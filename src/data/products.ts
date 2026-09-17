/* Helyben tárolt termékfotók (a klienstől kapott képek). */
import cupOfLove1 from '../assets/products/cup-of-love-1.jpg';
import cupOfLove2 from '../assets/products/cup-of-love-2.jpg';
import cupOfLove3 from '../assets/products/cup-of-love-3.jpg';
import bakancsParok1 from '../assets/products/kozos-bakancslista-paroknak-1.jpg';
import bakancsParok2 from '../assets/products/kozos-bakancslista-paroknak-2.jpg';
import heroSzezonalis from '../assets/hero-szezonalis.jpg';
import enidoKartya1 from '../assets/products/enido-kartya-1.jpg';
import enidoKartya2 from '../assets/products/enido-kartya-2.jpg';
import enidoKartya3 from '../assets/products/enido-kartya-3.jpg';
import enidoKartya4 from '../assets/products/enido-kartya-4.jpg';
import enidoKartya5 from '../assets/products/enido-kartya-5.jpg';
import gondolataim1 from '../assets/products/gondolataim-szett-1.jpg';
import karacsonyiBakancs1 from '../assets/products/karacsonyi-bakancslista-1.jpg';
import bakancsBaratnok1 from '../assets/products/kozos-bakancslista-baratnoknek-1.jpg';
import bakancsBaratnok2 from '../assets/products/kozos-bakancslista-baratnoknek-2.jpg';

/**
 * PiciCake termékkatalógus.
 *
 * Adatok forrása: www.picicake.hu (árak, opciók, felárak, készlet).
 *
 * Az eredeti oldalon az extrák összevont kombinációk voltak
 * ("Arany felirat + masni (+700 Ft)"). Itt szét vannak szedve egyedi
 * tételekre, amelyekből egyszerre több is választható — az összevont árak
 * pontosan kiadják az egyedi felárak összegét.
 */

export type Choice = { label: string; delta?: number };

export type OptionGroup = {
  id: string;
  label: string;
  /** 'select' = pontosan egy választás, 'multi' = több is jelölhető. */
  type: 'select' | 'multi';
  /** Kötelező választás (select esetén alapból igen). */
  required?: boolean;
  /** Multi csoportnál: legalább ennyit kell választani. */
  min?: number;
  hint?: string;
  choices: Choice[];
};

export type CategoryId = 'tortak' | 'browniek' | 'egyeb-desszertek' | 'timebox';

export type Product = {
  slug: string;
  name: string;
  category: CategoryId;
  price: number;
  comparePrice?: number;
  images: string[];
  short: string;
  desc: string[];
  bullets?: { title: string; items: string[] }[];
  options?: OptionGroup[];
  badges?: ('bestseller' | 'new' | 'seasonal')[];
  stock?: number;
  /** Cukrászati termék: csak PiciCake futár vagy személyes átvétel. */
  perishable?: boolean;
  featured?: boolean;
};

/* ------------------------------------------------------------------ */
/* Képek                                                              */
/* ------------------------------------------------------------------ */

/** Kliens GHL media könyvtára. */
const g = (id: string) => `https://storage.googleapis.com/msgsndr/XK4K2wKwozmU9LFA2vpG/media/${id}`;
/** picicake.hu termékkép (510×510). */
const u = (file: string) => `https://www.picicake.hu/img/43435/${file}/510x510,r/${file}.jpg`;

/** Oldalspecifikus, nem termékhez tartozó képek. */
const cdn = (id: string) => `https://assets.cdn.filesafe.space/XK4K2wKwozmU9LFA2vpG/media/${id}`;

/** A Best Sellers blokkban a valódi fotók jelennek meg, nem az AI renderek. */
export const BEST_SELLER_PHOTOS: Record<string, string> = {
  'koreai-bento-torta': cdn('691db03fd4f9b34e3e614a6b.jpg'),
  'bento-cup': cdn('691e1a20840ed112fa3b6b30.jpg'),
  'brownie-csokibetukkel': cdn('691ddae3d4f9b30a3465ef96.jpg'),
};

export const SITE_IMAGES = {
  faq: 'https://assets.cdn.filesafe.space/XK4K2wKwozmU9LFA2vpG/media/6976a284d4fb90b1bde7e5a3.png',
  specialLeft: g('692d90aa3ae160794cc18b72.jpg'),
  specialRight: 'https://assets.cdn.filesafe.space/XK4K2wKwozmU9LFA2vpG/media/69c2bf59427f6e261079a405.jpg',
};

export const HERO_SLIDES = [
  {
    label: 'Kézműves finomságok',
    title: 'Egyedi torták minden alkalomra',
    cta: 'Rendelj tortát',
    to: '/termekek/tortak',
    image: 'https://assets.cdn.filesafe.space/XK4K2wKwozmU9LFA2vpG/media/69c2bdf288a056fe6f149e5a.png',
  },
  {
    label: 'Aktuális kedvencek',
    title: 'Szezonális desszertek',
    cta: 'Fedezd fel',
    to: '/termekek/egyeb-desszertek',
    image: heroSzezonalis,
  },
];

/* ------------------------------------------------------------------ */
/* Segédfüggvények és ismétlődő listák                                 */
/* ------------------------------------------------------------------ */

const plain = (...labels: string[]): Choice[] => labels.map((label) => ({ label }));
const c = (label: string, delta: number): Choice => ({ label, delta });

const sel = (id: string, label: string, choices: Choice[], hint?: string): OptionGroup =>
  ({ id, label, type: 'select', required: true, choices, hint });

const multi = (id: string, label: string, choices: Choice[], opts?: { min?: number; hint?: string }): OptionGroup =>
  ({ id, label, type: 'multi', min: opts?.min, hint: opts?.hint, choices });

const IZ_BENTO = plain(
  'Fehércsoki – málna', 'Fehércsoki – eper', 'Fehércsoki – áfonya',
  'Tejcsoki – málna', 'Tejcsoki – eper', 'Tejcsoki – áfonya',
  'Citrom', 'Lime-kókusz', 'Vanília', 'Maxi King (mogyoró!)',
  'Eper-kókusz', 'Bounty', 'Pumpkin spice', 'Karamella',
  'Tejcsoki', 'Fehércsoki', 'Mézeskalács',
);

const IZ_TORTA = plain(
  'Fehércsoki – málna', 'Fehércsoki – eper', 'Fehércsoki – áfonya',
  'Tejcsoki – málna', 'Tejcsoki – eper', 'Tejcsoki – áfonya',
  'Lime-kókusz', 'Eper-kókusz', 'Citrom', 'Vanília',
  'Maxi king', 'Bounty', 'Karamella', 'Tejcsoki', 'Fehércsoki',
);

const IZ_SZELET = plain(
  'Tejcsoki – eper', 'Tejcsoki – málna', 'Tejcsoki – áfonya', 'Tejcsoki',
  'Fehércsoki – eper', 'Fehércsoki – málna', 'Fehércsoki – áfonya', 'Fehércsoki',
  'Maxi king (mogyoró!)', 'Karamella', 'Vanília',
);

const IZ_CUP = plain(
  'Citrom', 'Vanília (laktózmentesen is)',
  'Kókusz – málna (laktózmentesen is)', 'Kókusz – eper (laktózmentesen is)',
  'Bounty', 'Maxi king (mogyoró!)',
  'Fehércsoki – eper', 'Fehércsoki – áfonya', 'Fehércsoki – málna',
  'Tejcsoki – eper', 'Tejcsoki – áfonya', 'Tejcsoki – málna',
  'Karamella', 'Tejcsoki', 'Fehércsoki',
);

const DIET_EXTRAS = (fee: number): Choice[] => [c('Laktózmentesen kérem', fee), c('Gluténmentesen kérem', fee)];

/* ------------------------------------------------------------------ */
/* Közös szöveges blokkok (picicake.hu)                                */
/* ------------------------------------------------------------------ */

export const CAKE_RULES: { title: string; items: string[] }[] = [
  {
    title: 'Stílus és kivitelezés',
    items: [
      'Minden torta egyedi kérés alapján, PiciCake stílusban készül. Inspirációs fotót szívesen fogadunk, de más alkotó munkáját nem tudjuk pontosan reprodukálni — hasonló végeredményre törekszünk.',
      'A dekoráció kizárólag krémmel készül.',
      'Nem kérhető: cukorgyöngy, marcipán, fondant figura és ostyakép — ezek elolvadnak a mascarpone krémen.',
      'Fotó/kép ostyát nem készítünk, csak egyszerűbb, rajzos átdolgozás lehetséges.',
    ],
  },
  {
    title: 'Extrák, ahogy a valóságban kinéznek',
    items: [
      'Csillám: fújt csillámot használunk, gyöngyház hatású csillogással. Természetes fényben alig látszik, erős hidegfényben vagy vakuval érvényesül.',
      'Élővirág: az ehető virág mix mindig az aktuálisan elérhető, szezonális virágokból áll.',
      'Gyertya: minden esetben sima fehér, és nem a tortára tesszük, hanem mellé csomagoljuk.',
    ],
  },
];

export const CAKE_PACKAGING =
  'A bento torta zsírpapíron, felfelé nyitható, 15 cm-es cukornád dobozban kerül átadásra. Zacskót nem tudunk adni, több torta esetén érdemes magaddal hozni egyet. Melegben (már tavasztól) egy kis hűtőtáska jégakkuval jó szolgálatot tesz.';

/* ------------------------------------------------------------------ */
/* Termékek                                                            */
/* ------------------------------------------------------------------ */

export const PRODUCTS: Product[] = [
  /* ---------------------------- TORTÁK ---------------------------- */
  {
    slug: 'koreai-bento-torta',
    name: 'Koreai bento torta',
    category: 'tortak',
    price: 4500,
    images: [g('691f28839389317628b633cf.png'), g('691f2a54a1976e6063d6f129.jpg'), u('torta')],
    short: '8–10 cm-es minimalista torta két főre, egyedi felirattal.',
    desc: [
      'Az ünneplés szórakoztató, intim és finom módját keresed?',
      'A bento — vagy lunch-box — torták szépek, minimalisták és picik: 8–10 cm-es, átlagosan 200–300 grammos kis falánkságok. Tökéletesek 2 fő részére, de egyedül is könnyen elfogyaszthatók.',
      'A puha vaníliás piskótához válassz a gazdag mascarponés töltelék variációi közül. A piskóta minden esetben vaníliás, amelyet az általad választott krémmel töltünk be.',
      'Személyre szabható: válassz ízt, formát, és add meg a személyes üzenetedet.',
    ],
    bullets: [
      {
        title: 'Milyen alkalmakra javasoljuk?',
        items: ['Lánykérés', 'Intim gender reveal', 'Girls night', 'Lánybúcsú', 'Születésnap', 'Évforduló', 'Diplomaosztó', 'Egy átlagos nap'],
      },
      ...CAKE_RULES,
    ],
    options: [
      sel('iz', 'Íz', IZ_BENTO),
      sel('forma', 'Forma', plain('Kerek', 'Szív')),
      multi('extra', 'Extrák', [
        c('Egyedi rajz', 500),
        c('Arany felirat', 300),
        c('Fújt csillám', 300),
        c('Masni', 200),
        c('Gyertya (sima, 1 db)', 100),
        c('Ehető élővirág', 3500),
      ], { hint: 'Több is választható. A felirat felár nélkül jár.' }),
    ],
    badges: ['bestseller'],
    perishable: true,
    featured: true,
  },
  {
    slug: 'egyedi-torta',
    name: 'Egyedi torta',
    category: 'tortak',
    price: 11000,
    images: [g('691f27cea1976e6f59d68ee5.png'), g('691f0d19c862b02ae6cc4b85.jpg')],
    short: 'Szülinapi és ünnepi torta 4–22 szeletig, kerek vagy szív formában.',
    desc: [
      'Amikor nem két főre kell a torta, hanem az egész társaságnak. A vaníliás piskótához itt is te választod meg a mascarponés krém ízét, a méretet és a formát — mi pedig a te feliratoddal készítjük el.',
      '4 szeletestől 20–22 szeletesig rendelhető, kerek vagy szív alakban. A nagyobb méreteknél a felirat 15–20 karakterig ajánlott.',
    ],
    bullets: CAKE_RULES,
    options: [
      sel('iz', 'Íz', IZ_TORTA),
      sel('meret', 'Méret és forma', [
        c('4 szeletes (szív)', -1500),
        { label: '6–8 szeletes (kerek)' },
        { label: '6–8 szeletes (szív)' },
        c('10–12 szeletes (kerek)', 5000),
        c('10–12 szeletes (szív)', 5000),
        c('16–18 szeletes (kerek)', 15000),
        c('16–18 szeletes (szív)', 15000),
        c('20–22 szeletes (kerek)', 24000),
        c('20–22 szeletes (szív)', 24000),
      ]),
      multi('extra', 'Extrák', [
        c('Masni', 200),
        c('Gyertya (3 db sima)', 300),
        c('Arany felirat', 500),
        c('Extra rajz', 1000),
        c('Koktélcseresznye', 500),
        c('Csillám', 500),
        c('Ehető élővirág', 5500),
      ], { hint: 'Több is választható — az árak összeadódnak.' }),
    ],
    badges: ['bestseller'],
    perishable: true,
    featured: true,
  },
  {
    slug: 'laktozmentes-torta',
    name: 'Laktózmentes torta',
    category: 'tortak',
    price: 5500,
    images: [g('691f2e5d51f400c1a339c881.png'), g('691de216c03e0f18acc829e7.jpg')],
    short: 'Bento méretben és nagyobb tortaként is, gluténmentes kiegészítéssel.',
    desc: [
      'Ugyanaz a PiciCake stílus és krémes állag, laktózmentes alapanyagokból. Bento méretben indul, de 10–12 szeletes tortáig kérhető, kerek és szív formában.',
      'A kókuszos ízek gluténtartalmúak — ezt a választásnál jelezzük is. Ha egyszerre laktóz- és gluténmentes tortára van szükséged, az extráknál tudod hozzáadni.',
    ],
    bullets: CAKE_RULES,
    options: [
      sel('meret', 'Méret', [
        { label: 'Bento torta (szív)' }, { label: 'Bento torta (kerek)' },
        c('4 szeletes (csak szív)', 4500),
        c('6–8 szeletes (szív)', 6000), c('6–8 szeletes (kerek)', 6000),
        c('10–12 szeletes (szív)', 11000), c('10–12 szeletes (kerek)', 11000),
      ]),
      sel('iz', 'Íz', plain(
        'Citrom', 'Lime', 'Málna', 'Eper', 'Áfonya', 'Vanília',
        'Vanília – eper', 'Vanília – málna', 'Vanília – áfonya',
        'Kókusz (glutén)', 'Kókusz – lime (glutén)', 'Kókusz – eper (glutén)',
        'Kókusz – málna (glutén)', 'Kókusz – áfonya (glutén)',
      )),
      multi('extra', 'Extrák', [
        c('Masni', 200),
        c('Gyertya (3 db sima)', 300),
        c('Extra rajz', 500),
        c('Arany felirat', 500),
        c('Csillám', 500),
        c('Gluténmentesen is kérem', 1000),
        c('Ehető élővirág', 5500),
      ], { hint: 'Több is választható — az árak összeadódnak.' }),
    ],
    badges: ['bestseller'],
    perishable: true,
    featured: true,
  },
  {
    slug: 'glutenmentes-torta',
    name: 'Gluténmentes torta',
    category: 'tortak',
    price: 5500,
    images: [g('691f2d1a5bbf7f91b1e8a06c.png'), g('691de6ce59e47b059846b5f3.jpg')],
    short: 'Gluténmentes piskóta, bento mérettől 10–12 szeletes tortáig.',
    desc: [
      'Gluténmentes piskótából, ugyanazokkal az ízekkel és a megszokott dekorációval. Bento mérettől 10–12 szeletes tortáig rendelhető, kerek vagy szív formában.',
      'A műhelyben glutént tartalmazó alapanyagokkal is dolgozunk, ezért a termék nyomokban glutént tartalmazhat.',
    ],
    bullets: CAKE_RULES,
    options: [
      sel('meret', 'Méret', [
        { label: 'Bento torta (szív)' }, { label: 'Bento torta (kerek)' },
        c('4 szeletes (szív)', 3000),
        c('6–8 szeletes (szív)', 6000), c('6–8 szeletes (kerek)', 6000),
        c('10–12 szeletes (szív)', 11000), c('10–12 szeletes (kerek)', 11000),
      ]),
      sel('iz', 'Íz', plain(
        'Citrom', 'Málna', 'Eper', 'Áfonya', 'Vanília',
        'Vanília – málna', 'Vanília – eper', 'Vanília – áfonya',
        'Csoki', 'Csoki – málna', 'Csoki – eper', 'Csoki – áfonya',
        'Fehércsoki', 'Fehércsoki – málna', 'Fehércsoki – eper', 'Fehércsoki – áfonya',
      )),
      multi('extra', 'Extrák', [
        c('Masni', 200),
        c('Gyertya (3 db sima)', 300),
        c('Fújt csillám', 300),
        c('Egyedi rajz', 500),
        c('Arany felirat', 500),
        c('Ehető élővirág', 5500),
      ], { hint: 'Több is választható — az árak összeadódnak.' }),
    ],
    perishable: true,
  },
  {
    slug: 'ajandekcsomag',
    name: 'Ajándékcsomag',
    category: 'tortak',
    price: 13000,
    images: [g('692198e65408c6b95a28b5fc.png'), g('691e1dd0c03e0f4ee5d2abe9.jpg'), u('anyatortavirag')],
    short: 'Desszert és tortavirág egy csomagban — kész ajándék, semmi szervezés.',
    desc: [
      'Ha egy desszertnél többet szeretnél adni: a csomagban a választott torta vagy bento brownie mellé tortavirág is kerül, és kérhetsz hozzá TiMEbox ajándékot is.',
      'Anyák napjára, szülinapra, évfordulóra vagy köszönetnyilvánításra egyben, csomagolva.',
    ],
    bullets: CAKE_RULES,
    options: [
      sel('desszert', 'Desszert típusa', [
        ...plain(
          'Torta – fehércsoki-málna', 'Torta – fehércsoki-áfonya', 'Torta – fehércsoki-eper',
          'Torta – csoki-málna', 'Torta – csoki-áfonya', 'Torta – csoki-eper',
          'Torta – lime-kókusz', 'Torta – eper-kókusz', 'Torta – maxi king', 'Torta – bounty',
        ),
        c('Bento brownie (klasszikus)', -500),
      ]),
      sel('virag', 'Virág típusa', [
        { label: 'Nagy kerek' }, { label: 'Táska' }, c('Pillangó', 1000),
      ]),
      multi('ajandek', 'Ajándék mellé', [
        c('Énidő kártya', 2500),
        c('Önbizalom kártya', 2000),
        c('Beszélgetős kártya', 1500),
        c('Napi tervező', 1200),
        c('Hálanapló', 1000),
        c('Szatén scrunchie', 1000),
      ], { hint: 'Több is választható.' }),
    ],
    badges: ['bestseller'],
    perishable: true,
  },

  /* --------------------------- BROWNIEK --------------------------- */
  {
    slug: 'brownie-csokibetukkel',
    name: 'Brownie csokibetűkkel',
    category: 'browniek',
    price: 6000,
    images: [g('691f46ae5c5cab2f3714040b.png'), g('691ddae3d4f9b30a3465ef96.jpg')],
    short: 'Tábla brownie csokiszósszal és egyedi csokibetűs felirattal.',
    desc: [
      'Amikor az üzenet a lényeg. A sűrű, fudge-os brownie tetejére csokiszósz és egyedi felirat kerül csokibetűkből — tehát a szülinapi jókívánság vagy a bocsánatkérés is elfogyasztható.',
      'Kicsi (15×15 cm) és nagy (20×20 cm) méretben, három brownie alappal és háromféle szósszal.',
    ],
    options: [
      sel('tipus', 'Brownie típusa', plain('Klasszikus', 'Blondie – fehércsokis', 'Málnás')),
      multi('szosz', 'Szószok', plain('Málna', 'Karamella', 'Eper'), { min: 1, hint: 'Legalább egyet válassz, de többet is kérhetsz.' }),
      sel('meret', 'Méret', [{ label: 'Kicsi (15×15 cm)' }, c('Nagy (20×20 cm)', 3000)]),
    ],
    badges: ['bestseller'],
    perishable: true,
    featured: true,
  },
  {
    slug: 'bento-brownie',
    name: 'Bento brownie',
    category: 'browniek',
    price: 5000,
    images: [g('691f49dac862b0a90ad41989.png'), u('bentobrownie')],
    short: 'Brownie bento dobozban, felirattal vagy rajzzal, három méretben.',
    desc: [
      'A bento torta brownie-változata: sűrű, csokis alap, dobozban, kész üzenettel. Válaszd a klasszikust, a fehércsokis blondie-t vagy a málnást, hozzá pedig előre megírt vagy teljesen egyedi feliratot.',
      'Négyzet, kerek és szív formában, 10, 15 és 20 cm-es méretben.',
    ],
    options: [
      sel('iz', 'Brownie íze', plain('Alap (brownie)', 'Málnás', 'Fehércsokis (blondie)')),
      sel('felirat', 'Felirat', plain('Szeretlek', 'HBD', 'Apa', 'Anya', 'Egyedi felirat (lentebb írom)')),
      sel('forma', 'Forma', plain('Négyzet', 'Kerek', 'Szív')),
      sel('meret', 'Méret', [
        { label: 'Alap (10 cm)' }, c('Közepes (15 cm)', 1500), c('Nagy (20 cm)', 3500),
      ]),
      multi('extra', 'Extrák', [
        c('Egyedi rajz', 500),
        c('Gyümölcs dekor (eper, málna, áfonya)', 3000),
      ], { hint: 'Több is választható.' }),
    ],
    perishable: true,
  },
  {
    slug: 'brookie-kekszek',
    name: 'Brookie kekszek',
    category: 'browniek',
    price: 690,
    images: [g('69720b14d4fb900a76084abb.png'), g('691f4643a1976e5ce1db0dd7.jpg')],
    short: 'Darabos, brownie-s keksz nyolc ízben, 1-től 8 darabos kiszerelésben.',
    desc: [
      'Brownie és keksz egyben: kívül ropogós, belül fudge-os. Nyolc ízből válogathatsz, és 1, 2, 4, 6 vagy 8 darabos csomagot is kérhetsz — kávé vagy tea mellé a legjobb.',
      'Jól zárva 3 napig eláll. Ha kiszáradna, fél perc mikróban újra tökéletes.',
    ],
    options: [
      sel('iz', 'Íz', plain(
        'Vörösbársony', 'Brownie', 'Funfetti', 'Citrom',
        'Fehércsoki-eper', 'Csokis keksz', 'Cinnamon', 'Pumpkin Spice',
      )),
      sel('kiszereles', 'Kiszerelés', [
        { label: '1 darabos' }, c('2 darabos', 690), c('4 darabos', 2070),
        c('6 darabos', 3450), c('8 darabos', 4830),
      ]),
    ],
    badges: ['bestseller'],
    perishable: true,
    featured: true,
  },
  {
    slug: 'browniesu',
    name: 'Browniesu',
    category: 'browniek',
    price: 3000,
    images: [g('691f42f9d0b2ee8659bf89a6.png'), g('691dd84cf05eaf31f81e6a96.jpg')],
    short: 'Brownie és tiramisu találkozása, három méretben.',
    desc: [
      'A brownie sűrűsége és a tiramisu krémessége egy desszertben. Kerek 10 cm-es alapmérettől 20×20 cm-es tábláig kérhető, így magadnak és egy nagyobb társaságnak is jó.',
    ],
    options: [
      sel('meret', 'Méret', [
        { label: 'Alap (kerek, 10 cm)' },
        c('Közepes (négyzet, 15×15 cm)', 2000),
        c('Nagy (négyzet, 20×20 cm)', 4500),
      ]),
    ],
    perishable: true,
  },
  {
    slug: 'pumpkin-spice-blondie',
    name: 'Pumpkin Spice Blondie',
    category: 'browniek',
    price: 3000,
    images: [u('pumpkinspiceblondie')],
    short: 'Szezonális fehércsokis blondie sütőtökös fűszerezéssel.',
    desc: [
      'Ősz kezdetétől: fehércsokis blondie sütőtökös fűszerkeverékkel — fahéj, szegfűszeg, gyömbér. Kis marcipános tökökkel is kérhető, kerek és szív formában.',
    ],
    options: [
      sel('forma', 'Forma', plain('Kerek', 'Szív')),
      multi('extra', 'Extrák', [c('Kis marcipán tökök', 300)]),
    ],
    badges: ['seasonal'],
    perishable: true,
  },

  /* ----------------------- EGYÉB DESSZERTEK ----------------------- */
  {
    slug: 'bento-cup',
    name: 'Bento cup',
    category: 'egyeb-desszertek',
    price: 3000,
    images: [u('bentocup'), g('691e1a20840ed112fa3b6b30.jpg')],
    short: 'Pohárdesszert 15 ízben, választható dekorral és kanállal.',
    desc: [
      'Ugyanaz a piskóta és mascarponés krém, csak pohárban — így kanállal, azonnal fogyasztható. Tizenöt ízből válogathatsz, a tetejére pedig szívecskés, virágos, tappancsos vagy masnis dekor kerül.',
      'Laktóz- és gluténmentesen is kérhető, és extra kanalat is tudunk adni, ha megosztod valakivel.',
    ],
    options: [
      sel('iz', 'Íz', IZ_CUP),
      sel('dekor', 'Dekor', plain('Szívecskés', 'Virágos', 'Tappancsos', 'Gombás', 'Masnis', 'Felhős', 'Csillagos')),
      sel('kanal', 'Kanál', [
        { label: '1 db (alap)' }, c('2 db', 100), c('3 db', 150),
      ]),
      multi('extra', 'Extrák', DIET_EXTRAS(100)),
    ],
    perishable: true,
    featured: true,
  },
  {
    slug: 'bento-szelet',
    name: 'Bento szelet',
    category: 'egyeb-desszertek',
    price: 3500,
    images: [u('szelet')],
    short: 'Egyszemélyes tortaszelet 11 ízben, csillámmal vagy masnival.',
    desc: [
      'Egy szelet a bento tortából, dobozban — ha csak magadnak veszel valamit, vagy ha többféle ízt szeretnél kipróbálni. Tizenegy íz, hozzá csillám, masni vagy koktélcseresznye.',
      'Képeslapot is tudunk mellé tenni a te üzenetedddel.',
    ],
    options: [
      sel('iz', 'Íz', IZ_SZELET),
      multi('extra', 'Extrák', [
        c('Masni', 200),
        c('Csillám', 300),
        c('Koktélcseresznye', 300),
        ...DIET_EXTRAS(300),
        c('Képeslap üzenettel', 500),
      ], { hint: 'Több is választható — az árak összeadódnak.' }),
    ],
    badges: ['new'],
    stock: 8,
    perishable: true,
  },
  {
    slug: 'cup-of-love',
    name: 'Cup of Love',
    category: 'egyeb-desszertek',
    price: 6290,
    images: [cupOfLove1, cupOfLove2, cupOfLove3],
    short: 'Ajándékdesszert szezonális mintával és képeslappal.',
    desc: [
      'Kész ajándék: pohárdesszert a választott ízzel, az alkalomhoz illő mintával — Valentin-naptól karácsonyig tíz variációban. Képeslapot is tudunk mellé tenni, hogy ne kelljen külön beszerezned.',
    ],
    options: [
      sel('iz', 'Íz', IZ_SZELET),
      sel('minta', 'Minta', plain(
        'Valentin nap', 'Tavasz', 'Anyák napja', 'Nyár', 'Ősz 1', 'Ősz 2',
        'Halloween', 'Tél', 'Mikulás', 'Karácsony',
      )),
      multi('extra', 'Extrák', [
        c('Képeslap üzenettel', 500),
        ...DIET_EXTRAS(300),
      ], { hint: 'Több is választható.' }),
    ],
    badges: ['new'],
    stock: 5,
    perishable: true,
  },
  {
    slug: 'valentin-ajanlat',
    name: 'Valentin ajánlat',
    category: 'egyeb-desszertek',
    price: 6290,
    images: [u('combo')],
    short: 'Limitált Valentin-napi csomag szelettel és képeslappal.',
    desc: [
      'Limitált mennyiségben: Valentin-napi csomag a választott ízű szelettel, masnival vagy csillámmal, és ha kéred, képeslappal. Amíg a készlet tart.',
    ],
    options: [
      sel('iz', 'Szelet íze', IZ_SZELET),
      multi('extra', 'Extrák', [
        c('Masni', 200),
        c('Fújt csillám', 300),
        ...DIET_EXTRAS(300),
        c('Képeslap üzenettel', 500),
      ], { hint: 'Több is választható — az árak összeadódnak.' }),
    ],
    badges: ['new', 'seasonal'],
    stock: 8,
    perishable: true,
  },

  /* ------------------------ TIMEBOX TERMÉKEK ---------------------- */
  {
    slug: 'ajandek-timebox',
    name: 'Ajándék TiMEbox',
    category: 'timebox',
    price: 6000,
    comparePrice: 7990,
    images: [g('6924a74ae7b094f70c1f341d.png'), g('68f9d5d5778d6541796d1c36.png'), u('ajandekbox01')],
    short: 'Összeállított ajándékbox scrunchie-val és választható kártyákkal.',
    desc: [
      'Kész ajándék annak, aki megérdemli, hogy egy kicsit magára is figyeljen. A boxban szatén scrunchie és önfejlesztő kiegészítők vannak — az extráknál pedig tudsz hozzá kártyát, naplót vagy bakancslistát választani.',
    ],
    options: [
      sel('scrunchie', 'Scrunchie színe', plain('Babarózsaszín szatén', 'Narancs szatén', 'Mályva szatén', 'Pink szatén', 'Lila (matt)')),
      multi('extra', 'Extrák', [
        c('Énidő kártya', 2500),
        c('Advent kártya', 1500),
        c('Jegyzettömb', 600),
        c('Karácsonyi bakancslista', 350),
      ], { hint: 'Több is választható.' }),
    ],
    badges: ['bestseller'],
    stock: 19,
  },
  {
    slug: 'enido-timebox',
    name: 'Énidő TiMEbox',
    category: 'timebox',
    price: 5990,
    comparePrice: 7590,
    images: [g('6924a5dfc61b111308135924.png'), g('69244808a6fefe40cb366427.jpg')],
    short: 'Énidő box scrunchie-val, kártyákkal és naplókkal bővíthetően.',
    desc: [
      'Egy box arról, hogy a napodból egy kis rész a tiéd legyen. Scrunchie, kártyák és tervezők — az extráknál tudsz hozzá önbizalom kártyát, naplót vagy bakancslistát tenni.',
    ],
    options: [
      sel('scrunchie', 'Scrunchie színe', plain('Narancs', 'Pink', 'Babarózsaszín', 'Mályva', 'Lila (matt)')),
      multi('extra', 'Extrák', [
        c('Önbizalom kártya', 3000),
        c('Advent kártya', 3500),
        c('Beszélgetős kártya', 2500),
        c('Önbizalom napló', 600),
        c('Énidő lista', 600),
        c('Karácsonyi bakancslista', 600),
        c('Bakancslista barátnőknek', 600),
        c('Bakancslista pároknak', 600),
      ], { hint: 'Több is választható.' }),
    ],
    stock: 10,
  },
  {
    slug: 'enido-kartya',
    name: 'Énidő kártya',
    category: 'timebox',
    price: 2500,
    comparePrice: 5000,
    // Feltételezett kép a picicake.hu névsémája alapján — ha 404, a helyőrző jelenik meg.
    images: [enidoKartya1, enidoKartya2, enidoKartya3, enidoKartya4, enidoKartya5],
    short: 'Kártyacsomag napi énidő ötletekkel.',
    desc: [
      'Kártyák, amelyek minden nap adnak egy ötletet arra, hogyan tölts pár percet magaddal. Húzol egyet, és megteszed — nem kell hozzá se app, se tervezés.',
    ],
    stock: 18,
  },
  {
    slug: 'onbizalom-kartya',
    name: 'Önbizalom kártya',
    category: 'timebox',
    price: 1500,
    comparePrice: 3000,
    images: [u('onbizalomkartya01')],
    short: 'Megerősítő kártyák a napi rutinba.',
    desc: [
      'Megerősítő állítások kártyákon, amelyek nem üres szlogenek: mindegyikhez tartozik egy konkrét kérdés vagy mini feladat, amivel aznap dolgozni tudsz.',
    ],
    stock: 45,
  },
  {
    slug: 'beszelgetos-kartya',
    name: 'Beszélgetős kártya',
    category: 'timebox',
    price: 500,
    comparePrice: 2500,
    images: [g('6924a7c28e95935e22e3aa70.png'), g('6924a8038e95935148e3b38d.jpg'), u('kozoseste01')],
    short: 'Kérdéskártyák csajos estékre és páros beszélgetésekre.',
    desc: [
      'Kérdések, amiktől egy közös este nem a telefonnyomkodásnál ragad le. Csajos estére, páros beszélgetésre vagy családi asztalhoz.',
    ],
  },
  {
    slug: 'advent-kartya',
    name: 'Advent kártya',
    category: 'timebox',
    price: 1500,
    comparePrice: 4500,
    images: [u('adventkartya01')],
    short: '24 kártya az adventi készülődéshez.',
    desc: [
      'Huszonnégy kártya, mindegyiken egy apró adventi programmal. Naptár helyett, ami csak csokit ad: ez a decemberi hetekbe tesz bele valamit.',
    ],
    badges: ['seasonal'],
    stock: 29,
  },
  {
    slug: 'gondolataim-szett',
    name: 'Gondolataim szett',
    category: 'timebox',
    price: 3500,
    images: [gondolataim1],
    short: 'Napló és jegyzetszett az írós napokra.',
    desc: [
      'Összeállított szett azoknak, akik szeretik kiírni magukból a dolgokat: napló és jegyzetkiegészítők egy csomagban.',
    ],
  },
  {
    slug: 'halanaplo',
    name: 'Hálanapló',
    category: 'timebox',
    price: 900,
    comparePrice: 1200,
    images: [u('halanaplo01')],
    short: 'Napi három sor arról, ami jó volt.',
    desc: ['Napi három sor arról, ami aznap jó volt. Ennyi az egész — és pont ezért nem marad abba két hét után.'],
    stock: 133,
  },
  {
    slug: 'tervezo',
    name: 'Napi tervező',
    category: 'timebox',
    price: 1000,
    comparePrice: 1500,
    images: [u('tervezo01')],
    short: 'Napi tervező a fontos három feladatra.',
    desc: ['Egy lap egy nap: a három legfontosabb feladat, az időpontok és egy hely a jegyzeteknek. Nem tölti meg a napodat, csak rendezi.'],
    stock: 105,
  },
  {
    slug: 'jegyzettomb',
    name: 'Jegyzettömb',
    category: 'timebox',
    price: 350,
    comparePrice: 600,
    images: [u('jegyzettomb01')],
    short: 'Kicsi tömb a táska oldalzsebébe.',
    desc: ['Kicsi tömb, ami elfér a táska oldalzsebében — bevásárlólistához, ötletekhez, telefonszámokhoz.'],
    stock: 131,
  },
  {
    slug: 'bakancslista',
    name: 'Bakancslista',
    category: 'timebox',
    price: 300,
    comparePrice: 500,
    images: [u('bakancslista01')],
    short: 'Szezonális lista a kihagyhatatlan programokról.',
    desc: ['Szezonális lista arról, amit idén nem akarsz kihagyni. Kipipálni a legjobb része.'],
    stock: 40,
  },
  {
    slug: 'karacsonyi-bakancslista',
    name: 'Karácsonyi bakancslista',
    category: 'timebox',
    price: 350,
    comparePrice: 600,
    images: [karacsonyiBakancs1],
    short: 'Adventi programlista a decemberi hetekre.',
    desc: ['Decemberi programlista: mit süss, hova menj, kit hívj fel. Egy lap, ami rendet tesz az adventi hajtásban.'],
    badges: ['seasonal'],
    stock: 30,
  },
  {
    slug: 'kozos-bakancslista-baratnoknek',
    name: 'Közös bakancslista barátnőknek',
    category: 'timebox',
    price: 350,
    comparePrice: 600,
    images: [bakancsBaratnok1, bakancsBaratnok2],
    short: 'Páros lista a legjobb barátnőddel.',
    desc: ['Lista, amit ketten töltetek ki: mit szeretnétek együtt megcsinálni az idén. Ajándéknak is jó, mert kötelez egy kis közös időre.'],
    stock: 36,
  },
  {
    slug: 'kozos-bakancslista-paroknak',
    name: 'Közös bakancslista pároknak',
    category: 'timebox',
    price: 350,
    comparePrice: 600,
    images: [bakancsParok1, bakancsParok2],
    short: 'Páros lista közös tervekkel.',
    desc: ['Közös tervek egy lapon: utazás, első próbálkozások, apró randiötletek. Évfordulóra ajándékba is adható.'],
    badges: ['new'],
    stock: 31,
  },
  {
    slug: 'szaten-scrunchie',
    name: 'Szatén scrunchie',
    category: 'timebox',
    price: 990,
    images: [u('szatenscrunchie01')],
    short: 'Szatén hajgumi öt színben.',
    desc: ['Szatén hajgumi, ami nem hagy nyomot a hajon. Öt színben — a TiMEbox boxok mellé kiegészítőként is jó.'],
    options: [sel('szin', 'Szín', plain('Narancs', 'Világos lila', 'Mályva', 'Pink', 'Rózsaszín'))],
  },
];

/* ------------------------------------------------------------------ */
/* Kategóriák                                                          */
/* ------------------------------------------------------------------ */

export const CATEGORIES: { id: CategoryId; name: string; short: string; allLabel: string; slug: string; blurb: string; image?: string }[] = [
  {
    id: 'tortak', name: 'Torták', short: 'Torták', allLabel: 'Összes torta', slug: 'tortak',
    blurb: 'Bento torták két főre és nagy torták az egész társaságnak.',
    image: 'https://assets.cdn.filesafe.space/XK4K2wKwozmU9LFA2vpG/media/69c2bdf288a056fe6f149e5a.png',
  },
  {
    id: 'browniek', name: 'Browniek', short: 'Browniek', allLabel: 'Összes brownie', slug: 'browniek',
    blurb: 'Sűrű, fudge-os brownie-k, brookie kekszek és blondie.',
    image: g('691f46ae5c5cab2f3714040b.png'),
  },
  {
    id: 'egyeb-desszertek', name: 'Egyéb Desszertek', short: 'Desszertek', allLabel: 'Összes desszert', slug: 'egyeb-desszertek',
    blurb: 'Pohárdesszertek, szeletek és kész ajándékcsomagok.',
    image: u('bentocup'),
  },
  {
    id: 'timebox', name: 'TiMEbox Önfejlesztő Termékek', short: 'Ajándékok', allLabel: 'Összes ajándék', slug: 'timebox-onfejleszto-termekek',
    blurb: 'Kártyák, naplók és ajándékboxok — most végkiárusításon.',
    image: g('6924a74ae7b094f70c1f341d.png'),
  },
];

export const CATEGORY_BY_SLUG: Record<string, CategoryId> = {
  tortak: 'tortak',
  browniek: 'browniek',
  'egyeb-desszertek': 'egyeb-desszertek',
  'timebox-onfejleszto-termekek': 'timebox',
};

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

export const productsIn = (category?: CategoryId) =>
  category ? PRODUCTS.filter((p) => p.category === category) : PRODUCTS;

export const hasOptions = (p: Product) => Boolean(p.options?.length);

/** Egyszerű keresés név, rövid leírás és kategória alapján. */
export const searchProducts = (query: string) => {
  const q = query
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (q.length < 2) return [];
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return PRODUCTS.filter((p) => {
    const cat = CATEGORIES.find((x) => x.id === p.category)?.name ?? '';
    return norm(`${p.name} ${p.short} ${cat}`).includes(q);
  }).slice(0, 8);
};
