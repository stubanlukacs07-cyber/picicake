/* ==================================================================
   PiciCake — 3D desszertjelenet (three.js)
   Valós idejű jelenet: kézműves krémanyag, lágy meleg fény, kézzel
   elhelyezhető dekor, folytonos ecsetvonás és szabad krémnyomás.
   Egy egység = 1 cm. A desszert a világ origójában áll, nincs
   transzformálva, így a világ- és a lokális koordináta megegyezik.
   ================================================================== */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DECOR } from './catalog.js';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (seedRef) => {
  seedRef.s = (seedRef.s * 1664525 + 1013904223) % 4294967296;
  return seedRef.s / 4294967296;
};

/* ------------------------------------------------------------------ */
/* Eljárásos textúrák                                                  */
/* ------------------------------------------------------------------ */

/** Apró egyenetlenség a krémen — ettől nem plasztik hatású. */
function creamNormalMap(size = 256) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(size, size);
  const seed = { s: 9871 };
  const grid = 26;
  const field = new Float32Array((grid + 1) * (grid + 1));
  for (let i = 0; i < field.length; i += 1) field[i] = rnd(seed);
  const sample = (x, y) => {
    const gx = (x / size) * grid;
    const gy = (y / size) * grid;
    const x0 = Math.floor(gx) % grid;
    const y0 = Math.floor(gy) % grid;
    const fx = gx - Math.floor(gx);
    const fy = gy - Math.floor(gy);
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const at = (a, b) => field[(b % grid) * (grid + 1) + (a % grid)];
    return lerp(lerp(at(x0, y0), at(x0 + 1, y0), sx), lerp(at(x0, y0 + 1), at(x0 + 1, y0 + 1), sx), sy);
  };
  const h = new Float32Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      h[y * size + x] = sample(x, y) * 0.68 + sample(x * 3.1, y * 3.1) * 0.22 + sample(x * 7.3, y * 7.3) * 0.1;
    }
  }
  const str = 2.2;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const l = h[y * size + ((x - 1 + size) % size)];
      const r = h[y * size + ((x + 1) % size)];
      const u = h[((y - 1 + size) % size) * size + x];
      const d = h[((y + 1) % size) * size + x];
      const n = new THREE.Vector3((l - r) * str, (u - d) * str, 1).normalize();
      const i = (y * size + x) * 4;
      img.data[i] = (n.x * 0.5 + 0.5) * 255;
      img.data[i + 1] = (n.y * 0.5 + 0.5) * 255;
      img.data[i + 2] = (n.z * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 5);
  return tex;
}

/** Lágy stúdióhangulat: meleg felülvilágítás, halvány hideg kitöltés. */
function studioEnvironment(renderer) {
  const cv = document.createElement('canvas');
  cv.width = 512;
  cv.height = 256;
  const ctx = cv.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#fff8f2');
  g.addColorStop(0.42, '#f7e7e1');
  g.addColorStop(0.62, '#efdcd8');
  g.addColorStop(1, '#d9c6c1');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);
  const soft = ctx.createRadialGradient(150, 48, 4, 150, 48, 130);
  soft.addColorStop(0, 'rgba(255,255,255,1)');
  soft.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = soft;
  ctx.fillRect(0, 0, 512, 256);
  const cool = ctx.createRadialGradient(390, 96, 4, 390, 96, 120);
  cool.addColorStop(0, 'rgba(214,230,255,.85)');
  cool.addColorStop(1, 'rgba(214,230,255,0)');
  ctx.fillStyle = cool;
  ctx.fillRect(0, 0, 512, 256);

  const tex = new THREE.CanvasTexture(cv);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(tex).texture;
  pmrem.dispose();
  tex.dispose();
  return env;
}

/** Kockás (gingham) süteménypapír — a bento boxok belülre ezt kapják. */
function ginghamTexture(hex = '#e28ba6', cells = 9, size = 256) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#fffdfc';
  ctx.fillRect(0, 0, size, size);
  const step = size / cells;
  ctx.fillStyle = hex;
  ctx.globalAlpha = 0.45;
  for (let i = 0; i < cells; i += 2) {
    ctx.fillRect(i * step, 0, step, size);
    ctx.fillRect(0, i * step, size, step);
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function dotSprite() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,246,228,.85)');
  g.addColorStop(1, 'rgba(255,240,210,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(cv);
}

/* ------------------------------------------------------------------ */
/* Kontúrok — a dekor és a geometria ugyanezt használja                */
/* ------------------------------------------------------------------ */

function contourPoints(shape, dia, seg = 128) {
  const pts = [];
  const r = dia / 2;
  if (shape === 'sziv') {
    for (let i = 0; i < seg; i += 1) {
      const t = (i / seg) * TAU;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      pts.push(new THREE.Vector2(x, -y));
    }
  } else if (shape === 'negyzet') {
    const k = 1;
    const cr = 0.17;
    const arc = (cx, cy, a0, a1) => {
      for (let i = 0; i <= 8; i += 1) {
        const a = lerp(a0, a1, i / 8);
        pts.push(new THREE.Vector2(cx + Math.cos(a) * cr, cy + Math.sin(a) * cr));
      }
    };
    arc(k - cr, k - cr, 0, Math.PI / 2);
    arc(-k + cr, k - cr, Math.PI / 2, Math.PI);
    arc(-k + cr, -k + cr, Math.PI, Math.PI * 1.5);
    arc(k - cr, -k + cr, Math.PI * 1.5, TAU);
  } else {
    for (let i = 0; i < seg; i += 1) {
      const a = (i / seg) * TAU;
      pts.push(new THREE.Vector2(Math.cos(a), Math.sin(a)));
    }
  }
  if (shape === 'sziv') {
    // a nyaki bevágás és a csúcs lágyítása: így a kontúr befelé húzva sem törik
    for (let pass = 0; pass < 3; pass += 1) {
      const src = pts.map((p) => p.clone());
      for (let i = 0; i < src.length; i += 1) {
        const a = src[(i - 1 + src.length) % src.length];
        const b = src[(i + 1) % src.length];
        pts[i].set((a.x + src[i].x * 2 + b.x) / 4, (a.y + src[i].y * 2 + b.y) / 4);
      }
    }
  }
  // középre igazítás és méretezés a kért átmérőre
  const box = new THREE.Box2().setFromPoints(pts);
  const c = box.getCenter(new THREE.Vector2());
  const span = Math.max(box.max.x - box.min.x, box.max.y - box.min.y);
  const k = (r * 2) / span;
  return pts.map((p) => new THREE.Vector2((p.x - c.x) * k, (p.y - c.y) * k));
}

/** Egyenkozu KULSO perem tavolsag-mezo alapjan: minden szoghoz a sulypontbol
 *  kifele binarisan megkeressuk azt a pontot, ahol a konturtol mert tavolsag
 *  pontosan d. Igy a perem soha nem metszi magat (ellentetben a normalis menti
 *  eltolassal, ami a sziv nyaki bevagasanal visszahajlott), es mindenhol
 *  egyenletes — a korabbi, origobol skalazott valtozat a sziv csucsanal
 *  aranytalanul kilogott, mint egy ful. */
/** Pont a zart konturon belul van-e (vilag XZ). */
function insideContour(pts, x, z) {
  let hit = false;
  let j = pts.length - 1;
  for (let i = 0; i < pts.length; i += 1) {
    const a = pts[i];
    const b = pts[j];
    if ((a.y > z) !== (b.y > z) && x < ((b.x - a.x) * (z - a.y)) / (b.y - a.y) + a.x) hit = !hit;
    j = i;
  }
  return hit;
}

function offsetContour(pts, d, samples = 96) {
  const distToPoly = (x, y) => {
    let best = Infinity;
    for (let i = 0; i < pts.length; i += 1) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len2 = dx * dx + dy * dy || 1;
      const k = Math.min(1, Math.max(0, ((x - a.x) * dx + (y - a.y) * dy) / len2));
      best = Math.min(best, Math.hypot(x - (a.x + dx * k), y - (a.y + dy * k)));
    }
    return best;
  };
  const isInside = (x, y) => {
    let hit = false;
    let j = pts.length - 1;
    for (let i = 0; i < pts.length; i += 1) {
      const a = pts[i];
      const b = pts[j];
      if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) hit = !hit;
      j = i;
    }
    return hit;
  };
  // terulet szerinti sulypont: a sziv is csillagszeru ra nezve
  let area = 0;
  let gx = 0;
  let gy = 0;
  for (let i = 0; i < pts.length; i += 1) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const cr = a.x * b.y - b.x * a.y;
    area += cr;
    gx += (a.x + b.x) * cr;
    gy += (a.y + b.y) * cr;
  }
  area /= 2;
  if (!area) return pts.map((p) => new THREE.Vector2(p.x, p.y));
  gx /= 6 * area;
  gy /= 6 * area;

  const maxR = Math.max(...pts.map((p) => Math.hypot(p.x - gx, p.y - gy))) + 4 * d;
  const out = [];
  for (let i = 0; i < samples; i += 1) {
    const th = (i / samples) * TAU;
    const ux = Math.cos(th);
    const uy = Math.sin(th);
    let lo = 0;
    let hi = maxR;
    for (let it = 0; it < 34; it += 1) {
      const mid = (lo + hi) / 2;
      const px = gx + ux * mid;
      const py = gy + uy * mid;
      const sd = isInside(px, py) ? -distToPoly(px, py) : distToPoly(px, py);
      if (sd < d) lo = mid;
      else hi = mid;
    }
    const rr = (lo + hi) / 2;
    out.push(new THREE.Vector2(gx + ux * rr, gy + uy * rr));
  }
  return out;
}

const insetContour = (pts, d) => {
  // az irányítás (signed area) adja meg, melyik oldal van kívül
  let area = 0;
  for (let i = 0; i < pts.length; i += 1) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    area += a.x * b.y - b.x * a.y;
  }
  const ccw = area > 0;
  const out = [];
  const n = pts.length;
  for (let i = 0; i < n; i += 1) {
    const prev = pts[(i - 1 + n) % n];
    const next = pts[(i + 1) % n];
    const t = new THREE.Vector2().subVectors(next, prev).normalize();
    const nor = ccw ? new THREE.Vector2(-t.y, t.x) : new THREE.Vector2(t.y, -t.x);
    out.push(new THREE.Vector2(pts[i].x + nor.x * d, pts[i].y + nor.y * d));
  }
  return out;
};

/** A kontúrpontok VILÁG XZ koordináták (x, z). Az ExtrudeGeometry a shape
 *  Y tengelyét a világ -Z-jére képezi (rotateX(-90°)), ezért itt negatívba
 *  fordítjuk: így a test sziluettje pontosan a kontúrral egyezik. */
/** Lekerekített sarokú négyzet világ XZ pontokként. */
function roundedSquare(half, radius, per = 6) {
  const pts = [];
  const r = Math.min(radius, half * 0.9);
  const k = half - r;
  const arc = (cx, cz, a0) => {
    for (let i = 0; i <= per; i += 1) {
      const a = a0 + (Math.PI / 2) * (i / per);
      pts.push(new THREE.Vector2(cx + Math.cos(a) * r, cz + Math.sin(a) * r));
    }
  };
  arc(k, k, 0);
  arc(-k, k, Math.PI / 2);
  arc(-k, -k, Math.PI);
  arc(k, -k, Math.PI * 1.5);
  return pts;
}

function shapeFromPoints(pts) {
  const s = new THREE.Shape();
  s.moveTo(pts[0].x, -pts[0].y);
  for (let i = 1; i < pts.length; i += 1) s.lineTo(pts[i].x, -pts[i].y);
  s.closePath();
  return s;
}

/** A kontúr menti oldalfal simítása: az ExtrudeGeometry lapos normálisai
 *  különben látható függőleges csíkozást adnak a krémes felszínen. */
function smoothSideNormals(geometry, pts) {
  let area = 0;
  for (let i = 0; i < pts.length; i += 1) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    area += a.x * b.y - b.x * a.y;
  }
  const ccw = area > 0;
  const cn = pts.map((p, i) => {
    const a = pts[(i - 1 + pts.length) % pts.length];
    const b = pts[(i + 1) % pts.length];
    const t = new THREE.Vector2(b.x - a.x, b.y - a.y).normalize();
    return ccw ? new THREE.Vector2(t.y, -t.x) : new THREE.Vector2(-t.y, t.x);
  });
  const pos = geometry.attributes.position;
  const nor = geometry.attributes.normal;
  for (let i = 0; i < pos.count; i += 1) {
    const h = Math.hypot(nor.getX(i), nor.getZ(i));
    if (h < 0.1) continue;
    const x = pos.getX(i);
    const z = pos.getZ(i);
    let best = 0;
    let bd = Infinity;
    for (let j = 0; j < pts.length; j += 1) {
      const d = (pts[j].x - x) ** 2 + (pts[j].y - z) ** 2;
      if (d < bd) { bd = d; best = j; }
    }
    nor.setXYZ(i, cn[best].x * h, nor.getY(i), cn[best].y * h);
  }
  nor.needsUpdate = true;
}

const inside = (pts, x, z) => {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if ((a.y > z) !== (b.y > z) && x < ((b.x - a.x) * (z - a.y)) / (b.y - a.y) + a.x) hit = !hit;
  }
  return hit;
};

/** A kontúron belülre húz egy pontot — a dekor nem lóghat le. */
function pullInside(pts, x, z, margin) {
  let px = x;
  let pz = z;
  for (let step = 0; step < 24; step += 1) {
    let nearest = Infinity;
    for (const p of pts) nearest = Math.min(nearest, Math.hypot(p.x - px, p.y - pz));
    if (inside(pts, px, pz) && nearest >= margin) break;
    const len = Math.hypot(px, pz) || 1;
    px -= (px / len) * margin * 0.3;
    pz -= (pz / len) * margin * 0.3;
  }
  return [px, pz];
}

/* ------------------------------------------------------------------ */
/* Dekor geometriák (egyszer épülnek, példányosítva használjuk)        */
/* ------------------------------------------------------------------ */

function swirlGeometry(radius = 0.42, turns = 2.1, height = 0.62) {
  const pts = [];
  const n = 42;
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const a = t * TAU * turns;
    const r = radius * (1 - t * 0.82);
    pts.push(new THREE.Vector3(Math.cos(a) * r, height * t, Math.sin(a) * r));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 54, radius * 0.4, 7, false);
}

function dropGeometry(r = 0.4) {
  const g = new THREE.SphereGeometry(r, 16, 13);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i += 1) {
    const y = p.getY(i);
    if (y > 0) {
      const k = clamp(y / r, 0, 1);
      p.setX(i, p.getX(i) * (1 - k * 0.74));
      p.setZ(i, p.getZ(i) * (1 - k * 0.74));
      p.setY(i, y * 1.9);
    }
  }
  g.computeVertexNormals();
  return g;
}

/** Csillagcsúcs: bordázott, felfelé keskenyedő krémcsepp. */
function starTipGeometry(r = 0.44, flutes = 6) {
  const g = new THREE.CylinderGeometry(r * 0.16, r, 1, flutes * 4, 8, false);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i += 1) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const y = p.getY(i) + 0.5;
    const a = Math.atan2(z, x);
    const rr = Math.hypot(x, z);
    const rib = 1 + Math.cos(a * flutes) * 0.22 * (1 - y * 0.4);
    p.setX(i, Math.cos(a) * rr * rib);
    p.setZ(i, Math.sin(a) * rr * rib);
    p.setY(i, y * 1.05);
  }
  g.computeVertexNormals();
  return g;
}

/** Sima gyöngy: kicsit lapított félgömb, ahogy a habzsák lerakja. */
function pearlGeometry(r = 0.44) {
  const g = new THREE.SphereGeometry(r, 18, 14);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i += 1) {
    p.setY(i, p.getY(i) * 0.82 + r * 0.5);
  }
  g.computeVertexNormals();
  return g;
}

/* ------------------------------------------------------------------ */
/* Fő jelenet                                                          */
/* ------------------------------------------------------------------ */

export function createCakeScene(mount, opts = {}) {
  const onChange = opts.onChange ?? (() => {});
  const onSelect = opts.onSelect ?? (() => {});

  /* --- renderer ---------------------------------------------------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 1.6), 2.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.touchAction = 'none';
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const bg = new THREE.Color('#fbf1ee');
  scene.background = bg;
  scene.environment = studioEnvironment(renderer);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 400);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.minPolarAngle = 0.32;
  controls.maxPolarAngle = 1.46;
  controls.rotateSpeed = 0.85;
  renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

  /* --- fények ------------------------------------------------------ */
  const key = new THREE.DirectionalLight('#fff2e2', 1.55);
  key.position.set(-26, 34, 20);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.05;
  key.shadow.radius = 4.5;
  key.shadow.blurSamples = 10;
  scene.add(key);

  const fill = new THREE.DirectionalLight('#dfeaff', 0.32);
  fill.position.set(24, 14, 16);
  scene.add(fill);

  const rim = new THREE.DirectionalLight('#fff6ec', 0.42);
  rim.position.set(6, 16, -26);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight('#fff6ef', '#e3cfc9', 0.3));

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({
    color: '#6b4b45', opacity: 0.19, transparent: true,
  }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  /* --- anyagok ----------------------------------------------------- */
  const creamNormal = creamNormalMap();
  const mats = {
    cream: new THREE.MeshPhysicalMaterial({
      color: '#f2d3d0', roughness: 0.62, clearcoat: 0.12, clearcoatRoughness: 0.62,
      sheen: 0.22, sheenRoughness: 0.9, sheenColor: new THREE.Color('#fff4ef'),
      envMapIntensity: 0.55,
    }),
    pipe: new THREE.MeshPhysicalMaterial({
      color: '#ffffff', roughness: 0.5, clearcoat: 0.2, clearcoatRoughness: 0.5,
      sheen: 0.6, sheenRoughness: 0.8, normalMap: creamNormal,
      normalScale: new THREE.Vector2(0.22, 0.22), envMapIntensity: 0.9,
    }),
    gold: new THREE.MeshPhysicalMaterial({ color: '#c9a34a', metalness: 0.92, roughness: 0.34, envMapIntensity: 1.25 }),
    // feher papirpohar: magas alap-vilagossag, hogy ne szurkuljon el az arnyekban
    paper: new THREE.MeshPhysicalMaterial({
      color: '#ffffff', roughness: 0.72, sheen: 0.45, sheenRoughness: 0.6,
      sheenColor: new THREE.Color('#ffffff'), envMapIntensity: 0.95,
    }),
    pulp: new THREE.MeshPhysicalMaterial({ color: '#f4eee6', roughness: 0.95, sheen: 0.14, envMapIntensity: 0.32 }),
    wood: new THREE.MeshPhysicalMaterial({ color: '#cfa871', roughness: 0.62, sheen: 0.3, envMapIntensity: 0.55 }),
    woodDark: new THREE.MeshPhysicalMaterial({ color: '#b98f57', roughness: 0.7, envMapIntensity: 0.45 }),
    sponge: new THREE.MeshPhysicalMaterial({ color: '#f0dcb4', roughness: 0.92, envMapIntensity: 0.4 }),
    brownie: new THREE.MeshPhysicalMaterial({ color: '#4a2a1f', roughness: 0.74, clearcoat: 0.12, envMapIntensity: 0.6, normalMap: creamNormal, normalScale: new THREE.Vector2(0.5, 0.5) }),
    fruit: (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.2, clearcoat: 0.9, clearcoatRoughness: 0.1, envMapIntensity: 1.1 }),
    // szaten masni: a korabbi majdnem-fekete tonus miatt latszott rovarszeru
    // sotet formanak; a muhely szalagjai vilagos, marka-tonusu szatenek
    satin: new THREE.MeshPhysicalMaterial({
      color: '#d7a7a2', roughness: 0.34, sheen: 1, sheenRoughness: 0.22,
      sheenColor: new THREE.Color('#fff4f1'), clearcoat: 0.35, clearcoatRoughness: 0.35,
      envMapIntensity: 1.05,
    }),
    wax: new THREE.MeshPhysicalMaterial({ color: '#fdfaf5', roughness: 0.52, sheen: 0.4, envMapIntensity: 0.7 }),
    leaf: new THREE.MeshPhysicalMaterial({ color: '#5c7a4a', roughness: 0.55, envMapIntensity: 0.7 }),
  };

  /* --- csoportok --------------------------------------------------- */
  const root = new THREE.Group();
  scene.add(root);
  const bodyGroup = new THREE.Group();
  const artGroup = new THREE.Group();
  const decorGroup = new THREE.Group();
  const pipeGroup = new THREE.Group();
  const patternGroup = new THREE.Group();
  const borderGroup = new THREE.Group();
  root.add(bodyGroup, artGroup, decorGroup, pipeGroup, patternGroup, borderGroup);

  /* --- festőréteg -------------------------------------------------- */
  const paintCv = document.createElement('canvas');
  paintCv.width = paintCv.height = 1024;
  const paintCtx = paintCv.getContext('2d');
  const paintTex = new THREE.CanvasTexture(paintCv);
  paintTex.colorSpace = THREE.SRGBColorSpace;
  paintTex.anisotropy = 4;

  // az oldalfal sajat vaszna: u = kontur ivhossza, v = magassag
  const sideCv = document.createElement('canvas');
  sideCv.width = 2048;
  sideCv.height = 512;
  const sideCtx = sideCv.getContext('2d');
  const sideTex = new THREE.CanvasTexture(sideCv);
  sideTex.colorSpace = THREE.SRGBColorSpace;
  sideTex.anisotropy = 4;
  sideTex.wrapS = THREE.RepeatWrapping;

  /* --- felirat ----------------------------------------------------- */
  const textCv = document.createElement('canvas');
  const textCtx = textCv.getContext('2d');
  const textTex = new THREE.CanvasTexture(textCv);
  textTex.colorSpace = THREE.SRGBColorSpace;
  textTex.anisotropy = 4;
  // A felirat betűnként áll: minden betű saját mesh, ezért lehet egyenként
  // mozgatni, forgatni, skálázni és színezni.
  const letterGroup = new THREE.Group();
  artGroup.add(letterGroup);
  let letterItems = [];

  /* --- kijelölés gyűrű --------------------------------------------- */
  const gizmo = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.055, 8, 56),
    new THREE.MeshBasicMaterial({ color: '#b68e88', transparent: true, opacity: 0.95 }),
  );
  gizmo.rotation.x = -Math.PI / 2;
  gizmo.visible = false;
  gizmo.renderOrder = 8;
  scene.add(gizmo);

  const gizmoHandle = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 14, 12),
    new THREE.MeshBasicMaterial({ color: '#8d5f58' }),
  );
  gizmoHandle.visible = false;
  gizmoHandle.renderOrder = 9;
  scene.add(gizmoHandle);

  /* --- csillám ----------------------------------------------------- */
  const sparkTex = dotSprite();
  let sparkles = null;

  /* ================================================================ */
  /* Állapot                                                           */
  /* ================================================================ */

  let config = null;
  let patternItems = [];
  let patternSetItem = null;
  let geo = { pts: [], topY: 0, dia: 16, height: 9, boardR: 0, frame: 16, kind: 'cake' };
  let items = [];           // kézzel elhelyezhető dekor
  let strokes = [];         // nyomott krém
  let tool = 'orbit';
  let brush = { color: '#b0413e', size: 26, erase: false };
  let pipe = { color: '#ffffff', size: 0.42, tip: 'rozetta' };
  let selected = null;
  let dirty = true;
  let sig = { body: '', border: '', decor: '' , pattern: '' };

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const dragPlane = new THREE.Plane();
  const tmp = new THREE.Vector3();

  const mark = () => { dirty = true; schedule(); };

  /* ================================================================ */
  /* Geometria építés                                                  */
  /* ================================================================ */

  function disposeGroup(g) {
    for (const child of [...g.children]) {
      g.remove(child);
      child.traverse?.((o) => {
        if (o.geometry) o.geometry.dispose();
      });
    }
  }

  function jitter(geometry, amount, seedStart = 4242) {
    const p = geometry.attributes.position;
    const seed = { s: seedStart };
    for (let i = 0; i < p.count; i += 1) {
      const n = (rnd(seed) - 0.5) * amount;
      p.setXYZ(i, p.getX(i) + n, p.getY(i) + n * 0.6, p.getZ(i) + n);
    }
    geometry.computeVertexNormals();
    return geometry;
  }

  function extrudeBody(pts, height, bevel) {
    // A befele tolashoz is a tavolsag-mezos peremet hasznaljuk: a normalis
    // menti insetContour a sziv hegyes csucsat aranytalanul visszahuzta,
    // ezert ott kilatszott az arany talca egy hosszu tuskekent.
    const g = new THREE.ExtrudeGeometry(shapeFromPoints(offsetContour(pts, -bevel, 128)), {
      depth: height - bevel * 2,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: bevel,
      bevelThickness: bevel,
      curveSegments: 6,
      steps: 1,
    });
    g.rotateX(-Math.PI / 2);
    g.translate(0, bevel, 0);
    return g;
  }

  function planarUv(geometry, pts) {
    const box = new THREE.Box2().setFromPoints(pts);
    const w = box.max.x - box.min.x;
    const h = box.max.y - box.min.y;
    const pos = geometry.attributes.position;
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i += 1) {
      uv[i * 2] = (pos.getX(i) - box.min.x) / w;
      uv[i * 2 + 1] = 1 - (pos.getZ(i) - box.min.y) / h;
    }
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    return { box, w, h };
  }

  let paintPlate = null;
  let paintUv = null;

  function addPaintPlate(pts, y) {
    const g = new THREE.ShapeGeometry(shapeFromPoints(insetContour(pts, 0.22)), 8);
    g.rotateX(-Math.PI / 2);
    paintUv = planarUv(g, pts);
    g.translate(0, y, 0);
    paintPlate = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({
      map: paintTex, transparent: true, roughness: 0.5, clearcoat: 0.25,
      clearcoatRoughness: 0.5, depthWrite: false, envMapIntensity: 0.7,
    }));
    paintPlate.renderOrder = 3;
    bodyGroup.add(paintPlate);
  }

  let paintSleeve = null;

  /** Festőhüvely a desszert OLDALÁRA: a kontúr mentén futó, vékony szalag,
   *  amin u = ívhossz, v = magasság — így az ecset az oldalra is ráír. */
  /** A megepitett test tenyleges vizszintes kiterjedesehez skalazza a
   *  konturt. Az ExtrudeGeometry bevelje nem a nevleges konturt adja vissza,
   *  ezert minden ra epulo elem (festo huvely, szegely, dekor) elcsuszott. */
  function fitContourToMesh(pts, mesh) {
    mesh.geometry.computeBoundingBox();
    const bb = mesh.geometry.boundingBox;
    const meshW = Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z);
    const xs = pts.map((p) => p.x);
    const zs = pts.map((p) => p.y);
    const ptsW = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs));
    if (!ptsW || !meshW) return pts;
    const k = meshW / ptsW;
    if (Math.abs(k - 1) < 0.005) return pts;
    return pts.map((p) => new THREE.Vector2(p.x * k, p.y * k));
  }

  function addPaintSleeve(pts, baseY, height) {
    const n = pts.length;
    const ring = insetContour(pts, -0.035);
    const lens = [];
    let perim = 0;
    for (let i = 0; i < n; i += 1) {
      const a = ring[i];
      const b = ring[(i + 1) % n];
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      lens.push(perim);
      perim += d;
    }
    const position = [];
    const uv = [];
    const index = [];
    for (let i = 0; i <= n; i += 1) {
      const p = ring[i % n];
      const u = (i === n ? perim : lens[i]) / perim;
      position.push(p.x, baseY, p.y, p.x, baseY + height, p.y);
      uv.push(u, 0, u, 1);
    }
    for (let i = 0; i < n; i += 1) {
      const a = i * 2;
      index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(index);
    g.computeVertexNormals();
    paintSleeve = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({
      map: sideTex, transparent: true, roughness: 0.5, clearcoat: 0.25,
      clearcoatRoughness: 0.5, depthWrite: false, envMapIntensity: 0.7,
      side: THREE.DoubleSide,
    }));
    paintSleeve.renderOrder = 3;
    bodyGroup.add(paintSleeve);
  }

  function goldBoard(pts, dia) {
    const scaled = offsetContour(pts, Math.max(0.55, dia * 0.042));
    const g = new THREE.ExtrudeGeometry(shapeFromPoints(scaled), {
      depth: 0.22, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.1, bevelThickness: 0.08, steps: 1,
    });
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0.3, 0);
    const board = new THREE.Mesh(g, mats.gold);
    board.castShadow = true;
    board.receiveShadow = true;
    bodyGroup.add(board);
    return 0.52;
  }

  /** Fehér, molded pulp bento box kockás papírral — ez adja a koreai
   *  bento torta felismerhető képét, és a léptéket is ő hordozza. */
  /** A doboz a torta TENYLEGES fel-szelessegebol epul, nem a nevleges
   *  atmerobol: az ExtrudeGeometry bevelje miatt a ketto elter, es a torta
   *  korul indokolatlanul nagy res maradt. Elesben a bento torta szorosan
   *  ul a dobozban. */
  function bentoBox(cakeHalf, cakeH) {
    const gap = 0.5;
    const half = cakeHalf + gap + 0.55;
    const wall = clamp(cakeH * 0.46, 1.6, 3.2);
    const floorH = 0.36;
    const outer = roundedSquare(half, half * 0.26);
    const innerPts = roundedSquare(cakeHalf + gap, half * 0.22);

    const floorG = new THREE.ExtrudeGeometry(shapeFromPoints(outer), {
      depth: floorH, bevelEnabled: false, curveSegments: 5,
    });
    floorG.rotateX(-Math.PI / 2);
    const floor = new THREE.Mesh(floorG, mats.pulp);
    floor.castShadow = true;
    floor.receiveShadow = true;
    bodyGroup.add(floor);

    const wallShape = shapeFromPoints(outer);
    // a lyuk fordított körüljárású, különben a háromszögelés üvegszerű falat ad
    const holePts = [...innerPts].reverse();
    const hole = new THREE.Path();
    hole.moveTo(holePts[0].x, -holePts[0].y);
    for (let i = 1; i < holePts.length; i += 1) hole.lineTo(holePts[i].x, -holePts[i].y);
    hole.closePath();
    wallShape.holes.push(hole);
    const wallG = new THREE.ExtrudeGeometry(wallShape, { depth: wall, bevelEnabled: false, curveSegments: 5 });
    wallG.rotateX(-Math.PI / 2);
    wallG.translate(0, floorH, 0);
    const walls = new THREE.Mesh(wallG, mats.pulp);
    walls.castShadow = true;
    walls.receiveShadow = true;
    bodyGroup.add(walls);

    const linerPts = roundedSquare(cakeHalf + gap - 0.06, half * 0.2);
    const linerG = new THREE.ShapeGeometry(shapeFromPoints(linerPts), 5);
    linerG.rotateX(-Math.PI / 2);
    planarUv(linerG, linerPts);
    linerG.translate(0, floorH + 0.02, 0);
    const liner = new THREE.Mesh(linerG, new THREE.MeshPhysicalMaterial({
      map: ginghamTexture(), roughness: 0.86, sheen: 0.2, envMapIntensity: 0.4,
    }));
    liner.receiveShadow = true;
    bodyGroup.add(liner);

    return { baseY: floorH + 0.03, outerR: half * 1.18, rimY: floorH + wall, innerHalf: cakeHalf + gap };
  }

  function buildCake(product, size, shape, bento) {
    const pts = contourPoints(shape, size.dia);
    const bevel = Math.min(0.3, size.dia * 0.02, size.height * 0.075);
    // Eloszor a TEST epul meg, hogy tudjuk a tenyleges szelesseget — a doboz
    // es az arany talca ehhez igazodik, nem a nevleges atmerohoz.
    const body = new THREE.Mesh(extrudeBody(pts, size.height, bevel), mats.cream);
    smoothSideNormals(body.geometry, pts);
    body.castShadow = true;
    body.receiveShadow = true;
    bodyGroup.add(body);
    const fit = fitContourToMesh(pts, body);
    const cakeHalf = Math.max(...fit.map((p) => Math.max(Math.abs(p.x), Math.abs(p.y))));
    const box = bento ? bentoBox(cakeHalf, size.height) : null;
    const baseY = box ? box.baseY : goldBoard(fit, cakeHalf * 2);
    body.position.y = baseY;
    addPaintPlate(fit, baseY + size.height + 0.03);
    addPaintSleeve(fit, baseY + 0.04, size.height - 0.1);
    const reach = box ? box.outerR : size.dia * 0.6;
    return {
      pts: fit, topY: baseY + size.height, dia: size.dia, height: size.height,
      rimY: box?.rimY, sideRoom: box ? box.innerHalf - cakeHalf : Infinity,
      boardR: reach, frame: Math.max(reach * 1.06, size.dia * 1.08, (baseY + size.height) * 1.35),
      kind: 'cake', polar: bento ? 0.98 : 0.95,
    };
  }

  function buildBrownie(product, size, shape, base) {
    const pts = contourPoints(shape, size.dia);
    const baseY = goldBoard(pts, size.dia);
    const colors = { 'Alap (brownie)': '#4a2a1f', 'Málnás': '#5b2a2c', 'Fehércsokis (blondie)': '#c69a62' };
    const mat = mats.brownie.clone();
    mat.color = new THREE.Color(colors[base] ?? '#4a2a1f');
    const body = new THREE.Mesh(extrudeBody(pts, size.height, 0.26), mat);
    if (shape !== 'negyzet') smoothSideNormals(body.geometry, pts);
    body.castShadow = true;
    body.receiveShadow = true;
    body.position.y = baseY;
    bodyGroup.add(body);
    const fit = fitContourToMesh(pts, body);
    addPaintPlate(fit, baseY + size.height + 0.03);
    addPaintSleeve(fit, baseY + 0.04, size.height - 0.08);
    return { pts: fit, topY: baseY + size.height, dia: size.dia, height: size.height, boardR: size.dia * 0.6, frame: Math.max(size.dia * 1.05, 11), kind: 'brownie', polar: 0.92 };
  }

  /** Fehér papírpohár, benne teljesen sima, lapos krémfelszín. */
  function buildCup(product, size, frosting) {
    const rTop = size.dia / 2;
    const rBot = rTop * 0.76;
    const h = size.height;
    const profile = [];
    profile.push(new THREE.Vector2(0.001, 0));
    profile.push(new THREE.Vector2(rBot * 0.94, 0));
    profile.push(new THREE.Vector2(rBot, 0.12));
    for (let i = 0; i <= 10; i += 1) {
      const t = i / 10;
      profile.push(new THREE.Vector2(lerp(rBot, rTop, t), lerp(0.12, h - 0.34, t)));
    }
    profile.push(new THREE.Vector2(rTop + 0.16, h - 0.1));
    profile.push(new THREE.Vector2(rTop + 0.1, h + 0.05));
    profile.push(new THREE.Vector2(rTop - 0.08, h - 0.05));
    profile.push(new THREE.Vector2(rTop - 0.12, h - 0.55));
    const cup = new THREE.Mesh(new THREE.LatheGeometry(profile, 72), mats.paper);
    cup.castShadow = true;
    cup.receiveShadow = true;
    bodyGroup.add(cup);

    const creamY = h - 0.62;
    const cream = mats.cream.clone();
    cream.color = new THREE.Color(frosting);
    const surface = new THREE.Mesh(new THREE.CircleGeometry(rTop - 0.13, 72), cream);
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = creamY;
    surface.receiveShadow = true;
    bodyGroup.add(surface);
    // pár milliméteres krémfal a felszín alatt, hogy ne lássunk át
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(rTop - 0.13, rTop - 0.4, 1.6, 72, 1, true), cream);
    wall.position.y = creamY - 0.8;
    bodyGroup.add(wall);

    const pts = contourPoints('kerek', (rTop - 0.4) * 2);
    return { pts, topY: creamY, dia: size.dia, height: h, boardR: rTop * 1.2, frame: Math.max(size.dia * 1.6, h * 1.35), kind: 'cup', polar: 0.9 };
  }

  /** Bento szelet: teljes arany tálca, végig krémmel borított szelet. */
  function buildSlice(product, size, frosting) {
    const R = size.dia / 2;
    const ang = THREE.MathUtils.degToRad(52);
    const zOff = -R * 0.42;
    const wedge = (k, pad = 0) => {
      const out = [new THREE.Vector2(0, zOff - pad * 0.6)];
      for (let i = 0; i <= 26; i += 1) {
        const a = -ang / 2 + (ang * i) / 26;
        out.push(new THREE.Vector2(Math.sin(a) * (R * k + pad), Math.cos(a) * (R * k + pad) + zOff));
      }
      return out;
    };

    const cream = mats.cream.clone();
    cream.color = new THREE.Color(frosting);

    // arany tortatalca: nagy es kerek, mint egy rendes tortanal — csak a
    // szelet ul rajta
    const boardR = R * 0.96;
    const boardPts = contourPoints('kerek', boardR * 2);
    const boardG = new THREE.ExtrudeGeometry(shapeFromPoints(boardPts), {
      depth: 0.4, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.12, bevelThickness: 0.1, curveSegments: 8,
    });
    boardG.rotateX(-Math.PI / 2);
    boardG.translate(0, 0.12, 0);
    const board = new THREE.Mesh(boardG, mats.gold);
    board.castShadow = true;
    board.receiveShadow = true;
    bodyGroup.add(board);

    // finom fodros perem a tortapapiron
    const frill = new THREE.Mesh(
      new THREE.TorusGeometry(boardR - 0.16, 0.085, 7, 160),
      mats.gold,
    );
    frill.rotation.x = -Math.PI / 2;
    frill.position.y = 0.52;
    bodyGroup.add(frill);

    // a szelet: egy tag, végig krémmel borítva, lágyan lekerekített élekkel
    const bevel = 0.42;
    const bodyG = new THREE.ExtrudeGeometry(shapeFromPoints(wedge(1, -bevel)), {
      depth: size.height - bevel * 2, bevelEnabled: true, bevelSegments: 5,
      bevelSize: bevel, bevelThickness: bevel, curveSegments: 8,
    });
    bodyG.rotateX(-Math.PI / 2);
    bodyG.translate(0, 0.52 + bevel, 0);
    const body = new THREE.Mesh(bodyG, cream);
    body.castShadow = true;
    body.receiveShadow = true;
    bodyGroup.add(body);

    const topY = 0.52 + size.height;
    const fit = fitContourToMesh(wedge(1), body);
    addPaintPlate(fit, topY + 0.03);
    // a szelet oldalara is lehet ecsettel rajzolni
    addPaintSleeve(fit, 0.56, size.height - 0.12);
    return {
      pts: fit, topY, dia: R * 1.15, height: size.height, boardR: R * 0.96,
      frame: Math.max(R * 1.22, 10), kind: 'slice', polar: 0.95,
      borderBaseY: 0.52,
    };
  }

  /* ================================================================ */
  /* Nyomott krémminta a pohárra                                       */
  /* ================================================================ */

  const MOTIFS = {
    szivecskes: () => {
      const l = [];
      for (let i = 0; i <= 40; i += 1) {
        const t = (i / 40) * TAU;
        l.push([16 * Math.pow(Math.sin(t), 3) / 17, (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17]);
      }
      return [l];
    },
    viragos: () => {
      const out = [];
      for (let p = 0; p < 5; p += 1) {
        const a = (p / 5) * TAU;
        const cx = Math.cos(a) * 0.5;
        const cy = Math.sin(a) * 0.5;
        const loop = [];
        for (let i = 0; i <= 18; i += 1) {
          const t = (i / 18) * TAU;
          loop.push([cx + Math.cos(t) * 0.36, cy + Math.sin(t) * 0.28]);
        }
        out.push(loop);
      }
      const c = [];
      for (let i = 0; i <= 14; i += 1) {
        const t = (i / 14) * TAU;
        c.push([Math.cos(t) * 0.17, Math.sin(t) * 0.17]);
      }
      out.push(c);
      return out;
    },
    tappancsos: () => {
      const out = [];
      const pad = [];
      for (let i = 0; i <= 22; i += 1) {
        const t = (i / 22) * TAU;
        pad.push([Math.cos(t) * 0.46, Math.sin(t) * 0.38 - 0.22]);
      }
      out.push(pad);
      const toes = [[-0.42, 0.42], [-0.15, 0.6], [0.15, 0.6], [0.42, 0.42]];
      for (const [tx, ty] of toes) {
        const toe = [];
        for (let i = 0; i <= 14; i += 1) {
          const t = (i / 14) * TAU;
          toe.push([tx + Math.cos(t) * 0.18, ty + Math.sin(t) * 0.2]);
        }
        out.push(toe);
      }
      return out;
    },
    gombas: () => {
      const cap = [];
      for (let i = 0; i <= 22; i += 1) {
        const t = Math.PI * (i / 22);
        cap.push([Math.cos(t) * 0.62, Math.sin(t) * 0.5 + 0.06]);
      }
      cap.push([-0.62, 0.06]);
      const stem = [[-0.22, 0.04], [-0.2, -0.52], [0.2, -0.52], [0.22, 0.04]];
      const dots = [];
      for (let i = 0; i <= 12; i += 1) {
        const t = (i / 12) * TAU;
        dots.push([Math.cos(t) * 0.13 - 0.2, Math.sin(t) * 0.11 + 0.3]);
      }
      return [cap, stem, dots];
    },
    masnis: () => {
      const left = [[0, 0], [-0.62, 0.4], [-0.66, -0.34], [0, 0]];
      const right = [[0, 0], [0.62, 0.4], [0.66, -0.34], [0, 0]];
      const knot = [];
      for (let i = 0; i <= 14; i += 1) {
        const t = (i / 14) * TAU;
        knot.push([Math.cos(t) * 0.15, Math.sin(t) * 0.17]);
      }
      return [left, right, knot];
    },
    felhos: () => {
      const l = [];
      const bumps = [[-0.42, 0, 0.3], [-0.05, 0.12, 0.38], [0.36, -0.02, 0.28]];
      for (const [cx, cy, r] of bumps) {
        for (let i = 0; i <= 14; i += 1) {
          const t = Math.PI * (i / 14);
          l.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]);
        }
      }
      l.push([0.64, -0.02], [0.6, -0.26], [-0.6, -0.26], [-0.66, 0]);
      return [l];
    },
    csillagos: () => {
      const l = [];
      for (let i = 0; i <= 10; i += 1) {
        const a = (i / 10) * TAU - Math.PI / 2;
        const r = i % 2 === 0 ? 0.66 : 0.28;
        l.push([Math.cos(a) * r, Math.sin(a) * r]);
      }
      return [l];
    },
  };

  /** Minden nyomott minta önálló, kijelölhető elem: áthelyezhető, forgatható,
   *  átméretezhető és egyenként színezhető. */
  function motifMesh(item) {
    const build = MOTIFS[item.motif] ?? MOTIFS.szivecskes;
    const polys = build();
    const mat = mats.pipe.clone();
    mat.color = new THREE.Color(item.color);
    const g = new THREE.Group();
    for (const poly of polys) {
      if (poly.length < 3) continue;
      const v = poly.map(([x, z]) => new THREE.Vector3(x, 0, -z));
      const curve = new THREE.CatmullRomCurve3(v, false, 'catmullrom', 0.35);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, Math.max(26, poly.length * 2), 0.115 / item.scale, 7, false),
        mat,
      );
      g.add(tube);
    }
    // lathatatlan talalati felulet: a vekony kremvonalat kulonben szinte
    // lehetetlen eltalalni kattintassal
    const hit = new THREE.Mesh(
      new THREE.CircleGeometry(0.92, 20),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    hit.rotation.x = -Math.PI / 2;
    g.add(hit);
    return g;
  }

  function placeMotif(item) {
    if (!item.obj) return;
    item.obj.position.set(item.x, geo.topY + 0.1, item.z);
    item.obj.rotation.set(0, item.rot ?? 0, 0);
    item.obj.scale.setScalar(item.scale);
  }

  function storeMotif(item) {
    if (!config.patternItems) config.patternItems = [];
    config.patternItems = patternItems.map(({ obj, ...rest }) => rest);
  }

  /** Amig a vasarlo nem bontja szet, a mintak EGY egeszkent viselkednek:
   *  kattintasra az egesz keszlet jelolodik ki, es egyben mozog. */
  function rebuildPattern() {
    disposeGroup(patternGroup);
    if (!patternItems.length) return;
    if (!config.patternSplit) {
      const set = new THREE.Group();
      let maxR = 0.6;
      for (const item of patternItems) {
        const obj = motifMesh(item);
        obj.position.set(item.x, 0, item.z);
        obj.rotation.set(0, item.rot ?? 0, 0);
        obj.scale.setScalar(item.scale);
        set.add(obj);
        maxR = Math.max(maxR, Math.hypot(item.x, item.z) + item.scale * 0.9);
      }
      const setItem = {
        kind: 'patternset', x: 0, z: 0, rot: 0, scale: 1,
        color: patternItems[0].color, radius: maxR, obj: set,
      };
      set.position.set(0, geo.topY + 0.1, 0);
      set.userData.item = setItem;
      patternGroup.add(set);
      patternSetItem = setItem;
      return;
    }
    patternSetItem = null;
    for (const item of patternItems) {
      const obj = motifMesh(item);
      obj.userData.item = item;
      item.obj = obj;
      item.radius = item.scale * 0.85;
      placeMotif(item);
      patternGroup.add(obj);
    }
  }

  /** Alapelrendezés: egy nagy középső és négy kisebb minta a lapos felszínen. */
  function defaultPattern(motif, color) {
    const r = geo.pts.length ? Math.max(...geo.pts.map((p) => Math.hypot(p.x, p.y))) : 3;
    const spots = [[0, 0, 1], [-0.86, -0.72, 0.8], [0.84, -0.76, 0.8], [-0.76, 0.84, 0.72], [0.8, 0.86, 0.72]];
    return spots.map(([sx, sz, sc], i) => ({
      kind: 'motif', id: `m${i}`, motif,
      x: sx * r * 0.56, z: sz * r * 0.56,
      rot: 0, scale: sc * r * 0.32, color,
    }));
  }

  /* ================================================================ */
  /* Habszegély                                                        */
  /* ================================================================ */

  /** Egy csúcs = egy geometria. A krémátmérő 1 egységre normalizva,
   *  így a méretcsúszka és a szegély ugyanezt használja. */
  const TIP_GEO = {
    rozetta: swirlGeometry(0.5, 2.15, 0.72),
    csepp: dropGeometry(0.5),
    csillag: starTipGeometry(0.5),
    sima: pearlGeometry(0.5),
  };
  const tipGeo = (tip) => TIP_GEO[tip] ?? TIP_GEO.rozetta;
  const swirlGeo = TIP_GEO.rozetta;
  const dropGeo = TIP_GEO.csepp;

  /** Zárt kontúr egyenletes ívhossz szerinti újramintavétele.
   *  Visszaad pozíciót és kifelé mutató normálist — a szegély ebből épül. */
  function resampleRing(pts, spacing) {
    const n = pts.length;
    const segs = [];
    let perim = 0;
    for (let i = 0; i < n; i += 1) {
      const a = pts[i];
      const b = pts[(i + 1) % n];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      if (len < 1e-6) continue;
      segs.push({ a, b, len, start: perim });
      perim += len;
    }
    if (!segs.length) return { list: [], perim: 0 };
    const count = Math.max(6, Math.round(perim / Math.max(spacing, 0.12)));
    const step = perim / count;
    const list = [];
    let si = 0;
    for (let i = 0; i < count; i += 1) {
      const t = i * step;
      while (si < segs.length - 1 && segs[si].start + segs[si].len < t) si += 1;
      const s = segs[si];
      const k = clamp((t - s.start) / s.len, 0, 1);
      const x = lerp(s.a.x, s.b.x, k);
      const z = lerp(s.a.y, s.b.y, k);
      let nx = (s.b.y - s.a.y) / s.len;
      let nz = -(s.b.x - s.a.x) / s.len;
      if (nx * x + nz * z < 0) { nx = -nx; nz = -nz; }
      list.push({ x, z, nx, nz, i });
    }
    return { list, perim };
  }

  /** Egy szint szegélye. A felső és az alsó szint teljesen külön állítható.
   *  `inset` > 0 befelé (tetőperem), < 0 kifelé (tőszegély a tálcán). */
  function borderLevel(level, y, color, scale, inset) {
    if (!level?.on) return;
    const mat = mats.pipe.clone();
    mat.color = new THREE.Color(color);
    const size = (level.size ?? 0.42) * scale;
    const ring = insetContour(geo.pts, inset * size);

    if (level.tip === 'vonal') {
      const v = ring.map((p) => new THREE.Vector3(p.x, y, p.y));
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(v, true), Math.max(96, ring.length), size * 0.5, 8, true),
        mat,
      );
      tube.castShadow = true;
      borderGroup.add(tube);
      return;
    }

    const spacing = size * lerp(2.5, 1.15, level.density ?? 0.55);
    const { list } = resampleRing(ring, spacing);
    if (!list.length) return;
    const inst = new THREE.InstancedMesh(tipGeo(level.tip), mat, list.length);
    inst.castShadow = true;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const pos = new THREE.Vector3();
    const sc = new THREE.Vector3();
    list.forEach((p, i) => {
      // apró szabálytalanság: ez adja a kézműves jelleget
      const wob = Math.sin(i * 2.7) * 0.05 * size;
      const s = size * (0.94 + Math.sin(i * 1.13) * 0.06);
      if (level.tip === 'csepp') {
        q.setFromUnitVectors(up, new THREE.Vector3(p.nx * 0.52, 0.85, p.nz * 0.52).normalize());
      } else {
        q.setFromAxisAngle(up, i * 0.8);
      }
      pos.set(p.x + p.nx * wob, y, p.z + p.nz * wob);
      sc.set(s, s, s);
      m.compose(pos, q, sc);
      inst.setMatrixAt(i, m);
    });
    inst.instanceMatrix.needsUpdate = true;
    borderGroup.add(inst);
  }

  function buildBorder(border, color) {
    disposeGroup(borderGroup);
    if (!border || !geo.pts.length) return;
    const scale = clamp(Math.pow(geo.dia / 16, 0.4), 0.8, 1.4);
    const baseY = geo.borderBaseY ?? (geo.topY - geo.height);
    // a felső szegély a peremen ül, befelé húzva; az alsó a tőnél, KIFELÉ támaszkodva
    // a desszert falához — korábban a testbe volt ágyazva, ezért sosem látszott
    const top = border.felul ?? {};
    const bottom = border.alul ?? {};
    const topLift = top.tip === 'vonal' ? 0 : (top.size ?? 0.42) * scale * 0.34;
    borderLevel(border.felul, geo.topY + topLift, color, scale, 0.72);
    borderLevel(border.alul, baseY + (bottom.size ?? 0.42) * scale * 0.46, color, scale, -0.36);
  }

  /* ================================================================ */
  /* Dekorelemek                                                       */
  /* ================================================================ */

  function makeBow(color) {
    const g = new THREE.Group();
    const satin = color ? mats.satin.clone() : mats.satin;
    if (color) satin.color = new THREE.Color(color);
    const loopGeo = new THREE.TorusGeometry(1.05, 0.3, 10, 30);
    for (const s of [-1, 1]) {
      const loop = new THREE.Mesh(loopGeo, satin);
      loop.scale.set(1, 0.68, 0.5);
      loop.position.set(s * 1.08, 0.1, 0);
      loop.rotation.z = s * 0.3;
      loop.castShadow = true;
      g.add(loop);
    }
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), satin);
    knot.scale.set(1, 0.9, 0.7);
    knot.position.y = 0.1;
    knot.castShadow = true;
    g.add(knot);
    for (const s of [-1, 1]) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(s * 0.16, -0.16, 0.04),
        new THREE.Vector3(s * 0.62, -0.95, 0.14),
        new THREE.Vector3(s * 0.5, -1.75, 0.06),
      ]);
      const tail = new THREE.Mesh(new THREE.TubeGeometry(curve, 18, 0.24, 6, false), satin);
      tail.scale.z = 0.42;
      tail.castShadow = true;
      g.add(tail);
    }
    return g;
  }

  /** Eper: csucsba futo, kicsit szogletes test, apro magbenyomatokkal es
   *  otagu zold csesszelevellel — nem bogyo, hanem felismerheto eper. */
  function makeStrawberry() {
    const g = new THREE.Group();
    const R = 0.74;
    const bodyGeo = new THREE.SphereGeometry(R, 30, 24);
    const p = bodyGeo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i += 1) {
      v.fromBufferAttribute(p, i);
      // 0 = also csucs, 1 = felso vall
      const k = clamp((v.y + R) / (R * 2), 0, 1);
      // szivforma profil: keskeny csucs, teltebb vall
      const prof = Math.pow(k, 0.62) * (1 - Math.pow(1 - k, 5) * 0.25);
      const a = Math.atan2(v.z, v.x);
      // enyhe otos bordazat, ahogy a valodi eperen
      const rib = 1 + Math.cos(a * 5) * 0.035 * k;
      const s = lerp(0.2, 1.04, prof) * rib;
      v.x *= s;
      v.z *= s;
      v.y = v.y * 1.18 + R * 0.1;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    bodyGeo.computeVertexNormals();
    const body = new THREE.Mesh(bodyGeo, new THREE.MeshPhysicalMaterial({
      color: '#c4162a', roughness: 0.22, clearcoat: 0.92, clearcoatRoughness: 0.12,
      sheen: 0.4, sheenColor: new THREE.Color('#ff8f8f'), envMapIntensity: 1.15,
    }));
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);

    // magok: apro sargas szemek a felszinen, spiralban
    const seedGeo = new THREE.SphereGeometry(0.036, 7, 5);
    const seedMat = new THREE.MeshStandardMaterial({ color: '#e8d27a', roughness: 0.45 });
    const seeds = new THREE.InstancedMesh(seedGeo, seedMat, 62);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const pos = new THREE.Vector3();
    const one = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < 62; i += 1) {
      const t = (i + 0.5) / 62;
      const k = Math.pow(t, 0.72);
      const a = i * 2.399;
      const prof = Math.pow(k, 0.62) * (1 - Math.pow(1 - k, 5) * 0.25);
      const rad = lerp(0.2, 1.04, prof) * R * 0.99;
      const y = (-R + k * R * 2) * 1.18 + R * 0.1;
      pos.set(Math.cos(a) * rad, y, Math.sin(a) * rad);
      q.setFromUnitVectors(up, pos.clone().normalize());
      m.compose(pos, q, one);
      seeds.setMatrixAt(i, m);
    }
    seeds.instanceMatrix.needsUpdate = true;
    g.add(seeds);

    // csesszelevel: ot hegyes zold level a vallnal
    const leafMat = new THREE.MeshPhysicalMaterial({
      color: '#4f7a3a', roughness: 0.5, sheen: 0.5, sheenColor: new THREE.Color('#cfe6b0'),
      clearcoat: 0.3, envMapIntensity: 0.8,
    });
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.bezierCurveTo(0.2, 0.18, 0.24, 0.5, 0, 0.82);
    leafShape.bezierCurveTo(-0.24, 0.5, -0.2, 0.18, 0, 0);
    const leafGeo = new THREE.ExtrudeGeometry(leafShape, { depth: 0.035, bevelEnabled: false, curveSegments: 8 });
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * TAU + 0.3;
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.rotation.set(-Math.PI / 2 + 0.42, 0, 0);
      leaf.position.set(0, R * 1.24, 0);
      const pivot = new THREE.Group();
      pivot.rotation.y = a;
      pivot.add(leaf);
      g.add(pivot);
    }
    const hull = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 9), leafMat);
    hull.scale.y = 0.5;
    hull.position.y = R * 1.26;
    g.add(hull);

    g.rotation.z = 0.16;
    return g;
  }

  /** Domború bogyóhalmaz — a málna nem virág, hanem kupola alakú. */
  function makeRaspberry(color = '#b32544') {
    const g = new THREE.Group();
    const drupe = new THREE.SphereGeometry(0.2, 12, 10);
    const mat = mats.fruit(color);
    const rings = [[0, 0.56, 1], [0.34, 0.5, 8], [0.6, 0.3, 9], [0.74, 0.06, 7]];
    for (const [yk, r, n] of rings) {
      for (let i = 0; i < n; i += 1) {
        const a = (i / n) * TAU + yk * 3.1;
        const d = new THREE.Mesh(drupe, mat);
        d.position.set(Math.cos(a) * r, 0.12 + yk * 0.46, Math.sin(a) * r);
        d.scale.setScalar(lerp(1.05, 0.82, yk));
        d.castShadow = true;
        g.add(d);
      }
    }
    return g;
  }

  function makeBlueberry() {
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 14), mats.fruit('#38406e'));
    b.scale.y = 0.86;
    b.position.y = 0.36;
    b.castShadow = true;
    g.add(b);
    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.045, 6, 12), mats.fruit('#2a3157'));
    crown.rotation.x = -Math.PI / 2;
    crown.position.y = 0.71;
    g.add(crown);
    return g;
  }

  function makeCherry() {
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.52, 20, 16), mats.fruit('#a8102a'));
    b.position.y = 0.52;
    b.castShadow = true;
    g.add(b);
    const stem = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.95, 0), new THREE.Vector3(0.12, 1.5, 0.08), new THREE.Vector3(0.42, 1.78, 0.1),
    ]), 14, 0.045, 5, false), mats.leaf);
    g.add(stem);
    return g;
  }

  /** Ehető élővirág. Fajtánként más a szirom alakja, száma és a
   *  bibe — a szirom lágyan küpös, ezért kap fényt és árnyékot is. */
  const FLOWER_KINDS = {
    arvacska: { petals: 5, len: 1.22, wide: 0.94, cup: 0.3, tip: 0.55, core: '#f0c64a', coreR: 0.2, layers: 2 },
    primula: { petals: 5, len: 1.16, wide: 1.04, cup: 0.22, tip: 0.72, core: '#f4d24e', coreR: 0.26, layers: 1 },
    rozsa: { petals: 8, len: 0.92, wide: 0.78, cup: 0.62, tip: 0.5, core: null, coreR: 0.14, layers: 4 },
    harangvirag: { petals: 6, len: 1.28, wide: 0.62, cup: 0.5, tip: 0.2, core: '#e8dcc0', coreR: 0.15, layers: 2 },
    krizantem: { petals: 16, len: 1.32, wide: 0.34, cup: 0.26, tip: 0.3, core: '#e3c964', coreR: 0.15, layers: 3 },
  };

  function petalGeometry(spec) {
    const shape = new THREE.Shape();
    const w = spec.wide;
    const L = spec.len;
    const tip = spec.tip;
    shape.moveTo(0, 0);
    shape.bezierCurveTo(w * 0.7, L * 0.16, w * 0.62, L * 0.74, w * tip * 0.5, L);
    shape.bezierCurveTo(0, L * 1.08, 0, L * 1.08, -w * tip * 0.5, L);
    shape.bezierCurveTo(-w * 0.62, L * 0.74, -w * 0.7, L * 0.16, 0, 0);
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.03, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.022, bevelThickness: 0.016, curveSegments: 14,
    });
    // lágy küpösség: a szirom széle felhajlik
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i += 1) {
      const x = p.getX(i);
      const y = p.getY(i);
      p.setZ(i, p.getZ(i) + (x * x) * spec.cup * 1.6 + Math.pow(y / L, 2) * spec.cup * 0.4);
    }
    // Csucs-to tonusatmenet vertex-szinekkel: a to melyebb, a sziromhegy
    // vilagosabb. Enelkul a lapos, azonos tonusu szirmok osszeolvadtak, es a
    // virag amorf pacanak latszott.
    const col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i += 1) {
      const t = Math.min(1, Math.max(0, p.getY(i) / L));
      const edge = Math.min(1, Math.abs(p.getX(i)) / (w * 0.6));
      const k = 0.68 + Math.pow(t, 0.75) * 0.62 - edge * 0.06;
      col[i * 3] = k;
      col[i * 3 + 1] = k;
      col[i * 3 + 2] = k;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }

  const PETAL_CACHE = {};
  function makeFlower(item) {
    const kindId = item?.flower ?? 'arvacska';
    const spec = FLOWER_KINDS[kindId] ?? FLOWER_KINDS.arvacska;
    const base = item?.color ?? '#e8a8bd';
    const g = new THREE.Group();
    if (!PETAL_CACHE[kindId]) PETAL_CACHE[kindId] = petalGeometry(spec);
    const geoP = PETAL_CACHE[kindId];

    const c = new THREE.Color(base);
    const hsl = { h: 0, s: 0, l: 0 };
    c.getHSL(hsl);
    const mat = new THREE.MeshPhysicalMaterial({
      color: c, roughness: 0.42, vertexColors: true,
      sheen: 1, sheenRoughness: 0.32,
      sheenColor: new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s * 0.7), Math.min(0.96, hsl.l + 0.34)),
      clearcoat: 0.45, clearcoatRoughness: 0.35,
      transmission: 0.16, thickness: 0.22, ior: 1.36,
      envMapIntensity: 1.1, side: THREE.DoubleSide,
    });
    // belso szirmok kicsit melyebb tonusuak — ez adja a melyseget
    const inner = mat.clone();
    inner.color = new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s * 1.08), Math.max(0.12, hsl.l - 0.13));

    for (let layer = 0; layer < spec.layers; layer += 1) {
      const k = spec.layers === 1 ? 1 : 1 - layer * 0.26;
      const tilt = spec.layers === 1 ? 0.42 : 0.62 - layer * 0.2;
      const count = spec.layers === 1 ? spec.petals : Math.max(3, spec.petals - layer);
      for (let i = 0; i < count; i += 1) {
        const a = (i / count) * TAU + layer * 0.5 + (kindId === 'arvacska' ? 0.3 : 0);
        const petal = new THREE.Mesh(geoP, layer === 0 ? mat : inner);
        petal.scale.setScalar(k);
        petal.rotation.set(-Math.PI / 2 + tilt, 0, 0);
        // radialis szetnyitas: igy latszik res a szirmok kozott, es a virag
        // szirmokra bomlik, nem egyetlen folttá
        petal.position.set(0, layer * 0.08, -spec.len * k * 0.2);
        const pivot = new THREE.Group();
        pivot.rotation.y = a + (i % 2 ? 0.05 : -0.05);
        pivot.add(petal);
        petal.castShadow = true;
        g.add(pivot);
      }
    }

    if (spec.core) {
      // Kontrasztos bibe: ez adja a virag kozeppontjat, es ez valasztja el a
      // szirmokat egymastol. Korabban tul kicsi es tul hasonlo tonusu volt.
      const coreCol = new THREE.Color(spec.core);
      const dark = coreCol.clone().multiplyScalar(0.55);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(spec.coreR * 1.5, spec.coreR * 0.34, 10, 24),
        new THREE.MeshPhysicalMaterial({ color: dark, roughness: 0.6, envMapIntensity: 0.6 }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.06 + spec.layers * 0.05;
      g.add(ring);
      const core = new THREE.Mesh(new THREE.SphereGeometry(spec.coreR * 1.25, 18, 14), new THREE.MeshPhysicalMaterial({
        color: coreCol, roughness: 0.44, sheen: 0.8, sheenColor: new THREE.Color('#fffaf0'),
        clearcoat: 0.4, envMapIntensity: 1,
      }));
      core.scale.y = 0.7;
      core.position.y = 0.13 + spec.layers * 0.05;
      core.castShadow = true;
      g.add(core);
      // apro porzok
      const st = new THREE.InstancedMesh(
        new THREE.SphereGeometry(spec.coreR * 0.28, 6, 5),
        new THREE.MeshStandardMaterial({ color: '#fff3cf', roughness: 0.4 }),
        7,
      );
      const m = new THREE.Matrix4();
      for (let i = 0; i < 7; i += 1) {
        const a = (i / 7) * TAU;
        m.makeTranslation(Math.cos(a) * spec.coreR * 0.8, 0.14 + spec.layers * 0.05, Math.sin(a) * spec.coreR * 0.8);
        st.setMatrixAt(i, m);
      }
      st.instanceMatrix.needsUpdate = true;
      g.add(st);
    }

    // zold csesze a szirmok alatt
    const calyx = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8, 0, TAU, 0, Math.PI / 2), mats.leaf);
    calyx.scale.set(1, 0.5, 1);
    calyx.position.y = -0.02;
    g.add(calyx);
    return g;
  }

  /** Sima fehér gyertya — a műhely a torta MELLÉ csomagolja, nem bele. */
  function makeCandle() {
    const g = new THREE.Group();
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 5.4, 18), mats.wax);
    stick.rotation.z = Math.PI / 2;
    stick.position.y = 0.27;
    stick.castShadow = true;
    g.add(stick);
    const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.42, 6), new THREE.MeshStandardMaterial({ color: '#4a3f3a', roughness: 0.9 }));
    wick.rotation.z = Math.PI / 2;
    wick.position.set(2.9, 0.27, 0);
    g.add(wick);
    return g;
  }

  /** Fa kiskanál. A kanálfejet lapított tesztgömb adja — a korábbi félgömb
   *  180°-os fordítással készült, ami kifordította a normálisait, és a fej
   *  ezért látszott átlátszónak. */
  function makeSpoon() {
    const g = new THREE.Group();
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(1.3, 24, 16), mats.wood);
    bowl.scale.set(1, 0.3, 0.74);
    bowl.position.set(-2.7, 0.4, 0);
    bowl.castShadow = true;
    bowl.receiveShadow = true;
    g.add(bowl);
    // sekély mélyedés a fejben
    const dish = new THREE.Mesh(new THREE.SphereGeometry(1.02, 22, 14), mats.woodDark);
    dish.scale.set(1, 0.2, 0.7);
    dish.position.set(-2.7, 0.62, 0);
    g.add(dish);
    const neck = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.28, 0.7), mats.wood);
    neck.position.set(-1.5, 0.42, 0);
    neck.castShadow = true;
    g.add(neck);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.3, 0.98), mats.wood);
    handle.position.set(1.1, 0.42, 0);
    handle.castShadow = true;
    handle.receiveShadow = true;
    g.add(handle);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.49, 0.49, 0.3, 18), mats.wood);
    cap.rotation.x = Math.PI / 2;
    cap.position.set(3.4, 0.42, 0);
    cap.castShadow = true;
    g.add(cap);
    return g;
  }

  const FACTORY = {
    masni: (item) => makeBow(item?.color),
    gyertya: makeCandle,
    kanal: makeSpoon,
    virag: (item) => makeFlower(item),
    cseresznye: makeCherry,
    eper: makeStrawberry,
    malna: () => makeRaspberry('#b32544'),
    afonya: makeBlueberry,
  };

  /** A desszert méretéhez igazított, de valósághű dekorméret. */
  const decorScale = () => clamp(Math.pow(geo.dia / 16, 0.35), 0.72, 1.3);

  /** Melyik felszínre kerül az elem. Szeleten és pohárnál nincs oldalfal,
   *  amire masnit lehetne kötni, ezért az a tetejére kerül. */
  /** Az elem felszine. Elsodleges az ELEM sajat `surface` mezoje (ezt a
   *  huzas allitja), csak masodsorban a katalogus alapertelmezese. Oldalfal
   *  csak ott van, ahol tenylegesen van fuggoleges fal. */
  const hasSideWall = () => geo.kind === 'cake' || geo.kind === 'brownie' || geo.kind === 'slice';

  const surfaceOf = (typeOrItem, maybeItem) => {
    const item = typeof typeOrItem === 'object' ? typeOrItem : maybeItem;
    const key = typeof typeOrItem === 'object' ? typeOrItem.type : typeOrItem;
    const s = item?.surface ?? DECOR[key]?.surface ?? 'top';
    if (s === 'side' && !hasSideWall()) return 'top';
    return s;
  };

  /** Athuzhato-e az elem a tetorol az oldalra es vissza. */
  const canMoveToSide = (type) => !!DECOR[type]?.both && hasSideWall();

  function itemRadius(type, item) {
    const own = typeof type === 'object' ? type : item;
    const key = typeof type === 'object' ? type.type : type;
    return (DECOR[key]?.radius ?? 1.2) * decorScale() * (own?.scale ?? 1);
  }

  /** Tavolsag a felirat VALODI (forgatott) teglalapjaitol. A korabbi valtozat
   *  egy geo.dia*0.22 sugaru KORT hagyott szabadon, a felirat viszont fekvo,
   *  szeles teglalap — ezert a ket vegen a dekor rautt a szovegre. */
  function textGap(x, z) {
    if (!letterItems.length) return Infinity;
    let gap = Infinity;
    for (const it of letterItems) {
      const obj = it.obj;
      if (!obj?.geometry?.parameters) continue;
      const hw = (obj.geometry.parameters.width * obj.scale.x) / 2;
      const hh = (obj.geometry.parameters.height * obj.scale.y) / 2;
      const rot = it.rot ?? 0;
      const cs = Math.cos(rot);
      const sn = Math.sin(rot);
      const dx = x - obj.position.x;
      const dz = z - obj.position.z;
      // a pontot a teglalap sajat rendszerebe forgatjuk
      const lx = dx * cs - dz * sn;
      const lz = dx * sn + dz * cs;
      const ox = Math.abs(lx) - hw;
      const oz = Math.abs(lz) - hh;
      const d = (ox > 0 && oz > 0) ? Math.hypot(ox, oz) : Math.max(ox, oz);
      gap = Math.min(gap, d);
    }
    return gap;
  }

  /** Szabad hely keresése: a kontúron belül, a feliratot és egymást elkerülve. */
  function freeSpot(type, seedIndex = 0) {
    const surface = surfaceOf(type);
    if (surface === 'table') {
      const n = seedIndex;
      return { x: geo.boardR + 2.6 + n * 1.5, z: geo.boardR * 0.22 - n * 1.15, rot: 0.34 + n * 0.14 };
    }
    if (surface === 'side') {
      // a kamera felé eső oldalra kerül, hogy elsőre felismerhető legyen
      const dir = new THREE.Vector3().subVectors(camera.position, controls.target).setY(0).normalize();
      const pts = geo.pts;
      let best = 0;
      let bd = -Infinity;
      for (let i = 0; i < pts.length; i += 1) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        const tx = b.x - a.x;
        const tz = b.y - a.y;
        const len = Math.hypot(tx, tz) || 1;
        let nx = tz / len;
        let nz = -tx / len;
        if (nx * a.x + nz * a.y < 0) { nx = -nx; nz = -nz; }
        const d = nx * dir.x + nz * dir.z;
        if (d > bd) { bd = d; best = i; }
      }
      const spread = (seedIndex % 2 === 0 ? 1 : -1) * Math.ceil(seedIndex / 2) * 0.08;
      return { x: 0, z: 0, rot: 0, t: ((best / pts.length) + spread + 1) % 1, h: 0.56 };
    }
    const r = itemRadius(type);
    let best = null;
    for (let i = 0; i < 260; i += 1) {
      const a = (i * 2.399) + seedIndex * 0.7;
      const rad = Math.sqrt((i % 26) / 26) * (geo.dia / 2 - r * 1.1);
      let [x, z] = [Math.cos(a) * rad, Math.sin(a) * rad];
      [x, z] = pullInside(geo.pts, x, z, r * 1.05);
      let minD = Infinity;
      for (const it of items) {
        if (surfaceOf(it) !== 'top') continue;
        minD = Math.min(minD, Math.hypot(it.x - x, it.z - z) - itemRadius(it.type) - r);
      }
      // a felirat teljes teruletet szabadon hagyjuk
      if (geo.kind !== 'cup') minD = Math.min(minD, textGap(x, z) - r * 0.6);
      if (!best || minD > best.d) best = { d: minD, x, z };
      if (minD > 0.35) break;
    }
    return { x: best.x, z: best.z, rot: Math.random() * TAU };
  }

  /** A dekor ATMERETEZESE utan ujra kell rendezni: a nagyobb elem raulhat a
   *  feliratra vagy a szomszedjara. Ez iterativan kitolja oket, a konturon
   *  belul tartva. */
  function relaxItems(passes = 26) {
    const top = items.filter((it) => surfaceOf(it) === 'top' && it.x !== undefined);
    if (!top.length) return;
    for (let pass = 0; pass < passes; pass += 1) {
      let moved = false;
      for (const it of top) {
        const r = itemRadius(it.type, it);
        // 1) feliratrol le — a felirat legkozelebbi pontjatol tolunk el,
        //    nem a torta kozeppontjatol
        const need = r * 0.6;
        const gap = textGap(it.x, it.z);
        if (gap < need) {
          const e = 0.05;
          const gx = (textGap(it.x + e, it.z) - textGap(it.x - e, it.z)) / (2 * e);
          const gz = (textGap(it.x, it.z + e) - textGap(it.x, it.z - e)) / (2 * e);
          let nx = gx;
          let nz = gz;
          const len = Math.hypot(nx, nz);
          if (len < 1e-4) { nx = it.x; nz = it.z; }
          const L = Math.hypot(nx, nz) || 1;
          const step = (need - gap) * 0.6 + 0.05;
          it.x += (nx / L) * step;
          it.z += (nz / L) * step;
          moved = true;
        }
        // 2) egymasbol ki
        for (const other of top) {
          if (other === it) continue;
          const min = r + itemRadius(other.type, other);
          const dx = it.x - other.x;
          const dz = it.z - other.z;
          const d = Math.hypot(dx, dz);
          if (d < min && d > 0.0001) {
            const push = (min - d) / 2 + 0.02;
            it.x += (dx / d) * push;
            it.z += (dz / d) * push;
            other.x -= (dx / d) * push;
            other.z -= (dz / d) * push;
            moved = true;
          }
        }
        const [px, pz] = pullInside(geo.pts, it.x, it.z, r * 1.02);
        it.x = px;
        it.z = pz;
      }
      if (!moved) break;
    }
    for (const it of top) placeItem(it);
  }

  function addItem(type, spot) {
    const s = spot ?? freeSpot(type, items.filter((i) => i.type === type).length);
    const item = { id: `d${Date.now()}${Math.round(Math.random() * 999)}`, type, ...s };
    if (type === 'virag') {
      item.flower = config.flowerKind ?? 'arvacska';
      // a virágmix természetes: enyhén eltérő szín és méret minden szálon
      const pal = config.flowerColors ?? ['#e8a8bd', '#fdf3e6', '#f0c64a'];
      item.color = config.flowerColor ?? pal[items.filter((i) => i.type === 'virag').length % pal.length];
      item.scale = 0.88 + ((items.length * 37) % 25) / 100;
    }
    items.push(item);
    return item;
  }

  function rebuildDecor() {
    disposeGroup(decorGroup);
    for (const item of items) {
      const make = FACTORY[item.type];
      if (!make) continue;
      const obj = make(item);
      placeItem(item, obj);
      obj.userData.item = item;
      item.obj = obj;
      decorGroup.add(obj);
    }
    updateGizmo();
  }

  /** Egy elem elhelyezése a saját felszínén (tető / oldal / asztal). */
  function placeItem(item, obj = item.obj) {
    if (!obj) return;
    obj.scale.setScalar(decorScale() * (item.scale ?? 1));
    const surface = surfaceOf(item);
    if (surface === 'table') {
      obj.position.set(item.x, 0.32, item.z);
      obj.rotation.set(0, item.rot ?? 0, 0);
      return;
    }
    if (surface === 'side') {
      const pts = geo.pts;
      const t = clamp(item.t ?? 0.5, 0, 0.9999);
      const idx = t * pts.length;
      const a = pts[Math.floor(idx) % pts.length];
      const b = pts[(Math.floor(idx) + 1) % pts.length];
      const k = idx - Math.floor(idx);
      const px = lerp(a.x, b.x, k);
      const pz = lerp(a.y, b.y, k);
      const tx = b.x - a.x;
      const tz = b.y - a.y;
      const len = Math.hypot(tx, tz) || 1;
      let nx = tz / len;
      let nz = -tx / len;
      if (nx * px + nz * pz < 0) { nx = -nx; nz = -nz; }
      const baseY = geo.topY - geo.height;
      // A doboz pereme fole emeljuk az also korlatot: enelkul az oldalra tett
      // dekor (pl. masni) atmetszette a bento doboz falat.
      const own = sitHeight({ type: item.type, scale: item.scale }) * 0.55;
      const minH = geo.rimY !== undefined
        ? clamp((geo.rimY + own - baseY) / geo.height, 0.16, 0.8)
        : 0.16;
      const y = baseY + clamp(item.h ?? 0.52, minH, 0.9) * geo.height;

      if (DECOR[item.type]?.surface === 'side') {
        // a masni allva marad, csak a falhoz fordul
        obj.position.set(px + nx * 0.3 * decorScale(), y, pz + nz * 0.3 * decorScale());
        obj.rotation.set(0, Math.atan2(nx, nz) + (item.rot ?? 0), 0);
        return;
      }
      // A tetorol athuzott elem a falra FEKSZIK: a sajat "fel" iranya a fal
      // normalisa lesz, kicsit felfele billentve — igy nem all ki merolegesen,
      // es nem is sullyed a falba.
      const nrm = new THREE.Vector3(nx, 0, nz).lerp(new THREE.Vector3(0, 1, 0), 0.22).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), nrm);
      if (item.rot) q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), item.rot));
      obj.quaternion.copy(q);
      const lift = sitHeight(item) * 0.42 + 0.06;
      obj.position.set(px + nrm.x * lift, y + nrm.y * lift * 0.5, pz + nrm.z * lift);
      return;
    }
    obj.position.set(item.x, geo.topY + 0.02 - sinkDepth(item), item.z);
    obj.rotation.set(0, item.rot ?? 0, 0);
  }

  /** Az elem sajat magassaga a lokalis origotol — ebbol szamoljuk, mennyire
   *  alljon ki a falbol, illetve mennyire uljon bele a tetobe. */
  function sitHeight(item) {
    const base = { virag: 0.5, eper: 1.9, malna: 0.95, afonya: 0.8, cseresznye: 1.1, masni: 1.2 };
    return (base[item.type] ?? 1) * decorScale() * (item.scale ?? 1);
  }

  /** Apro besullyedes a kremben: enelkul a bogyok ugy neznek ki, mintha
   *  lebegnenek a felszin felett. */
  function sinkDepth(item) {
    const sink = { eper: 0.12, malna: 0.1, afonya: 0.1, cseresznye: 0.08, virag: 0.04 };
    return (sink[item.type] ?? 0) * decorScale() * (item.scale ?? 1);
  }

  /* ================================================================ */
  /* Felirat                                                           */
  /* ================================================================ */

  /** Egy betű krémmel írt képe. Minden betű saját textúra — ezért lehet
   *  egyenként színezni, mozgatni és forgatni. */
  const GLYPH_PX = 128;
  function glyphCanvas(ch, fontId, color, gold) {
    const cv = document.createElement('canvas');
    const ctx = cv.getContext('2d');
    const font = `${fontId === 'Poppins' ? '600 ' : ''}${GLYPH_PX}px \"${fontId}\", cursive`;
    ctx.font = font;
    const m = ctx.measureText(ch);
    const pad = GLYPH_PX * 0.3;
    cv.width = Math.max(8, Math.ceil(m.width + pad * 2));
    cv.height = Math.ceil(GLYPH_PX * 1.7);
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    let fill = color;
    if (gold) {
      const g = ctx.createLinearGradient(0, 0, cv.width, cv.height);
      g.addColorStop(0, '#f6dfa0');
      g.addColorStop(0.35, '#d8ad4e');
      g.addColorStop(0.62, '#f9eec2');
      g.addColorStop(1, '#b8882e');
      fill = g;
    }
    const cx = cv.width / 2;
    const cy = cv.height / 2;
    ctx.strokeStyle = 'rgba(88,58,52,.22)';
    ctx.lineWidth = GLYPH_PX * 0.11;
    ctx.strokeText(ch, cx, cy + GLYPH_PX * 0.045);
    ctx.strokeStyle = gold ? '#d8ad4e' : color;
    ctx.lineWidth = GLYPH_PX * 0.08;
    ctx.strokeText(ch, cx, cy);
    ctx.fillStyle = fill;
    ctx.fillText(ch, cx, cy);
    return { cv, advance: m.width };
  }

  /** A felirat alapelrendezése: soronként középre zárt alapvonal. */
  function layoutText(value, fontId) {
    const lines = value.split('\n').slice(0, 3).filter((l) => l.length);
    const ctx = textCtx;
    ctx.font = `${fontId === 'Poppins' ? '600 ' : ''}${GLYPH_PX}px \"${fontId}\", cursive`;
    const out = [];
    let maxW = 0;
    const widths = lines.map((line) => ctx.measureText(line).width);
    maxW = Math.max(1, ...widths);
    lines.forEach((line, li) => {
      let x = -widths[li] / 2;
      for (const ch of line) {
        const adv = ctx.measureText(ch).width;
        if (ch !== ' ') out.push({ ch, ox: x + adv / 2, oy: li * GLYPH_PX * 1.3, adv });
        x += adv;
      }
    });
    return { glyphs: out, spanW: maxW, spanH: Math.max(1, lines.length) * GLYPH_PX * 1.3 };
  }

  /** A sikot lefektetjuk, majd a VILAG Y tengelye korul forgatjuk. Euler
   *  szogekkel a Z-forgatas elbillentette a sikot, es a hatlapjaval nezett
   *  felenk — ezert nem lehetett kijelolni. */
  const FLAT_Q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  const Y_AXIS = new THREE.Vector3(0, 1, 0);
  function layFlat(obj, rot) {
    obj.quaternion.setFromAxisAngle(Y_AXIS, rot ?? 0).multiply(FLAT_Q);
  }

  /** A felirat ujraepitese ugy, hogy a kijeloles megmarad. Forgatas es
   *  mozgatas utan ezen keresztul fut ujra a konturba-szoritas is. */
  function refreshText() {
    const wasLetter = selected?.kind === 'letter' ? selected.index : null;
    const wasText = selected?.kind === 'text';
    updateText();
    if (wasText) selected = letterItems.find((i) => i.kind === 'text') ?? null;
    else if (wasLetter !== null) selected = letterItems.find((i) => i.index === wasLetter) ?? null;
    updateGizmo();
    mark();
  }

  /** A felirat SOHA nem lophat le a desszertrol: a forgatott befoglalo negy
   *  sarkat a konturhoz merjuk, es amig kilog, aranyosan kisebbre vesszuk. */
  function fitTextWidth(width, ratio, t) {
    const half = geo.dia * 0.3;
    const cx = (t.x ?? 0) * half;
    const cz = (t.z ?? 0) * half;
    const rot = t.rot ?? 0;
    const cs = Math.cos(rot);
    const sn = Math.sin(rot);
    let w = width;
    for (let guard = 0; guard < 10; guard += 1) {
      const hw = w / 2;
      const hh = (w * ratio) / 2;
      let ok = true;
      for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const lx = sx * hw;
        const lz = sz * hh;
        if (!insideContour(geo.pts, cx + lx * cs + lz * sn, cz - lx * sn + lz * cs)) { ok = false; break; }
      }
      if (ok) break;
      w *= 0.92;
    }
    return w;
  }

  /** A teljes felirat egyetlen kremtablaja — ez az alapallapot. */
  function buildWholeText(t, value, fontId, gold) {
    const lines = value.split('\n').slice(0, 3);
    const px = 128;
    const pad = 34;
    const font = `${fontId === 'Poppins' ? '600 ' : ''}${px}px "${fontId}", cursive`;
    textCtx.font = font;
    const w = Math.max(1, ...lines.map((l) => textCtx.measureText(l).width));
    textCv.width = Math.ceil(w + pad * 2);
    textCv.height = Math.ceil(lines.length * px * 1.3 + pad * 2);
    textCtx.clearRect(0, 0, textCv.width, textCv.height);
    textCtx.font = font;
    textCtx.textAlign = 'center';
    textCtx.textBaseline = 'middle';
    textCtx.lineJoin = 'round';
    textCtx.lineCap = 'round';
    const color = t.color ?? '#6b3b34';
    let fill = color;
    if (gold) {
      const g = textCtx.createLinearGradient(0, 0, textCv.width, textCv.height);
      g.addColorStop(0, '#f6dfa0');
      g.addColorStop(0.35, '#d8ad4e');
      g.addColorStop(0.62, '#f9eec2');
      g.addColorStop(1, '#b8882e');
      fill = g;
    }
    lines.forEach((line, i) => {
      const y = pad + px * 0.7 + i * px * 1.3;
      textCtx.strokeStyle = 'rgba(88,58,52,.22)';
      textCtx.lineWidth = px * 0.11;
      textCtx.strokeText(line, textCv.width / 2, y + px * 0.045);
      textCtx.strokeStyle = gold ? '#d8ad4e' : color;
      textCtx.lineWidth = px * 0.08;
      textCtx.strokeText(line, textCv.width / 2, y);
      textCtx.fillStyle = fill;
      textCtx.fillText(line, textCv.width / 2, y);
    });

    const tex = new THREE.CanvasTexture(textCv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const worldW = fitTextWidth(geo.dia * 0.66 * (t.size ?? 1), textCv.height / textCv.width, t);
    const worldH = (worldW * textCv.height) / textCv.width;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(worldW, worldH), new THREE.MeshPhysicalMaterial({
      map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      roughness: gold ? 0.28 : 0.48, metalness: gold ? 0.82 : 0, envMapIntensity: 0.8,
    }));
    const half = geo.dia * 0.3;
    const item = {
      kind: 'text', x: (t.x ?? 0) * half, z: (t.z ?? 0) * half,
      rot: t.rot ?? 0, scale: 1, color: t.color ?? '#6b3b34',
      radius: Math.max(worldW, worldH) * 0.5,
    };
    mesh.position.set(item.x, geo.topY + 0.09, item.z);
    layFlat(mesh, item.rot);
    mesh.renderOrder = 4;
    mesh.userData.item = item;
    item.obj = mesh;
    letterItems.push(item);
    letterGroup.add(mesh);
  }

  function updateText() {
    const t = config.text ?? {};
    const value = (t.value ?? '').replace(/\s+$/, '');
    disposeGroup(letterGroup);
    letterItems = [];
    if (!value.trim() || geo.kind === 'cup' || geo.kind === 'slice') return;

    const fontId = t.font ?? 'Caveat';
    if (!t.split) {
      buildWholeText(t, value, fontId, !!config.extras?.includes('arany'));
      return;
    }
    const gold = !!config.extras?.includes('arany');
    const { glyphs, spanW, spanH } = layoutText(value, fontId);
    if (!glyphs.length) return;

    // Vilagmeret: a teljes felirat a desszert atmerojenek ~66%-a. A felirat
    // viszont SOHA nem lophat le a desszertrol: a forgatott befoglalo negy
    // sarkat a konturhoz mérjük, es ha kilog, arányosan kisebbre vesszük.
    const worldW = fitTextWidth(geo.dia * 0.66 * (t.size ?? 1), spanH / spanW, t);
    const k = worldW / spanW;
    const half = geo.dia * 0.3;
    const ax = (t.x ?? 0) * half;
    const az = (t.z ?? 0) * half;
    const rot = t.rot ?? 0;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const overrides = t.letters ?? {};

    glyphs.forEach((glyph, i) => {
      const o = overrides[i] ?? {};
      const color = o.color ?? t.color ?? '#6b3b34';
      const { cv } = glyphCanvas(glyph.ch, fontId, color, o.gold ?? gold);
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      const gw = cv.width * k;
      const gh = cv.height * k;
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(gw, gh), new THREE.MeshPhysicalMaterial({
        map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide,
        roughness: (o.gold ?? gold) ? 0.28 : 0.48, metalness: (o.gold ?? gold) ? 0.82 : 0,
        envMapIntensity: 0.8,
      }));
      // alappóz: az alapvonal mentén, a felirat szögébe forgatva
      const bx = glyph.ox * k;
      const bz = glyph.oy * k;
      // A vilag Y-tengely koruli forgatas: (x,z) -> (x cos + z sin, -x sin + z cos).
      // A regi formula ellentetes iranyu volt, ezert a betuk POZICIOJA mas
      // fele lendult, mint amerre a betuk elfordultak.
      const baseX = ax + bx * cos + bz * sin;
      const baseZ = az - bx * sin + bz * cos;
      const item = {
        kind: 'letter', index: i, ch: glyph.ch,
        baseX, baseZ, dx: o.dx ?? 0, dz: o.dz ?? 0,
        rot: rot + (o.rot ?? 0), scale: o.scale ?? 1, color,
      };
      mesh.scale.setScalar(item.scale);
      mesh.position.set(baseX + item.dx, geo.topY + 0.09 + i * 0.002, baseZ + item.dz);
      layFlat(mesh, item.rot);
      mesh.renderOrder = 4;
      mesh.userData.item = item;
      item.obj = mesh;
      item.radius = Math.max(gw, gh) * 0.42 * item.scale;
      letterItems.push(item);
      letterGroup.add(mesh);
    });
  }

  /** Egy betű áthelyezése: az eltérést tarjuk számon, hogy a teljes felirat
   *  mozgatása után is a helyén maradjon. */
  function placeLetter(item) {
    if (!item.obj) return;
    item.obj.position.set(item.baseX + item.dx, item.obj.position.y, item.baseZ + item.dz);
    layFlat(item.obj, item.rot);
    item.obj.scale.setScalar(item.scale);
  }

  function storeLetter(item) {
    if (!config.text.letters) config.text.letters = {};
    config.text.letters[item.index] = {
      dx: item.dx, dz: item.dz, rot: item.rot - (config.text.rot ?? 0),
      scale: item.scale, color: item.color, gold: item.gold,
    };
  }

  /* ================================================================ */
  /* Csillám                                                           */
  /* ================================================================ */

  function updateSparkles() {
    if (sparkles) {
      root.remove(sparkles);
      sparkles.geometry.dispose();
      sparkles = null;
    }
    if (!config.extras?.includes('csillam')) return;
    // a fujt csillam sok apro, gyongyhaz szemcse: kevesbe halvany, de nem
    // kiegett — ket retegben, hogy legyen melysege
    const n = 1400;
    const pos = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const seed = { s: 771 };
    for (let i = 0; i < n; i += 1) {
      const onTop = rnd(seed) > 0.4;
      if (onTop) {
        let x = (rnd(seed) - 0.5) * geo.dia;
        let z = (rnd(seed) - 0.5) * geo.dia;
        [x, z] = pullInside(geo.pts, x, z, 0.22);
        pos.set([x, geo.topY + 0.1 + rnd(seed) * 0.05, z], i * 3);
      } else {
        const p = geo.pts[Math.floor(rnd(seed) * geo.pts.length)];
        const y = (geo.topY - geo.height) + rnd(seed) * geo.height;
        pos.set([p.x * 1.012, y, p.y * 1.012], i * 3);
      }
      size[i] = 0.055 + Math.pow(rnd(seed), 2.2) * 0.2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('size', new THREE.BufferAttribute(size, 1));
    sparkles = new THREE.Points(g, new THREE.PointsMaterial({
      map: sparkTex, size: 0.17, sizeAttenuation: true, transparent: true,
      opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending,
      color: new THREE.Color('#fff4e0'),
    }));
    root.add(sparkles);
  }

  /* ================================================================ */
  /* Kamera                                                            */
  /* ================================================================ */

  function frameCamera(animate = false) {
    const d = 13.4 * Math.pow(geo.frame, 0.438);
    controls.minDistance = d * 0.55;
    controls.maxDistance = d * 1.9;
    controls.target.set(0, geo.topY * 0.46, 0);
    if (!animate) {
      const a = -0.42;
      const p = geo.polar ?? 1.16;
      camera.position.set(
        controls.target.x + d * Math.sin(p) * Math.sin(a),
        controls.target.y + d * Math.cos(p),
        controls.target.z + d * Math.sin(p) * Math.cos(a),
      );
    } else {
      const dir = camera.position.clone().sub(controls.target).normalize();
      camera.position.copy(controls.target).add(dir.multiplyScalar(d));
    }
    camera.updateProjectionMatrix();
    controls.update();

    const s = geo.frame * 1.5;
    key.shadow.camera.left = -s;
    key.shadow.camera.right = s;
    key.shadow.camera.top = s;
    key.shadow.camera.bottom = -s;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 140;
    key.shadow.camera.updateProjectionMatrix();
    mark();
  }

  /* ================================================================ */
  /* Frissítés                                                         */
  /* ================================================================ */

  function applyConfig(next, product) {
    const prev = config;
    config = next;
    const size = product.sizes.find((s) => s.id === next.size) ?? product.sizes[0];
    const bodySig = [product.slug, next.size, next.shape, next.flavour, next.pattern ?? '', next.patternColor ?? '', product.frosting ? next.frosting : ''].join('|');
    const rebuiltBody = bodySig !== sig.body;

    if (rebuiltBody) {
      sig.body = bodySig;
      disposeGroup(bodyGroup);
      disposeGroup(pipeGroup);
      disposeGroup(patternGroup);
      paintPlate = null;
      paintSleeve = null;
      if (product.slug === 'bento-cup') geo = buildCup(product, size, next.frosting);
      else if (product.slug === 'bento-szelet') geo = buildSlice(product, size, next.frosting);
      else if (product.slug === 'bento-brownie') geo = buildBrownie(product, size, next.shape, next.flavour);
      else geo = buildCake(product, size, next.shape, product.slug === 'koreai-bento-torta');
      rebuildStrokes();
      if (paintPlate) paintTex.needsUpdate = true;
      frameCamera(!!prev && prev.slug === next.slug);
    }

    if (!product.pattern && !rebuiltBody && (prev?.frosting !== next.frosting)) {
      bodyGroup.traverse((o) => {
        if (o.material === mats.cream) o.material.color.set(next.frosting);
      });
    }
    mats.cream.color.set(product.frosting ? next.frosting : '#f2d3d0');

    // A nyomott minta SAJAT alairassal szinkronizal, nem a testepites agaban.
    // Korabban csak akkor frissult, ha a test is ujraepult — igy a jelenet es
    // a konfiguracio szetcsuszott (a pohron ot minta latszott, a mentett
    // tervben nulla), es a kovetkezo configbol-epites eltuntette a mintat.
    const patternSig = product.pattern
      ? [next.pattern ?? '', next.patternColor ?? '', bodySig].join('|')
      : 'nincs';
    if (patternSig !== sig.pattern) {
      sig.pattern = patternSig;
      if (product.pattern) {
        const saved = next.patternItems;
        const sameMotif = saved?.length && saved[0].motif === next.pattern;
        const colorChanged = !!prev && prev.patternColor !== next.patternColor;
        patternItems = sameMotif
          ? saved.map((p) => ({ ...p, kind: 'motif', color: colorChanged ? next.patternColor : p.color }))
          : defaultPattern(next.pattern, next.patternColor ?? '#b68e88');
        config.patternItems = patternItems.map(({ obj, ...rest }) => rest);
        rebuildPattern();
      } else {
        patternItems = [];
        config.patternItems = null;
        disposeGroup(patternGroup);
      }
    } else if (product.pattern && patternItems.length && !next.patternItems?.length) {
      // a konfiguracio elvesztette a mintakat (pl. "Uj terv"): irjuk vissza
      config.patternItems = patternItems.map(({ obj, ...rest }) => rest);
    }

    const borderSig = JSON.stringify(next.border) + next.borderColor + bodySig;
    if (borderSig !== sig.border) {
      sig.border = borderSig;
      buildBorder(product.border ? next.border : null, next.borderColor ?? '#ffffff');
    }

    // dekor: az extrák be/ki kapcsolása hozza létre és veszi le az elemeket
    // A felirat ELOBB epul fel: a freeSpot elkerulo aga a felirat mesh-et meri,
    // es a regi sorrendben (syncItems -> rebuildDecor -> updateText) az meg nem
    // letezett, ezert az elkerules csendben kimaradt, es a dekor a feliratra ult.
    updateText();
    syncItems(product, next);
    if (rebuiltBody) {
      for (const item of items) {
        if (surfaceOf(item) === 'top') {
          if (item.t !== undefined) {
            // oldalról a tetőre került (pl. masni szeleten): kapjon szabad helyet
            const spot = freeSpot(item.type, 0);
            item.x = spot.x;
            item.z = spot.z;
            item.t = undefined;
          }
          const [x, z] = pullInside(geo.pts, item.x, item.z, itemRadius(item.type));
          item.x = x;
          item.z = z;
        }
      }
    }
    relaxItems();
    rebuildDecor();
    updateText();
    updateSparkles();
    mark();
  }

  /** A dekorelemek pontosan az aktív, valós opciókhoz tartoznak. */
  function syncItems(product, next) {
    const allowed = new Map();
    for (const extra of product.extras) {
      if (!next.extras.includes(extra.id)) continue;
      if (extra.decor) allowed.set(extra.decor, extra);
      if (extra.decorSet) for (const d of extra.decorSet) allowed.set(d, extra);
    }
    if (product.spoons) allowed.set('kanal', { count: Number(next.spoons ?? 1), fixed: true });

    items = items.filter((it) => allowed.has(it.type));
    for (const [type, extra] of allowed) {
      const has = items.filter((i) => i.type === type).length;
      if (extra.fixed) {
        // kötött darabszám (gyertya, kanál)
        const want = extra.count ?? 1;
        if (has > want) {
          let drop = has - want;
          items = items.filter((i) => (i.type === type && drop-- > 0 ? false : true));
        }
        for (let i = has; i < want; i += 1) addItem(type);
      } else if (has === 0 && !extra.decorSet) {
        for (let i = 0; i < (extra.count ?? 1); i += 1) addItem(type);
      } else if (has === 0 && extra.decorSet && type === extra.decorSet[0]) {
        for (const d of extra.decorSet) {
          const n = d === 'eper' ? 2 : d === 'malna' ? 2 : 1;
          for (let i = 0; i < n; i += 1) addItem(d);
        }
      }
    }
  }

  /* ================================================================ */
  /* Krémnyomás és ecset                                               */
  /* ================================================================ */

  /** Kremradir: a mutato alatti nyomott kremelemet veszi le. A pontos mesh-
   *  talalat nem eleg megengedo (a rozetta kozepen nincs geometria), ezert a
   *  sugarhoz legkozelebbi krempontot keressuk. */
  function eraseStrokeAt(ev) {
    if (!strokes.length) return;
    setPointer(ev);
    raycaster.setFromCamera(pointer, camera);
    const ray = raycaster.ray;
    const p = new THREE.Vector3();
    let best = -1;
    let bestD = Infinity;
    strokes.forEach((stroke, i) => {
      const tol = (stroke.size ?? 0.4) * 1.5 + 0.35;
      for (const [x, y, z] of stroke.pts) {
        p.set(x, y, z);
        const d = ray.distanceToPoint(p);
        if (d < tol && d < bestD) { bestD = d; best = i; }
      }
    });
    if (best < 0) return;
    strokes.splice(best, 1);
    rebuildStrokes();
    mark();
  }

  function rebuildStrokes() {
    disposeGroup(pipeGroup);
    strokes.forEach((s, i) => addStrokeMesh(s, i));
  }

  function addStrokeMesh(stroke, index = strokes.indexOf(stroke)) {
    const mat = mats.pipe.clone();
    mat.color = new THREE.Color(stroke.color);
    if (stroke.type === 'drop') {
      const mesh = new THREE.Mesh(tipGeo(stroke.tip), mat);
      mesh.scale.setScalar(stroke.size);
      mesh.position.set(stroke.pts[0][0], stroke.pts[0][1], stroke.pts[0][2]);
      const n = new THREE.Vector3(stroke.n[0], stroke.n[1], stroke.n[2]).normalize();
      // a csúcs a felszín normálisa mentén áll, de mindig kicsit felfelé dől
      const dir = n.clone().lerp(new THREE.Vector3(0, 1, 0), 0.45).normalize();
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      mesh.castShadow = true;
      mesh.userData.strokeIndex = index;
      pipeGroup.add(mesh);
      return;
    }
    if (stroke.pts.length < 2) return;
    const v = stroke.pts.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const curve = new THREE.CatmullRomCurve3(v, false, 'catmullrom', 0.3);
    const r = stroke.size * 0.5;
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, Math.min(420, Math.max(24, v.length * 3)), r, 9, false),
      mat,
    );
    mesh.castShadow = true;
    mesh.userData.strokeIndex = index;
    pipeGroup.add(mesh);
    // lekerekített végek, hogy ne vágott cső legyen
    for (const end of [v[0], v[v.length - 1]]) {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), mat);
      cap.position.copy(end);
      cap.castShadow = true;
      cap.userData.strokeIndex = index;
      pipeGroup.add(cap);
    }
  }

  let current = null;

  function surfaceHit(ev) {
    setPointer(ev);
    raycaster.setFromCamera(pointer, camera);
    const targets = [];
    bodyGroup.traverse((o) => { if (o.isMesh && o !== paintPlate && o !== paintSleeve) targets.push(o); });
    borderGroup.children.forEach((o) => targets.push(o));
    if (paintPlate) targets.push(paintPlate);
    const hits = raycaster.intersectObjects(targets, false);
    return hits[0] ?? null;
  }

  function setPointer(ev) {
    const r = renderer.domElement.getBoundingClientRect();
    pointer.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  }

  function paintAt(ev) {
    setPointer(ev);
    raycaster.setFromCamera(pointer, camera);
    const targets = [];
    if (paintPlate) targets.push(paintPlate);
    if (paintSleeve) targets.push(paintSleeve);
    const hit = raycaster.intersectObjects(targets, false)[0];
    if (!hit?.uv) return;
    const onSide = hit.object === paintSleeve;
    const ctx = onSide ? sideCtx : paintCtx;
    const cv = onSide ? sideCv : paintCv;
    const tex = onSide ? sideTex : paintTex;
    // az oldalfal vaszna szeles, ezert a vonalvastagsagot at kell skalazni
    const kx = onSide ? 1.6 : 1;
    const x = hit.uv.x * cv.width;
    const y = (1 - hit.uv.y) * cv.height;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.globalCompositeOperation = brush.erase ? 'destination-out' : 'source-over';
    ctx.strokeStyle = brush.color;
    ctx.fillStyle = brush.color;
    ctx.lineWidth = brush.size * kx;
    const key = onSide ? 'side' : 'top';
    if (current && current.lastKey === key && current.lastX !== undefined) {
      const d = Math.hypot(x - current.lastX, y - current.lastY);
      if (d < cv.width * 0.35) {
        ctx.beginPath();
        ctx.moveTo(current.lastX, current.lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.arc(x, y, (brush.size * kx) / 2, 0, TAU);
      ctx.fill();
    }
    if (current) { current.lastX = x; current.lastY = y; current.lastKey = key; }
    tex.needsUpdate = true;
    mark();
  }

  /* ================================================================ */
  /* Interakció                                                        */
  /* ================================================================ */

  function applyControlMode() {
    const free = tool === 'orbit';
    controls.mouseButtons = free
      ? { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }
      : { LEFT: null, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
    controls.touches = free
      ? { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }
      : { ONE: null, TWO: THREE.TOUCH.DOLLY_ROTATE };
    renderer.domElement.style.cursor = free ? 'grab' : tool === 'brush' ? 'crosshair' : 'pointer';
  }

  function pickItem(ev) {
    setPointer(ev);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects([...decorGroup.children, ...letterGroup.children, ...patternGroup.children], true);
    for (const hit of hits) {
      let o = hit.object;
      while (o && !o.userData.item) o = o.parent;
      if (o?.userData.item) return { item: o.userData.item, obj: o, point: hit.point };
    }
    return null;
  }

  /** A kijelölt elem leírója a UI felé. */
  function describe(item) {
    if (!item) return null;
    if (item.kind === 'text') {
      return { kind: 'text', color: item.color, scale: config.text.size ?? 1, split: false };
    }
    if (item.kind === 'letter') {
      return { kind: 'letter', index: item.index, ch: item.ch, color: item.color, scale: item.scale };
    }
    if (item.kind === 'patternset') {
      return { kind: 'patternset', color: item.color, scale: item.scale ?? 1 };
    }
    if (item.kind === 'motif') {
      return { kind: 'motif', id: item.id, color: item.color, scale: item.scale };
    }
    return {
      kind: 'decor', type: item.type, id: item.id, scale: item.scale ?? 1,
      color: item.color, tintable: item.type === 'masni' || item.type === 'virag',
      flower: item.flower, surface: surfaceOf(item), canSide: canMoveToSide(item.type),
    };
  }

  function updateGizmo() {
    // A gyuru KIZAROLAG a szerkeszto modban lathato: mas eszkoznel dekoracionak
    // latszo kort huzott a desszert tetejere, es a mentett kepre is rakerult.
    if (!selected || tool !== 'move') {
      gizmo.visible = false;
      gizmoHandle.visible = false;
      return;
    }
    const obj = selected.obj;
    if (!obj) {
      gizmo.visible = false;
      gizmoHandle.visible = false;
      return;
    }
    const r = selected.radius
      ? selected.radius * 1.45
      : itemRadius(selected.type, selected) * 1.35;
    gizmo.scale.setScalar(r);
    gizmo.position.copy(obj.position);
    gizmo.position.y += 0.12;
    const rot = selected.rot ?? 0;
    gizmo.visible = true;
    gizmoHandle.visible = true;
    gizmoHandle.position.set(
      obj.position.x + Math.sin(rot) * r,
      obj.position.y + 0.16,
      obj.position.z + Math.cos(rot) * r,
    );
    gizmoHandle.scale.setScalar(clamp(geo.dia / 16, 0.8, 1.6));
    mark();
  }

  const capture = (ev) => {
    try { renderer.domElement.setPointerCapture(ev.pointerId); } catch { /* nem minden pointer fogható */ }
  };

  function onPointerDown(ev) {
    if (ev.button === 2) return;               // jobb gomb: mindig forgatás
    const isTouch = ev.pointerType === 'touch';

    if (tool === 'brush') {
      current = { kind: 'paint' };
      capture(ev);
      paintAt(ev);
      return;
    }

    if (tool === 'krem') {
      if (pipe.erase) {
        eraseStrokeAt(ev);
        current = { kind: 'erase' };
        capture(ev);
        return;
      }
      const hit = surfaceHit(ev);
      // ha a desszerten kívül indul a húzás, a vonás ott kezdődik, ahol a
      // felszínre ér — ahogy egy habzsákkal is tennéd
      current = { kind: 'krem', moved: false, sx: ev.clientX, sy: ev.clientY, stroke: null, n: null };
      if (hit) {
        const n = hit.face ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld) : new THREE.Vector3(0, 1, 0);
        const p = hit.point.clone().add(n.clone().multiplyScalar(pipe.size * 0.28));
        current.n = [n.x, n.y, n.z];
        current.stroke = { type: 'line', color: pipe.color, size: pipe.size, tip: pipe.tip, pts: [[p.x, p.y, p.z]] };
      }
      capture(ev);
      return;
    }

    // mozgatás / forgatás: gyűrű vagy elem
    setPointer(ev);
    raycaster.setFromCamera(pointer, camera);
    if (selected && gizmo.visible) {
      const gh = raycaster.intersectObjects([gizmoHandle, gizmo], false)[0];
      if (gh) {
        current = { kind: 'rotate', center: selected.obj.position.clone() };
        capture(ev);
        return;
      }
    }
    const pick = pickItem(ev);
    if (!pick) {
      if (tool === 'move') { selected = null; updateGizmo(); onSelect(null); }
      return;
    }
    selected = pick.item;
    updateGizmo();
    onSelect(describe(pick.item));
    current = { kind: 'move', item: pick.item, obj: pick.obj, isTouch };
    capture(ev);
  }

  function onPointerMove(ev) {
    if (!current) return;
    if (current.kind === 'paint') return paintAt(ev);
    if (current.kind === 'erase') return eraseStrokeAt(ev);

    if (current.kind === 'krem') {
      const hit = surfaceHit(ev);
      if (!hit) return;
      const n = hit.face ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld) : new THREE.Vector3(0, 1, 0);
      const p = hit.point.clone().add(n.clone().multiplyScalar(pipe.size * 0.28));
      if (!current.stroke) {
        // a felszínen kívül indult: itt kezdődik a vonás
        current.n = [n.x, n.y, n.z];
        current.stroke = { type: 'line', color: pipe.color, size: pipe.size, tip: pipe.tip, pts: [[p.x, p.y, p.z]] };
        current.sx = ev.clientX;
        current.sy = ev.clientY;
        return;
      }
      if (!current.moved && Math.hypot(ev.clientX - current.sx, ev.clientY - current.sy) < 4) return;
      const pts = current.stroke.pts;
      const last = pts[pts.length - 1];
      if (Math.hypot(p.x - last[0], p.y - last[1], p.z - last[2]) < pipe.size * 0.3) return;
      if (!current.moved) {
        current.moved = true;
        strokes.push(current.stroke);
      }
      pts.push([p.x, p.y, p.z]);
      if (current.mesh) {
        pipeGroup.remove(current.mesh);
        current.mesh.geometry.dispose();
        current.mesh = null;
      }
      const v = pts.map(([x, y, z]) => new THREE.Vector3(x, y, z));
      const mat = mats.pipe.clone();
      mat.color = new THREE.Color(current.stroke.color);
      current.mesh = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(v, false, 'catmullrom', 0.3), Math.min(320, v.length * 3), current.stroke.size * 0.5, 9, false),
        mat,
      );
      pipeGroup.add(current.mesh);
      mark();
      return;
    }

    if (current.kind === 'rotate') {
      setPointer(ev);
      raycaster.setFromCamera(pointer, camera);
      dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), current.center);
      if (!raycaster.ray.intersectPlane(dragPlane, tmp)) return;
      const ang = Math.atan2(tmp.x - current.center.x, tmp.z - current.center.z);
      if (selected.kind === 'patternset') {
        selected.rot = ang;
        selected.obj.rotation.set(0, ang, 0);
        onChange({ pattern: config.patternItems });
        updateGizmo();
        return;
      }
      if (selected.kind === 'text') {
        selected.rot = ang;
        config.text.rot = ang;
        refreshText();
        onChange({ text: { ...config.text } });
      } else if (selected.kind === 'letter') {
        selected.rot = ang;
        placeLetter(selected);
        storeLetter(selected);
        onChange({ text: { ...config.text } });
      } else if (selected.kind === 'motif') {
        selected.rot = ang;
        placeMotif(selected);
        storeMotif(selected);
        onChange({ pattern: patternItems.map(({ obj, ...r }) => r) });
      } else {
        selected.rot = ang;
        placeItem(selected);
        onChange({ items: serialiseItems() });
      }
      updateGizmo();
      return;
    }

    if (current.kind === 'move') {
      const item = current.item;
      if (item.kind === 'text') {
        setPointer(ev);
        raycaster.setFromCamera(pointer, camera);
        dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, geo.topY, 0));
        if (!raycaster.ray.intersectPlane(dragPlane, tmp)) return;
        const half = geo.dia * 0.3;
        config.text.x = clamp(tmp.x / half, -1.15, 1.15);
        config.text.z = clamp(tmp.z / half, -1.15, 1.15);
        item.x = config.text.x * half;
        item.z = config.text.z * half;
        item.obj.position.set(item.x, item.obj.position.y, item.z);
        onChange({ text: { ...config.text } });
        updateGizmo();
        return;
      }
      if (item.kind === 'patternset') {
        setPointer(ev);
        raycaster.setFromCamera(pointer, camera);
        dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, geo.topY, 0));
        if (!raycaster.ray.intersectPlane(dragPlane, tmp)) return;
        const [px, pz] = pullInside(geo.pts, tmp.x, tmp.z, 0.4);
        item.x = px;
        item.z = pz;
        item.obj.position.set(px, geo.topY + 0.1, pz);
        onChange({ pattern: config.patternItems });
        updateGizmo();
        return;
      }
      // A teljes felirat mozgatasa a KONFIGURACION keresztul fut, hogy a
      // konturba-szoritas minden lepes utan ujra lefusson.
      if (item.kind === 'text') {
        setPointer(ev);
        raycaster.setFromCamera(pointer, camera);
        dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, geo.topY, 0));
        if (!raycaster.ray.intersectPlane(dragPlane, tmp)) return;
        const half = geo.dia * 0.3 || 1;
        config.text.x = clamp(tmp.x / half, -1.3, 1.3);
        config.text.z = clamp(tmp.z / half, -1.3, 1.3);
        refreshText();
        onChange({ text: { ...config.text } });
        return;
      }
      if (item.kind === 'letter' || item.kind === 'motif') {
        setPointer(ev);
        raycaster.setFromCamera(pointer, camera);
        dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, geo.topY, 0));
        if (!raycaster.ray.intersectPlane(dragPlane, tmp)) return;
        const r = item.radius ?? 0.6;
        const [px, pz] = pullInside(geo.pts, tmp.x, tmp.z, r * 0.55);
        if (item.kind === 'letter') {
          item.dx = px - item.baseX;
          item.dz = pz - item.baseZ;
          placeLetter(item);
          storeLetter(item);
          onChange({ text: { ...config.text } });
        } else {
          item.x = px;
          item.z = pz;
          placeMotif(item);
          storeMotif(item);
          onChange({ pattern: patternItems.map(({ obj, ...rest }) => rest) });
        }
        updateGizmo();
        return;
      }
      let surface = surfaceOf(item);
      setPointer(ev);
      raycaster.setFromCamera(pointer, camera);

      // A tetorol az OLDALRA (es vissza) huzas: a felszint a talalat dolti el,
      // nem a katalogus alapertelmezese. Amit fuggoleges falon engednek el, az
      // oldalra kerul; amit a tetolapon, az a tetore.
      if (surface !== 'table' && canMoveToSide(item.type)) {
        const solid = bodyGroup.children.filter((o) => o.isMesh && o !== paintPlate && o !== paintSleeve);
        const hit = raycaster.intersectObjects(solid, false)[0];
        if (hit) {
          const nrm = hit.face
            ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld)
            : new THREE.Vector3(0, 1, 0);
          surface = Math.abs(nrm.y) < 0.55 ? 'side' : 'top';
          if (item.surface !== surface) {
            item.surface = surface;
            onSelect(describe(item));
          }
        }
      }

      if (surface === 'side') {
        const solid = bodyGroup.children.filter((o) => o.isMesh && o !== paintPlate && o !== paintSleeve);
        const hits = raycaster.intersectObjects(solid, false);
        if (!hits[0]) return;
        const p = hits[0].point;
        // legközelebbi kontúrpont → t paraméter
        let bestI = 0;
        let bestD = Infinity;
        for (let i = 0; i < geo.pts.length; i += 1) {
          const d = Math.hypot(geo.pts[i].x - p.x, geo.pts[i].y - p.z);
          if (d < bestD) { bestD = d; bestI = i; }
        }
        item.t = bestI / geo.pts.length;
        const baseY = geo.topY - geo.height;
        item.h = clamp((p.y - baseY) / geo.height, 0.18, 0.86);
        placeItem(item);
      } else if (surface === 'table') {
        dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0.32, 0));
        if (!raycaster.ray.intersectPlane(dragPlane, tmp)) return;
        const r = Math.hypot(tmp.x, tmp.z);
        const min = geo.boardR + 1.8;
        const k = r < min ? min / (r || 1) : 1;
        item.x = tmp.x * k;
        item.z = tmp.z * k;
        placeItem(item);
      } else {
        dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, geo.topY, 0));
        if (!raycaster.ray.intersectPlane(dragPlane, tmp)) return;
        {
          item.t = undefined;
          item.h = undefined;
          const r = itemRadius(item.type, item);
          const [x, z] = pullInside(geo.pts, tmp.x, tmp.z, r * 1.02);
          // ne csússzon egymásba
          let fx = x;
          let fz = z;
          for (const other of items) {
            if (other === item || surfaceOf(other) !== 'top') continue;
            const dx = fx - other.x;
            const dz = fz - other.z;
            const d = Math.hypot(dx, dz);
            const min = r + itemRadius(other.type);
            if (d < min && d > 0.0001) {
              fx = other.x + (dx / d) * min;
              fz = other.z + (dz / d) * min;
            }
          }
          [fx, fz] = pullInside(geo.pts, fx, fz, r * 1.02);
          item.x = fx;
          item.z = fz;
          placeItem(item);
          onChange({ items: serialiseItems() });
        }
      }
      updateGizmo();
    }
  }

  function onPointerUp(ev) {
    if (!current) return;
    if (ev?.pointerId !== undefined) {
      try { renderer.domElement.releasePointerCapture(ev.pointerId); } catch { /* nincs capture */ }
    }
    if (current.kind === 'krem') {
      if (current.mesh) {
        pipeGroup.remove(current.mesh);
        current.mesh.geometry.dispose();
      }
      if (!current.stroke) { current = null; return; }
      if (current.moved && current.stroke.pts.length >= 2) {
        addStrokeMesh(current.stroke);
      } else {
        // nem húzta: egyetlen csepp kerül oda, ahova koppintott
        if (current.moved) strokes.pop();
        const drop = {
          type: 'drop', color: pipe.color, size: pipe.size * 1.5, tip: pipe.tip,
          pts: [current.stroke.pts[0]], n: current.n,
        };
        strokes.push(drop);
        addStrokeMesh(drop);
      }
      onChange({ strokes: strokes.length });
    }
    if (current.kind === 'paint') onChange({ painted: true });
    if (current.kind === 'erase') onChange({ strokes: strokes.length });
    current = null;
    mark();
  }

  const el = renderer.domElement;
  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerup', onPointerUp);
  el.addEventListener('pointercancel', onPointerUp);
  // Biztonsagi halo: ha a pointer-fogas nem jott letre (pl. a mutatot a
  // vaszonon KIVUL engedik el), a vonas kulonben nyitva maradna, es a
  // kovetkezo mozgatas tovabb festene.
  const endAnywhere = (ev) => { if (current) onPointerUp(ev); };
  window.addEventListener('pointerup', endAnywhere);
  window.addEventListener('pointercancel', endAnywhere);
  window.addEventListener('blur', endAnywhere);
  controls.addEventListener('change', mark);

  /* ================================================================ */
  /* Render                                                            */
  /* ================================================================ */

  /* A renderelés igény szerint fut, de soha nem támaszkodik kizárólag a
     requestAnimationFrame-re: háttérfülön és beágyazott, nem festett
     keretben az sosem érkezik meg, és a vászon üresen maradna. */
  let raf = 0;
  let fallback = 0;
  let time = 0;
  let lastW = 0;
  let lastH = 0;
  let hasRendered = false;

  /** A vaszon meretezese. Ha a beagyazo elem meg nincs kimerve (0 szelesseg),
   *  NEM rogzitunk tartalek meretet — kulonben a jelenet orokre 640x420-nak
   *  hiszi magat, a CSS pedig szethuzza a kepet, es a mentett PNG is nyujtott
   *  lesz. Ilyenkor csak varunk a kovetkezo meresre. */
  function resize() {
    const w = Math.round(mount.clientWidth);
    const h = Math.round(mount.clientHeight);
    if (w < 2 || h < 2) return false;
    if (w === lastW && h === lastH) return false;
    lastW = w;
    lastH = h;
    renderer.setSize(w, h, false);
    // explicit CSS meret is: igy a rajzolt kep es a layout box mindig egyezik
    renderer.domElement.style.width = `${w}px`;
    renderer.domElement.style.height = `${h}px`;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (geo.pts.length) frameCamera(true);
    dirty = true;
    return true;
  }

  function tick() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    clearTimeout(fallback);
    resize();
    const moving = controls.update();
    time += 0.033;
    if (sparkles) {
      sparkles.material.opacity = 0.82 + Math.sin(time * 1.9) * 0.16;
      dirty = true;
    }
    if (moving || dirty) {
      renderer.render(scene, camera);
      dirty = false;
      hasRendered = true;
    }
    if (moving || sparkles || controls.autoRotate) schedule();
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; tick(); });
    clearTimeout(fallback);
    fallback = setTimeout(tick, 64);
  }

  resize();
  schedule();

  /** Orjarat: a renderelesi eletciklustol FUGGETLENUL ujramer es ujrarajzol.
   *  Hattersfulon, nem festett beagyazott keretben sem a rAF, sem a
   *  ResizeObserver nem erkezik meg — ez a halo fogja meg azt az esetet. */
  const watchdog = setInterval(() => {
    const w = Math.round(mount.clientWidth);
    const h = Math.round(mount.clientHeight);
    if (w < 2 || h < 2) return;
    if (w !== lastW || h !== lastH) {
      resize();
      schedule();
      return;
    }
    // ha meg sosem rajzoltunk, probaljuk ujra
    if (!hasRendered) schedule();
  }, 300);

  const ro = new ResizeObserver(mark);
  ro.observe(mount);
  window.addEventListener('resize', mark);

  const serialiseItems = () => items.map(({ obj, ...rest }) => rest);

  /* ================================================================ */
  /* Publikus API                                                      */
  /* ================================================================ */

  return {
    update(next, product) { applyConfig(next, product); },
    setTool(next) {
      tool = next;
      // Csak a szerkeszto modban van kijeloles: kulonben a gyuru dekoracionak
      // latszo kort huzott a torta tetejere.
      if (tool !== 'move') {
        selected = null;
        updateGizmo();
        onSelect(null);
      }
      applyControlMode();
    },
    setBrush(next) { brush = { ...brush, ...next }; },
    setPipe(next) { pipe = { ...pipe, ...next }; },
    /** Virágfajta és alapszín váltása minden élővirágon. */
    /** EGY kivalasztott szal fajtaja — a tobbi erintetlen marad. */
    flowerSelected(kind) {
      if (!selected || selected.type !== 'virag') return;
      selected.flower = kind;
      const id = selected.id;
      rebuildDecor();
      selected = items.find((i) => i.id === id) ?? null;
      updateGizmo();
      onChange({ items: serialiseItems() });
      mark();
    },
    /** A kijelolt elem attetele a tetorol az oldalra es vissza. */
    surfaceSelected(surface) {
      if (!selected || !canMoveToSide(selected.type)) return;
      const id = selected.id;
      selected.surface = surface;
      if (surface === 'side') {
        if (selected.t === undefined) {
          const spot = freeSpot(selected.type, items.filter((i) => surfaceOf(i) === 'side').length);
          selected.t = spot.t ?? 0.5;
          selected.h = spot.h ?? 0.54;
        }
      } else {
        selected.t = undefined;
        selected.h = undefined;
        const spot = freeSpot(selected.type, 0);
        selected.x = spot.x;
        selected.z = spot.z;
        relaxItems();
      }
      rebuildDecor();
      selected = items.find((i) => i.id === id) ?? null;
      updateGizmo();
      onSelect(describe(selected));
      onChange({ items: serialiseItems() });
      mark();
    },
    setFlowerKind(kind) {
      items = items.map((i) => (i.type === 'virag' ? { ...i, flower: kind } : i));
      rebuildDecor();
      onChange({ items: serialiseItems() });
      mark();
    },
    setFlowerColor(hex) {
      items = items.map((i) => (i.type === 'virag' ? { ...i, color: hex } : i));
      rebuildDecor();
      onChange({ items: serialiseItems() });
      mark();
    },
    setFlowerScale(scale) {
      items = items.map((i) => (i.type === 'virag' ? { ...i, scale } : i));
      relaxItems();
      rebuildDecor();
      onChange({ items: serialiseItems() });
      mark();
    },
    /** "Vegyes": szezonalis viragmix — szalankent MAS szin ES mas fajta,
     *  ahogy a muhely osszevalogatja. Korabban csak a szint valtogatta, es
     *  az egyforma fajtak miatt alig latszott a kulonbseg. */
    setFlowerMix(pal, kinds) {
      let k = 0;
      items = items.map((i) => {
        if (i.type !== 'virag') return i;
        const n = k;
        k += 1;
        return {
          ...i,
          color: pal[n % pal.length],
          flower: kinds && kinds.length ? kinds[(n * 2 + 1) % kinds.length] : i.flower,
          scale: (i.scale ?? 1) * (0.9 + ((n * 37) % 5) * 0.05),
        };
      });
      relaxItems();
      rebuildDecor();
      onChange({ items: serialiseItems() });
      mark();
    },
    setPatternMotif(motif) {
      patternItems = patternItems.map((p) => ({ ...p, motif }));
      config.patternItems = patternItems.map(({ obj, ...rest }) => rest);
      rebuildPattern();
      selected = null;
      updateGizmo();
      onSelect(null);
      mark();
    },
    setPatternColor(hex) {
      patternItems = patternItems.map((p) => ({ ...p, color: hex }));
      config.patternItems = patternItems.map(({ obj, ...rest }) => rest);
      rebuildPattern();
      mark();
    },
    setAutoRotate(on) { controls.autoRotate = on; controls.autoRotateSpeed = 0.9; mark(); },
    resetView() { frameCamera(false); },
    placeDecor(type) {
      const item = addItem(type);
      rebuildDecor();
      selected = item;
      updateGizmo();
      onChange({ items: serialiseItems() });
      return item;
    },
    removeSelected() {
      if (!selected || selected.kind !== 'decor' && ['letter', 'motif', 'text', 'patternset'].includes(selected.kind)) return false;
      items = items.filter((i) => i !== selected);
      selected = null;
      rebuildDecor();
      onChange({ items: serialiseItems() });
      return true;
    },
    rotateSelected(delta) {
      if (!selected) return;
      selected.rot = (selected.rot ?? 0) + delta;
      if (selected.kind === 'text') {
        config.text.rot = selected.rot;
        refreshText();
        onChange({ text: { ...config.text } });
        return;
      }
      if (selected.kind === 'letter') {
        placeLetter(selected);
        storeLetter(selected);
        onChange({ text: { ...config.text } });
      } else if (selected.kind === 'motif') {
        placeMotif(selected);
        storeMotif(selected);
        onChange({ pattern: config.patternItems });
      } else {
        placeItem(selected);
        onChange({ items: serialiseItems() });
      }
      updateGizmo();
    },
    /** Egyetlen betu vagy minta szinezese. */
    colorSelected(hex) {
      if (!selected) return;
      selected.color = hex;
      if (selected.kind === 'patternset') {
        patternItems = patternItems.map((p) => ({ ...p, color: hex }));
        config.patternItems = patternItems.map(({ obj, ...rest }) => rest);
        config.patternColor = hex;
        rebuildPattern();
        selected = patternSetItem;
        onChange({ pattern: config.patternItems });
        updateGizmo();
        mark();
        return;
      }
      if (selected.kind === 'text') {
        config.text.color = hex;
        updateText();
        selected = letterItems[0] ?? null;
        onChange({ text: { ...config.text } });
        updateGizmo();
        mark();
        return;
      }
      if (selected.kind !== 'letter' && selected.kind !== 'motif') {
        const id = selected.id;
        rebuildDecor();
        selected = items.find((i) => i.id === id) ?? null;
        onChange({ items: serialiseItems() });
        updateGizmo();
        mark();
        return;
      }
      if (selected.kind === 'letter') {
        storeLetter(selected);
        updateText();
        selected = letterItems[selected.index] ?? null;
        onChange({ text: { ...config.text } });
      } else if (selected.kind === 'motif') {
        storeMotif(selected);
        rebuildPattern();
        selected = patternItems.find((p) => p.id === selected.id) ?? null;
        onChange({ pattern: config.patternItems });
      }
      updateGizmo();
      mark();
    },
    scaleSelected(scale) {
      if (!selected) return;
      selected.scale = scale;
      if (selected.kind === 'patternset') {
        selected.obj.scale.setScalar(scale);
        onChange({ pattern: config.patternItems });
        updateGizmo();
        mark();
        return;
      }
      if (selected.kind === 'text') {
        config.text.size = scale;
        updateText();
        selected = letterItems[0] ?? null;
        onChange({ text: { ...config.text } });
        updateGizmo();
        mark();
        return;
      }
      if (selected.kind !== 'letter' && selected.kind !== 'motif') {
        const id = selected.id;
        relaxItems();
        selected = items.find((i) => i.id === id) ?? selected;
        onChange({ items: serialiseItems() });
        updateGizmo();
        mark();
        return;
      }
      if (selected.kind === 'letter') {
        placeLetter(selected);
        storeLetter(selected);
        selected.radius = (selected.radius ?? 0.6);
        onChange({ text: { ...config.text } });
      } else if (selected.kind === 'motif') {
        storeMotif(selected);
        rebuildPattern();
        selected = patternItems.find((p) => p.id === selected.id) ?? null;
        onChange({ pattern: config.patternItems });
      }
      updateGizmo();
      mark();
    },
    /** Betukre bontas es visszavonas. */
    splitText(on) {
      config.text.split = !!on;
      if (!on) config.text.letters = {};
      updateText();
      selected = null;
      updateGizmo();
      onSelect(null);
      onChange({ text: { ...config.text } });
      mark();
    },
    /** A felirat teljes alaphelyzete: kozepre, egyben, alapszinnel. */
    resetText() {
      config.text = {
        ...config.text, split: false, letters: {},
        x: 0, z: -0.05, rot: 0, size: 1,
      };
      updateText();
      selected = null;
      updateGizmo();
      onSelect(null);
      onChange({ text: { ...config.text } });
      mark();
    },
    splitPattern(on) {
      config.patternSplit = !!on;
      rebuildPattern();
      selected = null;
      updateGizmo();
      onSelect(null);
      onChange({ pattern: config.patternItems });
      mark();
    },
    resetPattern() {
      config.patternSplit = false;
      patternItems = defaultPattern(config.pattern, config.patternColor ?? '#b68e88');
      config.patternItems = patternItems.map(({ obj, ...rest }) => rest);
      rebuildPattern();
      selected = null;
      updateGizmo();
      onSelect(null);
      onChange({ pattern: config.patternItems });
      mark();
    },
    /** A betu visszater az alapsorba. */
    resetSelected() {
      if (selected?.kind !== 'letter') return;
      selected.dx = 0;
      selected.dz = 0;
      selected.rot = config.text.rot ?? 0;
      selected.scale = 1;
      placeLetter(selected);
      storeLetter(selected);
      onChange({ text: { ...config.text } });
      updateGizmo();
      mark();
    },
    undoStroke() {
      strokes.pop();
      rebuildStrokes();
      onChange({ strokes: strokes.length });
      mark();
    },
    clearStrokes() {
      strokes = [];
      rebuildStrokes();
      onChange({ strokes: 0 });
      mark();
    },
    clearPaint() {
      paintCtx.clearRect(0, 0, paintCv.width, paintCv.height);
      sideCtx.clearRect(0, 0, sideCv.width, sideCv.height);
      paintTex.needsUpdate = true;
      sideTex.needsUpdate = true;
      onChange({ painted: false });
      mark();
    },
    hasPaint() {
      const d = paintCtx.getImageData(0, 0, paintCv.width, paintCv.height).data;
      for (let i = 3; i < d.length; i += 4 * 97) if (d[i] > 6) return true;
      return false;
    },
    strokeCount: () => strokes.length,
    itemList: () => serialiseItems(),
    /** Teljes műállapot: ezt termékenként mentjük, így a desszertek között
     *  váltva mindegyik megőrzi a saját tervlépéseit. */
    artState() {
      return {
        strokes: JSON.parse(JSON.stringify(strokes)),
        items: serialiseItems(),
        paint: paintCv.toDataURL('image/png'),
        side: sideCv.toDataURL('image/png'),
      };
    },
    /** Visszaallitja egy termek elmentett tervlepeseit. A visszatoltott
     *  dekor ATMEGY a katalogusszuron: a masik desszertrol atszivargott
     *  elemek (pl. cseresznye a bento tortan) es a kotott darabszamok
     *  (bento: 1 gyertya, egyedi torta: 3) igy nem sertik a katalogust. */
    setArtState(art, product) {
      strokes = art?.strokes ? JSON.parse(JSON.stringify(art.strokes)) : [];
      rebuildStrokes();
      items = art?.items ? art.items.map((i) => ({ ...i })) : [];
      if (product && config) {
        syncItems(product, config);
        for (const it of items) {
          if (surfaceOf(it) !== 'top') continue;
          const [x, z] = pullInside(geo.pts, it.x ?? 0, it.z ?? 0, itemRadius(it.type, it));
          it.x = x;
          it.z = z;
        }
        relaxItems();
      }
      rebuildDecor();
      for (const [ctx, cv, tex, src] of [[paintCtx, paintCv, paintTex, art?.paint], [sideCtx, sideCv, sideTex, art?.side]]) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, cv.width, cv.height);
        tex.needsUpdate = true;
        if (!src) continue;
        const img = new Image();
        img.onload = () => {
          ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(img, 0, 0);
          tex.needsUpdate = true;
          mark();
        };
        img.src = src;
      }
      onChange({ strokes: strokes.length, items: serialiseItems() });
      mark();
    },
    /** Az „egyedi rajz" extra ki-be kapcsolása nem törli a munkát, csak elrejti. */
    setArtVisible(on) {
      if (paintPlate) paintPlate.visible = on;
      if (paintSleeve) paintSleeve.visible = on;
      pipeGroup.visible = on;
      mark();
    },
    hasArt() {
      if (strokes.length) return true;
      for (const [ctx, cv] of [[paintCtx, paintCv], [sideCtx, sideCv]]) {
        const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
        for (let i = 3; i < d.length; i += 4 * 61) if (d[i] > 6) return true;
      }
      return false;
    },
    /** Mentéshez: film grain és lágy vignetta a nyers képre. */
    snapshot(scale = 2) {
      const hadGizmo = gizmo.visible;
      gizmo.visible = false;
      gizmoHandle.visible = false;
      resize();
      renderer.render(scene, camera);
      const src = renderer.domElement;
      const out = document.createElement('canvas');
      out.width = src.width;
      out.height = src.height;
      const ctx = out.getContext('2d');
      ctx.drawImage(src, 0, 0);
      const vg = ctx.createRadialGradient(out.width / 2, out.height * 0.46, Math.min(out.width, out.height) * 0.22, out.width / 2, out.height * 0.5, Math.max(out.width, out.height) * 0.72);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(78,52,48,.16)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, out.width, out.height);
      const grain = ctx.getImageData(0, 0, out.width, out.height);
      const g = grain.data;
      for (let i = 0; i < g.length; i += 4) {
        const n = (Math.random() - 0.5) * 7;
        g[i] += n;
        g[i + 1] += n;
        g[i + 2] += n;
      }
      ctx.putImageData(grain, 0, 0);
      if (hadGizmo) updateGizmo();
      mark();
      return out.toDataURL('image/png');
    },
    paintDataUrl() { return paintCv.toDataURL('image/png'); },
    /** Fejlesztői hozzáférés: nézetbeállítás és jelenet-ellenőrzés. */
    setView(polar, azimuth) {
      const d = camera.position.distanceTo(controls.target);
      camera.position.set(
        controls.target.x + d * Math.sin(polar) * Math.sin(azimuth),
        controls.target.y + d * Math.cos(polar),
        controls.target.z + d * Math.sin(polar) * Math.cos(azimuth),
      );
      controls.update();
      mark();
    },
    debug: {
      scene, camera, controls, geometry: () => geo,
      selectedInfo: () => (selected ? { kind: selected.kind, rot: selected.rot, index: selected.index } : null),
      probe(px, py) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.set((px / rect.width) * 2 - 1, -((py / rect.height) * 2 - 1));
        raycaster.setFromCamera(pointer, camera);
        const targets = [...decorGroup.children, ...letterGroup.children, ...patternGroup.children];
        const hits = raycaster.intersectObjects(targets, true);
        const tm = letterGroup.children[0];
        return {
          tool, targets: targets.length,
          letterKids: letterGroup.children.length,
          rayOrigin: raycaster.ray.origin.toArray().map((n) => +n.toFixed(1)),
          rayDir: raycaster.ray.direction.toArray().map((n) => +n.toFixed(3)),
          near: raycaster.near, far: raycaster.far,
          distToText: tm ? +raycaster.ray.distanceToPoint(tm.position).toFixed(2) : null,
          directHit: tm ? raycaster.intersectObject(tm, false).length : null,
          bodyHit: raycaster.intersectObjects(bodyGroup.children, false).length,
          hits: hits.map((x) => ({ type: x.object.type, kind: x.object.userData?.item?.kind ?? null })),
        };
      },
    },
    dispose() {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
      clearInterval(watchdog);
      ro.disconnect();
      window.removeEventListener('resize', mark);
      controls.dispose();
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('pointerup', endAnywhere);
      window.removeEventListener('pointercancel', endAnywhere);
      window.removeEventListener('blur', endAnywhere);
      renderer.dispose();
      mount.removeChild(el);
    },
  };
}
