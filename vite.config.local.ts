import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Lokális, egyfájlos build konfigurációja.
 *
 * Miért kell külön: a böngésző a file:// protokoll alól CORS miatt nem tölt be
 * <script type="module"> fájlokat, ezért itt klasszikus (iife) bundle készül,
 * amit a build:local szkript beágyaz egyetlen index.html-be.
 */
export default defineConfig({
  plugins: [react()],
  base: './',
  define: { 'import.meta.env.VITE_LOCAL': '"1"' },
  build: {
    outDir: 'dist-local',
    assetsDir: '.',
    cssCodeSplit: false,
    modulePreload: false,
    target: 'es2019',
    // a logó és minden asset base64-ként a HTML-be kerül
    assetsInlineLimit: 10_000_000,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: 'app.[ext]',
      },
    },
  },
});
