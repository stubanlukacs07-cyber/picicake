import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../lib/cart';
import { groupSelections } from '../lib/pricing';
import { formatFt } from '../lib/format';
import { PRODUCTS } from '../data/products';
import { IconCheck, IconClose, Img } from './Bits';

/** Kosár mellé ajánlott, opció nélküli apróságok. */
const UPSELL = ['beszelgetos-kartya', 'halanaplo', 'jegyzettomb', 'bakancslista'];

export default function CartDrawer() {
  const { lines, subtotal, drawerOpen, closeDrawer, remove, setQty, justAdded, add, count } = useCart();
  const { pathname } = useLocation();

  /* Oldalváltáskor becsukjuk: különben a fátyol ott marad és elkapja a kattintásokat.
     Szándékosan csak a pathname a függőség — a closeDrawer identitása nem. */
  useEffect(() => {
    closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeDrawer();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  const upsell = PRODUCTS.filter((p) => UPSELL.includes(p.slug) && !lines.some((l) => l.slug === p.slug)).slice(0, 2);

  return (
    <>
      <div className="drawer-veil" onClick={closeDrawer} />
      <aside className="drawer" role="dialog" aria-label="Kosár" aria-modal="true">
        <div className="drawer__head">
          <h3>Kosár {count > 0 && <span style={{ color: 'var(--ink-soft)', fontSize: '.8em' }}>({count})</span>}</h3>
          <button type="button" className="icon-btn" onClick={closeDrawer} aria-label="Kosár bezárása"><IconClose /></button>
        </div>

        <div className="drawer__body">
          {justAdded && <p className="added"><IconCheck /> Hozzáadtuk a kosárhoz</p>}

          {lines.length === 0 ? (
            <div className="empty">
              <h3>Üres a kosár</h3>
              <p>Válassz egy tortát, brownie-t vagy desszertet — az ízeket és a feliratot a terméknél tudod megadni.</p>
              <Link to="/termekek" className="btn" onClick={closeDrawer} style={{ marginTop: '1rem' }}>Termékek megnézése</Link>
            </div>
          ) : (
            <>
              {lines.map((line) => (
                <div className="cart-line" key={line.id}>
                  <Link to={`/termek/${line.slug}`} className="cart-line__img" onClick={closeDrawer}>
                    <Img src={line.image} alt={line.name} />
                  </Link>
                  <div>
                    <Link to={`/termek/${line.slug}`} className="cart-line__name" onClick={closeDrawer}>{line.name}</Link>
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

              {upsell.length > 0 && (
                <div style={{ marginTop: 22 }}>
                  <h4 style={{ fontSize: '.88rem', fontWeight: 800, color: 'var(--brand-darker)', marginBottom: 10 }}>
                    Gyakran rendelik hozzá
                  </h4>
                  {upsell.map((p) => (
                    <div className="cart-line" key={p.slug}>
                      <div className="cart-line__img"><Img src={p.images[0]} alt={p.name} /></div>
                      <div>
                        <span className="cart-line__name">{p.name}</span>
                        <div className="cart-line__row" style={{ marginTop: 8 }}>
                          <span className="cart-line__price">{formatFt(p.price)}</span>
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => add(p, [])}>Hozzáadom</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {lines.length > 0 && (
          <div className="drawer__foot">
            <div className="totals"><span>Részösszeg</span><span>{formatFt(subtotal)}</span></div>
            <div className="totals" style={{ marginBottom: 12 }}>
              <span>Szállítás és díjak</span><span>A pénztárnál</span>
            </div>
            <Link to="/penztar" className="btn btn--block" onClick={closeDrawer}>Tovább a pénztárhoz</Link>
            <Link to="/kosar" className="btn btn--ghost btn--block" onClick={closeDrawer} style={{ marginTop: 8 }}>Kosár megnyitása</Link>
          </div>
        )}
      </aside>
    </>
  );
}
