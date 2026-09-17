import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FAQ, RATING, REVIEWS } from '../data/content';
import { BEST_SELLER_PHOTOS, PRODUCTS } from '../data/products';
import { formatFt } from '../lib/format';
import { useInView } from '../lib/useInView';
import { IconChevron, IconDiagonal, Img, Stars } from './Bits';

/* ------------------------- kis termékkártya ---------------------- */

export function MiniCard({ slug }: { slug: string }) {
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) return null;
  const photo = BEST_SELLER_PHOTOS[slug] ?? product.images[1] ?? product.images[0];

  return (
    <Link to={`/termek/${product.slug}`} className="mini">
      <div className="mini__media"><Img src={photo} alt={product.name} /></div>
      <div className="mini__body">
        <div>
          <div className="mini__name">{product.name}</div>
          <div className="mini__price">
            {product.options?.length ? `${formatFt(product.price)}-tól` : formatFt(product.price)}
          </div>
        </div>
        <span className="mini__go" aria-hidden="true"><IconDiagonal /></span>
      </div>
    </Link>
  );
}

/* --------------------------- GYIK lista -------------------------- */

export function FaqList({ limit }: { limit?: number }) {
  const [open, setOpen] = useState<number | null>(0);
  const items = limit ? FAQ.slice(0, limit) : FAQ;

  return (
    <div className="faq">
      {items.map((item, i) => (
        <div className="faq__item" key={item.q}>
          <button type="button" className="faq__q" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
            {item.q}
            <i className="faq__sign" aria-hidden="true" />
          </button>
          {open === i && <div className="faq__a">{item.a.map((p) => <p key={p}>{p}</p>)}</div>}
        </div>
      ))}
    </div>
  );
}

/** Kezdőlapi GYIK blokk: címsor, kép, harmonika — a referencia szerint. */
export function FaqBlock({ image }: { image?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const { ref, cls } = useInView();

  return (
    <section className="section section--rose">
      <div className={`wrap faq-block reveal ${cls}`} ref={ref}>
        <h2>Gyakori kérdések</h2>
        <div className="faq-block__media"><Img src={image} alt="PiciCake torták" /></div>
        <div className="acc">
          {FAQ.map((item, i) => (
            <div className="acc__item" key={item.q}>
              <button type="button" className="acc__q" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                {item.q}
                <IconChevron />
              </button>
              {open === i && <div className="acc__a">{item.a.map((p) => <p key={p}>{p}</p>)}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- vélemények -------------------------- */

export function ReviewsSection() {
  /* A lista kétszer szerepel: így a sáv végtelenítve, folyamatosan fut. */
  const loop = [...REVIEWS, ...REVIEWS];

  return (
    <section className="section">
      <div className="wrap">
        <div className="head head--center">
          <h2>Vélemények</h2>
          <p className="rating" style={{ marginTop: '.9rem' }}>
            <Stars value={RATING.average} /> {RATING.average.toFixed(1).replace('.', ',')} · {RATING.count} vélemény
          </p>
        </div>
      </div>

      <div className="revs">
        <div className="revs__track">
          {loop.map((r, i) => (
            <figure className="rev" key={`${r.name}-${i}`} style={{ margin: 0 }} aria-hidden={i >= REVIEWS.length}>
              <div className="rev__avatar"><Img src={r.image} alt={r.name} /></div>
              <strong>{r.name}</strong>
              <blockquote style={{ margin: 0 }}><p>{r.text}</p></blockquote>
              <Stars value={r.stars} />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
