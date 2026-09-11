import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    rollupOptions: { input: { main: resolve(__dirname, 'index.html'), privacy: resolve(__dirname, 'privacy.html') } },
  },
});
