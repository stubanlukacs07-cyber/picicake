import { createCakeScene } from './cake-scene.js';
import {
  PRODUCTS, productBySlug, sizeOf, shapesFor, buildOrder, formatFt,
  FROSTING_COLORS, TEXT_COLORS, PIPE_COLORS, RIBBON_COLORS, FLOWER_COLORS,
  FLOWERS, FONTS, DECOR, TIPS,
} from './catalog.js';

export const STORE = 'picicake.tervezo.v2';

/* ---- szín segédek (a webshop CakeBuilderéből) --------------------- */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function hexToHsl(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return { h: 0, s: 40, l: 80 };
  const [r, g, b] = [1, 2, 3].map((i) => parseInt(m[i], 16) / 255);
  const max = Math.max(r, g, b); const min = Math.min(r, g, b);
  const l = (max + min) / 2; let h = 0; let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function hslToHex(h, s, l) {
  const sn = s / 100; const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  const seg = Math.floor(h / 60) % 6;
  const rgb = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][seg]
    .map((v) => Math.round((v + m) * 255));
  return `#${rgb.map((v) => clamp(v, 0, 255).toString(16).padStart(2, '0')).join('')}`;
}
/**
 * A rendeléshez csatolt kép kicsinyített JPEG változata. A teljes felbontású
 * PNG-t a vásárló letölti; a kosárba és a webhookra ez a kisebb kerül, hogy
 * beleférjen a localStorage kvótájába.
 */
function compactImage(dataUrl, maxSide = 900, quality = 0.84) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, maxSide / Math.max(img.width, img.height));
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * k);
      cv.height = Math.round(img.height * k);
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#fbf1ee';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      resolve(cv.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---- alapállapot: letisztult, a feliratra nem lóg semmi ----------- */
export function defaults(slug = 'koreai-bento-torta') {
  const p = productBySlug(slug);
  const size = p.sizes[0];
  const shapes = shapesFor(p, size.id);
  // a szelet élein a nyomott krémszegély a termék része, nem opció
  const slice = p.slug === 'bento-szelet';
  return {
    slug: p.slug,
    flavour: p.flavours[0],
    size: size.id,
    shape: shapes[0]?.id ?? 'kerek',
    frosting: '#f2d3d0',
    pattern: p.pattern?.options[0].id ?? null,
    patternColor: '#b68e88',
    // A felirat es a minta ALAPBOL egyben all. Szetbontani a szerkesztoben
    // lehet, kulon kereszre — igy nem esik szet magatol semmi.
    patternSplit: false,
    patternItems: null,
    flowerKind: 'arvacska',
    flowerColor: null,
    flowerScale: 1,
    spoons: '1',
    border: {
      felul: { on: !!p.border, tip: slice ? 'csillag' : 'rozetta', density: slice ? 0.85 : 0.72, size: slice ? 0.5 : 0.52 },
      alul: { on: slice, tip: slice ? 'csillag' : 'sima', density: 0.85, size: 0.5 },
    },
    borderColor: slice ? '#f2d3d0' : '#ffffff',
    extras: [],
    text: {
      value: p.text?.mode === 'none' ? '' : p.text?.mode === 'preset' ? p.text.presets[0] : 'Boldog szülinapot',
      font: 'Caveat', color: slug === 'bento-brownie' ? '#fdf6ec' : '#6b3b34', size: 1, x: 0, z: -0.05, rot: 0,
      split: false, letters: {},
    },
  };
}

/** A mentett terv átveszi az új szerkezetet, de régi mentésből is indulhat. */
export function normalise(cfg) {
  const base = defaults(cfg.slug);
  const b = cfg.border ?? {};
  const level = (key) => ({ ...base.border[key], ...(b[key] ?? {}) });
  return {
    ...base,
    ...cfg,
    border: { felul: level('felul'), alul: level('alul') },
    text: { ...base.text, ...(cfg.text ?? {}) },
  };
}

/**
 * A tervező felszerelése egy DOM gyökérre. A visszaadott függvény leszereli.
 * @param {HTMLElement} root  a tervező markupját tartalmazó elem
 * @param {{ onGoToProduct?: (order: any) => void }} opts
 */
export async function initDesigner(root, opts = {}) {
  const onGoToProduct = opts.onGoToProduct ?? (() => {});
  let state = (() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE));
      if (raw?.config?.slug && productBySlug(raw.config.slug)) {
        return { ...raw, config: normalise(raw.config) };
      }
    } catch { /* nincs mentett terv */ }
    return { config: defaults(), saved: false, attached: false, byProduct: {} };
  })();
  if (!state.byProduct) state.byProduct = {};
  let config = state.config;
  let tool = 'orbit';
  let brush = { color: '#b0413e', size: 22, erase: false };
  let pipe = { color: '#ffffff', size: 0.4, tip: 'rozetta', erase: false };
  let selection = null;
  let spin = false;
  let painted = false;
  let strokeCount = 0;
  let savedImages = [];
  /* Elmentett saját színek mezőnként, két hely mindegyiknél. */
  state.myColors = state.myColors ?? {};
  /* Melyik panelszekció van nyitva — a panel újraépítésekor is megmarad. */
  state.secOpen = state.secOpen ?? {};

  const product = () => productBySlug(config.slug);
  const persist = () => {
    try {
      localStorage.setItem(STORE, JSON.stringify({
        config, saved: state.saved, attached: state.attached, byProduct: state.byProduct,
        myColors: state.myColors, secOpen: state.secOpen,
      }));
    } catch { /* letiltott storage */ }
  };

  /**
   * A festés, a nyomott krém és a lerakott dekor a jelenetben él, nem a
   * configban — ezért külön el kell menteni, különben a kezdőlapi néző egy
   * korábbi állapotot mutat. Késleltetve fut, mert két PNG kiolvasásából áll.
   */
  let artTimer = 0;
  const persistArt = (delay = 700) => {
    window.clearTimeout(artTimer);
    artTimer = window.setTimeout(() => {
      try {
        state.byProduct[config.slug] = {
          config: JSON.parse(JSON.stringify(config)),
          art: scene.artState(),
        };
        persist();
      } catch { /* letiltott storage */ }
    }, delay);
  };

  /* ---- jelenet ------------------------------------------------------ */
  const scene = createCakeScene(root.querySelector('#canvas'), {
    onChange: (info) => {
      if (info.text) config.text = { ...config.text, ...info.text };
      if (info.painted !== undefined) painted = info.painted;
      const drew = info.painted === true || (info.strokes !== undefined && info.strokes > strokeCount);
      if (info.strokes !== undefined) strokeCount = info.strokes;
      invalidateImage();
      if (drew) artOptOut = false;
      syncArtExtra(drew);
      renderPanel();
      persist();
      persistArt(drew ? 400 : 900);
      if (drew && !histLock) snapSoon(450);
    },
    onSelect: (sel) => { selection = sel; renderSubbar(); renderPanel(); },
  });

  /* ---- előzmények: visszavonás és újra ------------------------------ */
  const HIST_MAX = 25;
  let hist = [];
  let histAt = -1;
  let histLock = false;
  let histTimer = 0;

  const cloneState = () => ({
    config: JSON.parse(JSON.stringify(config)),
    art: scene.artState(),
  });

  function snap() {
    const entry = cloneState();
    hist = hist.slice(0, histAt + 1);
    hist.push(entry);
    if (hist.length > HIST_MAX) hist.shift();
    histAt = hist.length - 1;
    renderToolbar();
  }

  /** Késleltetett mentés: csúszka húzása közben nem tesz le lépést. */
  function snapSoon(delay = 200) {
    window.clearTimeout(histTimer);
    histTimer = window.setTimeout(snap, delay);
  }

  function restore(index) {
    const entry = hist[index];
    if (!entry) return;
    histLock = true;
    window.clearTimeout(histTimer);
    config = JSON.parse(JSON.stringify(entry.config));
    scene.update(config, product());
    scene.setArtState(entry.art, product());
    histAt = index;
    invalidateImage();
    renderToolbar();
    renderSubbar();
    renderPanel();
    persist();
    persistArt(300);
    histLock = false;
  }

  function invalidateImage() {
    if (state.saved) { state.saved = false; state.attached = false; }
  }

  /* ================================================================== */
  /* Eszközsáv                                                          */
  /* ================================================================== */

  function tools() {
    const p = product();
    const list = [{ id: 'orbit', label: 'Forgatás' }];
    if (p.tools.pipe) list.push({ id: 'krem', label: 'Krémnyomás' });
    if (p.tools.brush) list.push({ id: 'brush', label: 'Ecset' });
    list.push({ id: 'move', label: 'Dekor és felirat szerkesztése' });
    return list;
  }

  const HINTS = {
    orbit: 'Húzd az egérrel a forgatáshoz, görgess a nagyításhoz. Érintéssel egy ujj forgat, két ujj közelít.',
    brush: '<b>Bal gomb fest, jobb gomb forgat</b> — eszközváltás nélkül. A vonás folytonos, a tempótól függetlenül.',
    krem: '<b>Húzd</b>, és folytonos krémvonal keletkezik — <b>koppints</b>, és egyetlen csepp kerül oda. A tetején és az oldalán is működik; közben a jobb gomb forgat.',
    move: 'Kattints bármire: dekorra, <b>egyetlen betűre</b> vagy egy nyomott mintára. Húzással áthelyezed, a gyűrű fogantyújával forgatod — a sávon pedig színezed, méretezed és le is veszed.',
  };

  function renderToolbar() {
    const bar = root.querySelector('#toolbar');
    bar.innerHTML = `
      ${tools().map((t) => `<button class="chip chip--tool" data-act="tool" data-v="${t.id}" aria-selected="${tool === t.id}">${t.label}</button>`).join('')}
      <span class="spacer"></span>
      <button class="chip chip--tool chip--icon" data-act="undo" title="Visszavonás" aria-label="Visszavonás" ${histAt > 0 ? '' : 'disabled'}>↺</button>
      <button class="chip chip--tool chip--icon" data-act="redo" title="Újra" aria-label="Újra" ${histAt >= 0 && histAt < hist.length - 1 ? '' : 'disabled'}>↻</button>
      <button class="chip chip--tool chip--ghost" data-act="spin" aria-selected="${spin}">${spin ? 'Körbeforgás stop' : 'Körbeforgás'}</button>
      <button class="chip chip--tool" data-act="reset">Nézet vissza</button>`;
    root.querySelector('#hint').innerHTML = HINTS[tool];
    renderStageBadges();
  }

  function renderStageBadges() {
    const p = product();
    const size = sizeOf(p, config.size);
    const badges = [`${p.name}`, size.label];
    if (p.slug === 'egyedi-torta' || p.slug === 'koreai-bento-torta') {
      badges.push(`${Math.round(size.dia)} cm · ${Math.round(size.height)} cm magas`);
    }
    root.querySelector('#stageBadges').innerHTML = badges.map((b) => `<span>${esc(b)}</span>`).join('');
  }

  function renderSubbar() {
    const bar = root.querySelector('#subbar');
    if (tool === 'brush') {
      bar.innerHTML = `
        <span class="opt__label">Ecset</span>
        ${TEXT_COLORS.concat(['#e8b64a']).map((c) => `<button class="swatch swatch--sm" data-act="brushcolor" data-v="${c}" style="background:${c}" aria-selected="${!brush.erase && brush.color === c}" aria-label="Ecsetszín"></button>`).join('')}${myColorSlots('brushcolor')}
        <input type="color" class="colorwell" data-act="brushpick" value="${brush.color}" aria-label="Egyedi ecsetszín">
        <label class="slider" style="min-width:150px"><span>Vonalvastagság: ${brush.size} px</span>
          <input type="range" min="4" max="64" value="${brush.size}" data-act="brushsize"></label>
        <button class="chip" data-act="erase" aria-selected="${brush.erase}">Radír</button>
        <button class="chip" data-act="clearpaint">Rajz törlése</button>`;
      return;
    }
    if (tool === 'krem') {
      bar.innerHTML = `
        <span class="opt__label">Krém színe</span>
        ${PIPE_COLORS.map((c) => `<button class="swatch swatch--sm" data-act="pipecolor" data-v="${c}" style="background:${c}" aria-selected="${pipe.color.toLowerCase() === c}" aria-label="Krémszín"></button>`).join('')}${myColorSlots('pipecolor')}
        <input type="color" class="colorwell" data-act="pipepick" value="${pipe.color}" aria-label="Egyedi krémszín">
        <span class="opt__label" style="margin-left:6px">Csúcs</span>
        ${TIPS.map((t) => `<button class="chip" data-act="pipetip" data-v="${t.id}" aria-selected="${pipe.tip === t.id}">${esc(t.label)}</button>`).join('')}
        <label class="slider" style="min-width:168px"><span>Méret: ${pipe.size.toFixed(2)} cm</span>
          <input type="range" min="0.16" max="1.1" step="0.02" value="${pipe.size}" data-act="pipesize"></label>
        <button class="chip" data-act="pipeerase" aria-selected="${pipe.erase}">Radír</button>
        <button class="chip" data-act="undostroke">Vissza</button>
        <button class="chip" data-act="clearstrokes">Krém törlése</button>`;
      return;
    }
    if (tool === 'move' && selection) {
      const kind = selection.kind;
      const label = kind === 'letter' ? `Betű: ${selection.ch}`
        : kind === 'text' ? 'Felirat'
        : kind === 'motif' ? 'Nyomott minta'
        : kind === 'patternset' ? 'Minták (együtt)'
        : (DECOR[selection.type]?.label ?? 'Dekor');
      // betűnél és mintánál egyenkénti szín és méret is jár
      const tintable = ['letter', 'text', 'motif', 'patternset'].includes(kind) || !!selection.tintable;
      const colors = (kind === 'letter' || kind === 'text') ? TEXT_COLORS
        : (kind === 'motif' || kind === 'patternset') ? PIPE_COLORS
        : selection.type === 'virag' ? FLOWER_COLORS
        : RIBBON_COLORS;
      const sizeOnly = (kind === 'decor' && !tintable) ? `
        <label class="slider" style="min-width:132px"><span>Méret: ${(selection.scale ?? 1).toFixed(2)}×</span>
          <input type="range" min="0.5" max="1.8" step="0.05" value="${selection.scale ?? 1}" data-act="selscale"></label>` : '';
      const tint = tintable ? `
        <span class="opt__label" style="margin-left:4px">Szín</span>
        ${colors.map((c) => `<button class="swatch swatch--sm" data-act="selcolor" data-v="${c}" style="background:${c}" aria-selected="${(selection.color || '').toLowerCase() === c}" aria-label="Szín"></button>`).join('')}${myColorSlots('selcolor')}
        <input type="color" class="colorwell" data-act="selcolorpick" value="${selection.color || '#ffffff'}" aria-label="Egyedi szín">
        <label class="slider" style="min-width:132px"><span>Méret: ${(selection.scale ?? 1).toFixed(2)}×</span>
          <input type="range" min="0.4" max="2.4" step="0.05" value="${selection.scale ?? 1}" data-act="selscale"></label>` : '';
      // A kijelolt viragnak SAJAT fajtaja lehet: a "Vegyes" a szalankenti
      // valtozatossagot adja, ez pedig a celzott felulirast.
      const kindPick = selection.type === 'virag' ? `
        <span class="opt__label" style="margin-left:4px">Fajta</span>
        ${FLOWERS.map((f) => `<button class="chip" data-act="selflower" data-v="${f.id}" aria-selected="${selection.flower === f.id}">${esc(f.label)}</button>`).join('')}` : '';
      const sidePick = selection.canSide ? `
        <span class="opt__label" style="margin-left:4px">Hol</span>
        <button class="chip" data-act="selsurface" data-v="top" aria-selected="${selection.surface !== 'side'}">Tetején</button>
        <button class="chip" data-act="selsurface" data-v="side" aria-selected="${selection.surface === 'side'}">Oldalán</button>` : '';
      const actions = kind === 'text'
        ? '<button class="chip chip--ghost" data-act="splittext" data-v="on">Betűkre bontás</button><button class="chip" data-act="resettext">Alaphelyzet</button>'
        : kind === 'letter'
          ? '<button class="chip" data-act="selreset">Vissza a sorba</button><button class="chip" data-act="splittext" data-v="off">Betűk összevonása</button><button class="chip" data-act="resettext">Alaphelyzet</button>'
          : kind === 'patternset'
            ? '<button class="chip chip--ghost" data-act="splitpattern" data-v="on">Minták szétbontása</button><button class="chip" data-act="resetpattern">Alaphelyzet</button>'
            : kind === 'motif'
              ? '<button class="chip" data-act="splitpattern" data-v="off">Minták összevonása</button><button class="chip" data-act="resetpattern">Alaphelyzet</button>'
              : '<button class="chip" data-act="delsel">Levesz</button>';
      bar.innerHTML = `
        <span class="opt__label">Kijelölve</span><strong style="font-size:.88rem">${esc(label)}</strong>
        <button class="chip" data-act="rot" data-v="-0.26">Forgatás ↺</button>
        <button class="chip" data-act="rot" data-v="0.26">Forgatás ↻</button>
        ${tint}${sizeOnly}${kindPick}${sidePick}
        ${actions}`;
      return;
    }
    bar.innerHTML = '';
  }

  /* ================================================================== */
  /* Panel                                                              */
  /* ================================================================== */

  function chips(act, options, current, opts = {}) {
    return `<div class="opt__row">${options.map((o) => {
      const on = Array.isArray(current) ? current.includes(o.id) : current === o.id;
      return `<button class="chip" data-act="${act}" data-v="${o.id}" aria-selected="${on}" ${o.disabled ? 'disabled' : ''}>${esc(o.label)}${o.suffix ? ` <small>${esc(o.suffix)}</small>` : ''}</button>`;
    }).join('')}</div>`;
  }

  /** A krémszín több kontrollon jelenik meg; a húzás alatt ezeket kézzel
   *  tartjuk szinkronban, hogy ne kelljen újraépíteni a panelt. */
  function syncFrostingFields(hex, source, labelText) {
    const panel = root.querySelector('#panel');
    if (labelText) {
      const label = source.parentElement.querySelector('span');
      if (label) label.textContent = labelText;
    }
    const hexField = panel.querySelector('[data-act="hex"]');
    if (hexField && hexField !== source) hexField.value = hex;
    const well = panel.querySelector('[data-act="frostingpick"]');
    if (well && well !== source) well.value = hex;
    panel.querySelectorAll('[data-act="frosting"]').forEach((b) => {
      b.setAttribute('aria-selected', String(b.dataset.v === hex.toLowerCase()));
    });
  }

  /** Egyetlen szinvezerlo minden helyre: swatchok + arnyalat/telitettseg/
   *  vilagossag csuszka + hexkod. Igy a minta szinet ugyanolyan skalan
   *  lehet valasztani, mint a kremet. */
  /** A haromfele szin (krem, minta, szegely) ugyanazon a skalan all. */
  const COLOR_FIELDS = {
    frosting: {
      key: 'frosting', fallback: '#f2d3d0',
      get: () => config.frosting,
      set: (hex) => apply({ frosting: hex }),
      live: (hex) => applyLive({ frosting: hex }),
    },
    patterncolor: {
      key: 'patternColor', fallback: '#b68e88',
      get: () => config.patternColor,
      set: (hex) => apply({ patternColor: hex }),
      live: (hex) => applyLive({ patternColor: hex }),
    },
    bordercolor: {
      key: 'borderColor', fallback: '#ffffff',
      get: () => config.borderColor,
      set: (hex) => apply({ borderColor: hex }),
      live: (hex) => applyLive({ borderColor: hex }),
    },
    /* A felirat színe: a betűnkénti felülírásokat töröljük, különben a
       panelen választott szín nem látszódna. */
    textcolor: {
      fallback: '#6b3b34',
      get: () => config.text.color,
      set: (hex) => apply({ text: { ...config.text, color: hex, letters: {} } }),
      live: (hex) => applyLive({ text: { ...config.text, color: hex, letters: {} } }),
    },
    flowercolor: {
      fallback: '#f7e6ec',
      get: () => config.flowerColor || '#f7e6ec',
      set: (hex) => { invalidateImage(); config.flowerColor = hex; scene.setFlowerColor(hex); persist(); persistArt(); renderPanel(); },
      live: (hex) => { invalidateImage(); config.flowerColor = hex; scene.setFlowerColor(hex); persist(); },
    },
    brushcolor: {
      fallback: '#b0413e',
      get: () => brush.color,
      set: (hex) => { brush = { ...brush, color: hex, erase: false }; scene.setBrush(brush); renderSubbar(); },
      live: (hex) => { brush = { ...brush, color: hex, erase: false }; scene.setBrush(brush); },
    },
    pipecolor: {
      fallback: '#ffffff',
      get: () => pipe.color,
      set: (hex) => { pipe = { ...pipe, color: hex }; scene.setPipe(pipe); renderSubbar(); },
      live: (hex) => { pipe = { ...pipe, color: hex }; scene.setPipe(pipe); },
    },
    selcolor: {
      fallback: '#6b3b34',
      get: () => (selection && selection.color) || '#6b3b34',
      set: (hex) => { scene.colorSelected(hex); selection = { ...selection, color: hex }; invalidateImage(); persistArt(); renderSubbar(); },
      live: (hex) => { scene.colorSelected(hex); selection = { ...selection, color: hex }; invalidateImage(); },
    },
  };

  /**
   * Két elmenthető saját színhely minden színválasztóhoz. Üresen „+”, és a
   * pillanatnyi színt teszi bele; megtöltve rákattintva alkalmazza.
   */
  function myColorSlots(field) {
    const saved = state.myColors[field] ?? [null, null];
    const current = (COLOR_FIELDS[field]?.get?.() ?? '').toLowerCase();
    return saved.map((hex, i) => (hex
      ? `<span class="myslot">
          <button class="swatch swatch--my" data-act="myslot" data-f="${field}" data-v="${i}"
            style="background:${hex}" aria-selected="${hex.toLowerCase() === current}"
            title="Saját szín: ${hex}" aria-label="Saját szín ${hex}"></button>
          <button class="myslot__x" data-act="myclear" data-f="${field}" data-v="${i}" title="Hely törlése" aria-label="Saját szín törlése">×</button>
        </span>`
      : `<button class="swatch swatch--add" data-act="mysave" data-f="${field}" data-v="${i}"
          title="A mostani szín mentése ide" aria-label="Szín mentése">+</button>`)).join('');
  }

  function setColorField(name, hex, source) {
    const field = COLOR_FIELDS[name];
    if (!field) return;
    if (source) {
      const panel = root.querySelector('#panel');
      const block = source.closest('.opt');
      if (block) {
        const hexField = block.querySelector(`[data-act="${name}-hex"]`);
        if (hexField && hexField !== source) hexField.value = hex;
        const well = block.querySelector(`[data-act="${name}-pick"]`);
        if (well && well !== source) well.value = hex;
        block.querySelectorAll(`[data-act="${name}"]`).forEach((b) => {
          b.setAttribute('aria-selected', String(b.dataset.v === hex.toLowerCase()));
        });
      }
    }
    (field.live ?? field.set)(hex);
  }

  function colorBlock(act, value, swatches, label) {
    const hsl = hexToHsl(value);
    const safe = /^#[0-9a-f]{6}$/i.test(value) ? value : '#ffffff';
    return `<div class="opt" style="gap:8px">
      <span class="opt__label">${esc(label)}</span>
      <div class="opt__row">${swatches.map((c) => `<button class="swatch" data-act="${act}" data-v="${c}" style="background:${c}" aria-selected="${value.toLowerCase() === c}" aria-label="${esc(label)}"></button>`).join('')}${myColorSlots(act)}</div>
      <label class="slider"><span>Árnyalat</span><input type="range" min="0" max="360" value="${hsl.h}" data-act="${act}-hue"></label>
      <label class="slider"><span>Telítettség: ${hsl.s}%</span><input type="range" min="0" max="100" value="${hsl.s}" data-act="${act}-sat"></label>
      <label class="slider"><span>Világosság: ${hsl.l}%</span><input type="range" min="6" max="100" value="${hsl.l}" data-act="${act}-lum"></label>
      <div class="hexrow"><input type="text" value="${value}" data-act="${act}-hex" spellcheck="false" aria-label="Színkód">
        <input type="color" class="colorwell" value="${safe}" data-act="${act}-pick" aria-label="Színválasztó"></div>
    </div>`;
  }

  /**
   * Az opcióblokkokat lenyitható szekcióvá csomagolja: a felirat lesz a
   * fejléce, a tartalom pedig nyitható-zárható. A nyitott állapot a
   * mentésben él, így a panel újraépítésekor nem csukódik össze.
   */
  function section(html) {
    const m = html.match(/^<div class="opt"([^>]*)>\s*<span class="opt__label">([\s\S]*?)<\/span>([\s\S]*)<\/div>$/);
    if (!m) return html;
    const [, attrs, label, body] = m;
    const key = label.replace(/<[^>]*>/g, '').trim().slice(0, 40);
    const open = state.secOpen[key] !== false;
    return `<details class="sec"${open ? ' open' : ''}>
      <summary data-act="sec" data-v="${esc(key)}"><span>${label}</span><i aria-hidden="true"></i></summary>
      <div class="opt"${attrs}>${body}</div>
    </details>`;
  }

  /** Az összegzés belseje külön, hogy íráskor a panel újraépítése nélkül is frissüljön. */
  function summaryInner(order) {
    return `<dl>
      ${order.picks.map((x) => `<dt>${esc(x.label)}</dt><dd>${esc(x.value)}${x.delta ? ` <small>(${x.delta > 0 ? '+' : ''}${formatFt(x.delta)})</small>` : ''}</dd>`).join('')}
      ${order.checked.length ? `<dt>Extrák</dt><dd>${order.checked.map((x) => `${esc(x.label)} (+${formatFt(x.delta)})`).join('<br>')}</dd>` : ''}
      ${order.felirat ? `<dt>Felirat</dt><dd>${esc(order.felirat)}</dd>` : ''}
      ${strokeCount ? `<dt>Nyomott krém</dt><dd>${strokeCount} elem</dd>` : ''}
      ${painted ? '<dt>Rajz</dt><dd>saját ecsetrajz</dd>' : ''}
      </dl><div class="total"><span>Ár ezekkel az opciókkal</span><span>${formatFt(order.total)}</span></div>`;
  }

  /** Csak az összegzést rajzolja újra — a szövegmező fókusza megmarad. */
  function refreshSummary() {
    const box = root.querySelector('#orderSummary');
    if (box) box.innerHTML = summaryInner(buildOrder(product(), config));
  }

  function renderPanel() {
    const p = product();
    const size = sizeOf(p, config.size);
    const order = buildOrder(p, config);
    const hsl = hexToHsl(config.frosting);
    const shapes = shapesFor(p, config.size);
    const placeable = [];
    for (const extra of p.extras) {
      if (!config.extras.includes(extra.id)) continue;
      if (extra.decor && !extra.fixed) placeable.push(extra.decor);
      if (extra.decorSet) placeable.push(...extra.decorSet);
    }

    const out = [];

    out.push(`<div class="opt"><span class="opt__label">Mit tervezünk?</span>
      ${chips('slug', PRODUCTS.map((x) => ({ id: x.slug, label: x.name })), config.slug)}
      <p class="opt__note">${esc(p.note)} — ${formatFt(p.price)}-tól. A tervező csak a ${esc(p.name)} valós opcióit kínálja fel.</p></div>`);

    out.push(`<div class="opt"><span class="opt__label">${esc(p.flavourLabel ?? 'Íz')} — ${p.flavours.length} választható</span>
      <select data-act="flavour">${p.flavours.map((f) => `<option ${f === config.flavour ? 'selected' : ''}>${esc(f)}</option>`).join('')}</select></div>`);

    if (p.sizes.length > 1) {
      out.push(`<div class="opt"><span class="opt__label">${p.slug === 'egyedi-torta' ? 'Szeletszám' : 'Méret'}</span>
        ${chips('size', p.sizes.map((s) => ({ id: s.id, label: s.label, suffix: s.delta ? (s.delta > 0 ? `+${formatFt(s.delta)}` : formatFt(s.delta)) : '' })), config.size)}</div>`);
    }
    if (shapes.length > 1 || (p.shapes.length > 1 && shapes.length === 1)) {
      out.push(`<div class="opt"><span class="opt__label">Forma</span>
        ${chips('shape', p.shapes.map((s) => ({ id: s.id, label: s.label, disabled: !shapes.some((x) => x.id === s.id) })), config.shape)}
        ${shapes.length === 1 ? '<p class="opt__note">A 4 szeletes torta csak szív formában készül.</p>' : ''}</div>`);
    }

    if (p.pattern) {
      out.push(`<div class="opt"><span class="opt__label">Nyomott krémminta</span>
        ${chips('pattern', p.pattern.options, config.pattern)}
        ${colorBlock('patterncolor', config.patternColor, PIPE_COLORS, 'Minta színe')}
        <div class="opt__row">
          <button class="chip" data-act="splitpattern" data-v="${config.patternSplit ? 'off' : 'on'}">${config.patternSplit ? 'Minták összevonása' : 'Minták szétbontása'}</button>
          <button class="chip" data-act="resetpattern">Alaphelyzet</button></div>
        <p class="opt__note">A minta kontrasztos krémmel, nyomva kerül a sima, lapos krémfelszínre. Szétbontva minden minta külön mozgatható, forgatható, színezhető és méretezhető.</p></div>`);
    }

    if (p.spoons) {
      out.push(`<div class="opt"><span class="opt__label">Kanál</span>
        ${chips('spoons', p.spoons.options.map((o) => ({ id: o.id, label: o.label, suffix: o.delta ? `+${formatFt(o.delta)}` : '' })), config.spoons)}</div>`);
    }

    if (p.frosting) {
      out.push(colorBlock('frosting', config.frosting, FROSTING_COLORS, 'Krém színe'));
    }

    if (p.border) {
      const lvl = (key, title) => {
        const b = config.border[key];
        return `<div class="opt" style="gap:7px">
          <div class="opt__row" style="justify-content:space-between">
            <strong style="font-size:.86rem">${title}</strong>
            ${chips(`border-${key}-on`, [{ id: 'on', label: 'Kérem' }, { id: 'off', label: 'Nem' }], b.on ? 'on' : 'off')}
          </div>
          ${b.on ? `${chips(`border-${key}-tip`, [...TIPS, { id: 'vonal', label: 'Folytonos vonal' }], b.tip)}
          <label class="slider"><span>Méret: ${b.size.toFixed(2)} cm</span>
            <input type="range" min="0.18" max="1" step="0.02" value="${b.size}" data-act="border-${key}-size"></label>
          ${b.tip === 'vonal' ? '' : `<label class="slider"><span>Sűrűség</span>
            <input type="range" min="0" max="1" step="0.05" value="${b.density}" data-act="border-${key}-density"></label>`}` : ''}
        </div>`;
      };
      out.push(`<div class="opt"><span class="opt__label">Krém habszegély</span>
        ${lvl('felul', 'Felül')}
        ${lvl('alul', 'Alul')}
        ${colorBlock('bordercolor', config.borderColor, PIPE_COLORS, 'Szegély színe')}
        <p class="opt__note">A felső és az alsó szegély teljesen külön állítható — például felül csepp, alul folytonos vonal. Ha kézzel akarod nyomni, használd a <strong>Krémnyomás</strong> eszközt.</p></div>`);
    }

    out.push(`<div class="opt"><span class="opt__label">Extrák — több is választható</span>
      ${chips('extra', p.extras.map((e) => ({ id: e.id, label: e.label, suffix: `+${formatFt(e.price)}` })), config.extras)}
      ${p.extras.some((e) => e.fixed && config.extras.includes(e.id))
        ? `<p class="opt__note">${esc(p.extras.find((e) => e.fixed).label)} — a darabszám a terméknél kötött, és a gyertya a torta <strong>mellé</strong> csomagolva jelenik meg, nem beleszúrva.</p>` : ''}</div>`);

    // az elovirag reszletei: fajta, szin, meret — normal keretek kozott
    if (config.extras.includes('virag')) {
      out.push(`<div class="opt"><span class="opt__label">Ehető élővirág</span>
        ${chips('flowerkind', FLOWERS, config.flowerKind ?? 'arvacska')}
        <div class="opt__row"><span class="opt__note" style="min-width:74px">Szín</span>
          ${FLOWER_COLORS.map((c) => `<button class="swatch swatch--sm" data-act="flowercolor" data-v="${c}" style="background:${c}" aria-selected="${(config.flowerColor || '').toLowerCase() === c}" aria-label="Virágszín"></button>`).join('')}${myColorSlots('flowercolor')}
          <button class="chip" data-act="flowermix" aria-selected="${!config.flowerColor}">Vegyes</button></div>
        <label class="slider"><span>Virágméret: ${(config.flowerScale ?? 1).toFixed(2)}×</span>
          <input type="range" min="0.6" max="1.5" step="0.05" value="${config.flowerScale ?? 1}" data-act="flowerscale"></label>
        <p class="opt__note">Szezonális, ehető virágmix. Egy-egy szálat a szerkesztőben külön is áthelyezhetsz, forgathatsz és színezhetsz.</p></div>`);
    }

    if (placeable.length) {
      out.push(`<div class="opt"><span class="opt__label">Dekor lerakása</span>
        ${chips('place', [...new Set(placeable)].map((d) => ({ id: d, label: `+ ${DECOR[d].label}` })), null)}
        <p class="opt__note">Kattints egy elemre: felkerül egy szabad helyre. Utána a „Dekor és felirat mozgatása” eszközzel oda húzod, ahova szeretnéd, és a gyűrűvel elforgatod.</p></div>`);
    }

    if (p.text.mode !== 'none') {
      const isPreset = p.text.mode === 'preset';
      out.push(`<div class="opt"><span class="opt__label">Felirat</span>
        ${isPreset ? chips('preset', p.text.presets.map((t) => ({ id: t, label: t })), config.text.value) : ''}
        <textarea data-act="text" rows="2" placeholder="Boldog szülinapot" maxlength="${p.text.max}">${esc(config.text.value)}</textarea>
        <div class="opt__row">
          <select data-act="font" style="max-width:190px">${FONTS.map((f) => `<option value="${f.id}" ${config.text.font === f.id ? 'selected' : ''}>${esc(f.label)}</option>`).join('')}</select>
          ${TEXT_COLORS.map((c) => `<button class="swatch swatch--sm" data-act="textcolor" data-v="${c}" style="background:${c}" aria-selected="${config.text.color === c}" aria-label="Feliratszín"></button>`).join('')}${myColorSlots('textcolor')}
        </div>
        <label class="slider"><span>Árnyalat</span><input type="range" min="0" max="360" value="${hexToHsl(config.text.color).h}" data-act="textcolor-hue"></label>
        <label class="slider"><span>Telítettség: ${hexToHsl(config.text.color).s}%</span><input type="range" min="0" max="100" value="${hexToHsl(config.text.color).s}" data-act="textcolor-sat"></label>
        <label class="slider"><span>Világosság: ${hexToHsl(config.text.color).l}%</span><input type="range" min="6" max="100" value="${hexToHsl(config.text.color).l}" data-act="textcolor-lum"></label>
        <div class="hexrow"><input type="text" value="${config.text.color}" data-act="textcolor-hex" spellcheck="false" aria-label="Feliratszín kódja">
          <input type="color" class="colorwell" value="${/^#[0-9a-f]{6}$/i.test(config.text.color) ? config.text.color : '#6b3b34'}" data-act="textcolor-pick" aria-label="Feliratszín választó"></div>
        <label class="slider"><span>Betűméret</span><input type="range" min="0.5" max="1.6" step="0.05" value="${config.text.size}" data-act="textsize"></label>
        <div class="opt__row">
          <button class="chip" data-act="splittext" data-v="${config.text.split ? 'off' : 'on'}">${config.text.split ? 'Betűk összevonása' : 'Betűkre bontás'}</button>
          <button class="chip" data-act="resettext">Alaphelyzet</button></div>
        <p class="opt__note">Krémmel írt, kézírásos vonal, ${p.text.max} karakterig. A feliratot húzva mozgatod, a gyűrűvel forgatod.${p.text.gold ? ` Arany feliratot az extráknál kérhetsz.` : ''}</p></div>`);
    }

    out.push('<div class="divider"></div>');

    out.push(`<div class="summary" id="orderSummary">${summaryInner(order)}</div>`);

    

    const step = !state.saved ? 1 : (!state.attached ? 2 : 3);
    const views = `<div class="shots__views"><span class="opt__label">Kameraállás</span>
      <div class="opt__row">
        <button class="chip" data-act="view" data-v="elol">Elölről</button>
        <button class="chip" data-act="view" data-v="oldal">Oldalról</button>
        <button class="chip" data-act="view" data-v="fel">Felülről</button>
        <button class="chip" data-act="view" data-v="hatul">Hátulról</button>
      </div></div>`;
    const shots = savedImages.length ? `<div class="shots">
      ${savedImages.map((src, i) => `<div class="shots__item"><img src="${src}" alt="Mentett kép ${i + 1}">
        <button type="button" data-act="delimg" data-v="${i}" aria-label="${i + 1}. kép törlése">×</button></div>`).join('')}
    </div>` : '';

    out.push(`<div class="finish">
      <div class="steps">
        <div data-state="${step > 1 ? 'done' : 'active'}"><b>${step > 1 ? '✓' : '1'}</b> Terv kész</div>
        <div data-state="${step === 2 ? 'active' : step > 2 ? 'done' : ''}"><b>${step > 2 ? '✓' : '2'}</b> Kép mentése</div>
        <div data-state="${step === 3 ? 'active' : ''}"><b>3</b> Tovább a termékhez</div>
      </div>
      <div class="finish__body">
        ${views}
        ${shots}
        ${step === 1 ? `<p>Fordítsd a tervet a kívánt szögbe, és mentsd le a képet. <strong>A rendeléshez csatolni kell</strong> — nélküle a műhely nem látja, mit szeretnél. Több szögből is menthetsz, hogy minden részlet látszódjon.</p>
          <button class="btn btn--block" data-act="save">Kép mentése (PNG)</button>` : ''}
        ${step === 2 ? `<p class="warn">${savedImages.length} kép mentve. Fordítsd más szögbe a tervet, és ments még, ha valami nem látszik — aztán jelöld be, hogy megvan.</p>
          <button class="btn btn--ghost btn--block" data-act="save">Még egy szög mentése${savedImages.length >= 6 ? ' (max. 6)' : ''}</button>
          <label class="check" data-checked="false"><input type="checkbox" data-act="attach"> <span>A képeket elmentettem, és csatolom a rendeléshez.</span></label>` : ''}
        ${step === 3 ? `<p>Minden megvan. A termékoldal a fenti opciókkal nyílik meg, és a(z) ${savedImages.length} mentett képet automatikusan csatoljuk a rendeléshez.</p>
          <button class="btn btn--ghost btn--block" data-act="save">Még egy szög mentése</button>
          <button class="btn btn--block" data-act="go">Tovább a termékhez a beállításokkal</button>` : ''}
        <p class="note">A 3D kép alacsony felbontású illusztráció, a valóságtól eltérhet.</p>
      </div></div>`);

    out.push(`<div class="opt__row" style="gap:10px">
      <button class="btn btn--ghost btn--block" data-act="new">Új terv</button></div>`);

    out.push(`<p class="note">A desszertjeink PiciCake stílusban, <strong>kizárólag krémmel</strong> dekorálva készülnek: cukorgyöngy, marcipán- és fondantfigura, ostyakép és műanyag topper nem kérhető. A csillám fújt, gyöngyház hatású. Az élővirág szezonális, ehető virág mix. A pontos kivitelezést a rendelés után e-mailben egyeztetjük.</p>`);

    root.querySelector('#panel').innerHTML = out.map(section).join('');
  }

  /* ================================================================== */
  /* Interakciók                                                        */
  /* ================================================================== */

  function apply(changed = {}) {
    Object.assign(config, changed);
    scene.update(config, product());
    renderToolbar();
    renderPanel();
    persist();
    persistArt();
    if (!histLock) snapSoon(120);
  }

  /** Csúszkához és színválasztóhoz: a panelt NEM építi újra, különben a húzás
   *  közepe alatt cserélődne le az elem és megszakadna a húzás. */
  function applyLive(changed = {}) {
    Object.assign(config, changed);
    scene.update(config, product());
    refreshSummary();
    invalidateImage();
    persist();
    persistArt(900);
    if (!histLock) snapSoon(800);
  }

  function setTool(next) {
    tool = next;
    scene.setTool(next);
    if (next !== 'orbit' && spin) { spin = false; scene.setAutoRotate(false); }
    renderToolbar();
    renderSubbar();
  }

  /** Termekvaltas: minden alaphelyzetbe kerul az UJ desszertnel, de az
   *  eddigi desszert sajat beallitasai es rajza megmaradnak, es visszater-
   *  eskor ugyanott folytatod. */
  function switchProduct(slug) {
    if (slug === config.slug) return;
    state.byProduct[config.slug] = { config: JSON.parse(JSON.stringify(config)), art: scene.artState() };
    const saved = state.byProduct[slug];
    config = saved ? normalise(saved.config) : defaults(slug);
    state.saved = false;
    state.attached = false;
    selection = null;
    if (!tools().some((t) => t.id === tool)) tool = 'orbit';
    scene.setTool(tool);
    apply();
    scene.setArtState(saved?.art ?? null, product());
    strokeCount = scene.strokeCount();
    painted = scene.hasArt();
    artOptOut = false;
    syncArtExtra(false);
    renderSubbar();
    renderPanel();
  }

  /** Ha a vasarlo rajzol vagy kremet nyom, az "egyedi rajz" extra magatol
   *  bekerul a rendelesbe; ha leveszi, a rajz eltunik (de nem torlodik),
   *  es visszakattintva ujra megjelenik. */
  function artExtraId() {
    return product().extras.find((e) => e.effect === 'rajz')?.id ?? null;
  }

  let artOptOut = false;

  function syncArtExtra(fromDrawing = false) {
    const id = artExtraId();
    if (!id) return;
    const on = config.extras.includes(id);
    // csak uj rajzolaskor kapcsoljuk be magatol; ha a vasarlo levette, tiszteljuk
    if (fromDrawing && scene.hasArt() && !on && !artOptOut) {
      config.extras = [...config.extras, id];
      persist();
      renderPanel();
    }
    scene.setArtVisible(config.extras.includes(id));
  }

  const onClick = (ev) => {
    const el = ev.target.closest('[data-act]');
    if (!el || el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') return;
    const act = el.dataset.act;
    const v = el.dataset.v;
    const p = product();

    // szegély: border-<szint>-<mező>, hogy felül és alul teljesen külön állhasson
    if (act.startsWith('border-')) {
      const [, key, field] = act.split('-');
      const next = { ...config.border[key] };
      if (field === 'on') next.on = v === 'on';
      if (field === 'tip') next.tip = v;
      invalidateImage();
      return apply({ border: { ...config.border, [key]: next } });
    }

    switch (act) {
      case 'tool': return setTool(v);
      case 'spin': spin = !spin; if (spin) setTool('orbit'); scene.setAutoRotate(spin); return renderToolbar();
      case 'reset': return scene.resetView();
      case 'slug': return switchProduct(v);
      case 'size': {
        const allowed = shapesFor(p, v);
        const shape = allowed.some((s) => s.id === config.shape) ? config.shape : allowed[0].id;
        invalidateImage();
        return apply({ size: v, shape });
      }
      case 'shape': invalidateImage(); return apply({ shape: v });
      case 'pattern': invalidateImage(); return apply({ pattern: v });
      case 'patterncolor': invalidateImage(); return apply({ patternColor: v });
      case 'spoons': invalidateImage(); return apply({ spoons: v });
      case 'frosting':
      case 'patterncolor':
      case 'bordercolor': {
        invalidateImage();
        COLOR_FIELDS[act].set(v);
        return;
      }
      case 'bordercolor': invalidateImage(); return apply({ borderColor: v });
      case 'extra': {
        const on = config.extras.includes(v);
        invalidateImage();
        apply({ extras: on ? config.extras.filter((x) => x !== v) : [...config.extras, v] });
        // az "egyedi rajz" levetele elrejti a rajzot, visszakattintasa visszahozza
        if (v === artExtraId()) {
          artOptOut = on;
          scene.setArtVisible(!on);
        }
        return;
      }
      case 'place': {
        scene.placeDecor(v);
        setTool('move');
        invalidateImage();
        return;
      }
      case 'preset': invalidateImage(); return apply({ text: { ...config.text, value: v } });
      case 'textcolor': invalidateImage(); return COLOR_FIELDS.textcolor.set(v);
      case 'myslot': {
        const field = el.dataset.f;
        const hex = (state.myColors[field] ?? [])[Number(v)];
        if (!hex || !COLOR_FIELDS[field]) return undefined;
        invalidateImage();
        return COLOR_FIELDS[field].set(hex);
      }
      case 'mysave': {
        const field = el.dataset.f;
        const hex = COLOR_FIELDS[field]?.get?.() || COLOR_FIELDS[field]?.fallback;
        if (!hex) return undefined;
        const slots = [...(state.myColors[field] ?? [null, null])];
        slots[Number(v)] = hex;
        state.myColors[field] = slots;
        persist();
        renderPanel();
        return renderSubbar();
      }
      case 'myclear': {
        const field = el.dataset.f;
        const slots = [...(state.myColors[field] ?? [null, null])];
        slots[Number(v)] = null;
        state.myColors[field] = slots;
        persist();
        renderPanel();
        return renderSubbar();
      }
      case 'undo': return restore(histAt - 1);
      case 'redo': return restore(histAt + 1);
      case 'sec': {
        /* A <details> natívan nyit-zár; itt csak megjegyezzük az állapotot. */
        const open = state.secOpen[v] !== false;
        state.secOpen[v] = !open;
        persist();
        return undefined;
      }
      case 'brushcolor': brush = { ...brush, color: v, erase: false }; scene.setBrush(brush); return renderSubbar();
      case 'erase': brush = { ...brush, erase: !brush.erase }; scene.setBrush(brush); return renderSubbar();
      case 'clearpaint': scene.clearPaint(); painted = false; invalidateImage(); return renderPanel();
      case 'pipecolor': pipe = { ...pipe, color: v }; scene.setPipe(pipe); return renderSubbar();
      case 'pipetip': pipe = { ...pipe, tip: v }; scene.setPipe(pipe); return renderSubbar();
      case 'undostroke': scene.undoStroke(); invalidateImage(); return;
      case 'clearstrokes': scene.clearStrokes(); invalidateImage(); return;
      case 'rot': scene.rotateSelected(Number(v)); invalidateImage(); return;
      case 'selcolor': scene.colorSelected(v); selection = { ...selection, color: v }; invalidateImage(); return renderSubbar();
      case 'selreset': scene.resetSelected(); invalidateImage(); return renderSubbar();
      case 'selflower': {
        scene.flowerSelected(v);
        selection = { ...selection, flower: v };
        invalidateImage();
        return renderSubbar();
      }
      case 'selsurface': {
        scene.surfaceSelected(v);
        selection = { ...selection, surface: v };
        invalidateImage();
        return renderSubbar();
      }
      case 'splittext': scene.splitText(v === 'on'); invalidateImage(); renderSubbar(); return renderPanel();
      case 'resettext': scene.resetText(); invalidateImage(); renderSubbar(); return renderPanel();
      case 'splitpattern': scene.splitPattern(v === 'on'); invalidateImage(); renderSubbar(); return renderPanel();
      case 'resetpattern': scene.resetPattern(); invalidateImage(); renderSubbar(); return renderPanel();
      case 'flowerkind': invalidateImage(); config.flowerKind = v; scene.setFlowerKind(v); persist(); return renderPanel();
      case 'flowercolor': invalidateImage(); config.flowerColor = v; scene.setFlowerColor(v); persist(); return renderPanel();
      case 'flowermix': {
        invalidateImage();
        config.flowerColor = null;
        const pal = ['#e8a8bd', '#fdf3e6', '#f0c64a', '#d94f6e', '#8a5fbf'];
        scene.setFlowerMix(pal, FLOWERS.map((f) => f.id));
        persist();
        return renderPanel();
      }
      case 'delsel': scene.removeSelected(); selection = null; invalidateImage(); renderSubbar(); return renderPanel();
      case 'pipeerase': pipe = { ...pipe, erase: !pipe.erase }; scene.setPipe(pipe); return renderSubbar();
      case 'save': {
        if (savedImages.length >= 6) return renderPanel();
        const url = scene.snapshot();
        /* teljes felbontású PNG letöltése a vásárlónak */
        const a = document.createElement('a');
        a.href = url;
        a.download = `picicake-terv-${config.slug}-${savedImages.length + 1}.png`;
        a.click();
        state.saved = true;
        /* Az előnézet azonnal megjelenik, és csak egyszer rendereljük újra a
           panelt — így egy háttérben befejeződő kicsinyítés nem nyeli el a
           következő kattintást. A csatolt változat utólag cserélődik le a
           kisebb JPEG-re. */
        savedImages = [...savedImages, url];
        persist();
        renderPanel();
        compactImage(url).then((small) => {
          savedImages = savedImages.map((x) => (x === url ? small : x));
        });
        return undefined;
      }
      case 'delimg': {
        savedImages = savedImages.filter((_, i) => i !== Number(v));
        if (!savedImages.length) { state.saved = false; state.attached = false; }
        persist();
        return renderPanel();
      }
      case 'view': {
        /* gyors kameraállások, hogy több szögből is lehessen képet menteni */
        const [polar, azim] = ({
          elol: [1.28, 0], oldal: [1.2, 1.35], fel: [0.55, 0.5], hatul: [1.25, 3.14],
        })[v] ?? [1.2, 0.6];
        scene.setView(polar, azim);
        return;
      }
      case 'go': {
        const order = buildOrder(p, config);
        /* a mentett illusztrációt is átadjuk, hogy a rendeléshez csatolható legyen */
        onGoToProduct({ ...order, images: savedImages, config: JSON.parse(JSON.stringify(config)) });
        return;
      }
      case 'new': {
        config = defaults(config.slug);
        savedImages = [];
        state.saved = false;
        state.attached = false;
        painted = false;
        strokeCount = 0;
        scene.clearPaint();
        scene.clearStrokes();
        return apply();
      }
      default: return undefined;
    }
  };

  const onInput = (ev) => {
    const el = ev.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    const val = el.value;
    const hsl = hexToHsl(config.frosting);

    // egyseges szinkezeles: <nev>-hue / -sat / -lum / -hex / -pick
    const cm = act.match(/^([a-z]+)-(hue|sat|lum|hex|pick)$/);
    if (cm && COLOR_FIELDS[cm[1]]) {
      const [, name, field] = cm;
      const current = COLOR_FIELDS[name].get() || COLOR_FIELDS[name].fallback;
      const c = hexToHsl(current);
      let hex = current;
      if (field === 'hue') hex = hslToHex(Number(val), c.s, c.l);
      if (field === 'sat') hex = hslToHex(c.h, Number(val), c.l);
      if (field === 'lum') hex = hslToHex(c.h, c.s, Number(val));
      if (field === 'pick') hex = val;
      if (field === 'hex') {
        hex = val.startsWith('#') ? val : `#${val}`;
        if (!/^#[0-9a-f]{6}$/i.test(hex)) return undefined;
      }
      if (field === 'sat' || field === 'lum') {
        const label = el.parentElement.querySelector('span');
        if (label) label.textContent = field === 'sat' ? `Telítettség: ${Math.round(Number(val))}%` : `Világosság: ${Math.round(Number(val))}%`;
      }
      setColorField(name, hex, el);
      return;
    }

    if (act.startsWith('border-')) {
      const [, key, field] = act.split('-');
      const next = { ...config.border[key], [field === 'size' ? 'size' : 'density']: Number(val) };
      config.border = { ...config.border, [key]: next };
      const label = el.parentElement.querySelector('span');
      if (field === 'size' && label) label.textContent = `Méret: ${next.size.toFixed(2)} cm`;
      scene.update(config, product());
      invalidateImage();
      persist();
      return;
    }

    switch (act) {
      case 'flavour': return apply({ flavour: val });
      case 'font': return apply({ text: { ...config.text, font: val } });
      case 'text': {
        config.text = { ...config.text, value: val.slice(0, product().text.max) };
        applyLive({});
        /* A felirat törlésekor is frissülnie kell az összegzésnek. */
        return refreshSummary();
      }
      case 'textsize': config.text = { ...config.text, size: Number(val) }; return applyLive({});

      case 'brushsize': {
        brush = { ...brush, size: Number(val) };
        scene.setBrush(brush);
        const label = el.parentElement.querySelector('span');
        if (label) label.textContent = `Vonalvastagság: ${brush.size} px`;
        return;
      }
      case 'brushpick': brush = { ...brush, color: val, erase: false }; scene.setBrush(brush); return;
      case 'pipesize': {
        pipe = { ...pipe, size: Number(val) };
        scene.setPipe(pipe);
        const label = el.parentElement.querySelector('span');
        if (label) label.textContent = `Méret: ${pipe.size.toFixed(2)} cm`;
        return;
      }
      case 'pipepick': pipe = { ...pipe, color: val }; scene.setPipe(pipe); return;
      case 'selcolorpick': scene.colorSelected(val); selection = { ...selection, color: val }; invalidateImage(); return;
      case 'flowerscale': {
        config.flowerScale = Number(val);
        scene.setFlowerScale(Number(val));
        const label = el.parentElement.querySelector('span');
        if (label) label.textContent = `Virágméret: ${Number(val).toFixed(2)}×`;
        invalidateImage();
        persist();
        return;
      }
      case 'selscale': {
        scene.scaleSelected(Number(val));
        selection = { ...selection, scale: Number(val) };
        const label = el.parentElement.querySelector('span');
        if (label) label.textContent = `Méret: ${Number(val).toFixed(2)}×`;
        invalidateImage();
        return;
      }
      case 'attach': {
        state.attached = el.checked;
        el.closest('.check').dataset.checked = String(el.checked);
        persist();
        return renderPanel();
      }
      default: return undefined;
    }
  };

  root.addEventListener('click', onClick);
  root.addEventListener('input', onInput);

  /* nyitóállapot */
  await document.fonts.ready.catch(() => {});
  scene.setBrush(brush);
  scene.setPipe(pipe);
  scene.setTool('orbit');
  apply();
  /* A festés, a nyomott krém és a dekor a jelenetben él — visszatöltjük, hogy a
     szerkesztőbe visszalépve is a legfrissebb terv jelenjen meg. */
  scene.setArtState(state.byProduct?.[config.slug]?.art ?? null, product());
  renderSubbar();
  snap();

  /* a React oldal ezzel szereli le a tervezőt útvonalváltáskor */
  return () => {
    root.removeEventListener('click', onClick);
    root.removeEventListener('input', onInput);
    try { scene.dispose(); } catch { /* már eldobva */ }
  };

}
