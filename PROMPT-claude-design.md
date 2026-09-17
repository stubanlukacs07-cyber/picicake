# Prompt — fotórealisztikus PiciCake desszertvizualizáció (Claude Design)

A böngészőben futó three.js tervező valós időben számol, ezért a látvány stilizált marad.
Ha fotórealisztikus végeredmény kell, az alábbi feladattal érdemes Claude Designhoz fordulni.
A prompt szándékosan részletes, hogy ne adjon vissza alacsony felbontású, gyenge látványt.

---

## Feladat

Készíts fotórealisztikus termékvizualizációkat a PiciCake budapesti kézműves cukrászműhely
desszertjeiről, amelyek egy webshop 3D tervezőjének **előre renderelt képsorozataként**
használhatók (turntable: 36 kép, 10 fokonként, tökéletesen loopolható).

## Termékek és pontos paraméterek

1. **Koreai bento torta** — 8–10 cm átmérő, 200–300 g, 2 főre. Kerek vagy szív alak.
2. **Egyedi torta** — 4 / 6–8 / 10–12 / 16–18 / 20–22 szeletes, kerek vagy szív. **Egy emelet.**
3. **Bento brownie** — négyzet, kerek vagy szív, 10 / 15 / 20 cm, sűrű csokoládés brownie alap.
4. **Bento cup** — fehér papírpohár, tetején nyomott mascarponés krémörvény.

## Kötelező stílusszabályok (a műhely valós szabályai)

- A dekoráció **kizárólag krémmel** készül: vajkrém/mascarpone. Nyomott habszegély az alján és
  a tetején, sima, szatén hatású oldalak.
- **NEM szerepelhet**: cukorgyöngy, marcipánfigura, fondantfigura, ostyakép, műanyag topper.
- Felirat: krémmel írt, kézírásos vonal, 15–20 karakter. Arany felirat esetén ehető aranyfesték.
- Csillám: fújt, gyöngyház hatású, természetes fényben alig látszik, hidegfényben csillan.
- Élővirág: szezonális, ehető virág mix.
- Gyertya: sima fehér, mindig a torta **mellé** csomagolva, nem beleszúrva.
- Átadás: zsírpapíron, felfelé nyitható, 15 cm-es cukornád dobozban; a tortapapír arany, fodros szélű.

## Vizuális követelmények

- **Felbontás**: legalább 2048×2048 px képkockánként, veszteségmentes PNG, alfa csatornával.
- **Kamera**: 50 mm-es ekvivalens, szemmagasság alatt kb. 15–20°, enyhe felülnézet; a torta a
  képkocka 70%-át töltse ki, fix magasság a teljes turntable alatt.
- **Fény**: lágy, nagy softbox 45°-ban balról, halvány hideg kitöltés jobbról, finom kontúrfény
  hátulról. Meleg, 5200 K körüli alaphangulat. Éles, kiégett highlight nem lehet.
- **Anyag**: a krém félmatt, mikroszkopikus pórusokkal és nagyon halvány felszíni
  szubszurfész-szórással; a gyümölcs nedves, tükröződő; az arany tortapapír anizotrop fémes.
- **Árnyék**: lágy kontaktárnyék a tortapapír alatt, nem fekete, hanem meleg szürke.
- **Háttér**: semleges, meleg törtfehér vagy világos rózsaszín (#FFFBF8 – #F3DED9) gradiens,
  vagy világos fapadló felülnézetből. Zavaró elem nélkül.
- **Utómunka**: enyhe film grain (max. 1%), nincs erős vignettálás, nincs túltolt kontraszt.

## Variációk, amikre kép kell

- Krémszínek: `#F0C4C2`, `#D7A7A2`, `#B68E88`, `#F7EAD2`, `#B8C9B2`, `#6B4433`, `#3D4A63`, fehér
- Dekor: csak krém / eper / málna / koktélcseresznye / ehető élővirág / fújt csillám
- Kiegészítő: fekete szatén masni a torta oldalán; 1 vagy 3 fehér gyertya a torta mellett

## Amit el kell kerülni

Ne legyen rajzos, „3D render” hatású, lapos, plasztik anyagú vagy alacsony felbontású kép.
Ne legyen szimmetrikusan tökéletes: a kézműves jelleget apró egyenetlenségek adják a
habszegélyen és a felirat vonalvezetésén.

## Átadás

Termékenként és variációnként egy 36 képes turntable sorozat, egységes névkonvencióval:
`<termek>_<forma>_<szin>_<dekor>_<000..350>.png`, plusz egy kontaktlap mindegyikről.
