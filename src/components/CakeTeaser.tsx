import { useEffect, useRef } from 'react';
import { createCakeScene } from '../designer/cake-scene.js';
import type { CakeSceneApi } from '../designer/cake-scene';
import { productBySlug } from '../designer/catalog.js';
import { STORE, defaults, normalise } from '../designer/ui.js';

/**
 * A böngészőben mentett terv betöltése. A festés, a nyomott krém és a lerakott
 * dekor nem a configban él, hanem a jelenet „art” állapotában — ezért azt is
 * vissza kell tölteni, különben egy korábbi állapot látszik.
 */
function savedDesign() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) ?? 'null');
    if (raw?.config?.slug) {
      const config = normalise(raw.config);
      const art = raw.byProduct?.[config.slug]?.art ?? null;
      return { config, art };
    }
  } catch {
    /* nincs vagy sérült a mentés */
  }
  return { config: defaults(), art: null };
}

/**
 * Kezdőlapi néző: a legutóbb elmentett tervet mutatja, és csak forgatni
 * lehet. Szerkeszteni a tervező oldalon.
 */
export default function CakeTeaser() {
  const mount = useRef<HTMLDivElement>(null);
  const api = useRef<CakeSceneApi | null>(null);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    let scene: CakeSceneApi | null = null;
    try {
      scene = createCakeScene(el);
      const { config, art } = savedDesign();
      const product = productBySlug(config.slug);
      scene.update(config, product);
      if (art) scene.setArtState(art, product);
      scene.setTool('orbit');
      scene.setAutoRotate(true);
      api.current = scene;
    } catch (err) {
      console.error('[tervező néző] nem indult', err);
    }
    return () => {
      try { scene?.dispose(); } catch { /* már eldobva */ }
      api.current = null;
    };
  }, []);

  return (
    <div
      className="teaser3d"
      ref={mount}
      role="img"
      aria-label="A legutóbb elmentett 3D desszertterv — húzással körbeforgatható"
      onPointerDown={() => api.current?.setAutoRotate(false)}
    />
  );
}
