import { Link } from 'react-router-dom';
import { useCart } from '../lib/cart';
import { computeTotals, groupSelections } from '../lib/pricing';
import { formatFt } from '../lib/format';
import { SERVICE_FEE_LABEL, SHOP } from '../data/config';
import { Img } from '../components/Bits';

export default function Cart() {
  const { lines, subtotal, setQty, remove, count, hasPerishable } = useCart();
  const totals = computeTotals(subtotal);

  if (lines.length === 0) {
    return (
      <section className="section">
        <div className="wrap empty">
          <h1>Üres a kosár</h1>
          <p style={{ marginInline: 'auto' }}>
            Válassz egy tortát, brownie-t vagy desszertet — az ízeket és a feliratot a terméknél tudod megadni.
          </p>
          <Link to="/termekek" className="btn" style={{ marginTop: '1.4rem' }}>Termékek megnézése</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section section--tight">
      <div className="wrap">
        <div className="head">
          <h1>Kosár</h1>
          <p className="lead">{count} tétel a kosárban.</p>
        </div>

        <div className="checkout">
          <div className="panel">
            {lines.map((line) => (
              <div className="cart-line" key={line.id} style={{ gridTemplateColumns: '96px 1fr' }}>
                <Link to={`/termek/${line.slug}`} className="cart-line__img">
                  <Img src={line.image} alt={line.name} />
                </Link>
                <div>
                  <Link to={`/termek/${line.slug}`} className="cart-line__name">{line.name}</Link>
                  {line.selections.length > 0 && (
                    <div className="cart-line__opts">
                      <ul>
                        {groupSelections(line.selections).map((g) => (
                          <li key={g.groupId}>{g.groupLabel}: {g.values.join(', ')}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="cart-line__row">
                    <div className="qty">
                      <button type="button" onClick={() => setQty(line.id, line.qty - 1)} aria-label="Kevesebb">−</button>
                      <span>{line.qty}</span>
                      <button type="button" onClick={() => setQty(line.id, line.qty + 1)} aria-label="Több">+</button>
                    </div>
                    <span className="cart-line__price">{formatFt(line.unitPrice * line.qty)}</span>
                  </div>
                  <button type="button" className="remove" onClick={() => remove(line.id)} style={{ marginTop: 8 }}>Törlés</button>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 20 }}>
              <Link to="/termekek" className="link-underline">Vásárlás folytatása</Link>
            </div>
          </div>

          <div className="panel summary">
            <h3>Összegzés</h3>
            <div className="summary-line"><span>Részösszeg</span><span>{formatFt(totals.subtotal)}</span></div>
            <div className="summary-line"><span>{SERVICE_FEE_LABEL}</span><span>{formatFt(totals.serviceFee)}</span></div>
            <div className="summary-line"><span>Szállítás</span><span>A pénztárnál</span></div>
            <div className="summary-total"><span>Eddig</span><span>{formatFt(totals.total)}</span></div>
            <Link to="/penztar" className="btn btn--block" style={{ marginTop: 18 }}>Tovább a pénztárhoz</Link>
            <p style={{ fontSize: '.84rem', color: 'var(--ink-soft)', marginTop: 14 }}>
              Az átvétel módját és a napot a pénztárnál választod ki.
              {hasPerishable && ` Friss desszertet legkorábban ${SHOP.leadTimeDays} nap múlvára tudunk vállalni.`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
