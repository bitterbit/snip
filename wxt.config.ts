import { defineConfig } from 'wxt';

export default defineConfig({
  outDir: 'dist', // not .output: the macOS folder picker hides dot-folders
  manifest: {
    name: 'snip',
    description: 'Drag to screenshot part of a page.',
    permissions: ['activeTab', 'scripting'],
    action: {},
    commands: {
      _execute_action: { suggested_key: { default: 'Alt+Shift+S' } },
    },
  },
});
