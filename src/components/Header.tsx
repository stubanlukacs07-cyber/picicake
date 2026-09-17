import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CATEGORIES, PRODUCTS, productsIn, searchProducts } from '../data/products';
import { SHOP } from '../data/config';
import { formatFt } from '../lib/format';
import { useCart } from '../lib/cart';
import logo from '../assets/logo.png';
import { IconBag, IconClose, IconMenu, IconSearch, Img } from './Bits';
import { LANGS, useLang } from '../i18n';

/** A felső, balról jobbra futó információs csík tartalma. */
const PROMOS = [
  'Kiszállítás Budapesten, minden nap 13:00–17:00 között',
  'Személyes átvétel a XV. kerületben, egyeztetett időpontban',
  'Minden desszert frissen, aznap készül',
  `Rendelj legalább ${SHOP.leadTimeDays} nappal előre — a napok hamar betelnek`,
  'Agglomerációba is szállítunk, 14 településre',
];

export default function Header() {
  const { count, openDrawer } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { lang, setLang } = useLang();

  /* A legördülő menü késleltetve zár, így az egér át tud haladni
     a link és a panel közötti sávon anélkül, hogy eltűnne. */
  const closeTimer = useRef<number | undefined>(undefined);
  const openDrop = () => {
    window.clearTimeout(closeTimer.current);
    setDropOpen(true);
  };
  const closeDrop = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setDropOpen(false), 300);
  };
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useEffect(() => {
    setMenuOpen(false);
    setSubOpen(false);
    setDropOpen(false);
    setSearchOpen(false);
    setQuery('');
  }, [pathname]);

  const results = searchOpen ? searchProducts(query) : [];

  return (
    <>
      <div className="promo" aria-hidden="true">
        <div className="promo__track">
          {[...PROMOS, ...PROMOS].map((text, i) => <span key={i}>{text}</span>)}
        </div>
      </div>

      <header className="header">
        <div className="wrap header__inner">
          <Link to="/kezdolap" className="logo" aria-label="PiciCake — kezdőlap">
            <img src={logo} alt="PiciCake" />
          </Link>

          <nav className="nav" aria-label="Főmenü">
            <NavLink to="/kezdolap" className="nav__link">Kezdőlap</NavLink>

            <div
              className="nav__group"
              data-open={dropOpen}
              onMouseEnter={openDrop}
              onMouseLeave={closeDrop}
              onFocus={openDrop}
              onBlur={closeDrop}
            >
              <NavLink to="/termekek" className="nav__link" aria-expanded={dropOpen} aria-haspopup="true">
                Termékek <i className="nav__caret" aria-hidden="true" />
              </NavLink>
              <div className="nav__drop">
                <div className="dropdown">
                  {CATEGORIES.map((cat) => (
                    <Link key={cat.id} to={`/termekek/${cat.slug}`}>
                      {cat.name} <small>{productsIn(cat.id).length}</small>
                    </Link>
                  ))}
                  <hr />
                  <Link to="/termekek">Összes termék <small>{PRODUCTS.length}</small></Link>
                  <Link to="/torta-tervezo">Tortatervező <small>3D</small></Link>
                </div>
              </div>
            </div>

            <NavLink to="/rendezveny" className="nav__link">Rendezvény</NavLink>
            <NavLink to="/informaciok" className="nav__link">Információk</NavLink>
            <NavLink to="/kapcsolat" className="nav__link">Kapcsolat</NavLink>
          </nav>

          <div className="header__actions">
            <button type="button" className="icon-btn" onClick={openDrawer} aria-label={`Kosár (${count} tétel)`}>
              <IconBag />
              {count > 0 && <span className="cart-count">{count}</span>}
            </button>
            <button
              type="button"
              className="icon-btn burger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Menü bezárása' : 'Menü megnyitása'}
            >
              {menuOpen ? <IconClose /> : <IconMenu />}
            </button>

            <button type="button" className="search-btn" onClick={() => setSearchOpen((v) => !v)} aria-expanded={searchOpen}>
              Keresés
            </button>

            <div className="lang" role="group" aria-label="Nyelv" data-no-i18n>
              {LANGS.map((l) => (
                <button key={l.id} type="button" aria-current={l.id === lang} onClick={() => setLang(l.id)}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>


        {menuOpen && (
          <div className="mobile-menu">
            <div className="wrap mobile-menu__panel">
              <Link to="/kezdolap" className="mobile-menu__link">Kezdőlap</Link>
              <button type="button" className="mobile-menu__link" onClick={() => setSubOpen((v) => !v)} aria-expanded={subOpen}>
                Termékek <i className="nav__caret" aria-hidden="true" style={{ marginLeft: 8 }} />
              </button>
              {subOpen && (
                <div className="mobile-menu__sub">
                  {CATEGORIES.map((cat) => <Link key={cat.id} to={`/termekek/${cat.slug}`}>{cat.name}</Link>)}
                  <Link to="/termekek">Összes termék</Link>
                  <Link to="/torta-tervezo">Tortatervező (3D)</Link>
                </div>
              )}
              <Link to="/rendezveny" className="mobile-menu__link">Rendezvény</Link>
              <Link to="/informaciok" className="mobile-menu__link">Információk</Link>
              <Link to="/kapcsolat" className="mobile-menu__link">Kapcsolat</Link>
              <button type="button" className="mobile-menu__link" onClick={() => { setMenuOpen(false); setSearchOpen(true); }}>
                Keresés
              </button>
            </div>
          </div>
        )}
      </header>

      {searchOpen && (
        <div className="search-panel">
          <div className="wrap">
            <label className="field">
              <span className="search-panel__label"><IconSearch /> Keresés a termékek között</span>
              <input
                type="search"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchOpen(false);
                  if (e.key === 'Enter' && results[0]) navigate(`/termek/${results[0].slug}`);
                }}
                placeholder="Pl. bento torta, brownie, kártya…"
              />
            </label>

            {query.trim().length >= 2 && (
              <div className="search-results">
                {results.length === 0 && <p style={{ color: 'var(--ink-soft)', marginTop: 12 }}>Nincs találat erre: „{query}”.</p>}
                {results.map((p) => (
                  <Link key={p.slug} to={`/termek/${p.slug}`}>
                    <span className="thumb"><Img src={p.images[0]} alt={p.name} /></span>
                    <span style={{ flex: 1 }}>
                      <strong>{p.name}</strong>
                      <small>{p.short}</small>
                    </span>
                    <strong style={{ whiteSpace: 'nowrap' }}>{formatFt(p.price)}</strong>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
