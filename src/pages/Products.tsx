import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CATEGORIES, CATEGORY_BY_SLUG, productsIn } from '../data/products';
import type { Product } from '../data/products';
import ProductCard from '../components/ProductCard';

import { SHOP } from '../data/config';

type SortId = 'nepszeruseg' | 'nev-asc' | 'nev-desc' | 'ar-asc' | 'ar-desc' | 'ujdonsag';

const score = (p: Product) =>
  (p.badges?.includes('bestseller') ? 4 : 0) + (p.featured ? 2 : 0) + (p.badges?.includes('new') ? 1 : 0);

const sortBy = (list: Product[], sort: SortId) => {
  const copy = [...list];
  switch (sort) {
    case 'ar-asc': return copy.sort((a, b) => a.price - b.price);
    case 'ar-desc': return copy.sort((a, b) => b.price - a.price);
    case 'nev-asc': return copy.sort((a, b) => a.name.localeCompare(b.name, 'hu'));
    case 'nev-desc': return copy.sort((a, b) => b.name.localeCompare(a.name, 'hu'));
    case 'ujdonsag': return copy.sort((a, b) => Number(b.badges?.includes('new')) - Number(a.badges?.includes('new')));
    default: return copy.sort((a, b) => score(b) - score(a));
  }
};

export default function Products() {
  const { category: slug } = useParams();
  const categoryId = slug ? CATEGORY_BY_SLUG[slug] : undefined;
  const category = CATEGORIES.find((c) => c.id === categoryId);
  /* Mindig népszerűség szerint — külön rendezőt nem kínálunk. */
  const list = useMemo(() => sortBy(productsIn(categoryId), 'nepszeruseg'), [categoryId]);

  const title = category ? category.name : 'Összes termék';
  const blurb = category
    ? category.blurb
    : 'Torták, brownie-k, pohárdesszertek és TiMEbox ajándékok — minden, ami most rendelhető.';

  return (
    <>
      <div className="wrap">
        <nav className="crumbs" aria-label="Morzsamenü">
          <Link to="/kezdolap">Kezdőlap</Link><span>/</span>
          {category ? <><Link to="/termekek">Termékek</Link><span>/</span>{category.name}</> : 'Termékek'}
        </nav>
      </div>

      <section className="section section--tight">
        <div className="wrap">
          <div className="head">
            <h1>{title}</h1>
            <p className="lead">{blurb}</p>
          </div>

          {/* Egyetlen szűrő: gombos kategóriaválasztó. Mobilon vízszintesen húzható. */}
          <div className="filterbar">
            <div className="filters" role="tablist" aria-label="Kategóriák">
              <Link to="/termekek" className="chip" aria-selected={!category} role="tab">Összes</Link>
              {CATEGORIES.map((c) => (
                <Link key={c.id} to={`/termekek/${c.slug}`} className="chip" aria-selected={category?.id === c.id} role="tab">
                  {c.name}
                </Link>
              ))}
            </div>
            <p className="toolbar__count">
              {list.length} termék{categoryId === 'timebox' ? ' — végkiárusítás, amíg a készlet tart' : ''}
            </p>
          </div>

          <div className="grid">
            {list.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>

          {list.length === 0 && (
            <div className="empty">
              <h3>Ebben a kategóriában most nincs termék</h3>
              <Link to="/termekek" className="btn" style={{ marginTop: '1rem' }}>Összes termék</Link>
            </div>
          )}

          <div className="note" style={{ marginTop: 44, maxWidth: 820 }}>
            <strong>Fontos a desszertrendeléshez.</strong> A napot a pénztárnál választod ki, legkorábban{' '}
            {SHOP.leadTimeDays} nap múlvára — a napok hamar betelnek. Friss desszertnél a PiciCake futár
            (Budapest 2 000 Ft, agglomeráció 6 000 Ft) vagy a személyes átvétel választható. {SHOP.allergens}
          </div>
        </div>
      </section>

    </>
  );
}
