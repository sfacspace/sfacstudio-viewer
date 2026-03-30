import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    open: true,
  },
  build: {
    outDir: 'dist',
  },
  assetsInclude: ['**/*.wasm'],
  resolve: {
    alias: {
      // dev/build 시 수정한 public 쪽 PlayCanvas 사용 (로그 등)
      playcanvas: path.resolve(__dirname, 'public/js/playcanvas.mjs'),
    },
  },
  optimizeDeps: {
    include: ['playcanvas', 'mediabunny'],
  },
});
