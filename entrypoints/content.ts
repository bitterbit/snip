const STYLE = `
  [hidden] { display: none !important; }
  .overlay { position: fixed; inset: 0; z-index: 2147483647; cursor: crosshair; background: rgb(0 0 0 / .4); }
  .overlay.selecting { background: none; }
  .box { position: fixed; outline: 1px dashed #fff; box-shadow: 0 0 0 100vmax rgb(0 0 0 / .4); }
  .toolbar { position: fixed; display: flex; gap: 4px; padding: 4px; border-radius: 6px; background: #fff;
             box-shadow: 0 2px 8px rgb(0 0 0 / .3); font: 13px system-ui, sans-serif; cursor: default; }
  button { font: inherit; padding: 4px 10px; border: 0; border-radius: 4px; background: #eee; color: #111; cursor: pointer; }
  button:hover { background: #ddd; }
`;

export default defineContentScript({
  registration: 'runtime', // only runs when background.ts injects it
  main() {
    if (document.getElementById('snip')) return; // already open

    // Shadow DOM keeps the page's CSS away from the overlay.
    const host = document.createElement('div');
    host.id = 'snip';
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>${STYLE}</style>
      <div class="overlay">
        <div class="box" hidden></div>
        <div class="toolbar" hidden>
          <button class="copy">Copy</button>
          <button class="download">Download</button>
        </div>
      </div>`;
    document.documentElement.append(host);

    const overlay = root.querySelector<HTMLElement>('.overlay')!;
    const box = root.querySelector<HTMLElement>('.box')!;
    const toolbar = root.querySelector<HTMLElement>('.toolbar')!;

    let rect = new DOMRect(); // selected region, in viewport CSS pixels
    let start: { x: number; y: number } | null = null;

    // --- Drag to select ---

    overlay.addEventListener('pointerdown', (e) => {
      if (toolbar.contains(e.target as Node)) return;
      start = { x: e.clientX, y: e.clientY };
      overlay.setPointerCapture(e.pointerId);
      toolbar.hidden = true;
    });

    overlay.addEventListener('pointermove', (e) => {
      if (!start) return;
      rect = new DOMRect(
        Math.min(start.x, e.clientX),
        Math.min(start.y, e.clientY),
        Math.abs(e.clientX - start.x),
        Math.abs(e.clientY - start.y),
      );
      overlay.classList.add('selecting');
      box.hidden = false;
      Object.assign(box.style, {
        left: `${rect.x}px`,
        top: `${rect.y}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      });
    });

    overlay.addEventListener('pointerup', () => {
      if (!start) return;
      start = null;
      if (rect.width < 4 || rect.height < 4) {
        overlay.classList.remove('selecting');
        box.hidden = true;
        return;
      }
      // Toolbar goes under the selection, or above it if there's no room.
      toolbar.hidden = false;
      const { offsetWidth: w, offsetHeight: h } = toolbar;
      const below = rect.bottom + 8;
      toolbar.style.top = `${below + h < innerHeight ? below : Math.max(8, rect.top - h - 8)}px`;
      toolbar.style.left = `${Math.min(rect.left, innerWidth - w - 8)}px`;
    });

    // --- Actions ---

    root.querySelector<HTMLElement>('.copy')!.onclick = () => {
      // Hand ClipboardItem the promise right away so Chrome keeps the click's user activation.
      navigator.clipboard.write([new ClipboardItem({ 'image/png': grab() })]);
    };

    root.querySelector<HTMLElement>('.download')!.onclick = async () => {
      const url = URL.createObjectURL(await grab());
      const a = document.createElement('a');
      a.href = url;
      a.download = `snip-${new Date().toLocaleString('sv').replace(' ', '-').replaceAll(':', '')}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey, true);

    function close() {
      host.remove();
      document.removeEventListener('keydown', onKey, true);
    }

    // Remove the overlay, screenshot the tab, and crop to the selection.
    async function grab(): Promise<Blob> {
      close();
      await new Promise(requestAnimationFrame); // wait until the overlay
      await new Promise(requestAnimationFrame); // is gone from the screen

      const img = new Image();
      img.src = await browser.runtime.sendMessage('capture');
      await img.decode();

      const s = devicePixelRatio; // screenshot is in device pixels, rect is in CSS pixels
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(rect.width * s);
      canvas.height = Math.round(rect.height * s);
      canvas
        .getContext('2d')!
        .drawImage(img, rect.x * s, rect.y * s, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
      return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob!), 'image/png'));
    }
  },
});
