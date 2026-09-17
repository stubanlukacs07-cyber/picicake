import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DesignerMobileBar from '../components/DesignerMobileBar';
import { DESIGNER_MARKUP } from '../designer/markup';
import { initDesigner } from '../designer/ui.js';
import type { DesignerOrder } from '../designer/types';
import { toPreset } from '../designer/preset';
/* A webshop styles.css-e után töltődik, így a lenti szigetelő reset érvényesül. */
import '../designer/designer.css';

/**
 * A Claude Designtól érkezett desszerttervező beépítve.
 * A markup statikus váz, a felületet a designer/ui.js tölti fel és kezeli;
 * innen csak felszereljük, és elkapjuk a „tovább a termékhez" eseményt.
 */
export default function CakeBuilder() {
  const root = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  /* a navigate friss referenciája, hogy az init effekt ne fusson újra miatta */
  const go = useRef(navigate);
  go.current = navigate;

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    let teardown: (() => void) | undefined;
    let alive = true;

    initDesigner(el, {
      onGoToProduct: (order: DesignerOrder) => {
        const preset = toPreset(order);
        go.current(`/termek/${order.slug}`, { state: { preset } });
      },
    })
      .then((dispose: () => void) => {
        if (alive) teardown = dispose;
        else dispose?.();
      })
      .catch((err: unknown) => {
        console.error('[tervező] indítási hiba', err);
      });

    return () => {
      alive = false;
      teardown?.();
    };
  }, []);

  return (
    <div className="pc-designer">
      <div className="wrap" ref={root} dangerouslySetInnerHTML={{ __html: DESIGNER_MARKUP }} />
      {/* Telefonon ikonsáv + alsó lap: egyszerre csak egy beállításcsoport látszik. */}
      <DesignerMobileBar root={root} />
    </div>
  );
}
