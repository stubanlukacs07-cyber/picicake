# PiciCake webshop — GitHub-ra feltöltés és megnyitás

## A legegyszerűbb út: a kész build már benne van

A repóban ott van a `docs/` mappa, ami a **lefordított, kész oldal**. Nem kell
se Node.js, se build, se GitHub Actions — csak feltöltöd és beállítod a Pages-t:

1. **Feltöltés** — a `picicake` mappa tartalmát töltsd fel a repóba
   (GitHub felület: *Add file → Upload files*, vagy `git push`).
2. **Settings → Pages**
   - *Source:* **Deploy from a branch**
   - *Branch:* **main** és a mappa: **`/docs`**
   - *Save*
3. Egy-két perc múlva az oldal él: `https://<felhasznalo>.github.io/<repo>/`

## Ha üres, fehér vagy fekete oldalt látsz

Az szinte biztosan azt jelenti, hogy a Pages a repó **gyökerét** szolgálja ki
(`/ (root)`), nem a `/docs` mappát. A gyökérben lévő `index.html` a Vite
fejlesztői sablonja: a `/src/main.tsx` fájl éles környezetben nem létezik, ezért
nem indul el semmi.

Két megoldás:

- **Állítsd a Pages mappáját `/docs`-ra** (lásd fent) — ez a helyes beállítás.
- Vagy hagyd gyökéren: a gyökér `index.html`-be beépítettünk egy biztonsági
  hálót, ami ilyenkor automatikusan átirányít a `./docs/` címre. Ekkor a cím
  `https://<felhasznalo>.github.io/<repo>/docs/` lesz.

## Ha automatikus buildet szeretnél

Van egy GitHub Actions munkafolyamat is (`.github/workflows/deploy.yml`), ami
minden `main`-re küldött push után újraépíti és kiteszi az oldalt. Ehhez:

**Settings → Pages → Source: GitHub Actions**

Ezzel a `docs/` mappára nincs szükség, de nem is zavar.

## Miért hash alapú az útvonal?

A Pages-build relatív `base`-t és hash alapú útvonalakat használ
(`.../#/termek/koreai-bento-torta`), ezért:

- nem kell szerveroldali SPA-átirányítás,
- mindegy, mi a repó neve, nem kell semmit átírni,
- az aloldalak újratöltésre és megosztott linkből is működnek.

Saját domainre a `npm run build` a normál URL-eket adja (`/termek/...`) — ott a
szervernek kell minden kérést az `index.html`-re irányítania.

## Helyi futtatás és újraépítés

```bash
npm install
npm run dev          # fejlesztői szerver
npm run build        # éles build saját domainre (normál URL-ek)
npm run build:pages  # GitHub Pages build → dist/
npm run build:local  # egyetlen HTML fájl, dupla kattintással nyitható
```

A `docs/` mappa frissítése kézzel: `npm run build:pages`, majd a `dist` tartalmát
másold a `docs` mappába (a `.nojekyll` fájl maradjon meg benne).

## Amit a klienstől még várunk

- a webhook URL-ek a `src/data/config.ts` `ENDPOINTS` blokkjába,
- Stripe Checkout Session a szerver oldalon (a `checkoutUrl` visszaadásával),
- a hiányzó termékleírások véglegesítése,
- az angol és német szövegek anyanyelvi átolvasása (`src/i18n/en.ts`, `de.ts`).
