import { useState } from 'react';
import { SHOP } from '../data/config';
import { submit } from '../lib/submit';
import type { SubmitState } from '../lib/submit';
import { IconFacebook, IconInstagram, IconTiktok } from '../components/Bits';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', topic: 'Rendeléssel kapcsolatos kérdés', message: '' });
  const [state, setState] = useState<SubmitState>('idle');
  const [error, setError] = useState('');

  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const send = async () => {
    if (form.name.trim().length < 3 || !form.email.includes('@') || form.message.trim().length < 10) {
      setError('A név, az e-mail cím és egy pár szavas üzenet szükséges.');
      return;
    }
    setError('');
    setState('sending');
    try {
      await submit('contact', form);
      setState('done');
    } catch {
      setState('error');
      setError(`Nem sikerült elküldeni. Írj közvetlenül: ${SHOP.email}`);
    }
  };

  return (
    <section className="section section--tight">
      <div className="wrap">
        <div className="head">
          <p className="eyebrow">Kapcsolat</p>
          <h1>Keress bátran</h1>
          <p className="lead">
            Egyedi kérés, nagyobb rendelés vagy csak egy kérdés — válaszolunk. A műhelyben csak a rendelések
            készítésekor és az egyeztetett átadáskor vagyunk, ezért e-mailben érünk el a legbiztosabban.
          </p>
        </div>

        <div className="contact-grid">
          <div>
            <ul className="contact-list">
              <li>
                <strong>E-mail</strong>
                <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>
              </li>
              <li>
                <strong>Telefon</strong>
                <a href={`tel:${SHOP.phoneHref}`}>{SHOP.phone}</a>
              </li>
              <li>
                <strong>Műhely és átvétel</strong>
                <p>{SHOP.address}</p>
                <p style={{ fontSize: '.92rem', fontWeight: 500, color: 'var(--ink-soft)' }}>{SHOP.addressNote} · átvétel {SHOP.pickupWindow} között, előzetes egyeztetéssel</p>
              </li>
              <li>
                <strong>Kiszállítás</strong>
                <p style={{ fontSize: '.98rem' }}>Budapesten 13:00–17:00, agglomerációban 13:00–19:00 között</p>
              </li>
            </ul>

            <div className="socials" style={{ marginTop: 18, color: 'var(--brand)' }}>
              <a href={SHOP.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><IconInstagram /></a>
              <a href={SHOP.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><IconFacebook /></a>
              <a href={SHOP.social.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok"><IconTiktok /></a>
            </div>

            <iframe
              className="map"
              style={{ marginTop: 22 }}
              title="PiciCake műhely a térképen"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=1156%20Budapest%2C%20P%C3%A1skomliget%20utca%2050&output=embed"
            />
          </div>

          <div className="panel">
            <h3>Írj nekünk</h3>
            {state === 'done' ? (
              <div>
                <p style={{ fontWeight: 700, color: 'var(--brand-darker)' }}>Megkaptuk az üzeneted.</p>
                <p>Egy munkanapon belül válaszolunk a megadott e-mail címre.</p>
              </div>
            ) : (
              <>
                <div className="form-grid">
                  <label className="field"><span>Név</span>
                    <input type="text" value={form.name} onChange={(e) => set('name')(e.target.value)} />
                  </label>
                  <label className="field"><span>Telefonszám (nem kötelező)</span>
                    <input type="tel" value={form.phone} onChange={(e) => set('phone')(e.target.value)} />
                  </label>
                  <label className="field span-2"><span>E-mail cím</span>
                    <input type="email" value={form.email} onChange={(e) => set('email')(e.target.value)} />
                  </label>
                  <label className="field span-2"><span>Miben segíthetünk?</span>
                    <select value={form.topic} onChange={(e) => set('topic')(e.target.value)}>
                      <option>Rendeléssel kapcsolatos kérdés</option>
                      <option>Egyedi torta egyeztetés</option>
                      <option>Rendezvény, nagyobb mennyiség</option>
                      <option>Meglévő rendelés módosítása</option>
                      <option>Együttműködés, sajtó</option>
                      <option>Egyéb</option>
                    </select>
                  </label>
                  <label className="field span-2"><span>Üzenet</span>
                    <textarea value={form.message} onChange={(e) => set('message')(e.target.value)} />
                  </label>
                </div>
                {error && <p className="error">{error}</p>}
                <button type="button" className="btn btn--block" style={{ marginTop: 18 }} onClick={send} disabled={state === 'sending'}>
                  {state === 'sending' ? 'Küldés…' : 'Üzenet elküldése'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
