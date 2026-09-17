/**
 * A dist-local build összecsomagolása EGYETLEN index.html fájlba.
 *
 * A CSS és a JS bekerül a HTML-be, így nincs külső fájlhivatkozás,
 * és a file:// protokoll alól (dupla kattintás) is működik.
 *
 * Futtatás: npm run build:local
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist-local';
const outDir = 'lokalis';

const html = readFileSync(join(dist, 'index.html'), 'utf8');
const js = readFileSync(join(dist, 'app.js'), 'utf8');
const css = existsSync(join(dist, 'app.css')) ? readFileSync(join(dist, 'app.css'), 'utf8') : '';

// A </script> a beágyazott kódban lezárná a script tagot — ezt fel kell törni.
const safeJs = js.replace(/<\/script/gi, '<\\/script');

// A Vite a <head>-be emeli a script taget. Modul scriptként ez rendben van
// (halasztott futás), de beágyazott klasszikus scriptként még nem létezne a
// #root elem — ezért a JS-t a </body> elé tesszük.
//
// A csere függvénnyel történik, hogy a bundle-ben lévő $ karaktereket ne
// értelmezze a replace speciális mintaként ($&, $1, $` stb.).
let out = html
  .replace(/\s*<script[^>]*src="\.?\/?app\.js"[^>]*><\/script>/i, '')
  .replace(/<link[^>]*href="\.?\/?app\.css"[^>]*>/i, () => `<style>\n${css}\n</style>`)
  .replace(/<\/body>/i, () => `  <script>\n${safeJs}\n  </script>\n  </body>`);

if (out.includes('app.js')) {
  throw new Error('A JS beágyazása nem sikerült — ellenőrizd a dist-local/index.html script tagját.');
}

if (existsSync(outDir)) rmSync(outDir, { recursive: true });
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'index.html'), out);

const kb = (Buffer.byteLength(out) / 1024).toFixed(0);
console.log(`Kész: ${outDir}/index.html (${kb} kB) — dupla kattintással megnyitható.`);
