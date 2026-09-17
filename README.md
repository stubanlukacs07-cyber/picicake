# PiciCake webshop

Többoldalas webshop a picicake.hu újjáépítéséhez. React 18 + Vite + TypeScript, react-router-dom, sima CSS
design tokenekkel. Nincs CSS framework és nincs backend függőség: bárhova kitehető, ami statikus fájlt szolgál ki.

---

## Indítás

```bash
npm install
npm run dev      # fejlesztés: http://localhost:5173
npm run build    # éles build a dist/ mappába
npm run preview  # a build kipróbálása
```

---

## Oldalszerkezet

| Útvonal | Oldal |
|---|---|
| `/kezdolap` | Kezdőlap |
| `/termekek` | Összes termék |
| `/termekek/tortak` · `/browniek` · `/egyeb-desszertek` · `/timebox-onfejleszto-termekek` | Kategóriák |
| `/termek/:slug` | Termékoldal |
| `/rendezveny` | Rendezvény, ajánlatkérés |
| `/informaciok` (`#gyik`, `#fizetes`) | Információk |
| `/kapcsolat` | Kapcsolat |
| `/kosar` · `/penztar` | Kosár és pénztár |

A menüben a **Termékek** felirat az összes termékre visz, a legördülő menü pedig a négy kategóriára és az
„Összes termék” pontra.

A mostani GHL-oldal URL-jei át vannak irányítva, hogy a meglévő linkek és a hirdetések ne törjenek el:
`/tortak`, `/browniek`, `/egyeb-desszertek`, `/timebox-onfejleszto-termkek`, `/products-list`,
`/egyedi-torta-rendeles`, `/informaciok-menupont`, `/contact-us`, `/product-details/product/:slug`.

---

## Design és márkaszínek

A paletta a megadott két színre épül, minden token a `src/styles.css` első blokkjában:

| Token | Érték | Hol jelenik meg |
|---|---|---|
| `--brand` | `#B58E88` | fejléc, elsődleges gomb, aktív állapotok |
| `--brand-soft` | `#D8A7A1` | USP pillek, „Új” badge, kiemelések |
| `--brand-deep` | `#946D67` | gomb hover, mobil menü |
| `--brand-darker` | `#6E4F4A` | címsorok, lábléc |
| `--blush` / `--blush-soft` | `#EFDCD8` / `#FAF2F0` | világos felületek, szekcióháttér |

Betűtípus: **Poppins** — a referencia oldal betűje.

A logó `src/assets/logo.png`: a kapott képből kivágva, átlátszó háttérrel, fehér grafikával,
így a rózsaszín fejlécen és a láblécen is jól mutat.

### Kezdőlap — a referencia szerinti felépítés
1. **Felső információs csík** — balról jobbra futó szöveg a szállításról, átvételről és a határidőről.
2. **Fejléc** — logó, menü, kosár, Keresés, HU/EN/DE. Bejelentkezés nincs (kivéve).
3. **Slider** — 2 dia áttűnéssel, bal oldali szövegblokk, alatta pontok; az aktív sávvá alakul
   **fekete** haladó kitöltéssel. A magassága `aspect-ratio: 2.55/1`, max. 620 px — végig kifut
   a képernyő széléig, de nem nyúlik el.
4. **USP badge-ek** — a kliens saját kódja szerint: `#d7a7a2` pill, fehér ikonkör, hoverre
   fekete háttér + fehér szöveg, miközben az ikon fekete marad a körben.
5. **Tabos termékblokk** — Torták / Browniek / Desszertek / Ajándékok.
6. **Best Sellers** — rózsaszín sáv, bal oldalt a címsor, jobbra 3 kártya körbe zárt nyíllal.
7. **„Rendelj egyedi desszertet!" + „További termékek"** — 4 kártya.
8. **Speciális kérések** — két fotó között középen a szöveg és a fekete ajánlatkérő gomb.
9. **Kategóriák**, **Történetünk**, **Gyakori kérdések** (rózsaszín sáv, kép + harmonika),
   **Vélemények** (léptethető kártyák), **Hírlevél**, **Lábléc**.

### Lábléc
A referencia szerint: rózsaszín háttér, három középre igazított hasáb (Rólunk / Kapcsolat / Info)
nagy címsorokkal, alatta a logó, a rövid bemutatkozás és a közösségi ikonok.

### Effektek (a kliens kódja szerint)
- **fénycsík minden gombon**: balról jobbra átsuhanó, ferde fehér sáv, ezzel vált feketére
- **animált gradiens aláhúzás** a tabokon és a szöveges linkeken (0-ról 100%-ra fut ki)
- termékkártyán ráhúzáskor az AI-render helyett a **valós fotóra vált**, ráközelít, és felúszik a kosárgomb
- USP badge hoverre fekete háttér + fehér szöveg, az ikon fekete marad a fehér körben
- a vélemények **végtelenített sávban** futnak balról jobbra, hoverre megállnak
- megjelenéskor felcsúszó szekciók és lépcsőzött kártyák (IntersectionObserver)
- `prefers-reduced-motion` esetén minden animáció kikapcsol

### Termékképek sorrendje
Minden terméknél az **AI-render van elöl**, a valós fotó a második — a kártyán ráhúzáskor
erre vált át, a kliens által megadott párosítás szerint. A `SITE_IMAGES` objektumban
(`src/data/products.ts`) van a GYIK képe és a Speciális kérések két fotója.

### Rendezvény — 3 fázisú ajánlatkérő
1. **Kérdések** — Milyen ízű legyen? (15 íz), Teljesen egyedi ízt választok, Forma
   (Kerek / Négyzet / Szív), Megjegyzés, Mikorra szeretnéd a tortát?
2. **Képfeltöltés** — 3 db kép, „(Ha van inspirációd)". A képek base64 data URL-ként
   mennek a webhookra (max. 5 MB/kép), így Make-ből egyenesen a GHL media könyvtárba tölthetők.
3. **Adatok** — Teljes Név, Telefonszám, Email cím, ÁSZF + adatkezelési elfogadás, Benyújtás.

### Időpontok — egységesítve a picicake.hu adataival
| Mód | Idősáv | Díj |
|---|---|---|
| PiciCake futár Budapest | 13:00–17:00 | 2.000 Ft |
| PiciCake futár agglomeráció | 13:00–19:00 | 6.000 Ft |
| Személyes átvétel XV. ker. | 11:00–18:00 (egyeztetéssel, nem nyitvatartás) | ingyenes |

A korábbi „Nyitva: 11:00–18:00" félreérthető volt: az a személyes átvétel sávja, nem
üzleti nyitvatartás. Minden szöveg ezt már így írja.

### Betűtípus
**Poppins** (300–800) — ezt használja a referencia oldal is.

---

## Amit egyeztetni kell élesítés előtt

### 1. Árak — eltérés a két oldal között
A `src/data/products.ts` a **picicake.hu** árait tartalmazza. A GHL-oldalon ezek mások:

| Termék | picicake.hu (most ez van beírva) | GHL-oldal |
|---|---|---|
| Ajándékcsomag | 13.000 Ft | 10.500 Ft |
| Bento brownie | 5.000 Ft | 4.500 Ft |
| Brownie csokibetűkkel | 6.000 Ft | 5.500 Ft |
| Bento cup | 3.000 Ft | 2.500 Ft |
| Énidő TiMEbox | 5.990 Ft | 4.990 Ft |
| Ajándék TiMEbox | 6.000 Ft | 7.000 Ft |
| Beszélgetős kártya | 500 Ft | 1.000 Ft |

Egy apró ellentmondás az eredeti adatban: a gluténmentes tortánál az „Arany felirat + masni”
kombináció 800 Ft volt, miközben az arany felirat 500 és a masni 200 — itt 700 Ft-tal számolunk.

### 2. Hiányzó termékképek
Ezeknél nincs kép, helyettük monogramos helyőrző jelenik meg (a `Img` komponens automatikusan
visszaesik rá, ha egy URL 404-et ad):

Cup of Love · Gondolataim szett · Karácsonyi bakancslista · Közös bakancslista barátnőknek ·
Közös bakancslista pároknak

Bizonytalan (kitalált fájlnév a picicake.hu névsémája alapján, lehet 404): Énidő kártya ·
Hálanapló · Jegyzettömb.

### 3. Termékleírások
A Koreai bento torta leírása szó szerint a picicake.hu-ról van, ahogy a közös torta-szabályok
(dekoráció, csillám, élővirág, gyertya, „nem kérhető”, csomagolás) is. A többi termék rövid
leírása vázlat a valós opciókból — érdemes a kliens szövegével felülírni.

### 4. Nyelvváltó
A HU/EN/DE váltó megjelenik a fejlécben, de csak a magyar verzió létezik: EN/DE-re kattintva egy
sáv jelzi, hogy fejlesztés alatt van. Fordítások után kell hozzá egy i18n réteg.

---

## Opciók és extrák

Az eredeti oldalon az extrák összevont kombinációk voltak („Arany felirat + masni (+700 Ft)”).
Itt minden extra önálló tétel a saját árával, és **egyszerre több is jelölhető** — az árak
összeadódnak, és az ár a terméklapon élőben frissül.

Az opciócsoportoknak két típusa van (`src/data/products.ts`):

- `sel(id, label, choices)` — pontosan egy választás, kötelező (íz, méret, forma, dekor)
- `multi(id, label, choices, { min, hint })` — több is jelölhető (extrák, ajándék mellé, szószok)

Az összevont árak pontosan kiadják az egyedi felárak összegét, például az Egyedi tortánál:
masni 200 · gyertya 300 · arany felirat 500 · extra rajz 1.000 · koktélcseresznye 500 ·
csillám 500 · ehető élővirág 5.500.

Torta jellegű termékeknél külön mező van a **feliratra** (max. 20 karakter) és a **színekre**
(max. 3), a GYIK szabályai szerint. Mindkettő bekerül a kosársorba és a rendelés payloadjába.

---

## Szállítás, fizetés, díjak

Forrás: https://www.picicake.hu/shop_contact.php?tab=shipping

| Szállítás | Díj | Idősáv | Friss desszertre |
|---|---|---|---|
| PiciCake futár — Budapest | 2.000 Ft | 13:00–17:00 | igen |
| PiciCake futár — agglomeráció | 6.000 Ft | 13:00–19:00 | igen |
| Személyes átvétel (XV. ker.) | ingyenes | 11:00–18:00, órás sávok | igen |
| Foxpost | 1.700 Ft | — | nem |
| GLS | 2.600 Ft | — | nem |
| PostaPont | 2.200 Ft | — | nem |
| MPL | 2.200 Ft | — | nem |

A pénztár ezt automatikusan kezeli: ha a kosárban friss desszert van, csak a három felső mód
jelenik meg. Az agglomerációs futárnál a 14 elérhető településből listából kell választani.

Fizetés: bankkártya (Stripe), előre utalás (OTP 11715007 21553572), utánvét **+490 Ft/rendelés**.

A **3% rendszerhasználati díj** a termékek + szállítás + fizetési felár összegére számolódik, és
felül jön rá — a pénztár összegzésében tételesen látszik. Ha csak a termékek értékére kellene,
elég a `computeTotals` `base` képletét átírni (`src/lib/pricing.ts`).

---

## Pénztár — három fázis

1. **Átvétel módja** — a kosár tartalmához szűrt szállítási módok, árral.
2. **Időpont** — naptár, ami a szállítási módhoz igazodik: friss desszertnél legkorábban
   4 nap, TiMEbox ajándéknál 2 nap múlva. Személyes átvételnél órás időpontok is választhatók,
   futárnál a fix idősáv jelenik meg.
3. **Adatok és fizetés** — elérhetőség, szállítási cím (csak ha a mód igényli), megjegyzés,
   fizetési mód, ÁSZF.

A lépésjelzőn vissza lehet lépni, előre csak akkor, ha az adott lépés adatai megvannak.
A naptár fogad egy `unavailable` listát is (`src/components/Calendar.tsx`) — ide jöhetnek
a betelt napok, amint van rá endpoint.

## Integráció

A `src/data/config.ts` `ENDPOINTS` objektumába kell beírni a GHL/Make webhook URL-eket:

```ts
export const ENDPOINTS = {
  order: 'https://hook.eu2.make.com/...',       // rendelés
  contact: '...',                                // kapcsolati űrlap
  eventQuote: '...',                             // rendezvény ajánlatkérés
  newsletter: '...',                             // hírlevél
};
```

Amíg üres, semmi nem hibázik: a felület a sikeres állapotot mutatja, a payload pedig a böngésző konzoljába
kerül, így a teljes folyamat végigkattintható integráció nélkül.

A rendelés payloadja már olyan alakú, hogy Make-ben közvetlenül fel lehessen dolgozni:

```json
{
  "orderId": "PC-ABC123",
  "fulfilment": "kiszallitas | atvetel",
  "payment": "bankkartya | utanvet | atutalas",
  "customer": { "name": "...", "email": "...", "phone": "..." },
  "requestedDate": "2026-09-19",
  "requestedSlot": "13:00–17:00",
  "address": { "zip": "...", "city": "...", "street": "...", "doorbell": "..." },
  "note": "...",
  "items": [{
    "slug": "koreai-bento-torta", "name": "Koreai bento torta", "qty": 1,
    "unitPrice": 4800, "total": 4800,
    "options": [{ "group": "Íz", "value": "Citrom", "delta": 0 },
                { "group": "Extra", "value": "Fújt csillám", "delta": 300 },
                { "group": "Felirat", "value": "Boldog szülinapot!", "delta": 0 }]
  }],
  "totals": { "subtotal": 17500, "shipping": 2000, "paymentFee": 0, "serviceFee": 585, "total": 20085 },
  "currency": "HUF"
}
```

### Stripe
A böngészőből nem lehet Checkout Sessiont nyitni (titkos kulcs kell hozzá), ezért a folyamat:
a rendelés a `order` webhookra megy, a backend/Make létrehozza a Stripe Checkout Sessiont, és
JSON-ban visszaad egy `checkoutUrl` (vagy `url`) mezőt. Ha bankkártyás fizetés van kiválasztva és
jön ilyen link, a felület automatikusan átirányít rá — ez már be van kötve (`src/lib/submit.ts`).
Ha nincs link, a rendelés simán leadható és a visszaigazoló képernyő jelenik meg.

Ami még hiányzik a teljes körhöz:
1. **Stripe Checkout Session** létrehozása szerver oldalon (a fenti `checkoutUrl` visszaadása).
2. **Naptár / kapacitás** — a pénztár csak a minimum átfutást kényszeríti ki. A betelt napok
   letiltásához kell egy elérhető napokat visszaadó endpoint (`Calendar` `unavailable` propja).
3. **Számlázás** — Számlázz.hu XML Agent hívás a Make scenarióból, a payload alapján.

---

## Deploy

**Gyökérre (saját domain, Netlify, Vercel, Cloudflare Pages)** — a `vite.config.ts`-ben `base: '/'` marad.
SPA-hoz kell egy átirányítás minden útvonalról az `index.html`-re:

- Netlify `public/_redirects`: `/*  /index.html  200`
- Vercel `vercel.json`: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- nginx: `try_files $uri /index.html;`

**GitHub Pages** — a `public/404.html` már el van készítve, ez visszaállítja a mély linkeket.
Ha alkönyvtárba megy, `base: '/repo-nev/'`. Fontos: relatív `base: './'` **nem** működik, mert a
`/termek/:slug` útvonalon elcsúsznak az asset útvonalak.

---

## Felépítés

```
src/
  data/config.ts      elérhetőségek, szállítási szabályok, webhookok, fizetési módok
  data/products.ts    29 termék, kategóriák, opciócsoportok felárakkal, készlet, képek
  data/content.ts     GYIK, vélemények, USP-k, történet, rendezvény szövegek
  lib/cart.tsx        kosár context, localStorage mentés, panel állapot
  lib/format.ts       Ft formázás, dátumok
  lib/submit.ts       webhook küldés fallbackkel
  components/         Header, Footer, CartDrawer, ProductCard, Sections, Bits (ikonok, Img)
  pages/              Home, Products, ProductDetail, Event, Info, Contact, Cart, Checkout, NotFound
  styles.css          design tokenek + minden stílus
```

### Új termék felvétele
A `PRODUCTS` tömbbe kell egy objektum. Az opciócsoportok `choices` elemei `{ label, delta? }` alakúak, a
`delta` a felár forintban (negatív is lehet, pl. a bento brownie a csomagban −500 Ft). Ha nincs
`options`, a terméken a kártyáról is közvetlenül kosárba tehető („Kosárba”), különben a
termékoldalra visz („Válassz opciót”).

### Felirat és színek
A torta jellegű termékeknél (`tortak` kategória + bento brownie, brownie csokibetűkkel, browniesu) a
termékoldalon külön mező van a feliratra (max. 20 karakter) és a színekre (max. 3), a GYIK szabályai
szerint. Ezek a kosársorba és a rendelés payloadjába is bekerülnek, így nem kell utólag e-mailben
egyeztetni.

---

## Kisegítő megoldások

- kosár localStorage-ban, letiltott storage esetén is működik (csak nem őrzi meg)
- a legördülő menü késleltetve zár, így az egér át tud haladni a link és a panel közötti sávon
- kereső a fejlécben (név, rövid leírás és kategória alapján), Enterrel az első találatra ugrik
- `prefers-reduced-motion` figyelembe véve, látható fókuszjelölés, „ugrás a tartalomra” link
- kép nélküli termékeknél monogramos helyőrző, hibás URL esetén automatikus visszaesés
- 360 px-ig 2 hasábos termékrács, mobilon legördülő kategóriaválasztó a pillek helyett

---

## Lokális megnyitás szerver nélkül

```bash
npm run build:local
```

Ez a `lokalis/index.html` fájlt hozza létre: egyetlen, önálló HTML, amiben a CSS és a JS is benne van.
Dupla kattintással megnyitható, nem kell hozzá se szerver, se `npm run dev`.

Amit tudni kell róla:
- Az útvonalak hash alapúak (`index.html#/termekek/tortak`), mert a `file://` protokoll alól a normál
  útvonalak nem működnének. Éles buildben (`npm run build`) automatikusan visszaáll a normál URL-ekre.
- A termékfotók és a betűtípusok távoli URL-ről jönnek, ezekhez kell internet. Offline is megnyílik,
  csak a képek helyén helyőrző lesz, a betű pedig rendszerbetűre esik vissza.
- A kosár itt is megmarad újratöltés után (localStorage).
- Külön build kell hozzá, mert a böngésző CORS miatt nem tölt be `<script type="module">`-t `file://`
  alól — ezért készül klasszikus bundle, amit a `scripts/build-local.mjs` beágyaz a HTML-be.

---

## 3D desszerttervező (`/torta-tervezo`)

A tervező a Claude Designtól érkezett, önálló ES-modulos prototípus, ami be van építve
a React appba. A forrás a `src/designer/` mappában van:

| Fájl | Mi ez |
|---|---|
| `catalog.js` | **A katalógus — ez az egyetlen igazság.** Termékek, ízek, méretek, formák, minták, extrák és áraik, a picicake.hu szerint. A tervező csak azt kínálja fel, ami itt szerepel. |
| `cake-scene.js` | A three.js jelenet: kézműves krémanyag, lágy meleg fény, kézzel elhelyezhető dekor, folytonos ecsetvonás, szabad krémnyomás. |
| `ui.js` | A felület. Egy `initDesigner(root, opts)` függvényt exportál, ami felszereli a tervezőt, és a leszerelő függvényt adja vissza. |
| `designer.css` | A tervező stílusa, **`.pc-designer` alá szigetelve**, hogy ne ütközzön a webshop globális osztályaival (`.panel`, `.chip`, `.swatch`, `.slider`…). A `@font-face` blokkok kikerültek: a betűket az `index.html` tölti be. |
| `markup.ts` | A tervező statikus váza szövegként. A `ui.js` ezeket az elemeket tölti fel. |
| `preset.ts`, `types.ts` | A terv → termékopció leképezés és a típusok. |

### Hogyan illeszkedik a webshopba
- `src/pages/CakeBuilder.tsx` kirakja a vázat, meghívja az `initDesigner`-t, és
  útvonalváltáskor leszereli. A `.pc-designer` burkolat adja a stílusszigetelést.
- A prototípus saját fejléce/láblécére nincs szükség: a keretet a webshop adja.
- A tervező `három lépéses befejező folyamata` (**terv kész → kép mentése → tovább a
  termékhez**) érintetlen. A „tovább" művelet a prototípusban konzolra írt; most a
  `preset.ts`-en keresztül a **termékoldalra navigál**.
- A leképezés csak olyan opciócímkét állít be, ami az adott terméknél tényleg létezik,
  így nem keletkezik érvénytelen választás a legördülőkben.

### A mentett illusztráció végigmegy a rendelésig
Ez volt az üzletileg kritikus pont. A lánc:

1. a tervezőben a **Kép mentése** letölti a PNG-t, és el is tesszük data URL-ként,
2. a **csatolás jelölése** nyitja a harmadik lépést,
3. a termékoldal a preset mellett megkapja a képet, és meg is jeleníti („A tervezőből
   jöttél" blokkban),
4. a kosársor eltárolja (`designImage`), és a terv összefoglalója opcióként bekerül,
5. a rendelés payloadjában minden tételnél ott van a `designImage` — így a Make/GHL
   oldalon egyenesen a média könyvtárba tölthető.

### Kezdőlapi néző
A kezdőlap a **legutóbb elmentett tervet** jeleníti meg (localStorage `picicake.tervezo.v2`),
és csak forgatni lehet. Ugyanaz a jelenetmotor hajtja, mint a szerkesztőt.

### Méret
A three.js miatt az éles bundle ~918 kB (gzip 261 kB), a lokális egyfájlos verzió ~1 MB.
Ha ez sok, a `CakeBuilder` és a `CakeTeaser` `React.lazy`-vel leválasztható külön
csomagba — a lokális build `inlineDynamicImports` beállítása ezt így is elbírja.

## Ebben a körben javított hibák

| Hiba | Ok | Javítás |
|---|---|---|
| A kosár gomb nem nyitotta a panelt | a `closeDrawer` minden rendernél új referenciát kapott, így a `CartDrawer` effektje azonnal visszazárta | `useCallback` a nyitó/záró függvényekre, és az effekt csak az útvonalra figyel |
| Két szűrő a termékek oldalon, egymásba csúszó feliratokkal | a pill-lista és a legördülő ugyanabban a flex sávban volt | csak a gombos szűrő maradt, saját sorban; mobilon vízszintesen húzható |
| „TiMEbox önfejlesztő termékek" írásmód | nem a picicake.hu szerinti | „TiMEbox Önfejlesztő Termékek" és „Egyéb Desszertek" |
| Bento brownie-hoz nem a saját fotója tartozott | a kliens snippetjében megadott hover kép más termék fotója | a picicake.hu saját `bentobrownie` fotójára cserélve |
| Best Sellers kártyákról eltűnt a név, ár és nyíl | a média `<span>` inline maradt, ezért összecsúszott a kártya | blokkszintű média, fehér hátterű szövegblokk, és a kliens által küldött valódi fotók |
| Best Sellers szöveg nem volt mindenhol fehér, és középen állt | öröklött színek + `align-items: center` | fehér szöveg, felülre igazított hasáb |
| „Gyakori kérdések" címsor középen | `align-items: center` | felülre igazítva |
| A tervező osztályai ütköztek a webshoppal | a prototípus `.panel`, `.chip`, `.swatch`, `.slider` osztályai ugyanúgy hívódnak, mint a webshopéi | a tervező teljes stílusa `.pc-designer` alá szigetelve |
| A prototípus felülete importálásra azonnal elindult | modulszintű kód és top-level await | `initDesigner(root)` függvény, leszerelővel — így Reactben is fel-/leszerelhető, és az egyfájlos build is lefordul |
| A lábléc túl nagy | három nagy címsoros hasáb + külön logóblokk | kompakt lábléc, a logó 3D-s, áttetsző vízjelként a háttérben |
| Szív alaknál a dekor nem követte a formát | a pozíciók kör mentén számolódtak | a dekor a forma kontúrjából számolódik, és a geometria is ugyanazzal az eltolással kerül a helyére |
| A dekor mérete nem követte a desszert méretét | fix méretek | a dekor a rádiusszal együtt skálázódik |
| A felirat túllógott a tortán | fix méretű vászon | a vászon szorosan a szöveg körül méretezve, a lap pedig a formán belülre vágva |
| A kategóriák nem látszottak kártyának | ugyanolyan háttér, mint a szekció | fehér kártya kerettel és árnyékkal |
| A hírlevél külön szekció volt | saját színnel, csak pár oldalon | a lábléc része lett, egy színnel, és minden oldalon megjelenik |

---

## Legutóbbi kör

### Összecsúszó befejező blokk a tervezőben
A webshop globális `.summary { position: sticky }` szabálya beszivárgott a tervezőbe, mert
a prototípus ugyanezt az osztálynevet használja, és a saját szabálya nem írta felül a
pozicionálást. Így a jobb hasáb megtapadt, és a „Tovább a termékhez" gomb a fölötte lévő
összegzésre csúszott.

A tervező 23 osztályneve ütközik a webshopéval (`btn`, `chip`, `panel`, `summary`, `steps`,
`swatch`, `slider`, `check`, `wrap`…). A `designer.css` elején most egy szigetelő blokk
semlegesíti az örökölt pozicionálást és elrendezést (`position`, `inset`, `animation`,
`transform`, `float`, `max-width`, `min-width`) ezekre az osztályokra, a `.pc-designer` alatt.
A tervező saját szabályai ez után jönnek azonos specifikussággal, így mindig ők nyernek.

### Több nézet mentése
A befejező blokkban négy gyors kameraállás van (**elölről, oldalról, felülről, hátulról**),
és **legfeljebb hat kép** menthető. Mindegyikről előnézet készül, külön törölhető, és a
darabszám a szövegekben is látszik.

A letöltött fájl teljes felbontású PNG. A rendeléshez csatolt változat viszont
kicsinyített JPEG (max. 900 px, q 0.84): egy 2× méretű PNG data URL több megabájt lenne,
és három kép már kitöltené a localStorage kvótáját — így a kosár nem tudott volna
megmaradni az oldal újratöltésekor. Két kép most kb. 60 kB.

### Rendelés visszaigazolása
A leadás után a visszaigazoló oldal megmutatja a teljes rendelést: az átvétel módját és
díját, a kért napot és idősávot, a fizetési módot, a szállítási címet, tételenként a
választott opciókat, a megjegyzést, a végösszeg bontását — és **a csatolt terveket
képekben**, letölthetően. A kosár a leadáskor kiürül, ezért a rendelés egy pillanatképe
külön állapotba kerül (`PlacedOrder`).

### Termékek oldal
A „Sorrend" rendezés kikerült; a lista mindig népszerűség szerint jön. A kategóriaszűrő és
a darabszám egy sorban van (`.filterbar`), mobilon a chipek vízszintesen húzhatók, a
darabszám alá kerül.

---

## Legutóbbi kör — cím, képek, ugrások

### Szállítási cím irányítószám alapján
A „Postakód" helyett **Irányítószám** van: csak számjegyek, legfeljebb négy (beillesztésből
is kiszűrjük a szemetet), és **ebből azonosítjuk a települést**. A település mező zárolt, nem
írható át.

- **Budapesti kiszállítás**: csak 1011–1239 fogadható el, a település mindig „Budapest".
- **Agglomeráció**: csak a 14 elérhető település irányítószáma (`AGGLO_ZIPS` a `config.ts`-ben),
  egyébként a mező üresen marad, és a mező alatt ott van, hova szállítunk.
- Szállítási mód váltásakor a település újraszámolódik: ha az irányítószám nem illik az új
  módhoz, kiürül.

A 2. lépésről kikerült a külön település-választó — duplikálta a címnél megadott adatot, és
emiatt akadt el a rendelés, ha valaki kihagyta.

> Az irányítószámok a magyar postai kódok szerint vannak felvéve. Ha valamelyik település
> több irányítószámot használ, a `config.ts`-ben egy sorral bővíthető.

### Csatolt képek a termékoldalon
A képfeltöltés **mindig elérhető**, nem csak a tervezőből jövet:

- a tervezőből hozott mentések előtöltve jelennek meg,
- bármikor tölthetsz fel továbbiakat (pl. élő inspirációs fotót), összesen hatot,
- mindegyik külön eltávolítható,
- a feltöltött fotó 1000 px-re kicsinyítve, JPEG-ként tárolódik, hogy a kosár beleférjen
  a localStorage kvótájába.

Tervező nélkül a blokk „Van elképzelésed vagy inspirációd?" szöveggel jelenik meg, és
linkel a 3D tervezőre.

### Visszaigazoló oldal képei
A csatolt tervekre kattintva **nagyítás** nyílik, nem letöltés — a kép a vásárló gépéről
került fel, nincs értelme visszatölteni. Bezárás a fátylon kattintva vagy az × gombbal.

### A 3D nézet megállása
A tervező vászna `position: sticky` volt 18 px-es eltolással, ami nem számolt a webshop
ragadó fejlécével — ezért görgetéskor a fejléc levágta a tetejét, az alja meg kifutott a
képernyőből. Most a fejléc alatt áll meg, és a vászon magassága a képernyő feléhez
igazodik (`min(50vh, …)`), így egészében látszik.

### Rendezvény lépésjelző
Az összekötő vonal a kör pszeudo-elemén volt, fix szélességgel, és átszelte az első kör
számjegyét — innen a „+" hatás. A vonal átkerült a lépés elemre (`left: -50%; right: 50%`),
a körök pedig fölé rajzolódnak.

### Információk menü ugrásai
A `#szallitas` típusú linkeket a HashRouter útvonalként értelmezte, ezért nem ugrott
semmi. Most JS-ből görgetünk, a ragadó fejléc magasságát beszámítva; a szekciók
`scroll-margin-top`-ot is kaptak.

### Új termékfotók
Bekerültek a kliens képei: **Cup of Love** (3), **Közös bakancslista pároknak** (2),
**Énidő kártya** (5). A fájlok `src/assets/products/`-ban vannak, 800 px-re méretezett,
progresszív JPEG-ként (összesen ~625 kB). Emiatt a lokális egyfájlos verzió 1,85 MB-ra
nőtt, mert abba a képek base64-ként beágyazódnak; az éles build külön fájlként, lustán
tölti őket.

---

## Legutóbbi kör — tervező finomítások

### A kezdőlap a friss tervet mutatja
A festés, a nyomott krém és a lerakott dekor **nem a configban él**, hanem a jelenet
saját állapotában (`artState()`), ezért a kezdőlapi néző egy korábbi verziót mutatott.
Most a tervező minden változás után — késleltetve, hogy a húzás ne akadjon — elmenti a
terv élő állapotát a termékéhez, a néző pedig a config mellé ezt is visszatölti
(`setArtState`). A késleltetés azért kell, mert az art két PNG kiolvasásából áll.

### Lenyitható panelszekciók
Minden opcióblokk (Mit tervezünk?, Íz, Szeletszám, Forma, Krém színe, Habszegély,
Extrák, Felirat…) külön nyitható-zárható szekció lett. A felirat a fejléce, a nyitott
állapot a mentésben él, így a panel újraépítésekor nem csukódik össze. A csomagolás
általános: minden blokk, ami `opt` + `opt__label` szerkezetű, automatikusan szekciót kap.

### Visszavonás és újra
Az eszközsávban két nyíl: **↺ visszavonás** és **↻ újra**, legfeljebb 25 lépés.
Egy lépés a config és a terv élő állapota együtt, így a véletlen törlés, a dekor
lerakása és az ecsetvonás is visszahozható. A csúszkák húzása nem tesz le lépést
minden pixelnél — késleltetve, a húzás végén mentődik.

### Felirat színe a panelen
A panel swatchjai azért nem látszottak, mert a **betűnkénti felülírások**
(`text.letters`) erősebbek a globális feliratszínnél — ha valaki egyszer a
szerkesztőben színezett egy betűt, onnantól a panel hatástalan volt. Most a panelen
választott szín törli a betűnkénti felülírásokat, és a felirat teljes színvezérlőt
kapott: swatchok, árnyalat/telítettség/világosság csúszka és hexkód.

### Két saját színhely minden színválasztónál
Minden színsor végén két hely van: üresen `+`, ami a **pillanatnyi színt** teszi bele,
megtöltve rákattintva alkalmazza, a sarkában lévő `×` pedig üríti. A helyek a
mentésben élnek, és mind a nyolc színmezőre külön működnek: krém, minta, szegély,
felirat, virág, ecset, nyomott krém és a kijelölt elem színe.

### Új termékfotók
Bekerült: **Gondolataim szett** (1), **Karácsonyi bakancslista** (1),
**Közös bakancslista barátnőknek** (2). Ezzel a klienstől kapott fotók mind a helyükön
vannak. A lokális egyfájlos verzió 2,04 MB — a képek base64-ként ágyazódnak bele; az
éles build külön fájlként, lustán tölti őket.

---

## Legutóbbi kör — GitHub, nyelvek, mobil

### GitHub-ra feltölthető csomag
A zip egy kész repó-váz: `.gitignore`, `.github/workflows/deploy.yml` és két
buildmód. A `npm run build:pages` **hash alapú útvonalakat** és relatív `base`-t
használ, így a GitHub Pages alkönyvtárban is működik, a repó nevétől függetlenül,
szerveroldali SPA-átirányítás nélkül. A részletes lépések a `README-GITHUB.md`-ben.

### Három nyelv: HU / EN / DE
Az oldal alapnyelve `hu` (a `<html lang>` ezért nem kínálja fel a böngésző
fordítóját magyar tartalomra), a fejléc HU/EN/DE gombjai pedig valóban váltanak.

A fordítás egy szótáras rétegen keresztül megy (`src/i18n/`): a magyar szöveg a
kulcs, az `en.ts` és a `de.ts` az érték. A réteg a kész DOM-ban cseréli a
szövegeket és a `placeholder` / `title` / `aria-label` / `alt` attribútumokat, így
**a termékadatok, a GYIK, a pénztár és a 3D tervező felülete is lefordul** —
egyetlen szótárból, a komponensek átírása nélkül. Ami nincs a szótárban, magyarul
marad, tehát a bővítés fokozatos.

A számot tartalmazó, összeragasztott szövegekre (`4.500 Ft-tól`,
`Telítettség: 57%`, `Kosár (2 tétel)`) minták vannak, nem külön szótársorok.

Jelenleg **651 kulcs** van mindkét nyelven. A hosszabb marketingszövegeket
érdemes anyanyelvivel átolvasatni — a fájlok erre készültek.

### Mobil
- A tervező vászna mobilon a fejléc alatt ragad, így görgetés közben is látszik,
  amit szerkesztesz; az eszközsáv vízszintesen húzható, nem tördel három sorba.
- A vásznon `touch-action: none`, tehát egy ujj forgat, kettő közelít — nem
  görgeti el az oldalt.
- Minden kattintható elem legalább 40–46 px, a beviteli mezők betűje 16 px,
  így az iOS nem közelít rá a mezőkre.
- A nyelvváltó és a Keresés mobilon is elérhető a fejlécben.

### Hero kép
A félresikerült kivágású „Szezonális desszertek" dia lecserélve a kliens új,
1910×600-as bannerére (`src/assets/hero-szezonalis.jpg`).

### Tervező javítások
- **A felirat törlése után frissül az összegzés.** Az összegzés külön blokk lett
  (`#orderSummary`), amit íráskor a panel újraépítése nélkül rajzolunk újra — így
  a szövegmező fókusza is megmarad.
- **A szerkesztőbe visszalépve a legfrissebb terv jelenik meg.** Indításkor a
  mentett `artState` (festés, nyomott krém, lerakott dekor) is visszatöltődik,
  nem csak a config.
