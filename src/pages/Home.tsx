import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, PRODUCTS, SITE_IMAGES, productsIn } from '../data/products';
import type { CategoryId } from '../data/products';
import HeroSlider from '../components/HeroSlider';
import CakeTeaser from '../components/CakeTeaser';
import ProductCard from '../components/ProductCard';
import { FaqBlock, MiniCard, ReviewsSection } from '../components/Sections';
import { useInView } from '../lib/useInView';
import {
  BadgeCraft, BadgeGift, BadgeTruck, BadgeVerified, FeatureBadge, Img, Reveal,
} from '../components/Bits';

const FEATURES = [
  { icon: <BadgeGift />, label: 'Személyre szabható' },
  { icon: <BadgeTruck />, label: 'Gyors kiszállítás' },
  { icon: <BadgeVerified />, label: 'Ellenőrzött vélemények' },
  { icon: <BadgeCraft />, label: 'Kézműves desszertek' },
];

/** A kezdőlapi tabokon csak ez a három szerepel — a desszertek lentebb jönnek. */
const TAB_IDS: CategoryId[] = ['tortak', 'browniek', 'timebox'];
const TABS = TAB_IDS.map((id) => CATEGORIES.find((c) => c.id === id)!);

const BEST_SELLERS = ['koreai-bento-torta', 'bento-cup', 'brownie-csokibetukkel'];
const MORE = ['ajandekcsomag', 'ajandek-timebox', 'enido-timebox', 'beszelgetos-kartya'];

export default function Home() {
  const [tab, setTab] = useState<CategoryId>('tortak');
  const activeCategory = CATEGORIES.find((c) => c.id === tab)!;
  const tabGrid = useInView();
  const moreGrid = useInView();
  const catGrid = useInView();

  /* A tabok mögötti képeket előre betöltjük, így a váltás nem akad meg
     a képek letöltésén — korábban ez tűnt laggolásnak. */
  useEffect(() => {
    TAB_IDS.flatMap((id) => productsIn(id).slice(0, 4))
      .flatMap((p) => p.images.slice(0, 2))
      .forEach((src) => { const i = new Image(); i.src = src; });
  }, []);

  return (
    <>
      <HeroSlider />

      {/* -------------------------- USP badge-ek -------------------------- */}
      <section className="section section--tight">
        <Reveal className="wrap feature-container">
          {FEATURES.map((f) => <FeatureBadge key={f.label} icon={f.icon} label={f.label} />)}
        </Reveal>
      </section>

      {/* ----------------------- tabos termékblokk ------------------------ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="tabs" role="tablist" aria-label="Termékkategóriák">
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" className="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
                {t.short}
              </button>
            ))}
          </div>

          {/* Nincs key a rácson: így a váltás nem építi újra a DOM-ot. */}
          <div className={`grid reveal-grid ${tabGrid.cls}`} ref={tabGrid.ref}>
            {productsIn(tab).slice(0, 4).map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>

          <div style={{ marginTop: 36, textAlign: 'center' }}>
            <Link to={`/termekek/${activeCategory.slug}`} className="btn btn--ghost">{activeCategory.allLabel}</Link>
          </div>
        </div>
      </section>

      {/* --------------------------- Best Sellers ------------------------- */}
      <section className="section section--rose">
        <Reveal className="wrap bs">
          <div className="bs__copy">
            <p className="eyebrow">Ami most népszerű</p>
            <h2>Best Sellers</h2>
            <p>Nézd meg mások kedvenceit!</p>
          </div>
          <div className="bs__row">
            {BEST_SELLERS.map((slug) => <MiniCard key={slug} slug={slug} />)}
          </div>
        </Reveal>
      </section>

      {/* ------------------------ További termékek ------------------------ */}
      <section className="section">
        <div className="wrap">
          <Reveal className="band head">
            <h2>Rendelj egyedi desszertet!</h2>
            <p style={{ marginBottom: 0 }}>
              <Link to="/termekek" className="link-underline">Budapesti kiszállítással</Link>
            </p>
          </Reveal>

          <Reveal className="band head" delay={80}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2rem)' }}>További termékek</h2>
          </Reveal>

          <div className={`grid reveal-grid ${moreGrid.cls}`} ref={moreGrid.ref}>
            {MORE.map((slug) => {
              const product = PRODUCTS.find((p) => p.slug === slug);
              return product ? <ProductCard key={slug} product={product} /> : null;
            })}
          </div>

          <div style={{ marginTop: 36, textAlign: 'center' }}>
            <Link to="/termekek" className="btn btn--dark">Összes termék</Link>
          </div>
        </div>
      </section>

      {/* -------------------------- Speciális kérések --------------------- */}
      <div className="event-wrapper">
        <Reveal className="event-content">
          <div className="col img-col">
            <Img src={SITE_IMAGES.specialLeft} alt="Brownie szeletek rendezvényre" />
          </div>
          <div className="col text-col">
            <h2>Speciális kérések</h2>
            <p>Tökéletes kiegészítést keresel a következő eseményedhez? Kérj egyedi desszerteket!</p>
            <Link to="/rendezveny" className="btn btn--dark">Kérj ajánlatot</Link>
          </div>
          <div className="col img-col">
            <Img src={SITE_IMAGES.specialRight} alt="Egyedi desszertek" />
          </div>
        </Reveal>
      </div>

      {/* ----------------------------- Kategóriák ------------------------- */}
      <section className="section section--blush">
        <div className="wrap">
          <Reveal className="head head--center">
            <p className="eyebrow">Mit szeretnél ma?</p>
            <h2>Kategóriák</h2>
          </Reveal>
          <div className={`cat-grid reveal-grid ${catGrid.cls}`} ref={catGrid.ref}>
            {CATEGORIES.map((cat) => (
              <Link to={`/termekek/${cat.slug}`} className="cat" key={cat.id}>
                <span className="cat__media"><Img src={cat.image} alt={cat.name} /></span>
                <span className="cat__body" style={{ display: 'block' }}>
                  <h3>{cat.name}</h3>
                  <p>{cat.blurb}</p>
                  <span className="cat__count">{productsIn(cat.id).length} termék</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------- 3D tortatervező ---------------------- */}
      <section className="section">
        <Reveal className="wrap game-teaser">
          <div>
            <p className="eyebrow">Desszerttervező</p>
            <h2>Tervezd meg a saját desszertedet 3D-ben</h2>
            <p className="lead" style={{ margin: '.8rem 0 1.2rem' }}>
              Termék, íz, méret, forma, krémszín, nyomott krém, dekor és felirat — sőt ecsettel rá
              is festhetsz. Itt a legutóbbi tervedet látod: forgasd körbe, szerkeszteni a tervezőben
              tudod. A tervező csak azt kínálja fel, ami az adott terméknél valóban rendelhető.
            </p>
            <p className="builder__disclaimer" style={{ marginBottom: '1.4rem' }}>
              A rendeléshez a képet le kell menteni és csatolni. A 3D kép alacsony felbontású
              illusztráció, a valóságtól eltérhet.
            </p>
            <Link to="/torta-tervezo" className="btn btn--dark">Kipróbálom</Link>
          </div>
          <div className="game-teaser__art"><CakeTeaser /></div>
        </Reveal>
      </section>

      <FaqBlock image={SITE_IMAGES.faq} />

      <ReviewsSection />

    </>
  );
}
