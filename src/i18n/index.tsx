import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { EN } from './en';
import { DE } from './de';

export type Lang = 'hu' | 'en' | 'de';

export const LANGS: { id: Lang; label: string; htmlLang: string }[] = [
  { id: 'hu', label: 'HU', htmlLang: 'hu' },
  { id: 'en', label: 'EN', htmlLang: 'en' },
  { id: 'de', label: 'DE', htmlLang: 'de' },
];

const DICTS: Record<Lang, Record<string, string>> = { hu: {}, en: EN, de: DE };

/**
 * Minták a számot tartalmazó, összeragasztott szövegekhez — ezeket nem
 * érdemes szó szerint szótárazni, mert a szám mindig más.
 */
const PATTERNS: { re: RegExp; en: string; de: string }[] = [
  { re: /^(.+) Ft-tól$/, en: 'from $1 Ft', de: 'ab $1 Ft' },
  { re: /^(\d+) termék$/, en: '$1 products', de: '$1 Produkte' },
  { re: /^(\d+)\. kép$/, en: 'Image $1', de: 'Bild $1' },
  { re: /^(\d+)\. dia: (.+)$/, en: 'Slide $1: $2', de: 'Folie $1: $2' },
  { re: /^Telítettség: (\d+)%$/, en: 'Saturation: $1%', de: 'Sättigung: $1 %' },
  { re: /^Világosság: (\d+)%$/, en: 'Lightness: $1%', de: 'Helligkeit: $1 %' },
  { re: /^Méret: ([\d.,]+) cm$/, en: 'Size: $1 cm', de: 'Größe: $1 cm' },
  { re: /^Íz — (\d+) választható$/, en: 'Flavour — $1 options', de: 'Geschmack — $1 Optionen' },
  { re: /^(.+) — (\d+) választható$/, en: '$1 — $2 options', de: '$1 — $2 Optionen' },
  { re: /^Kosár \((\d+) tétel\)$/, en: 'Cart ($1 items)', de: 'Warenkorb ($1 Artikel)' },
  { re: /^Kép csatolása \((\d+)\/(\d+)\)$/, en: 'Attach an image ($1/$2)', de: 'Bild anhängen ($1/$2)' },
  { re: /^Legfeljebb (\d+) kép csatolható$/, en: 'Up to $1 images can be attached', de: 'Es können bis zu $1 Bilder angehängt werden' },
  { re: /^(\d+) kép mentve\.?$/, en: '$1 images saved.', de: '$1 Bilder gespeichert.' },
  { re: /^Csatolt terv \((\d+) kép\)$/, en: 'Attached design ($1 images)', de: 'Angehängter Entwurf ($1 Bilder)' },
  { re: /^(\d+) elem$/, en: '$1 items', de: '$1 Elemente' },
  { re: /^Már csak (\d+) db$/, en: 'Only $1 left', de: 'Nur noch $1 Stück' },
  { re: /^(\d+) az (\d+)-ből$/, en: '$1 out of $2', de: '$1 von $2' },
  { re: /^(\d+) vélemény$/, en: '$1 reviews', de: '$1 Bewertungen' },
  { re: /^Rendelésszám: (.+)$/, en: 'Order number: $1', de: 'Bestellnummer: $1' },
];

function patternHit(lang: Lang, key: string) {
  if (lang === 'hu') return null;
  for (const p of PATTERNS) {
    const m = key.match(p.re);
    if (m) return (lang === 'en' ? p.en : p.de).replace(/\$(\d)/g, (_, i) => m[Number(i)] ?? '');
  }
  return null;
}

let activeLang: Lang = 'hu';
const STORE_KEY = 'picicake.lang';

/* ================================================================== */
/* Fordítási réteg                                                     */
/*                                                                     */
/* A webshop szövegei magyarul vannak a kódban — ez a réteg a kész DOM- */
/* ban cseréli le őket a szótár alapján. Így a termékadatok, a GYIK, a  */
/* pénztár és a 3D tervező felülete is lefordul, egyetlen szótárból.    */
/* Új fordítás hozzáadásához csak az en.ts / de.ts fájlt kell bővíteni. */
/* ================================================================== */

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CANVAS', 'NOSCRIPT', 'CODE', 'PRE', 'SVG']);
const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'] as const;

/**
 * Az eredeti magyar szöveg és az általunk legutóbb kiírt érték. A kettőből
 * derül ki, hogy a csomópontot mi fordítottuk le, vagy a React írta át —
 * enélkül nyelvek között váltva elveszne az eredeti magyar kulcs.
 */
type Tracked = { source: string; written: string };
const origText = new WeakMap<Text, Tracked>();
const origAttr = new WeakMap<Element, Record<string, Tracked>>();

let applying = false;
let touched = false;

/**
 * Egy szöveg fordítása. A körülvevő szóközöket megőrzi, hogy a
 * „szöveg <strong>kiemelés</strong> szöveg" szerkezetek ne csúszjanak össze.
 */
function lookup(dict: Record<string, string>, source: string) {
  const key = source.trim();
  if (!key) return null;
  const hit = dict[key] ?? patternHit(activeLang, key);
  if (hit === null || hit === undefined) return null;
  return source.replace(key, hit);
}

function translateText(node: Text, dict: Record<string, string>) {
  const current = node.nodeValue ?? '';
  const tracked = origText.get(node);

  /* Ha az érték nem az, amit mi írtunk ki, akkor a React cserélte le
     (pl. ár frissült) — onnantól az lesz az eredeti. */
  const source = tracked && current === tracked.written ? tracked.source : current;

  const next = lookup(dict, source) ?? source;
  origText.set(node, { source, written: next });
  if (current !== next) {
    applying = true;
    node.nodeValue = next;
    applying = false;
    touched = true;
  }
}

function translateAttrs(el: Element, dict: Record<string, string>) {
  let store = origAttr.get(el);
  for (const attr of ATTRS) {
    const current = el.getAttribute(attr);
    if (current === null) continue;
    const tracked = store?.[attr];
    const source = tracked && current === tracked.written ? tracked.source : current;
    const next = lookup(dict, source) ?? source;

    if (!store) {
      store = {};
      origAttr.set(el, store);
    }
    store[attr] = { source, written: next };

    if (current !== next) {
      applying = true;
      el.setAttribute(attr, next);
      applying = false;
      touched = true;
    }
  }
}

function walk(node: Node, dict: Record<string, string>) {
  if (node.nodeType === Node.TEXT_NODE) {
    translateText(node as Text, dict);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node as Element;
  if (SKIP_TAGS.has(el.tagName)) return;
  if (el.hasAttribute('data-no-i18n')) return;
  translateAttrs(el, dict);
  for (let child = el.firstChild; child; child = child.nextSibling) walk(child, dict);
}

let observer: MutationObserver | null = null;
let queued = false;
let activeDict: Record<string, string> = {};

function sweep() {
  if (!document.body) return;
  /* Magyarul csak akkor kell végigmenni, ha korábban már fordítottunk. */
  if (activeDict === DICTS.hu && !touched) return;
  walk(document.body, activeDict);
}

function startObserver() {
  if (observer) return;
  observer = new MutationObserver(() => {
    if (applying || queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      sweep();
    });
  });
  observer.observe(document.body, {
    childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: [...ATTRS],
  });
}

/* ================================================================== */
/* React kötés                                                         */
/* ================================================================== */

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (hu: string) => string };
const LangContext = createContext<Ctx>({ lang: 'hu', setLang: () => {}, t: (hu) => hu });

export const useLang = () => useContext(LangContext);

function readLang(): Lang {
  try {
    const saved = localStorage.getItem(STORE_KEY) as Lang | null;
    if (saved && DICTS[saved]) return saved;
  } catch { /* letiltott storage */ }
  return 'hu';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang);

  useEffect(() => {
    activeDict = DICTS[lang];
    activeLang = lang;
    const html = LANGS.find((l) => l.id === lang)?.htmlLang ?? 'hu';
    document.documentElement.lang = html;
    try { localStorage.setItem(STORE_KEY, lang); } catch { /* letiltott storage */ }
    startObserver();
    sweep();
    /* A szótárcsere után a második körben a beúszó elemek is lefordulnak. */
    const again = window.setTimeout(sweep, 60);
    return () => window.clearTimeout(again);
  }, [lang]);

  const value = useMemo<Ctx>(() => ({
    lang,
    setLang: setLangState,
    t: (hu: string) => DICTS[lang][hu] ?? hu,
  }), [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
