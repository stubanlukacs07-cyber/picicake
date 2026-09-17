import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/products';
import { SHOP } from '../data/config';
import { submit } from '../lib/submit';
import type { SubmitState } from '../lib/submit';
import logo from '../assets/logo.png';
import { IconFacebook, IconInstagram, IconTiktok } from './Bits';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<SubmitState>('idle');

  const subscribe = async () => {
    if (!email.includes('@')) return setState('error');
    setState('sending');
    try {
      await submit('newsletter', { email });
      setState('done');
      setEmail('');
    } catch {
      setState('error');
    }
  };

  return (
    <footer className="footer">
      {/* A logó 3D-s vízjelként a háttérben, a hírlevél sávba is belelógva */}
      <img className="footer__mark" src={logo} alt="" aria-hidden="true" />

      <div className="wrap">
        {/* hírlevél — minden oldal alján megjelenik */}
        <div className="footer__news">
          <div>
            <h3>Érdekelnek az új ízek?</h3>
            <p>Szezonális desszertek, limitált ajánlatok és a szabad rendelési napok — havonta egy levélben.</p>
          </div>
          <div>
            {state === 'done' ? (
              <p className="footer__news-ok">Köszönjük, feliratkoztunk a listára.</p>
            ) : (
              <div className="newsletter__form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setState('idle'); }}
                  placeholder="E-mail címed"
                  aria-label="E-mail cím"
                />
                <button type="button" className="btn btn--light" onClick={subscribe} disabled={state === 'sending'}>
                  {state === 'sending' ? 'Küldés…' : 'Iratkozz fel!'}
                </button>
              </div>
            )}
            {state === 'error' && <p className="footer__news-err">Adj meg egy érvényes e-mail címet.</p>}
          </div>
        </div>

        <div className="footer__top">
          <div>
            <h4>PiciCake</h4>
            <p className="footer__tag">
              Kézműves bento torták, brownie-k és desszertek Budapesten. Frissen, helyben,
              a te feliratoddal.
            </p>
            <div className="socials">
              <a href={SHOP.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><IconInstagram /></a>
              <a href={SHOP.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><IconFacebook /></a>
              <a href={SHOP.social.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok"><IconTiktok /></a>
            </div>
          </div>

          <div>
            <h4>Termékek</h4>
            <ul>
              {CATEGORIES.map((cat) => <li key={cat.id}><Link to={`/termekek/${cat.slug}`}>{cat.name}</Link></li>)}
              <li><Link to="/termekek">Összes termék</Link></li>
              <li><Link to="/torta-tervezo">Tortatervező</Link></li>
            </ul>
          </div>

          <div>
            <h4>Kapcsolat és info</h4>
            <ul>
              <li><a href={`mailto:${SHOP.email}`}>{SHOP.email}</a></li>
              <li><a href={`tel:${SHOP.phoneHref}`}>{SHOP.phone}</a></li>
              <li>{SHOP.address} ({SHOP.addressNote})</li>
              <li>Átvétel: {SHOP.pickupWindow}, egyeztetéssel</li>
              <li><Link to="/informaciok">Szállítás, fizetés, GYIK</Link></li>
              <li><a href={SHOP.legal.jobs} target="_blank" rel="noreferrer">Munkalehetőség</a></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} PiciCake · {SHOP.contactPerson} · Adószám: {SHOP.taxNumber}</span>
          <span style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap' }}>
            <a href={SHOP.legal.aszf} target="_blank" rel="noreferrer">ÁSZF</a>
            <a href={SHOP.legal.privacy} target="_blank" rel="noreferrer">Adatkezelés</a>
            <a href={SHOP.legal.shipping} target="_blank" rel="noreferrer">Szállítás</a>
            <a href={SHOP.legal.withdrawal} target="_blank" rel="noreferrer">Elállás</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
