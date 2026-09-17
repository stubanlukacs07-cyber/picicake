# PiciCake webshop — GitHub-ra feltöltés és megnyitás

## 1. Feltöltés

A zip tartalma egy kész repó-váz: benne a forrás, a `package.json`, a
`.gitignore` és a GitHub Actions munkafolyamat. A `node_modules`, a `dist` és a
`lokalis` mappa szándékosan nincs benne — ezeket a build hozza létre.

```bash
# a zip kibontása után, a picicake mappában
git init
git add .
git commit -m "PiciCake webshop"
git branch -M main
git remote add origin https://github.com/<felhasznalo>/<repo>.git
git push -u origin main
```

Vagy a GitHub felületén: **Add file → Upload files**, és húzd be a `picicake`
mappa tartalmát.

## 2. Megnyitás böngészőben (GitHub Pages)

A repóban egyszer be kell állítani:

**Settings → Pages → Build and deployment → Source: GitHub Actions**

Ezután minden `main`-re küldött push automatikusan buildel és kiteszi az oldalt.
A cím: `https://<felhasznalo>.github.io/<repo>/`

A Pages-build szándékosan **hash alapú útvonalakat** használt
(`.../#/termek/koreai-bento-torta`) és relatív `base`-t, ezért:

- nem kell szerveroldali SPA-átirányítás,
- mindegy, mi a repó neve, nem kell semmit átírni,
- az aloldalak újratöltésre is működnek.

## 3. Helyi futtatás

```bash
npm install
npm run dev          # fejlesztői szerver
npm run build        # éles build saját domainre (normál URL-ek)
npm run build:pages  # GitHub Pages build (hash útvonalak, relatív base)
npm run build:local  # egyetlen HTML fájl, dupla kattintással nyitható
```

## 4. Amit a klienstől még várunk

- a webhook URL-ek a `src/data/config.ts` `ENDPOINTS` blokkjába,
- Stripe Checkout Session a szerver oldalon (a `checkoutUrl` visszaadásával),
- a hiányzó termékleírások véglegesítése,
- az angol és német szövegek anyanyelvi átolvasása (`src/i18n/en.ts`, `de.ts`).
