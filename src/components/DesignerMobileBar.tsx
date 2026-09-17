import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Mobil burkolat a tervezőhöz.
 *
 * Asztali gépen a jobb oldali panel jó, telefonon viszont szűk és nehezen
 * kezelhető. Itt ezért Paint-szerű megoldást adunk: a vászon alatt egy ikonsáv
 * van, és egy ikonra koppintva alsó lapként felcsúszik CSAK az az egy
 * szakasz. A vászon közben látszik, így minden állítás azonnal ellenőrizhető.
 *
 * A panelt a tervező (designer/ui.js) rendereli újra, ezért a szakaszokat
 * MutationObserverrel követjük, és az ikonsávot mindig hozzáigazítjuk.
 */

/** A szakaszok felirata alapján választott ikon. */
const ICONS: { match: RegExp; icon: string }[] = [
  { match: /tervez/i, icon: '🧁' },
  { match: /íz|geschmack|flavour/i, icon: '🍓' },
  { match: /szelet|méret|size|größe|anzahl/i, icon: '📐' },
  { match: /forma|shape|form/i, icon: '⬤' },
  { match: /krém színe|cremefarbe|frosting/i, icon: '🎨' },
  { match: /habszegély|cremerand|border/i, icon: '〰️' },
  { match: /minta|muster|pattern/i, icon: '✳️' },
  { match: /extr/i, icon: '✨' },
  { match: /virág|blüte|flower/i, icon: '🌸' },
  { match: /dekor/i, icon: '🍒' },
  { match: /felirat|schriftzug|letter/i, icon: '✍️' },
  { match: /kanál|löffel|spoon/i, icon: '🥄' },
];

const iconFor = (label: string) => ICONS.find((i) => i.match.test(label))?.icon ?? '⚙️';

/** Rövid címke az ikon alá, hogy ne csak a kép beszéljen. */
const shortLabel = (label: string) => label.split('—')[0].trim().split(/\s+/).slice(0, 2).join(' ');

type Section = { index: number; label: string; icon: string };

export default function DesignerMobileBar({ root }: { root: React.RefObject<HTMLDivElement | null> }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const openRef = useRef<number | null>(null);
  openRef.current = open;

  /* Csak szűk kijelzőn jelenünk meg. */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1040px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  /** A panel szakaszainak láthatósága: csak a kiválasztott van nyitva. */
  const applyOpen = useCallback((which: number | null) => {
    const panel = root.current?.querySelector('#panel');
    if (!panel) return;
    const items = Array.from(panel.querySelectorAll<HTMLDetailsElement>('details.sec'));
    items.forEach((el, i) => {
      el.open = which === i;
      el.hidden = which !== null && which !== i;
    });
  }, [root]);

  /** Szakaszlista beolvasása a panelből. */
  const readSections = useCallback(() => {
    const panel = root.current?.querySelector('#panel');
    if (!panel) return;
    const items = Array.from(panel.querySelectorAll<HTMLDetailsElement>('details.sec'));
    const next = items.map((el, index) => {
      const label = el.querySelector('summary')?.textContent?.trim() ?? `Beállítás ${index + 1}`;
      return { index, label, icon: iconFor(label) };
    });
    setSections((prev) => (
      prev.length === next.length && prev.every((p, i) => p.label === next[i].label) ? prev : next
    ));
    applyOpen(openRef.current);
  }, [root, applyOpen]);

  /* A tervező újrarendereli a panelt — minden változás után újraolvasunk. */
  useEffect(() => {
    if (!isMobile) return;
    const panel = root.current?.querySelector('#panel');
    if (!panel) return;
    readSections();
    const mo = new MutationObserver(() => readSections());
    mo.observe(panel, { childList: true, subtree: false });
    return () => mo.disconnect();
  }, [isMobile, root, readSections]);

  /* A gyökérre jelzés megy, hogy a CSS tudja: mobil lap nyitva van-e. */
  useEffect(() => {
    const el = root.current?.closest('.pc-designer') as HTMLElement | null;
    if (!el) return;
    el.dataset.mobile = isMobile ? 'true' : 'false';
    el.dataset.sheet = isMobile && open !== null ? 'open' : 'closed';
    return () => { delete el.dataset.sheet; };
  }, [isMobile, open, root]);

  /* Nézetváltásnál és kilépéskor minden szakasz visszanyílik. */
  useEffect(() => {
    if (isMobile) return;
    const panel = root.current?.querySelector('#panel');
    panel?.querySelectorAll<HTMLDetailsElement>('details.sec').forEach((el) => {
      el.hidden = false;
      el.open = true;
    });
    setOpen(null);
  }, [isMobile, root]);

  useEffect(() => { applyOpen(open); }, [open, applyOpen]);

  if (!isMobile || sections.length === 0) return null;

  const active = open !== null ? sections[open] : null;

  return (
    <>
      <div className="mbar" role="toolbar" aria-label="Szerkesztő eszközök">
        {sections.map((s) => (
          <button
            key={s.label}
            type="button"
            className="mbar__btn"
            aria-pressed={open === s.index}
            onClick={() => {
              const next = open === s.index ? null : s.index;
              setOpen(next);
              /* Lap nyitásakor a vászonhoz ugrunk, hogy látszódjon,
                 amit éppen állítasz. */
              if (next !== null) {
                requestAnimationFrame(() => {
                  const stage = root.current?.querySelector('.stage');
                  if (stage) stage.scrollIntoView({ block: 'start', behavior: 'smooth' });
                  else window.scrollTo({ top: 0, behavior: 'smooth' });
                });
              }
            }}
          >
            <span className="mbar__icon" aria-hidden="true">{s.icon}</span>
            <span className="mbar__label">{shortLabel(s.label)}</span>
          </button>
        ))}
      </div>

      {active && (
        <div className="msheet__head">
          <strong>{active.label}</strong>
          <button type="button" className="msheet__close" onClick={() => setOpen(null)} aria-label="Bezárás">×</button>
        </div>
      )}
    </>
  );
}
