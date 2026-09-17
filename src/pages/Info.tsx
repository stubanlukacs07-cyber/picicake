import { Link } from 'react-router-dom';
import { PAYMENT_METHODS, SERVICE_FEE_LABEL, SHIPPING_METHODS, SHOP } from '../data/config';
import { formatFt } from '../lib/format';
import { useInView } from '../lib/useInView';
import { FaqList } from '../components/Sections';
import {
  BadgeCraft, BadgeGift, BadgeTruck, BadgeVerified, IconBag, IconCheck, Reveal,
} from '../components/Bits';

const SHIP_ICON: Record<string, JSX.Element> = {
  'futar-budapest': <BadgeTruck />,
  'futar-agglomeracio': <BadgeTruck />,
  atvetel: <BadgeGift />,
  foxpost: <IconBag />,
  gls: <BadgeTruck />,
  postapont: <IconBag />,
  mpl: <BadgeTruck />,
};

const JUMPS = [
  { id: 'szallitas', label: 'Szállítás és átvétel' },
  { id: 'fizetes', label: 'Fizetés' },
  { id: 'jo-tudni', label: 'Jó tudni' },
  { id: 'gyik', label: 'Gyakori kérdések' },
];

/**
 * Az oldalon belüli ugrás. A `#szallitas` típusú linkek a HashRouter miatt
 * útvonalként értelmeződtek volna, ezért kézzel görgetünk, a ragadó fejléc
 * magasságát is beszámítva.
 */
function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 92;
  const top = el.getBoundingClientRect().top + window.scrollY - headerH - 18;
  window.scrollTo({ top, behavior: 'smooth' });
}

const GOOD_TO_KNOW = [
  {
    title: 'Rendelési határidő',
    items: [
      `Friss desszert legkorábban ${SHOP.leadTimeDays} nap múlvára kérhető.`,
      'A napok hamar betelnek — érdemes minél előbb rendelni.',
      'Ha az adott nap megtelt, e-mailben jelezzük.',
      'Hétvégén is elérhetőek vagyunk.',
    ],
  },
  {
    title: 'Eltarthatóság',
    items: [
      'Torta: hűtve kb. 3 nap, legfinomabb aznap vagy másnap.',
      'Brownie: hűtve kb. 4 nap. Ha kiszárad, fél perc mikróban újra puha.',
      'Brookie: jól zárva 3 nap.',
      'A mascarponés krém hűtés közben kissé repedezhet — ez természetes.',
    ],
  },
  {
    title: 'Allergének',
    items: [
      SHOP.allergens,
      'Laktóz- és gluténmentes torta külön termékként rendelhető.',
      'A műhelyben glutént tartalmazó alapanyagokkal is dolgozunk.',
    ],
  },
];

export default function Info() {
  const ship = useInView();
  const pay = useInView();
  const good = useInView();

  return (
    <>
      {/* ------------------------------ fejléc ---------------------------- */}
      <section className="info-hero">
        <Reveal className="wrap">
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,.9)' }}>Információk</p>
          <h1>Minden, ami a rendeléshez kell</h1>
          <p className="lead" style={{ maxWidth: '58ch' }}>
            Szállítás, átvétel, fizetés, határidők és allergének egy helyen. Ha valamire nem találsz
            választ, írj a {SHOP.email} címre — egy munkanapon belül válaszolunk.
          </p>
          <div className="info-chips">
            {JUMPS.map((j) => (
              <button type="button" key={j.id} onClick={() => jumpTo(j.id)}>{j.label}</button>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---------------------------- szállítás --------------------------- */}
      <section className="section" id="szallitas">
        <div className="wrap">
          <Reveal className="head">
            <p className="eyebrow">Hogyan jut el hozzád</p>
            <h2>Szállítás és átvétel</h2>
            <p className="lead">
              Friss desszertnél csak a PiciCake futár vagy a személyes átvétel választható. A
              csomagautomata és a futárszolgálatok a TiMEbox ajándékokra érvényesek.
            </p>
          </Reveal>

          <div className={`ship-grid reveal-grid ${ship.cls}`} ref={ship.ref}>
            {SHIPPING_METHODS.map((m) => (
              <article className={`ship${m.allowsPerishable ? '' : ' ship--off'}`} key={m.id}>
                <span className="ship__icon">{SHIP_ICON[m.id]}</span>
                {!m.allowsPerishable && <span className="ship__tag">Csak ajándékra</span>}
                <h3>{m.label}</h3>
                <p>{m.note}</p>
                {m.cities && <p><strong>Elérhető:</strong> {m.cities.join(', ')}</p>}
                <p style={{ fontWeight: 500, color: 'var(--ink)' }}>Idősáv: {m.window}</p>
                <span className="ship__fee">{m.fee === 0 ? 'Ingyenes' : formatFt(m.fee)}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- fizetés ---------------------------- */}
      <section className="section section--rose" id="fizetes">
        <div className="wrap">
          <Reveal className="head head--center">
            <p className="eyebrow">Ahogy kényelmes</p>
            <h2>Fizetés</h2>
          </Reveal>

          <div className={`good reveal-grid ${pay.cls}`} ref={pay.ref}>
            {PAYMENT_METHODS.map((p) => (
              <div className="good__item" key={p.id}>
                <h3>{p.label}</h3>
                <p style={{ fontSize: '.92rem', color: 'var(--ink-soft)' }}>{p.note}</p>
                {p.fee > 0 && <span className="ship__fee" style={{ marginTop: '.8rem', display: 'inline-block' }}>+{formatFt(p.fee)} / rendelés</span>}
              </div>
            ))}
          </div>

          <p style={{ marginTop: 26, display: 'flex', gap: 10, alignItems: 'flex-start', maxWidth: '70ch' }}>
            <IconCheck />
            <span>
              <strong>{SERVICE_FEE_LABEL}.</strong> A rendelés végösszegére 3% rendszerhasználati díj
              kerül, amit a pénztárban tételesen is látsz a véglegesítés előtt.
            </span>
          </p>
        </div>
      </section>

      {/* ----------------------------- jó tudni --------------------------- */}
      <section className="section" id="jo-tudni">
        <div className="wrap">
          <Reveal className="head head--center">
            <p className="eyebrow">Mielőtt rendelsz</p>
            <h2>Jó tudni</h2>
          </Reveal>

          <div className={`good reveal-grid ${good.cls}`} ref={good.ref}>
            {GOOD_TO_KNOW.map((block) => (
              <div className="good__item" key={block.title}>
                <h3>{block.title}</h3>
                <ul>{block.items.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            ))}
          </div>

          <div className="note" style={{ marginTop: 30, maxWidth: 880 }}>
            <strong>Felirat és színek.</strong> A feliratot és a torta színeit a terméknél vagy a pénztár
            megjegyzés rovatában tudod megadni. Felirat: a méret függvényében 15–20 karakter. Színek:
            legfeljebb három — ha nem adsz meg, a témához illőt választjuk. Külön írd meg a torta
            alapszínét és a feliratét is.
          </div>
        </div>
      </section>

      {/* ------------------------------- GYIK ----------------------------- */}
      <section className="section section--blush" id="gyik">
        <div className="wrap">
          <Reveal className="head head--center">
            <p className="eyebrow">Gyakori kérdések</p>
            <h2>Amit a legtöbbször kérdeznek</h2>
          </Reveal>
          <div style={{ marginInline: 'auto', maxWidth: 860 }}>
            <FaqList />
          </div>
          <div style={{ marginTop: 34, display: 'flex', gap: '.7rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/termekek" className="btn">Termékek megnézése</Link>
            <Link to="/kapcsolat" className="btn btn--ghost">Kérdésem van</Link>
          </div>

          <div className="feature-container" style={{ marginTop: 40 }}>
            <span className="feature-badge"><span className="icon-circle"><BadgeVerified /></span>Ellenőrzött vélemények</span>
            <span className="feature-badge"><span className="icon-circle"><BadgeCraft /></span>Kézműves desszertek</span>
          </div>

          <p style={{ fontSize: '.85rem', color: 'var(--ink-soft)', marginTop: 34, textAlign: 'center', marginInline: 'auto' }}>
            {SHOP.name} · {SHOP.contactPerson} · {SHOP.address} · Adószám: {SHOP.taxNumber} ·
            Nyilvántartási szám: {SHOP.regNumber}
            <br />
            <a href={SHOP.legal.aszf} target="_blank" rel="noreferrer" className="link-underline">ÁSZF</a>
            {' · '}
            <a href={SHOP.legal.privacy} target="_blank" rel="noreferrer" className="link-underline">Adatkezelési tájékoztató</a>
            {' · '}
            <a href={SHOP.legal.shipping} target="_blank" rel="noreferrer" className="link-underline">Szállítás</a>
            {' · '}
            <a href={SHOP.legal.withdrawal} target="_blank" rel="noreferrer" className="link-underline">Elállás</a>
          </p>
        </div>
      </section>

    </>
  );
}
