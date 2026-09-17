import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap empty">
        <h1 style={{ fontSize: '2.4rem' }}>Ezt az oldalt nem találjuk</h1>
        <p style={{ marginInline: 'auto' }}>
          Lehet, hogy elköltözött a termék, vagy elírás történt a linkben. A kínálat egy kattintásra van.
        </p>
        <div style={{ display: 'flex', gap: '.7rem', justifyContent: 'center', marginTop: '1.4rem', flexWrap: 'wrap' }}>
          <Link to="/termekek" className="btn">Összes termék</Link>
          <Link to="/kezdolap" className="btn btn--ghost">Kezdőlap</Link>
        </div>
      </div>
    </section>
  );
}
