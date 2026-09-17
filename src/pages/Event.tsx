import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EVENT_PAGE } from '../data/content';
import { SITE_IMAGES } from '../data/products';
import { SHOP } from '../data/config';
import { earliestDate, toInputDate } from '../lib/format';
import { submit } from '../lib/submit';
import type { SubmitState } from '../lib/submit';
import { IconUpload, Img, Reveal } from '../components/Bits';


/** Ízek — a picicake.hu egyedi torta kínálata szerint. */
const FLAVOURS = [
  'Fehér csokoládé – Málna', 'Fehér csokoládé – Eper', 'Fehér csokoládé – Áfonya',
  'Tejcsokoládé – Málna', 'Tejcsokoládé – Eper', 'Tejcsokoládé – Áfonya',
  'Lime – Kókusz', 'Eper – Kókusz', 'Citrom', 'Vanília',
  'Maxi King', 'Bounty', 'Karamell', 'Tejcsokoládé', 'Fehér csokoládé',
];

const SHAPES = ['Kerek', 'Négyzet', 'Szív'];

type Step = 1 | 2 | 3;
const STEP_LABELS: Record<Step, string> = { 1: 'Kérdések', 2: 'Képfeltöltés', 3: 'Adatok' };
const STEP_INTRO: Record<Step, string> = {
  1: 'Mondd el, milyen tortára gondoltál.',
  2: 'Ha van inspirációd, töltsd fel — nem kötelező.',
  3: 'Hova küldjük az ajánlatot?',
};

type Upload = { name: string; dataUrl: string };

const MAX_MB = 5;
const MAX_FILES = 3;

export default function Event() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    flavour: '', customFlavour: '', shape: '', note: '', date: '',
    name: '', phone: '', email: '', accept: false,
  });
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [state, setState] = useState<SubmitState>('idle');

  const set = (key: keyof typeof form) => (value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));
  const minDate = toInputDate(earliestDate(SHOP.leadTimeDays));

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_FILES - uploads.length;
    const chosen = Array.from(files).slice(0, Math.max(0, room));
    const tooBig = chosen.filter((f) => f.size > MAX_MB * 1024 * 1024);
    if (tooBig.length) {
      setErrors([`Ezek a képek nagyobbak ${MAX_MB} MB-nál: ${tooBig.map((f) => f.name).join(', ')}`]);
    } else {
      setErrors([]);
    }
    const ok = chosen.filter((f) => f.size <= MAX_MB * 1024 * 1024);
    const read = await Promise.all(ok.map((file) => new Promise<Upload>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, dataUrl: String(reader.result) });
      reader.onerror = () => reject(new Error('olvasási hiba'));
      reader.readAsDataURL(file);
    })));
    setUploads((prev) => [...prev, ...read].slice(0, MAX_FILES));
  };

  const validate = (target: Step): string[] => {
    const out: string[] = [];
    if (target >= 2) {
      if (!form.flavour && !form.customFlavour.trim()) out.push('Válassz ízt, vagy írd be a saját ötletedet.');
      if (!form.shape) out.push('Válaszd ki a formát.');
      if (form.note.trim().length < 5) out.push('A megjegyzésbe kérünk, írd le a méretet és a darabszámot.');
      if (!form.date) out.push('Add meg, mikorra szeretnéd a tortát.');
    }
    return out;
  };

  const go = (target: Step) => {
    const problems = validate(target);
    setErrors(problems);
    if (problems.length === 0) {
      setStep(target);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };

  const send = async () => {
    const problems = validate(3);
    if (form.name.trim().length < 3) problems.push('Kérünk, add meg a teljes neved.');
    if (form.phone.replace(/\D/g, '').length < 9) problems.push('Kérünk, add meg a telefonszámod.');
    if (!form.email.includes('@')) problems.push('Kérünk, add meg egy érvényes e-mail címet.');
    if (!form.accept) problems.push('Az ÁSZF és az adatkezelési tájékoztató elfogadása szükséges.');
    setErrors(problems);
    if (problems.length > 0) return;

    setState('sending');
    try {
      await submit('eventQuote', {
        ...form,
        images: uploads.map((u) => ({ name: u.name, dataUrl: u.dataUrl })),
      });
      setState('done');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setState('error');
      setErrors([`Nem sikerült elküldeni. Írj nekünk: ${SHOP.email}`]);
    }
  };

  return (
    <>
      <section className="section section--tight">
        <Reveal className="wrap split">
          <div>
            <p className="eyebrow">Rendezvény</p>
            <h1>{EVENT_PAGE.title}</h1>
            <p className="lead" style={{ margin: '1rem 0 0' }}>{EVENT_PAGE.lead}</p>
            <ul className="pill-list">
              {EVENT_PAGE.occasions.map((o) => <li key={o}>{o}</li>)}
            </ul>
            <a href="#ajanlatkeres" className="btn" style={{ marginTop: '1.6rem' }}>Kérj ajánlatot</a>
          </div>
          <span className="split__media"><Img src={SITE_IMAGES.specialLeft} alt="Desszertasztal rendezvényre" /></span>
        </Reveal>
      </section>

      {/* ---------------------------- 3 lépés ---------------------------- */}
      <section className="section section--blush">
        <div className="wrap">
          <Reveal className="head head--center">
            <p className="eyebrow">Így megy</p>
            <h2>Három lépés az ajánlatig</h2>
          </Reveal>
          <div className="steps">
            {EVENT_PAGE.steps.map((s) => (
              <div className="step" key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------- ajánlatkérő --------------------------- */}
      <section className="section" id="ajanlatkeres">
        <div className="wrap">
          <Reveal className="head head--center">
            <h2>Egyedi torta rendelés</h2>
            <p className="lead">
              Töltsd ki a három rövid lépést, és két munkanapon belül küldünk konkrét ajánlatot.
            </p>
          </Reveal>

          <div className="wiz">
            {state === 'done' ? (
              <div className="wiz__card">
                <div className="wiz__body" style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.5rem' }}>Megkaptuk a kérésed!</h3>
                  <p style={{ marginInline: 'auto', color: 'var(--ink-soft)' }}>
                    Két munkanapon belül küldünk egy konkrét ajánlatot ízekkel, mérettel és árral.
                    Ha közben kérdésed van, írj a {SHOP.email} címre.
                  </p>
                  <Link to="/termekek" className="btn" style={{ marginTop: '1.4rem' }}>Termékek megnézése</Link>
                </div>
              </div>
            ) : (
              <>
                <nav className="wiz__steps" aria-label="Ajánlatkérés lépései">
                  {([1, 2, 3] as Step[]).map((n) => (
                    <button
                      key={n}
                      type="button"
                      className="wiz__step"
                      data-state={n === step ? 'current' : n < step ? 'done' : 'todo'}
                      onClick={() => (n < step ? setStep(n) : go(n))}
                    >
                      <i>{n}</i><span>{STEP_LABELS[n]}</span>
                    </button>
                  ))}
                </nav>

                <div className="wiz__card">
                  <div className="wiz__head">
                    <div>
                      <h3>{STEP_LABELS[step]}</h3>
                      <p>{STEP_INTRO[step]}</p>
                    </div>
                    <span className="wiz__count">{step} / 3</span>
                  </div>
                  <div className="wiz__body">
                    {/* ------------------------ 1. kérdések ------------------------ */}
                    {step === 1 && (
                      <>
                        <div className="wiz__row">
                          <div className="wiz__field">
                            <label htmlFor="flavour">Milyen ízű legyen?</label>
                            <select id="flavour" value={form.flavour} onChange={(e) => set('flavour')(e.target.value)}>
                              <option value="">Kérünk, válassz!</option>
                              {FLAVOURS.map((f) => <option key={f} value={f}>{f}</option>)}
                            </select>
                          </div>
                          <div className="wiz__field">
                            <label htmlFor="shape">Forma</label>
                            <select id="shape" value={form.shape} onChange={(e) => set('shape')(e.target.value)}>
                              <option value="">Kérünk, válassz!</option>
                              {SHAPES.map((f) => <option key={f} value={f}>{f}</option>)}
                            </select>
                            <p className="wiz__hint">Formatortát nem készítünk.</p>
                          </div>
                        </div>

                        <div className="wiz__field">
                          <label htmlFor="customFlavour">Teljesen egyedi ízt választok</label>
                          <input id="customFlavour" type="text" value={form.customFlavour} onChange={(e) => set('customFlavour')(e.target.value)} />
                          <p className="wiz__hint">
                            Adunk lehetőséget a választásra, de azt nem tudjuk garantálni, hogy tudunk beszerezni!
                          </p>
                        </div>

                        <div className="wiz__field">
                          <label htmlFor="note">Megjegyzés</label>
                          <textarea
                            id="note"
                            value={form.note}
                            onChange={(e) => set('note')(e.target.value)}
                            placeholder="Fontos a tortának a mérete, és darabszáma!"
                          />
                          <p className="wiz__hint">
                            Ide írd le nyugodtan, pontosan mit szeretnél: alkalom, színek, felirat, méret,
                            adagok száma, bármi, amit fontosnak találsz.
                          </p>
                        </div>

                        <div className="wiz__field" style={{ marginBottom: 0 }}>
                          <label htmlFor="date">Mikorra szeretnéd a tortát?</label>
                          <input id="date" type="date" min={minDate} value={form.date} onChange={(e) => set('date')(e.target.value)} />
                          <p className="wiz__hint">
                            Legkorábban {SHOP.leadTimeDays} nap múlvára tudjuk vállalni; nagyobb rendezvényre
                            2–3 héttel előre érdemes szólni.
                          </p>
                        </div>
                      </>
                    )}

                    {/* ---------------------- 2. képfeltöltés ---------------------- */}
                    {step === 2 && (
                      <>
                        <div className="wiz__field">
                          <label htmlFor="files">Van inspirációd? Töltsd fel</label>
                          <div className="drop">
                            <input
                              id="files"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => { void addFiles(e.target.files); e.target.value = ''; }}
                            />
                            <IconUpload />
                            <strong>Kattints vagy húzd ide a képeket</strong>
                            <span>Legfeljebb {MAX_FILES} kép, egyenként max. {MAX_MB} MB</span>
                          </div>
                          <p className="wiz__hint">
                            Nem kötelező — ha nincs kép, simán lépj tovább. A feltöltött fotókat csak
                            inspirációként használjuk, más alkotó munkáját nem másoljuk le.
                          </p>
                        </div>

                        {uploads.length > 0 && (
                          <div className="drop__list">
                            {uploads.map((u, i) => (
                              <div className="drop__item" key={`${u.name}-${i}`}>
                                <img src={u.dataUrl} alt="" />
                                <button type="button" onClick={() => setUploads((prev) => prev.filter((_, x) => x !== i))} aria-label={`${u.name} törlése`}>×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* -------------------------- 3. adatok ------------------------- */}
                    {step === 3 && (
                      <>
                        <div className="wiz__row">
                          <div className="wiz__field">
                            <label htmlFor="name">Teljes Név</label>
                            <input id="name" type="text" autoComplete="name" value={form.name} onChange={(e) => set('name')(e.target.value)} />
                          </div>
                          <div className="wiz__field">
                            <label htmlFor="phone">Telefonszám</label>
                            <input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set('phone')(e.target.value)} placeholder="+36" />
                          </div>
                        </div>
                        <div className="wiz__field">
                          <label htmlFor="email">Email cím</label>
                          <input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email')(e.target.value)} />
                        </div>
                        <label className="check">
                          <input type="checkbox" checked={form.accept} onChange={(e) => set('accept')(e.target.checked)} />
                          <span>
                            Elolvastam, és elfogadom az{' '}
                            <a href={SHOP.legal.aszf} target="_blank" rel="noreferrer">ÁSZF</a>-et valamint az{' '}
                            <a href={SHOP.legal.privacy} target="_blank" rel="noreferrer">ADATKEZELÉSI TÁJÉKOZTATÓT</a>.
                          </span>
                        </label>
                      </>
                    )}

                    {errors.length > 0 && (
                      <ul className="error" style={{ paddingLeft: '1.1rem', marginTop: 16 }}>
                        {errors.map((e) => <li key={e}>{e}</li>)}
                      </ul>
                    )}
                  </div>

                  <div className="wiz__foot">
                    {step > 1 && (
                      <button type="button" className="wiz__back" onClick={() => setStep((step - 1) as Step)}>← Előző</button>
                    )}
                    {step < 3 ? (
                      <button type="button" className="wiz__next" onClick={() => go((step + 1) as Step)}>Következő →</button>
                    ) : (
                      <button type="button" className="wiz__next" onClick={send} disabled={state === 'sending'}>
                        {state === 'sending' ? 'Küldés…' : 'Benyújtás'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="note" style={{ marginTop: 22 }}>
                  {EVENT_PAGE.notes.map((n) => <p key={n} style={{ marginBottom: '.5rem' }}>{n}</p>)}
                  <p style={{ margin: 0 }}>
                    <strong>Sürgős?</strong> Hívj minket a {SHOP.phone} számon, vagy írj a {SHOP.email} címre.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

    </>
  );
}
