# snip

A tiny Chrome extension for screenshots, modeled on Zen's built-in tool: click the icon (or press the shortcut), drag a region, then **Copy** or **Download**.

## Keys

| Key | Action |
| --- | --- |
| `Alt+Shift+S` (`⌥⇧S` on macOS) | Start a capture (same as clicking the icon) |
| Drag | Select a region (drag again to redo) |
| `Esc` | Cancel |

If the shortcut clashes with another extension, Chrome leaves it unset. Set it at `chrome://extensions/shortcuts`.

## Install

Requires Node 22+.

```sh
git clone git@github.com:bitterbit/snip.git && cd snip
npm install
npm run build
```

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and pick `dist/chrome-mv3`.
3. Optional: pin snip to the toolbar.

## Develop

```sh
npm run dev      # opens a Chrome instance with snip loaded and hot reload
npm run check    # typecheck
```
