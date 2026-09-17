import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../lib/cart';
import { computeTotals, groupSelections } from '../lib/pricing';
import type { Totals } from '../lib/pricing';
import {
  AGGLO_ZIPS, PAYMENT_METHODS, SERVICE_FEE_LABEL, SHIPPING_METHODS, SHOP, STRIPE,
  cityForZip, isBudapestZip, shippingById,
} from '../data/config';
import type { PaymentId, ShippingId } from '../data/config';
import { earliestDate, formatDateHu, formatFt, toInputDate } from '../lib/format';
import { submit } from '../lib/submit';
import type { SubmitState } from '../lib/submit';
import Calendar from '../components/Calendar';

/** A leadott rendelés a visszaigazoló oldalhoz — a kosár ekkor már üres. */
type PlacedOrder = {
  shipping: { id: string; label: string; fee: number; window: string };
  payment: { label: string; fee: number };
  requestedDate: string;
  requestedSlot: string;
  customer: { name: string; email: string; phone: string };
  address: { zip: string; city: string; street: string; doorbell: string } | null;
  note: string;
  items: {
    slug: string; name: string; qty: number; total: number;
    options: { group: string; value: string; delta: number }[];
    designImages: string[];
  }[];
  totals: Totals;
};
import { IconCheck } from '../components/Bits';

type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: 'Átvétel módja',
  2: 'Időpont',
  3: 'Adatok és fizetés',
};

export default function Checkout() {
  const { lines, subtotal, hasPerishable, clear } = useCart();

  const [step, setStep] = useState<Step>(1);
  const [shipping, setShipping] = useState<ShippingId | null>(null);
  const [payment, setPayment] = useState<PaymentId>('bankkartya');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    zip: '', city: '', street: '', doorbell: '',
    note: '', accept: false,
  });
  const [errors, setErrors] = useState<string[]>([]);
  /** Nagyítva megjelenített csatolt terv a visszaigazoló oldalon. */
  const [zoom, setZoom] = useState<string | null>(null);
  const [state, setState] = useState<SubmitState>('idle');
  const [orderId, setOrderId] = useState('');
  /* A kosár a leadás után kiürül, ezért a visszaigazoláshoz eltesszük a rendelést. */
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  const method = shipping ? shippingById(shipping) : null;
  const minDate = toInputDate(earliestDate(hasPerishable ? SHOP.leadTimeDays : SHOP.leadTimeDaysGifts));

  const available = useMemo(
    () => SHIPPING_METHODS.filter((m) => (hasPerishable ? m.allowsPerishable : true)),
    [hasPerishable],
  );

  const totals = computeTotals(
    subtotal,
    method?.fee ?? 0,
    PAYMENT_METHODS.find((p) => p.id === payment)?.fee ?? 0,
  );

  const set = (key: keyof typeof form) => (value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  /**
   * Az irányítószám csak négy számjegy lehet, és ebből azonosítjuk a
   * települést — Budapestet nem lehet átírni, az agglomerációban pedig csak a
   * 14 elérhető település irányítószáma fogadható el.
   */
  const cityFor = (zip: string, shippingId?: string) => {
    if (zip.length !== 4) return '';
    if (shippingId === 'futar-budapest') return isBudapestZip(zip) ? 'Budapest' : '';
    if (shippingId === 'futar-agglomeracio') return AGGLO_ZIPS[zip] ?? '';
    return cityForZip(zip);
  };

  const setZip = (raw: string) => {
    /* Beírásból és beillesztésből is csak a számjegyek első négyese marad. */
    const zip = raw.replace(/\D/g, '').slice(0, 4);
    setForm((f) => ({ ...f, zip, city: cityFor(zip, method?.id) }));
  };

  /** Az irányítószámhoz tartozó visszajelzés a mező alatt. */
  const zipHint = (() => {
    if (!method?.needsAddress) return null;
    if (form.zip.length < 4) return { ok: false, text: 'Négy számjegy — ebből azonosítjuk a települést.' };
    if (method.id === 'futar-budapest') {
      return isBudapestZip(form.zip)
        ? { ok: true, text: 'Budapest — a kiszállítás rendben.' }
        : { ok: false, text: 'Ez nem budapesti irányítószám. Agglomerációba az agglomerációs kiszállítással viszünk.' };
    }
    const city = AGGLO_ZIPS[form.zip];
    return city
      ? { ok: true, text: `${city} — a kiszállítás rendben.` }
      : { ok: false, text: 'Erre az irányítószámra nem szállítunk. Elérhető: ' + Object.values(AGGLO_ZIPS).join(', ') + '.' };
  })();

  /* Szállítási mód váltásakor az időpont ürül; a települést a címnél megadott
     irányítószámból számoljuk újra. */
  useEffect(() => {
    setSlot('');
  }, [shipping]);

  /* ------------------------------ sikeres rendelés ------------------------------ */
  if (state === 'done') {
    return (
      <section className="wrap success">
        <p className="eyebrow">Megkaptuk</p>
        <h1>Köszönjük a rendelést!</h1>
        <span className="success__code">Rendelésszám: {orderId}</span>
        <p>Visszaigazoló e-mailt küldünk a megadott címre. Ha valamit egyeztetnünk kell az időponttal, keresünk.</p>

        {placed && (
          <div className="receipt">
            <h2>Amit rendeltél</h2>

            <div className="receipt__grid">
              <div>
                <span>Átvétel módja</span>
                <strong>{placed.shipping.label}</strong>
                <small>{placed.shipping.fee === 0 ? 'Ingyenes' : formatFt(placed.shipping.fee)}</small>
              </div>
              <div>
                <span>{placed.shipping.id === 'atvetel' ? 'Átvétel ideje' : 'Kiszállítás napja'}</span>
                <strong>{formatDateHu(placed.requestedDate)}</strong>
                <small>{placed.requestedSlot}</small>
              </div>
              <div>
                <span>Fizetés</span>
                <strong>{placed.payment.label}</strong>
                {placed.payment.fee > 0 && <small>+{formatFt(placed.payment.fee)}</small>}
              </div>
              {placed.address && (
                <div>
                  <span>Szállítási cím</span>
                  <strong>{placed.address.zip} {placed.address.city}</strong>
                  <small>{placed.address.street}{placed.address.doorbell ? ` · ${placed.address.doorbell}` : ''}</small>
                </div>
              )}
            </div>

            <ul className="receipt__items">
              {placed.items.map((item, i) => (
                <li key={`${item.slug}-${i}`}>
                  <div className="receipt__row">
                    <strong>{item.qty} × {item.name}</strong>
                    <span>{formatFt(item.total)}</span>
                  </div>
                  {item.options.length > 0 && (
                    <ul className="receipt__opts">
                      {item.options.map((o, j) => (
                        <li key={j}>{o.group}: {o.value}{o.delta ? ` (+${formatFt(o.delta)})` : ''}</li>
                      ))}
                    </ul>
                  )}
                  {item.designImages.length > 0 && (
                    <div className="receipt__shots">
                      <span>Csatolt terv ({item.designImages.length} kép)</span>
                      <div>
                        {item.designImages.map((src, j) => (
                          <button type="button" key={j} onClick={() => setZoom(src)} aria-label={`${j + 1}. csatolt terv nagyítása`}>
                            <img src={src} alt={`Csatolt terv ${j + 1}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {placed.note.trim() && (
              <p className="receipt__note"><strong>Megjegyzésed:</strong> {placed.note}</p>
            )}

            <div className="receipt__totals">
              <div><span>Termékek</span><span>{formatFt(placed.totals.subtotal)}</span></div>
              <div><span>Szállítás</span><span>{placed.totals.shipping === 0 ? 'Ingyenes' : formatFt(placed.totals.shipping)}</span></div>
              {placed.totals.paymentFee > 0 && <div><span>Fizetési felár</span><span>{formatFt(placed.totals.paymentFee)}</span></div>}
              <div><span>{SERVICE_FEE_LABEL}</span><span>{formatFt(placed.totals.serviceFee)}</span></div>
              <div className="receipt__sum"><span>Összesen</span><span>{formatFt(placed.totals.total)}</span></div>
            </div>
          </div>
        )}

        {payment === 'atutalas' && (
          <p style={{ marginInline: 'auto' }}>
            Utaláshoz: {SHOP.contactPerson} · {SHOP.bankName} {SHOP.bankAccount}. A közlemény rovatba
            kérjük a <strong>{orderId}</strong> rendelésszámot.
          </p>
        )}
        <Link to="/termekek" className="btn" style={{ marginTop: '1.6rem' }}>Vissza a termékekhez</Link>

        {zoom && (
          <div className="lightbox" role="dialog" aria-modal="true" aria-label="Csatolt terv" onClick={() => setZoom(null)}>
            <img src={zoom} alt="Csatolt terv nagyítva" />
            <button type="button" className="lightbox__close" onClick={() => setZoom(null)} aria-label="Bezárás">×</button>
          </div>
        )}
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <section className="section">
        <div className="wrap empty">
          <h1>Üres a kosár</h1>
          <p style={{ marginInline: 'auto' }}>Tegyél bele valamit, és utána tudod leadni a rendelést.</p>
          <Link to="/termekek" className="btn" style={{ marginTop: '1.4rem' }}>Termékek megnézése</Link>
        </div>
      </section>
    );
  }

  /* --------------------------------- lépések ---------------------------------- */

  const validate = (target: Step): string[] => {
    const out: string[] = [];
    if (target >= 2 && !shipping) out.push('Válaszd ki, hogyan kéred a rendelést.');
    if (target >= 3) {
      if (!date) out.push('Válassz napot a naptárból.');
      if (method?.slots && !slot) out.push('Válassz időpontot az átvételhez.');
    }
    return out;
  };

  const go = (target: Step) => {
    const problems = validate(target);
    setErrors(problems);
    if (problems.length === 0) {
      setStep(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const send = async () => {
    const problems = validate(3);
    if (form.name.trim().length < 3) problems.push('Kérünk, add meg a neved.');
    if (!form.email.includes('@')) problems.push('Kérünk, add meg egy érvényes e-mail címet.');
    if (form.phone.replace(/\D/g, '').length < 9) problems.push('Kérünk, add meg a telefonszámod — a futár ezen hív.');
    if (method?.needsAddress) {
      if (!/^\d{4}$/.test(form.zip)) {
        problems.push('Az irányítószám négy számjegy.');
      } else if (method.id === 'futar-budapest' && !isBudapestZip(form.zip)) {
        problems.push('Ez az irányítószám nem budapesti. Válaszd az agglomerációs kiszállítást, vagy írd át az irányítószámot.');
      } else if (method.id === 'futar-agglomeracio' && !AGGLO_ZIPS[form.zip]) {
        problems.push('Erre az irányítószámra nem szállítunk. A 14 elérhető település közül válassz irányítószámot.');
      }
      if (!form.city.trim()) problems.push('Az irányítószámból nem sikerült beazonosítani a települést.');
      if (form.street.trim().length < 5) problems.push('Kérünk, add meg az utcát és a házszámot.');
    }
    if (!form.accept) problems.push('Az ÁSZF és az adatkezelési tájékoztató elfogadása szükséges.');
    setErrors(problems);
    if (problems.length > 0) return;

    setState('sending');
    const id = `PC-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const payload = {
      orderId: id,
      shipping: { id: method!.id, label: method!.label, fee: method!.fee, window: method!.window },
      payment,
      requestedDate: date,
      requestedSlot: method!.slots ? slot : method!.window,
      customer: { name: form.name, email: form.email, phone: form.phone },
      address: method!.needsAddress
        ? { zip: form.zip, city: form.city, street: form.street, doorbell: form.doorbell }
        : null,
      note: form.note,
      items: lines.map((l) => ({
        slug: l.slug, name: l.name, qty: l.qty, unitPrice: l.unitPrice, total: l.qty * l.unitPrice,
        options: l.selections.map((s) => ({ group: s.groupLabel, value: s.label, delta: s.delta })),
        designImages: l.designImages ?? [],
      })),
      totals,
      currency: STRIPE.currency,
    };

    try {
      const res = await submit('order', payload);
      /* Bankkártyánál a backend adhat vissza Stripe Checkout linket — ha van, oda megyünk. */
      const url = (res as { checkoutUrl?: string }).checkoutUrl;
      if (payment === 'bankkartya' && url) {
        window.location.href = url;
        return;
      }
      setOrderId(id);
      setPlaced({
        shipping: payload.shipping,
        payment: PAYMENT_METHODS.find((x) => x.id === payment)!,
        requestedDate: payload.requestedDate,
        requestedSlot: payload.requestedSlot,
        customer: payload.customer,
        address: payload.address,
        note: payload.note,
        items: payload.items,
        totals: payload.totals,
      });
      setState('done');
      clear();
      window.scrollTo({ top: 0 });
    } catch {
      setState('error');
      setErrors([`A rendelést nem sikerült elküldeni. Próbáld újra, vagy írj nekünk: ${SHOP.email}`]);
    }
  };

  const stepState = (s: Step) => (s === step ? 'current' : s < step ? 'done' : 'todo');

  return (
    <section className="section section--tight">
      <div className="wrap">
        <div className="head">
          <h1>Pénztár</h1>
          <p className="lead">Három rövid lépés, és már készítjük is.</p>
        </div>

        <div className="checkout">
          <div>
            <nav className="steps-bar" aria-label="Rendelés lépései">
              {([1, 2, 3] as Step[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  className="steps-bar__item"
                  data-state={stepState(s)}
                  onClick={() => (s < step ? setStep(s) : go(s))}
                >
                  <span>{s}. lépés</span>
                  {STEP_LABELS[s]}
                </button>
              ))}
            </nav>

            {/* ---------------------------- 1. lépés ---------------------------- */}
            {step === 1 && (
              <div className="panel">
                <h3>Hogyan kéred?</h3>
                {hasPerishable && (
                  <p style={{ fontSize: '.88rem', color: 'var(--ink-soft)', marginBottom: '1rem' }}>
                    A kosárban friss desszert van, ezért csak a PiciCake futár és a személyes átvétel
                    választható — a csomagautomata és a futárszolgálatok nem tudják épségben kiszállítani.
                  </p>
                )}
                <div className="choice">
                  {available.map((m) => (
                    <label className="radio" key={m.id} data-checked={shipping === m.id}>
                      <input type="radio" name="shipping" checked={shipping === m.id} onChange={() => {
                        setShipping(m.id);
                        setForm((f) => ({ ...f, city: cityFor(f.zip, m.id) }));
                      }} />
                      <span className="radio__body">
                        <strong>{m.label}</strong>
                        <small>{m.note}</small>
                        {m.cities && <small>Elérhető: {m.cities.join(', ')}</small>}
                      </span>
                      <span className="radio__fee">{m.fee === 0 ? 'Ingyenes' : formatFt(m.fee)}</span>
                    </label>
                  ))}
                </div>
                {errors.length > 0 && <ul className="error" style={{ paddingLeft: '1.1rem' }}>{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
                <button type="button" className="btn btn--block" style={{ marginTop: 20 }} onClick={() => go(2)}>
                  Tovább az időponthoz
                </button>
              </div>
            )}

            {/* ---------------------------- 2. lépés ---------------------------- */}
            {step === 2 && method && (
              <div className="panel">
                <h3>Mikorra kéred?</h3>
                <p style={{ fontSize: '.9rem', color: 'var(--ink-soft)' }}>
                  {method.label} · {method.window}
                  {hasPerishable && ` · legkorábban ${SHOP.leadTimeDays} nap múlva`}
                </p>

                <div style={{ marginTop: 18 }}>
                  <Calendar value={date} onChange={setDate} min={minDate} />
                </div>

                {method.slots ? (
                  <div style={{ marginTop: 22 }}>
                    <p style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--brand-darker)', marginBottom: '.6rem' }}>
                      Átvétel időpontja
                    </p>
                    <div className="slots">
                      {method.slots.map((s) => (
                        <button key={s} type="button" className="slot" aria-pressed={slot === s} onClick={() => setSlot(s)}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="note" style={{ marginTop: 20 }}>
                    <strong>Kiszállítás sávja: {method.window}.</strong> Szűkebb intervallumot nem tudunk vállalni,
                    de a futár telefonál, amikor a közelben jár.
                  </p>
                )}

                {date && (
                  <p style={{ marginTop: 16, fontSize: '.92rem' }}>
                    Választott nap: <strong>{formatDateHu(date)}</strong>{slot && `, ${slot}`}
                  </p>
                )}

                {errors.length > 0 && <ul className="error" style={{ paddingLeft: '1.1rem' }}>{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
                <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>Vissza</button>
                  <button type="button" className="btn" style={{ flex: 1 }} onClick={() => go(3)}>Tovább az adatokhoz</button>
                </div>
              </div>
            )}

            {/* ---------------------------- 3. lépés ---------------------------- */}
            {step === 3 && method && (
              <>
                <div className="panel">
                  <h3>Elérhetőség</h3>
                  <div className="form-grid">
                    <label className="field"><span>Név</span>
                      <input type="text" value={form.name} onChange={(e) => set('name')(e.target.value)} autoComplete="name" />
                    </label>
                    <label className="field"><span>Telefonszám</span>
                      <input type="tel" value={form.phone} onChange={(e) => set('phone')(e.target.value)} autoComplete="tel" placeholder="+36" />
                    </label>
                    <label className="field span-2"><span>E-mail cím</span>
                      <input type="email" value={form.email} onChange={(e) => set('email')(e.target.value)} autoComplete="email" />
                    </label>
                  </div>
                </div>

                {method.needsAddress && (
                  <div className="panel">
                    <h3>Szállítási cím</h3>
                    <div className="form-grid">
                      <label className="field"><span>Irányítószám</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="\\d{4}"
                          value={form.zip}
                          onChange={(e) => setZip(e.target.value)}
                          autoComplete="postal-code"
                          placeholder="pl. 1156"
                        />
                        {zipHint && (
                          <small className={zipHint.ok ? 'field__ok' : 'field__hint'}>{zipHint.text}</small>
                        )}
                      </label>
                      <label className="field"><span>Település</span>
                        <input
                          type="text"
                          value={form.city}
                          readOnly
                          tabIndex={-1}
                          aria-readonly="true"
                          placeholder="Az irányítószámból"
                          className="input--locked"
                        />
                        <small className="field__hint">
                          {method.id === 'futar-budapest'
                            ? 'Budapesti kiszállítás — a település adott.'
                            : 'A 14 elérhető település közül az irányítószám alapján.'}
                        </small>
                      </label>
                      <label className="field span-2"><span>Utca, házszám</span>
                        <input type="text" value={form.street} onChange={(e) => set('street')(e.target.value)} autoComplete="street-address" />
                      </label>
                      <label className="field span-2"><span>Emelet, kapucsengő (nem kötelező)</span>
                        <input type="text" value={form.doorbell} onChange={(e) => set('doorbell')(e.target.value)} />
                      </label>
                    </div>
                  </div>
                )}

                <div className="panel">
                  <h3>Megjegyzés</h3>
                  <label className="field">
                    <span>Bármi, amit tudnunk kell a rendelésről</span>
                    <textarea
                      value={form.note}
                      onChange={(e) => set('note')(e.target.value)}
                      placeholder="Pl. a felirat pontos szövege, a torta színei (max. 3), allergia, vagy hogy mikor a legjobb hívni."
                    />
                  </label>
                  <p style={{ fontSize: '.86rem', color: 'var(--ink-soft)', marginTop: 10 }}>
                    Ha a terméknél kihagytad a feliratot vagy a színeket, ide is beírhatod. Ha nem adsz meg
                    színt, a témához illőt választunk.
                  </p>
                </div>

                <div className="panel">
                  <h3>Fizetés</h3>
                  <div className="choice">
                    {PAYMENT_METHODS.map((p) => (
                      <label className="radio" key={p.id} data-checked={payment === p.id}>
                        <input type="radio" name="payment" checked={payment === p.id} onChange={() => setPayment(p.id)} />
                        <span className="radio__body">
                          <strong>{p.label}</strong>
                          <small>{p.note}</small>
                        </span>
                        {p.fee > 0 && <span className="radio__fee">+{formatFt(p.fee)}</span>}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <label className="check">
                    <input type="checkbox" checked={form.accept} onChange={(e) => set('accept')(e.target.checked)} />
                    <span>
                      Elfogadom az <a href={SHOP.legal.aszf} target="_blank" rel="noreferrer" className="link-underline">ÁSZF-et</a> és
                      az <a href={SHOP.legal.privacy} target="_blank" rel="noreferrer" className="link-underline">adatkezelési tájékoztatót</a>.
                    </span>
                  </label>
                  {errors.length > 0 && (
                    <ul className="error" style={{ paddingLeft: '1.1rem', marginTop: 12 }}>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
                  )}
                  <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn--ghost" onClick={() => setStep(2)}>Vissza</button>
                    <button type="button" className="btn" style={{ flex: 1 }} onClick={send} disabled={state === 'sending'}>
                      {state === 'sending' ? 'Rendelés küldése…' : `Rendelés véglegesítése · ${formatFt(totals.total)}`}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ---------------------------- összegzés ---------------------------- */}
          <div className="panel summary">
            <h3>Rendelésed</h3>
            {lines.map((l) => (
              <div key={l.id} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid var(--line)' }}>
                <div className="summary-line" style={{ padding: 0 }}>
                  <span style={{ color: 'var(--brand-darker)', fontWeight: 700 }}>{l.qty} × {l.name}</span>
                  <span style={{ fontWeight: 700 }}>{formatFt(l.unitPrice * l.qty)}</span>
                </div>
                {l.selections.length > 0 && (
                  <div className="cart-line__opts" style={{ marginTop: 4 }}>
                    <ul>
                      {groupSelections(l.selections).map((gr) => (
                        <li key={gr.groupId}>{gr.groupLabel}: {gr.values.join(', ')}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            <div className="summary-line"><span>Részösszeg</span><span>{formatFt(totals.subtotal)}</span></div>
            <div className="summary-line">
              <span>Szállítás{method ? ` — ${method.label}` : ''}</span>
              <span>{method ? (method.fee === 0 ? 'Ingyenes' : formatFt(method.fee)) : 'Az 1. lépésben'}</span>
            </div>
            {totals.paymentFee > 0 && (
              <div className="summary-line"><span>Utánvét díja</span><span>{formatFt(totals.paymentFee)}</span></div>
            )}
            <div className="summary-line"><span>{SERVICE_FEE_LABEL}</span><span>{formatFt(totals.serviceFee)}</span></div>
            <div className="summary-total"><span>Összesen</span><span>{formatFt(totals.total)}</span></div>

            {date && (
              <p style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 14, fontSize: '.88rem', color: 'var(--brand-darker)', fontWeight: 600 }}>
                <IconCheck /> {formatDateHu(date)}{slot && `, ${slot}`}
              </p>
            )}
            <p style={{ fontSize: '.82rem', color: 'var(--ink-soft)', marginTop: 14 }}>{SHOP.allergens}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
