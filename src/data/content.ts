/**
 * Szövegek. A GYIK és az átvételi/szállítási infók a kliens saját szövegei
 * (picicake.hu + a jelenlegi oldal), ezért nem szabad átfogalmazni őket
 * a kliens jóváhagyása nélkül.
 */

export type Faq = { q: string; a: string[] };

export const FAQ: Faq[] = [
  {
    q: 'Milyen napra kérhetem a rendelést?',
    a: [
      'A rendelés leadásakor kiválaszthatod, melyik napra kéred a szállítást vagy az átvételt.',
      'Érdemes időben rendelni, mert a napok gyorsan betelnek. Szabad kapacitás esetén legkésőbb 4 nappal előre tudsz rendelni.',
      'Egész héten, hétvégén is elérhetőek vagyunk.',
    ],
  },
  {
    q: 'Hova írhatom a torta színeit és a feliratot?',
    a: [
      'A megjegyzés rovatot a rendelés utolsó lépésénél találod.',
      'Torta színei: legfeljebb 3 szín. Ha nem írsz, mi választunk a témához illőt. Külön írd meg a torta alapszínét és a feliratét is.',
      'Felirat: a torta méretétől függően maximum 15–20 karakter.',
      'Kérünk, pontosan add meg ezeket, mert ez alapján készítjük el a rendelést. Ha több megjegyzésed van, írj e-mailt az egyeztetéshez.',
    ],
  },
  {
    q: 'Küldhetek inspirációt?',
    a: [
      'Igen! Fontos azonban, hogy a torták a PiciCake stílusában készülnek el az egyedi kéréseken felül, így kérünk, bízd ránk magad.',
      'Inspirációs fotó esetén igyekszünk a legjobban követni azt, de ha más alkotó munkája, pontosan ugyanolyat nem biztos, hogy tudunk alkotni — a hasonlóságra viszont törekszünk.',
    ],
  },
  {
    q: 'Hol tudom átvenni a rendelést?',
    a: [
      'A rendelés személyesen is átvehető a XV. kerületben, előzetes egyeztetés után.',
      'Cím: 1156 Budapest, Páskomliget utca 50. (44-es kapucsengő). Az átvétel 11:00 és 18:00 között lehetséges, előzetes egyeztetéssel — ez nem nyitvatartás, csak a megbeszélt időpontban vagyunk a műhelyben.',
      'Kérünk, érkezz pontos időben, mert csak a rendelések készítésekor és a megbeszélt átadáskor vagyunk a műhelyben, előre összeállított sorrendet követve.',
    ],
  },
  {
    q: 'Desszertkiszállítást szeretnék. Melyik futárt válasszam?',
    a: [
      'Kérünk, mindig a PiciCake futárt válaszd, hogy a sütemény épségben érkezzen meg. Desszertkiszállítást csak Budapesten belül vállalunk.',
      'A GLS és a Foxpost csak a TiMEbox ajándékokra érvényes, a sütikre nem — azokat nem tudják garantáltan problémamentesen kiszállítani.',
      'A rendelésnél megadott időpont alapján dolgozunk. Ha minden rendben, nem küldünk külön visszaigazolást, csak akkor írunk, ha gond van az időponttal.',
    ],
  },
  {
    q: 'Mikor szállítjátok ki a rendelést?',
    a: [
      'Budapesten minden nap 13:00 és 17:00 között, az agglomeráció 14 településén 13:00 és 19:00 között szállítunk ki.',
      'A pontos idő a forgalomtól függ, de a futár hívni fog, amikor a közelben jár. Szűkebb intervallumot a napi forgalom és a rendelési sorrend miatt nem tudunk vállalni.',
      'Ha változik az időpont, előre jelezzük — ez ritkán fordul elő.',
    ],
  },
  {
    q: 'Meddig áll el a desszert?',
    a: [
      'Torták: frissen, aznap készülnek, hűtve kb. 3 napig fogyaszthatók. A legfinomabb aznap vagy másnap. A mascarponés krém hűtés közben kissé repedezhet — ez természetes.',
      'Brownie: frissen készül, hűtve kb. 4 napig fogyasztható. Ha kicsit kiszárad, fél perc mikróban újra puha lesz.',
      'Brookie: jól zárva 3 napig eláll. Legfinomabb frissen vagy másnap, tea vagy kávé mellé.',
    ],
  },
  {
    q: 'Mi történik, ha nem veszem át a rendelésem?',
    a: [
      'Ha nem tudod átvenni a rendelésed, másnapig megőrizzük. Ha addig sem jelzel, a rendelés törlődik.',
      'Ha mégsem kéred, kérünk, szólj nekünk, hogy ne pazaroljunk alapanyagot és időt.',
    ],
  },
];

export type Review = { name: string; text: string; stars: number; image?: string };

const media = (id: string) => `https://storage.googleapis.com/msgsndr/XK4K2wKwozmU9LFA2vpG/media/${id}`;

export const REVIEWS: Review[] = [
  { name: 'Niki', text: 'A desszertboxok isteni finomak.', stars: 5, image: media('691c27ab61a0e52326549296.jpg') },
  { name: 'Anna', text: 'A torták egyszerűen mesések!', stars: 5, image: media('691da1f588e1e6015a809562.jpg') },
  { name: 'Kata', text: 'Gyors kiszállítás és finom desszertek.', stars: 5, image: media('691ddae3d4f9b30a3465ef96.jpg') },
  { name: 'Dóra', text: 'Minden alkalommal tőlük rendelek.', stars: 5, image: media('691dd84388e1e6535286d97d.jpg') },
  { name: 'Réka', text: 'A család kedvence lett.', stars: 5, image: media('691de216c03e0f18acc829e7.jpg') },
  { name: 'Gabi', text: 'Tökéletes ajándék bárkinek.', stars: 5, image: media('691de6ce59e47b059846b5f3.jpg') },
  { name: 'Lili', text: 'Hihetetlenül friss és finom.', stars: 5, image: media('691e1a20840ed112fa3b6b30.jpg') },
  { name: 'Orsi', text: 'Első osztályú minőség minden alkalommal.', stars: 5, image: media('691f0d19c862b02ae6cc4b85.jpg') },
  { name: 'Eszter', text: 'Gyönyörűek és nagyon finomak.', stars: 5, image: media('691ddd7959e47b01ae4556c6.jpg') },
  { name: 'Timi', text: 'Kedves kiszolgálás, csodás sütik.', stars: 5, image: media('691f494353e3503fc75e41d3.jpg') },
];

export const RATING = {
  average: REVIEWS.reduce((s, r) => s + r.stars, 0) / REVIEWS.length,
  count: REVIEWS.length,
};

export const USP = [
  { title: 'Személyre szabható', text: 'Íz, forma, felirat és dekor — te állítod össze.' },
  { title: 'Budapesti kiszállítás', text: 'Saját futárral, minden nap 13:00 és 17:00 között (2.000 Ft).' },
  { title: 'Frissen, helyben készül', text: 'Minden rendelés aznap, a XV. kerületi műhelyben.' },
  { title: 'Kész ajándék', text: 'Képeslap, tortavirág és TiMEbox kiegészítők egy rendelésben.' },
];

export const STORY = {
  eyebrow: 'Történetünk',
  title: 'PiciCake',
  lead: '2022 óta sütjük a jellegzetes darabos sütijeinket, csokoládés brownie-inkat és a szánkban olvadó finomságainkat.',
  body: [
    'A bento tortával kezdtük: egy 8–10 centis tortával, ami két embernek pont elég, és amire rá lehet írni azt, amit egyébként nehéz kimondani. Kiderült, hogy erre sokkal többeknek van szüksége, mint gondoltuk.',
    'Ma is minden darab frissen, helyben készül a pici, de varázslatos XV. kerületi műhelyünkben, minőségi alapanyagokból. Nincs raktár, nincs előre legyártott készlet: azt sütjük meg, amit aznap megrendelnek.',
  ],
};

export const EVENT_PAGE = {
  title: 'Desszertasztal rendezvényre',
  lead: 'Esküvő, céges esemény, babaváró vagy szülinapi parti — összeállítjuk hozzá a desszertkínálatot, a logós brownie-tól a mini bento tortákig.',
  occasions: [
    'Esküvő és eljegyzés',
    'Céges rendezvény, csapatajándék',
    'Babaváró és gender reveal',
    'Szülinapi parti',
    'Lánybúcsú, girls night',
    'Diplomaosztó',
  ],
  steps: [
    { title: 'Írd meg a kereteket', text: 'Dátum, létszám, helyszín és hogy mire gondoltál. Ha van Pinterest-tábla vagy fotó, azt is küldd el.' },
    { title: 'Kapsz egy ajánlatot', text: '2 munkanapon belül összeállítunk egy konkrét kínálatot árakkal, mennyiségekkel és a szükséges előkészítési idővel.' },
    { title: 'Véglegesítjük', text: 'Egyeztetjük az ízeket és a dekort, te pedig előleget fizetsz. Az átadás napján mindent lehűtve, szállításra készen kapsz meg.' },
  ],
  notes: [
    'Nagyobb rendezvényre legalább 2–3 héttel előre érdemes szólni, szezonban (május, december) még korábban.',
    'A desszertasztalhoz állványt és tálakat nem biztosítunk, de segítünk kitalálni, mi kell hozzá.',
    'A kiszállítás a PiciCake futárral történik: Budapesten 13:00–17:00 között 2.000 Ft, az agglomeráció 14 településén 13:00–19:00 között 6.000 Ft. Átvétel a XV. kerületben ingyenes.',
  ],
};
