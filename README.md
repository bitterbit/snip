# snip

A tiny Chrome extension for screenshots, modeled on Zen's built-in tool: click the icon (or press `Alt+Shift+S`), drag a region, then **Copy** or **Download**. `Esc` cancels.

## Install

Requires Node 22+.

```sh
git clone git@github.com:bitterbit/snip.git && cd snip
npm install
npm run build
```

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and pick `dist/chrome-mv3`.
3. Optional: pin snip to the toolbar, or change the shortcut at `chrome://extensions/shortcuts`.

## Develop

```sh
npm run dev      # opens a Chrome instance with snip loaded and hot reload
npm run check    # typecheck
```
