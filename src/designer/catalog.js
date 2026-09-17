/* ==================================================================
   PiciCake — a tervező katalógusa.
   EZ AZ EGYETLEN IGAZSÁG: a tervező kizárólag azt kínálja fel, ami itt
   szerepel, és minden tétel a picicake.hu termékopcióira képezhető le.
   Az adatok a webshop src/data/products.ts-éből származnak.
   ================================================================== */

export const IZ = {
  bento: [
    'Fehércsoki – málna', 'Fehércsoki – eper', 'Fehércsoki – áfonya',
    'Tejcsoki – málna', 'Tejcsoki – eper', 'Tejcsoki – áfonya',
    'Citrom', 'Lime-kókusz', 'Vanília', 'Maxi King (mogyoró!)',
    'Eper-kókusz', 'Bounty', 'Pumpkin spice', 'Karamella',
    'Tejcsoki', 'Fehércsoki', 'Mézeskalács',
  ],
  torta: [
    'Fehércsoki – málna', 'Fehércsoki – eper', 'Fehércsoki – áfonya',
    'Tejcsoki – málna', 'Tejcsoki – eper', 'Tejcsoki – áfonya',
    'Lime-kókusz', 'Eper-kókusz', 'Citrom', 'Vanília',
    'Maxi king', 'Bounty', 'Karamella', 'Tejcsoki', 'Fehércsoki',
  ],
  cup: [
    'Citrom', 'Vanília (laktózmentesen is)',
    'Kókusz – málna (laktózmentesen is)', 'Kókusz – eper (laktózmentesen is)',
    'Bounty', 'Maxi king (mogyoró!)',
    'Fehércsoki – eper', 'Fehércsoki – áfonya', 'Fehércsoki – málna',
    'Tejcsoki – eper', 'Tejcsoki – áfonya', 'Tejcsoki – málna',
    'Karamella', 'Tejcsoki', 'Fehércsoki',
  ],
  szelet: [
    'Tejcsoki – eper', 'Tejcsoki – málna', 'Tejcsoki – áfonya', 'Tejcsoki',
    'Fehércsoki – eper', 'Fehércsoki – málna', 'Fehércsoki – áfonya', 'Fehércsoki',
    'Maxi king (mogyoró!)', 'Karamella', 'Vanília',
  ],
};

/** Krémszínek — a műhely valóban használt tónusai. */
export const FROSTING_COLORS = ['#f2d3d0', '#d7a7a2', '#b68e88', '#f7ead2', '#bfcdb6', '#efe7e0', '#6b4433', '#ffffff'];
export const TEXT_COLORS = ['#6b3b34', '#ffffff', '#2b2325', '#b0413e', '#3d4a63', '#4f7a43'];
export const PIPE_COLORS = ['#ffffff', '#f2d3d0', '#d7a7a2', '#b68e88', '#6b4433', '#bfcdb6'];
/** Szalagszinek a masnihoz — a muhely szatenjei. */
export const RIBBON_COLORS = ['#d7a7a2', '#ffffff', '#b68e88', '#a8102a', '#3d4a63', '#2f2422'];

export const FONTS = [
  { id: 'Caveat', label: 'Kézírás' },
  { id: 'Dancing Script', label: 'Kalligráfia' },
  { id: 'Poppins', label: 'Nyomtatott' },
];

/* --- dekorelemek: amit a vásárló kézzel lerakhat és elforgathat ----- */
/** Habnyomó csúcsok — ugyanez a készlet a kézi nyomáshoz és a szegélyhez. */
export const TIPS = [
  { id: 'rozetta', label: 'Rozetta' },
  { id: 'csepp',   label: 'Csepp' },
  { id: 'csillag', label: 'Csillag' },
  { id: 'sima',    label: 'Sima gyöngy' },
];

/** surface = alapertelmezett felszin. `both: true` eseten a vasarlo a
 *  desszert OLDALARA is athuzhatja az elemet — a mozgatas kozben az kap
 *  oldal-modot, amit az oldalfalon engednek el. A gyertya es a kanal marad
 *  az asztalon: a muhely azokat a desszert melle csomagolja. */
export const DECOR = {
  masni:      { label: 'Masni',            surface: 'side',  radius: 2.2, both: true },
  gyertya:    { label: 'Gyertya',          surface: 'table', radius: 1.4 },
  virag:      { label: 'Ehető élővirág',   surface: 'top',   radius: 1.35, both: true },
  cseresznye: { label: 'Koktélcseresznye', surface: 'top',   radius: 1.1, both: true },
  eper:       { label: 'Eper',             surface: 'top',   radius: 1.5, both: true },
  malna:      { label: 'Málna',            surface: 'top',   radius: 1.1, both: true },
  afonya:     { label: 'Áfonya',           surface: 'top',   radius: 0.8, both: true },
  kanal:      { label: 'Kanál',            surface: 'table', radius: 1.6 },
};

/* --- a hét nyomott krémminta a bento cuphoz ------------------------- */
/** Ehető élővirág fajták — szezonális, ehető virágmix elemei. */
export const FLOWERS = [
  { id: 'arvacska', label: 'Árvácska' },
  { id: 'primula', label: 'Primula' },
  { id: 'rozsa', label: 'Miniatűr rózsa' },
  { id: 'harangvirag', label: 'Harangvirág' },
  { id: 'krizantem', label: 'Krizantém' },
];

export const FLOWER_COLORS = ['#e8a8bd', '#fdf3e6', '#f0c64a', '#d94f6e', '#8a5fbf', '#f07a3c', '#c4162a'];

export const CUP_PATTERNS = [
  { id: 'szivecskes', label: 'Szívecskés' },
  { id: 'viragos',    label: 'Virágos' },
  { id: 'tappancsos', label: 'Tappancsos' },
  { id: 'gombas',     label: 'Gombás' },
  { id: 'masnis',     label: 'Masnis' },
  { id: 'felhos',     label: 'Felhős' },
  { id: 'csillagos',  label: 'Csillagos' },
];

/* ==================================================================
   Termékek. Minden `extras` tétel egy valódi webshop-opció:
   group = az opciócsoport id-je, label = a pontos opciócímke.
   ================================================================== */

export const PRODUCTS = [
  {
    slug: 'koreai-bento-torta',
    name: 'Koreai bento torta',
    price: 4500,
    note: '8–10 cm, 200–300 g, 2 főre',
    flavours: IZ.bento,
    flavourGroup: 'iz',
    shapes: [{ id: 'kerek', label: 'Kerek' }, { id: 'sziv', label: 'Szív' }],
    sizes: [{ id: 'bento', label: '8–10 cm (2 fő)', dia: 10, height: 5.2 }],
    shapeGroup: 'forma',
    frosting: true,
    border: true,
    text: { mode: 'free', max: 20, gold: 'Arany felirat' },
    tools: { brush: 'Egyedi rajz', pipe: 'Egyedi rajz' },
    extras: [
      { id: 'masni',  label: 'Masni',                price: 200,  group: 'extra', decor: 'masni',   count: 1 },
      { id: 'gyertya', label: 'Gyertya (sima, 1 db)', price: 100, group: 'extra', decor: 'gyertya', count: 1, fixed: true },
      { id: 'virag',  label: 'Ehető élővirág',       price: 3500, group: 'extra', decor: 'virag',   count: 3 },
      { id: 'csillam', label: 'Fújt csillám',        price: 300,  group: 'extra', effect: 'csillam' },
      { id: 'arany',  label: 'Arany felirat',        price: 300,  group: 'extra', effect: 'arany' },
      { id: 'rajz',   label: 'Egyedi rajz',          price: 500,  group: 'extra', effect: 'rajz' },
    ],
  },
  {
    slug: 'egyedi-torta',
    name: 'Egyedi torta',
    price: 11000,
    note: '4-től 22 szeletig, kerek vagy szív',
    flavours: IZ.torta,
    flavourGroup: 'iz',
    shapes: [{ id: 'kerek', label: 'Kerek' }, { id: 'sziv', label: 'Szív' }],
    sizes: [
      { id: '4',     label: '4 szeletes',     dia: 13, height: 6.6, shapes: ['sziv'], delta: -1500 },
      { id: '6-8',   label: '6–8 szeletes',   dia: 16, height: 7.4,  delta: 0 },
      { id: '10-12', label: '10–12 szeletes', dia: 19, height: 8.2,  delta: 5000 },
      { id: '16-18', label: '16–18 szeletes', dia: 23, height: 9.2,  delta: 15000 },
      { id: '20-22', label: '20–22 szeletes', dia: 27, height: 10.2, delta: 24000 },
    ],
    /** A méret és a forma egy opciócsoport: „6–8 szeletes (kerek)”. */
    sizeShapeGroup: 'meret',
    frosting: true,
    border: true,
    text: { mode: 'free', max: 20, gold: 'Arany felirat' },
    tools: { brush: 'Extra rajz', pipe: 'Extra rajz' },
    extras: [
      { id: 'masni',      label: 'Masni',               price: 200,  group: 'extra', decor: 'masni',      count: 1 },
      { id: 'gyertya',    label: 'Gyertya (3 db sima)', price: 300,  group: 'extra', decor: 'gyertya',    count: 3, fixed: true },
      { id: 'cseresznye', label: 'Koktélcseresznye',    price: 500,  group: 'extra', decor: 'cseresznye', count: 3 },
      { id: 'virag',      label: 'Ehető élővirág',      price: 5500, group: 'extra', decor: 'virag',      count: 3 },
      { id: 'csillam',    label: 'Csillám',             price: 500,  group: 'extra', effect: 'csillam' },
      { id: 'arany',      label: 'Arany felirat',       price: 500,  group: 'extra', effect: 'arany' },
      { id: 'rajz',       label: 'Extra rajz',          price: 1000, group: 'extra', effect: 'rajz' },
    ],
  },
  {
    slug: 'bento-brownie',
    name: 'Bento brownie',
    price: 5000,
    note: 'négyzet / kerek / szív, 10–20 cm',
    flavours: ['Alap (brownie)', 'Málnás', 'Fehércsokis (blondie)'],
    flavourGroup: 'iz',
    flavourLabel: 'Brownie alap',
    shapes: [{ id: 'negyzet', label: 'Négyzet' }, { id: 'kerek', label: 'Kerek' }, { id: 'sziv', label: 'Szív' }],
    sizes: [
      { id: '10', label: 'Alap (10 cm)',    dia: 10, height: 3.2, delta: 0 },
      { id: '15', label: 'Közepes (15 cm)', dia: 15, height: 3.5, delta: 1500 },
      { id: '20', label: 'Nagy (20 cm)',    dia: 20, height: 3.8, delta: 3500 },
    ],
    shapeGroup: 'forma',
    frosting: false,
    border: false,
    text: {
      mode: 'preset', group: 'felirat', max: 20,
      presets: ['Szeretlek', 'HBD', 'Apa', 'Anya'],
      customLabel: 'Egyedi felirat (lentebb írom)',
    },
    tools: { brush: 'Egyedi rajz' },
    extras: [
      { id: 'gyumolcs', label: 'Gyümölcs dekor (eper, málna, áfonya)', price: 3000, group: 'extra', decorSet: ['eper', 'malna', 'afonya'], count: 5 },
      { id: 'rajz',     label: 'Egyedi rajz',                          price: 500,  group: 'extra', effect: 'rajz' },
    ],
  },
  {
    slug: 'bento-cup',
    name: 'Bento cup',
    price: 3000,
    note: 'fehér papírpohár, egy méret',
    flavours: IZ.cup,
    flavourGroup: 'iz',
    shapes: [],
    sizes: [{ id: 'cup', label: 'Pohár', dia: 7.6, height: 8.4 }],
    frosting: true,
    border: false,
    pattern: { group: 'dekor', options: CUP_PATTERNS },
    spoons: { group: 'kanal', options: [
      { id: '1', label: '1 db (alap)', delta: 0 },
      { id: '2', label: '2 db', delta: 100 },
      { id: '3', label: '3 db', delta: 150 },
    ] },
    text: { mode: 'none' },
    tools: {},
    extras: [
      { id: 'laktoz', label: 'Laktózmentesen kérem', price: 100, group: 'extra', flag: true },
      { id: 'gluten', label: 'Gluténmentesen kérem', price: 100, group: 'extra', flag: true },
    ],
  },
  {
    slug: 'bento-szelet',
    name: 'Bento szelet',
    price: 3500,
    note: 'egy szelet, dobozban',
    flavours: IZ.szelet,
    flavourGroup: 'iz',
    shapes: [],
    sizes: [{ id: 'szelet', label: 'Egy szelet', dia: 17, height: 4.6 }],
    frosting: true,
    // A korbefuto nyomott kremszegely a szelet sajat megjelenese (a fotokon is
    // ez lathato), ezert allithato. SZABAD kremnyomast viszont nem ajanlunk
    // fel: a szeletnek nincs "egyedi rajz" opcioja a webshopban, es a
    // katalogus az igazsag.
    border: true,
    text: { mode: 'none' },
    tools: {},
    extras: [
      { id: 'masni',      label: 'Masni',                 price: 200, group: 'extra', decor: 'masni',      count: 1 },
      { id: 'cseresznye', label: 'Koktélcseresznye',      price: 300, group: 'extra', decor: 'cseresznye', count: 1 },
      { id: 'csillam',    label: 'Csillám',               price: 300, group: 'extra', effect: 'csillam' },
      { id: 'laktoz',     label: 'Laktózmentesen kérem',  price: 300, group: 'extra', flag: true },
      { id: 'gluten',     label: 'Gluténmentesen kérem',  price: 300, group: 'extra', flag: true },
    ],
  },
];

export const productBySlug = (slug) => PRODUCTS.find((p) => p.slug === slug) ?? PRODUCTS[0];

export const sizeOf = (product, sizeId) =>
  product.sizes.find((s) => s.id === sizeId) ?? product.sizes[0];

/** A méretnél engedett formák — a 4 szeletes torta csak szív. */
export const shapesFor = (product, sizeId) => {
  const size = sizeOf(product, sizeId);
  if (!size.shapes) return product.shapes;
  return product.shapes.filter((s) => size.shapes.includes(s.id));
};

export const formatFt = (n) =>
  `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} Ft`;

/* ==================================================================
   Terv → valós termékopciók. A termékoldal ezt veszi át.
   ================================================================== */
export function buildOrder(product, config) {
  const size = sizeOf(product, config.size);
  const shape = product.shapes.find((s) => s.id === config.shape);
  const picks = [];
  const checked = [];
  let total = product.price;

  picks.push({ group: product.flavourGroup, label: product.flavourLabel ?? 'Íz', value: config.flavour, delta: 0 });

  if (product.sizeShapeGroup) {
    const value = `${size.label} (${shape?.id === 'sziv' ? 'szív' : 'kerek'})`;
    picks.push({ group: product.sizeShapeGroup, label: 'Méret és forma', value, delta: size.delta ?? 0 });
    total += size.delta ?? 0;
  } else {
    if (product.sizes.length > 1) {
      picks.push({ group: 'meret', label: 'Méret', value: size.label, delta: size.delta ?? 0 });
      total += size.delta ?? 0;
    }
    if (product.shapeGroup && shape) {
      picks.push({ group: product.shapeGroup, label: 'Forma', value: shape.label, delta: 0 });
    }
  }

  if (product.pattern) {
    const p = product.pattern.options.find((o) => o.id === config.pattern);
    if (p) picks.push({ group: product.pattern.group, label: 'Dekor', value: p.label, delta: 0 });
  }

  if (product.spoons) {
    const s = product.spoons.options.find((o) => o.id === config.spoons) ?? product.spoons.options[0];
    picks.push({ group: product.spoons.group, label: 'Kanál', value: s.label, delta: s.delta });
    total += s.delta;
  }

  if (product.text?.mode === 'preset') {
    const isPreset = product.text.presets.includes(config.text.value.trim());
    picks.push({
      group: product.text.group, label: 'Felirat',
      value: isPreset ? config.text.value.trim() : product.text.customLabel, delta: 0,
    });
  }

  for (const extra of product.extras) {
    if (!config.extras.includes(extra.id)) continue;
    checked.push({ group: extra.group, label: extra.label, delta: extra.price });
    total += extra.price;
  }

  const felirat = product.text?.mode === 'none'
    ? undefined
    : config.text.value.replace(/\n/g, ' ').trim().slice(0, product.text.max) || undefined;

  return { slug: product.slug, picks, checked, felirat, total };
}
