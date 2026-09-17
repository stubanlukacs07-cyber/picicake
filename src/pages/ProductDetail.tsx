import { useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CAKE_PACKAGING, CATEGORIES, PRODUCTS, getProduct } from '../data/products';
import { SHOP } from '../data/config';
import { formatDelta, formatFt } from '../lib/format';
import { useCart } from '../lib/cart';
import type { Selection } from '../lib/cart';
import ProductCard from '../components/ProductCard';
import { Img } from '../components/Bits';
import NotFound from './NotFound';
import type { Preset } from '../designer/types';

/** Ezeknél kérhető felirat és tortaszín (GYIK: max 3 szín, 15–20 karakter). */
const ALLOWS_TEXT = (slug: string, category: string) =>
  category === 'tortak' || ['bento-brownie', 'brownie-csokibetukkel', 'browniesu'].includes(slug);

export default function ProductDetail() {
  const { slug = '' } = useParams();
  const product = getProduct(slug);
  const { add } = useCart();

  /* A tortatervezőből átadott előbeállítás. */
  const location = useLocation();
  const preset = (location.state as { preset?: Preset } | null)?.preset;
  const usePreset = preset?.slug === slug;

  const [picked, setPicked] = useState<Record<string, string>>(usePreset ? preset!.picks : {});
  const [checked, setChecked] = useState<Record<string, string[]>>(usePreset ? preset!.checked : {});
  const [felirat, setFelirat] = useState(usePreset ? preset!.felirat ?? '' : '');
  /* A csatolt képek: a tervezőből jövő mentések, és amit a vásárló utólag feltölt. */
  const [designImages, setDesignImages] = useState<string[]>(usePreset ? preset!.images ?? [] : []);
  const [uploadError, setUploadError] = useState('');

  const MAX_IMAGES = 6;
  const MAX_MB = 5;

  /** Feltöltött fotó kicsinyítve, hogy a kosár beleférjen a tárhelybe. */
  const shrink = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, 1000 / Math.max(img.width, img.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * k);
        cv.height = Math.round(img.height * k);
        cv.getContext('2d')!.drawImage(img, 0, 0, cv.width, cv.height);
        resolve(cv.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => reject(new Error('kép hiba'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('olvasási hiba'));
    reader.readAsDataURL(file);
  });

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_IMAGES - designImages.length;
    const chosen = Array.from(files).slice(0, Math.max(0, room));
    const tooBig = chosen.filter((f) => f.size > MAX_MB * 1024 * 1024);
    setUploadError(tooBig.length ? `Túl nagy (max. ${MAX_MB} MB): ${tooBig.map((f) => f.name).join(', ')}` : '');
    const ok = chosen.filter((f) => f.size <= MAX_MB * 1024 * 1024);
    try {
      const read = await Promise.all(ok.map(shrink));
      setDesignImages((prev) => [...prev, ...read].slice(0, MAX_IMAGES));
    } catch {
      setUploadError('Valamelyik képet nem sikerült beolvasni.');
    }
  };
  const [szinek, setSzinek] = useState(usePreset ? preset!.szinek ?? '' : '');
  const [qty, setQty] = useState(1);
  const [image, setImage] = useState(0);
  const [touched, setTouched] = useState(false);

  const selections = useMemo<Selection[]>(() => {
    const out: Selection[] = [];
    for (const group of product?.options ?? []) {
      if (group.type === 'select') {
        const label = picked[group.id];
        if (!label) continue;
        const choice = group.choices.find((x) => x.label === label);
        out.push({ groupId: group.id, groupLabel: group.label, label, delta: choice?.delta ?? 0 });
      } else {
        for (const label of checked[group.id] ?? []) {
          const choice = group.choices.find((x) => x.label === label);
          out.push({ groupId: group.id, groupLabel: group.label, label, delta: choice?.delta ?? 0 });
        }
      }
    }
    return out;
  }, [product, picked, checked]);

  if (!product) return <NotFound />;

  const category = CATEGORIES.find((x) => x.id === product.category)!;
  const unitPrice = product.price + selections.reduce((sum, x) => sum + x.delta, 0);
  const extrasTotal = selections.filter((x) => x.delta !== 0).reduce((sum, x) => sum + x.delta, 0);
  const allowsText = ALLOWS_TEXT(product.slug, product.category);
  const related = PRODUCTS.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4);
  const sale = product.comparePrice && product.comparePrice > product.price;

  const missing = (product.options ?? []).filter((group) =>
    group.type === 'select'
      ? group.required && !picked[group.id]
      : (group.min ?? 0) > (checked[group.id]?.length ?? 0),
  );

  const toggle = (groupId: string, label: string) =>
    setChecked((prev) => {
      const current = prev[groupId] ?? [];
      return {
        ...prev,
        [groupId]: current.includes(label) ? current.filter((x) => x !== label) : [...current, label],
      };
    });

  const addToCart = () => {
    setTouched(true);
    if (missing.length > 0) {
      document.getElementById(`opt-${missing[0].id}`)?.focus();
      document.getElementById(`opt-${missing[0].id}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    const extras: Selection[] = [];
    if (felirat.trim()) extras.push({ groupId: 'felirat', groupLabel: 'Felirat', label: felirat.trim(), delta: 0 });
    if (szinek.trim()) extras.push({ groupId: 'szinek', groupLabel: 'Színek', label: szinek.trim(), delta: 0 });
    if (usePreset) {
      extras.push({ groupId: 'terv', groupLabel: 'Összeállítás', label: '3D tervezőben összeállítva', delta: 0 });
    }
    add(product, [...selections, ...extras], qty, designImages.length ? designImages : undefined);
    setQty(1);
  };

  return (
    <>
      <div className="wrap">
        <nav className="crumbs" aria-label="Morzsamenü">
          <Link to="/kezdolap">Kezdőlap</Link><span>/</span>
          <Link to="/termekek">Termékek</Link><span>/</span>
          <Link to={`/termekek/${category.slug}`}>{category.name}</Link><span>/</span>
          {product.name}
        </nav>
      </div>

      <div className="wrap pdp">
        <div>
          <div className="gallery__main">
            <Img src={product.images[image]} alt={product.name} eager />
          </div>
          {product.images.length > 1 && (
            <div className="gallery__thumbs">
              {product.images.map((src, i) => (
                <button key={src} type="button" aria-current={i === image} onClick={() => setImage(i)} aria-label={`${i + 1}. kép`}>
                  <Img src={src} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp__buy">
          <h1 style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.6rem)' }}>{product.name}</h1>
          <p style={{ color: 'var(--ink-soft)', marginTop: '.6rem' }}>{product.short}</p>

          <div className="note design-note" style={{ marginTop: '1rem' }}>
            <div>
              {usePreset ? (
                <>
                  <strong>A tervezőből jöttél.</strong> A terved beállításait előre kitöltöttük.
                  {designImages.length > 0
                    ? ' A mentett képeket csatoljuk a rendeléshez — így a műhely pontosan azt látja, amit összeraktál.'
                    : ' A képet a tervezőben mentsd le, vagy tölts fel egyet itt, különben nem jut el hozzánk az illusztráció.'}
                </>
              ) : (
                <>
                  <strong>Van elképzelésed vagy inspirációd?</strong> Tölts fel képeket a rendeléshez —
                  saját fotót, mintát, vagy a 3D tervezőben mentett tervet.
                </>
              )}
            </div>

            {designImages.length > 0 && (
              <div className="design-note__shots">
                {designImages.map((src, i) => (
                  <span className="design-note__shot" key={i}>
                    <img src={src} alt={`Csatolt kép ${i + 1}`} />
                    <button
                      type="button"
                      onClick={() => setDesignImages((prev) => prev.filter((_, x) => x !== i))}
                      aria-label={`${i + 1}. kép eltávolítása`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <label className="design-note__upload">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => { void addFiles(e.target.files); e.target.value = ''; }}
                disabled={designImages.length >= MAX_IMAGES}
              />
              <span>
                {designImages.length >= MAX_IMAGES
                  ? `Legfeljebb ${MAX_IMAGES} kép csatolható`
                  : `Kép csatolása (${designImages.length}/${MAX_IMAGES})`}
              </span>
            </label>
            {uploadError && <p className="error" style={{ margin: 0 }}>{uploadError}</p>}

            {!usePreset && (
              <p style={{ margin: 0, fontSize: '.84rem' }}>
                <Link to="/torta-tervezo" className="link-underline">Vagy tervezd meg 3D-ben</Link>
              </p>
            )}
          </div>

          <div className="pdp__price">
            {formatFt(unitPrice * qty)}
            {sale && <del>{formatFt(product.comparePrice! * qty)}</del>}
          </div>
          {extrasTotal !== 0 && (
            <p className="pdp__basenote">
              Alapár {formatFt(product.price)} · választott opciók {formatDelta(extrasTotal)}
            </p>
          )}
          {product.stock !== undefined && (
            <p className="pdp__basenote" style={{ color: 'var(--brand)', fontWeight: 700 }}>Raktáron: {product.stock} db</p>
          )}

          {product.options?.map((group) => {
            const invalid = touched && missing.some((m) => m.id === group.id);
            if (group.type === 'select') {
              return (
                <div className="optgroup" key={group.id}>
                  <label className="optgroup__label" htmlFor={`opt-${group.id}`}>
                    <strong>{group.label}</strong>
                    {invalid && <em>Kötelező választás</em>}
                  </label>
                  <select
                    id={`opt-${group.id}`}
                    value={picked[group.id] ?? ''}
                    onChange={(e) => setPicked({ ...picked, [group.id]: e.target.value })}
                  >
                    <option value="">Kérünk, válassz!</option>
                    {group.choices.map((choice) => (
                      <option key={choice.label} value={choice.label}>
                        {choice.label}{choice.delta ? ` (${formatDelta(choice.delta)})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            const picks = checked[group.id] ?? [];
            return (
              <fieldset className="optgroup" key={group.id} id={`opt-${group.id}`} tabIndex={-1} style={{ border: 0, margin: 0, padding: 0 }}>
                <legend className="optgroup__label" style={{ width: '100%', padding: 0 }}>
                  <strong>{group.label}</strong>
                  {invalid && <em>Válassz legalább {group.min}-et</em>}
                  {!invalid && picks.length > 0 && (
                    <em style={{ color: 'var(--brand)' }}>{picks.length} kiválasztva</em>
                  )}
                </legend>
                {group.hint && <p className="optgroup__hint">{group.hint}</p>}
                <div className="extras">
                  {group.choices.map((choice) => {
                    const on = picks.includes(choice.label);
                    return (
                      <label className="extra" key={choice.label} data-checked={on}>
                        <input type="checkbox" checked={on} onChange={() => toggle(group.id, choice.label)} />
                        <span className="extra__name">{choice.label}</span>
                        <span className="extra__price">{choice.delta ? formatDelta(choice.delta) : 'ingyen'}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}

          {allowsText && (
            <>
              <div className="optgroup">
                <label className="optgroup__label" htmlFor="felirat">
                  <strong>Felirat</strong>
                  <em style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>max. 20 karakter</em>
                </label>
                <input id="felirat" type="text" maxLength={20} value={felirat} onChange={(e) => setFelirat(e.target.value)} placeholder="pl. Boldog szülinapot, Anna!" />
              </div>
              <div className="optgroup">
                <label className="optgroup__label" htmlFor="szinek">
                  <strong>Színek</strong>
                  <em style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>legfeljebb 3</em>
                </label>
                <input id="szinek" type="text" value={szinek} onChange={(e) => setSzinek(e.target.value)} placeholder="pl. púderrózsaszín alap, fehér felirat" />
              </div>
            </>
          )}

          <div className="buy-row">
            <div className="qty">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Kevesebb">−</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Több">+</button>
            </div>
            <button type="button" className="btn" onClick={addToCart}>Add a kosaradhoz</button>
          </div>

          <div className="note">
            {product.perishable ? (
              <>
                <strong>Átvétel és szállítás.</strong> A napot a pénztárnál választod ki, legkorábban{' '}
                {SHOP.leadTimeDays} nap múlvára. Desszertnél a PiciCake futár (Budapest 2 000 Ft, agglomeráció
                6 000 Ft) vagy a személyes átvétel választható — csomagautomata és GLS nem.
              </>
            ) : (
              <>
                <strong>Szállítás.</strong> A TiMEbox ajándékok Foxposttal, GLS-szel, PostaPonttal és MPL-lel is
                mennek, illetve átvehetők a XV. kerületben.
              </>
            )}
          </div>
        </div>
      </div>

      <div className="wrap pdp__desc">
        <div>
          <h2>A termékről</h2>
          {product.desc.map((p) => <p key={p}>{p}</p>)}
          {product.perishable && (
            <p style={{ fontSize: '.88rem', color: 'var(--ink-soft)', marginTop: '1.4rem' }}>{SHOP.allergens}</p>
          )}
        </div>

        <div className="bullets">
          {product.bullets?.map((b) => (
            <div key={b.title}>
              <h3>{b.title}</h3>
              <ul>{b.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
          {product.category === 'tortak' && (
            <div>
              <h3>Átadás és csomagolás</h3>
              <ul><li>{CAKE_PACKAGING}</li></ul>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="head"><h2 style={{ fontSize: '1.8rem' }}>Ezt is szeretni fogod</h2></div>
            <div className="grid">{related.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
