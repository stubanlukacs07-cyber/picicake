/**
 * Központi beállítások. Élesítés előtt ezt a fájlt kell átnézni.
 *
 * A szállítási módok, díjak és fizetési adatok forrása:
 * https://www.picicake.hu/shop_contact.php?tab=shipping
 */

export const SHOP = {
  name: 'PiciCake',
  tagline: 'Pici torta, nagy élmény',
  email: 'picicake.budapest@gmail.com',
  phone: '+36 30 313 3656',
  phoneHref: '+36303133656',
  address: '1156 Budapest, Páskomliget utca 50.',
  addressNote: '44-es kapucsengő',
  /** Személyes átvétel sávja a XV. kerületben (nem nyitvatartás — előzetes egyeztetéssel). */
  pickupWindow: '11:00–18:00',
  /** Budapesti kiszállítás sávja. */
  deliveryWindowBudapest: '13:00–17:00',
  /** Agglomerációs kiszállítás sávja. */
  deliveryWindowAgglo: '13:00–19:00',
  contactPerson: 'Erényi-Kovács Tímea',
  taxNumber: '57743774142',
  regNumber: '56394535',
  bankAccount: '11715007 21553572',
  bankName: 'OTP Bank',
  /** A desszert legkorábban ennyi nappal később kérhető (GYIK: min. 4 nap). */
  leadTimeDays: 4,
  /** TiMEbox (nem romlandó) termékeknél rövidebb az átfutás. */
  leadTimeDaysGifts: 2,
  social: {
    instagram: 'https://www.instagram.com/pici.cake/',
    facebook: 'https://www.facebook.com/p/PiciCake-61552846619097/?locale=hu_HU',
    tiktok: 'https://www.tiktok.com/@picicake.budapest',
  },
  legal: {
    aszf: 'https://www.picicake.hu/shop_help.php?tab=terms',
    privacy: 'https://www.picicake.hu/shop_help.php?tab=privacy_policy',
    withdrawal: 'https://www.picicake.hu/spg/636642/Elallas-a-szerzodestol',
    shipping: 'https://www.picicake.hu/shop_contact.php?tab=shipping',
    jobs: 'https://www.picicake.hu/allas',
  },
  allergens: 'A termékek laktózt, glutént és tojást tartalmaznak. Nyomokban mogyorót tartalmazhatnak.',
};

/** Rendszerhasználati díj: a részösszeg + szállítás után rászámolt 3%. */
export const SERVICE_FEE_RATE = 0.03;
export const SERVICE_FEE_LABEL = 'Rendszerhasználati díj (3%)';

/* ------------------------------------------------------------------ */
/* Szállítási módok                                                    */
/* ------------------------------------------------------------------ */

export type ShippingId =
  | 'futar-budapest'
  | 'futar-agglomeracio'
  | 'atvetel'
  | 'foxpost'
  | 'gls'
  | 'postapont'
  | 'mpl';

export type ShippingMethod = {
  id: ShippingId;
  label: string;
  note: string;
  fee: number;
  /** Ez az idősáv jelenik meg a naptárnál. */
  window: string;
  /** Választható időpontok (személyes átvételnél), különben a sáv fix. */
  slots?: string[];
  /** Romlandó desszertnél is választható? */
  allowsPerishable: boolean;
  /** Kell hozzá szállítási cím? */
  needsAddress: boolean;
  cities?: string[];
};

/**
 * Az agglomerációs kiszállítás 14 települése irányítószám szerint.
 * A pénztár ebből ismeri fel, hova megy a rendelés — a települést nem kell
 * kézzel beírni, és nem is lehet elírni.
 */
export const AGGLO_ZIPS: Record<string, string> = {
  '2000': 'Szentendre',
  '2011': 'Budakalász',
  '2013': 'Pomáz',
  '2040': 'Budaörs',
  '2051': 'Biatorbágy',
  '2071': 'Páty',
  '2092': 'Budakeszi',
  '2120': 'Dunakeszi',
  '2141': 'Csömör',
  '2142': 'Nagytarcsa',
  '2143': 'Kistarcsa',
  '2151': 'Fót',
  '2310': 'Szigetszentmiklós',
  '2314': 'Halásztelek',
};

/** Budapest irányítószámai: 1011–1239. */
export const isBudapestZip = (zip: string) =>
  /^\d{4}$/.test(zip) && Number(zip) >= 1011 && Number(zip) <= 1239;

/** Az irányítószámhoz tartozó település, ha kiszállítunk oda. */
export const cityForZip = (zip: string) =>
  (isBudapestZip(zip) ? 'Budapest' : AGGLO_ZIPS[zip]) ?? '';

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'futar-budapest',
    label: 'PiciCake futár — Budapest',
    note: 'A választott napon 13:00 és 17:00 között érkezik. A futár telefonál, amikor a közelben jár. Szűkebb intervallumot a napi forgalom és a rendelési sorrend miatt nem tudunk vállalni.',
    fee: 2000,
    window: SHOP.deliveryWindowBudapest,
    allowsPerishable: true,
    needsAddress: true,
  },
  {
    id: 'futar-agglomeracio',
    label: 'PiciCake futár — agglomeráció',
    note: 'A választott napon 13:00 és 19:00 között érkezik. A futár telefonál, amikor a közelben jár.',
    fee: 6000,
    window: SHOP.deliveryWindowAgglo,
    allowsPerishable: true,
    needsAddress: true,
    cities: [
      'Fót', 'Pomáz', 'Dunakeszi', 'Csömör', 'Kistarcsa', 'Nagytarcsa', 'Budaörs',
      'Szigetszentmiklós', 'Halásztelek', 'Biatorbágy', 'Budakeszi', 'Páty', 'Budakalász', 'Szentendre',
    ],
  },
  {
    id: 'atvetel',
    label: 'Személyes átvétel — XV. kerület',
    note: '1156 Budapest, Páskomliget utca 50. (44-es kapucsengő). Előzetes időpont-egyeztetéssel, 11:00 és 18:00 között. A tortákat hűtött állapotban adjuk át, a szállítást is így érdemes megoldani.',
    fee: 0,
    window: SHOP.pickupWindow,
    slots: ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
    allowsPerishable: true,
    needsAddress: false,
  },
  {
    id: 'foxpost',
    label: 'Foxpost csomagautomata',
    note: 'Érintkezésmentes átvétel bármelyik automatából, átvevő kóddal. PiciCake desszertre nem választható.',
    fee: 1700,
    window: 'Az automata nyitvatartása szerint',
    allowsPerishable: false,
    needsAddress: true,
  },
  {
    id: 'gls',
    label: 'GLS futárszolgálat',
    note: 'Házhoz szállítás munkanapokon. PiciCake desszertre nem választható.',
    fee: 2600,
    window: 'Munkanap, 8:00–17:00',
    allowsPerishable: false,
    needsAddress: true,
  },
  {
    id: 'postapont',
    label: 'PostaPont',
    note: 'Átvétel postán vagy MOL töltőállomáson. PiciCake desszertre nem választható.',
    fee: 2200,
    window: 'A PostaPont nyitvatartása szerint',
    allowsPerishable: false,
    needsAddress: true,
  },
  {
    id: 'mpl',
    label: 'MPL futárszolgálat',
    note: 'A Magyar Posta csomagszállítása. PiciCake desszertre nem választható.',
    fee: 2200,
    window: 'Munkanap, 8:00–17:00',
    allowsPerishable: false,
    needsAddress: true,
  },
];

export const shippingById = (id: ShippingId) => SHIPPING_METHODS.find((m) => m.id === id)!;

/* ------------------------------------------------------------------ */
/* Fizetési módok                                                      */
/* ------------------------------------------------------------------ */

export type PaymentId = 'bankkartya' | 'atutalas' | 'utanvet';

export type PaymentMethod = {
  id: PaymentId;
  label: string;
  note: string;
  /** Fix felár forintban (utánvét: 490 Ft/rendelés). */
  fee: number;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'bankkartya',
    label: 'Bankkártya',
    note: 'Biztonságos online fizetés Stripe-on keresztül, a rendelés véglegesítése után.',
    fee: 0,
  },
  {
    id: 'atutalas',
    label: 'Előre utalás',
    note: `Kedvezményezett: ${SHOP.contactPerson} · ${SHOP.bankName}: ${SHOP.bankAccount}. A közlemény rovatba a rendelésszám kerül.`,
    fee: 0,
  },
  {
    id: 'utanvet',
    label: 'Utánvét (készpénz)',
    note: 'Fizetés átvételkor, készpénzben. Rendelésenként 490 Ft felárral.',
    fee: 490,
  },
];

export const paymentById = (id: PaymentId) => PAYMENT_METHODS.find((m) => m.id === id)!;

/* ------------------------------------------------------------------ */
/* Integrációk                                                         */
/* ------------------------------------------------------------------ */

/**
 * Ide jön a GHL / Make webhook URL-je.
 * Amíg üres, az űrlapok és a rendelés nem küldenek semmit:
 * a felület a "sikeres" állapotot mutatja, a payload pedig a konzolba kerül.
 */
export const ENDPOINTS = {
  order: '',
  contact: '',
  eventQuote: '',
  newsletter: '',
};

/**
 * Stripe Checkout indítása.
 * A böngészőből nem lehet közvetlenül Checkout Sessiont nyitni (titkos kulcs kell hozzá),
 * ezért a rendelés a webhookra megy, az onnan visszakapott fizetési linkre irányítunk.
 * Amíg ez nincs bekötve, a rendelés simán leadható.
 */
export const STRIPE = {
  /** Make/backend endpoint, ami Checkout Session URL-t ad vissza. */
  checkoutEndpoint: '',
  currency: 'HUF',
};
