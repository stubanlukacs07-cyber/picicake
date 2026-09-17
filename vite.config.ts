import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Két üzemmód:
 *
 * - `npm run build` — saját domainre, gyökérre deployolva. Normál URL-ek
 *   (`/termek/koreai-bento-torta`), a szervernek SPA-átirányítás kell.
 *
 * - `npm run build:pages` — GitHub Pages alkönyvtárba. A `base` relatív, az
 *   útvonalak pedig hash alapúak (`#/termek/...`), így semmilyen szerveroldali
 *   átirányítás nem kell, és a repó nevétől is független.
 */
export default defineConfig(({ mode }) => {
  const pages = mode === 'pages' || process.env.VITE_HASH === '1';
  return {
    plugins: [react()],
    base: pages ? './' : '/',
    define: pages ? { 'import.meta.env.VITE_HASH': JSON.stringify('1') } : {},
    build: { outDir: 'dist', assetsDir: 'assets' },
  };
});
