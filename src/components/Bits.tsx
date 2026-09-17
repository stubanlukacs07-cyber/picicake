import { useState } from 'react';
import type { ReactNode } from 'react';
import { useInView } from '../lib/useInView';

const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const IconBag = () => (
  <svg viewBox="0 0 24 24" {...s} aria-hidden="true">
    <path d="M6 8h12l-1 12H7L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);
export const IconMenu = () => <svg viewBox="0 0 24 24" {...s} aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
export const IconClose = () => <svg viewBox="0 0 24 24" {...s} aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const IconSearch = () => <svg viewBox="0 0 24 24" width="20" height="20" {...s} aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>;
export const IconCheck = () => <svg viewBox="0 0 24 24" width="18" height="18" {...s} aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>;
export const IconLeft = () => <svg viewBox="0 0 24 24" width="17" height="17" {...s} aria-hidden="true"><path d="M14 6l-6 6 6 6" /></svg>;
export const IconRight = () => <svg viewBox="0 0 24 24" width="17" height="17" {...s} aria-hidden="true"><path d="M10 6l6 6-6 6" /></svg>;
export const IconDiagonal = () => <svg viewBox="0 0 24 24" width="18" height="18" {...s} aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>;
export const IconUpload = () => (
  <svg viewBox="0 0 24 24" {...s} aria-hidden="true"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
);
export const IconChevron = () => <svg viewBox="0 0 24 24" width="20" height="20" {...s} aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>;

/* ---- A kliens által megadott badge ikonok (20×20, currentColor) ---- */

const badgeSvg = {
  xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none',
} as const;
const p = { stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const BadgeGift = () => (
  <svg {...badgeSvg} aria-hidden="true">
    <path d="M16.875 6.25H3.125C2.77982 6.25 2.5 6.52982 2.5 6.875V9.375C2.5 9.72018 2.77982 10 3.125 10H16.875C17.2202 10 17.5 9.72018 17.5 9.375V6.875C17.5 6.52982 17.2202 6.25 16.875 6.25Z" {...p} />
    <path d="M16.25 10V15.625C16.25 15.7908 16.1842 15.9497 16.0669 16.0669C15.9497 16.1842 15.7908 16.25 15.625 16.25H4.375C4.20924 16.25 4.05027 16.1842 3.93306 16.0669C3.81585 15.9497 3.75 15.7908 3.75 15.625V10" {...p} />
    <path d="M10 6.25V16.25" {...p} />
    <path d="M13.8117 2.43849C14.5414 3.16818 14.5844 4.39631 13.8117 5.08068C12.4906 6.25021 10 6.25021 10 6.25021C10 6.25021 10 3.75959 11.1719 2.43849C11.8539 1.66584 13.082 1.70881 13.8117 2.43849Z" {...p} />
    <path d="M6.18849 2.43849C5.45881 3.16818 5.41584 4.39631 6.18849 5.08068C7.50959 6.25021 10.0002 6.25021 10.0002 6.25021C10.0002 6.25021 10.0002 3.75959 8.82834 2.43849C8.14631 1.66584 6.91818 1.70881 6.18849 2.43849Z" {...p} />
  </svg>
);

export const BadgeTruck = () => (
  <svg {...badgeSvg} aria-hidden="true">
    <path d="M14.375 6.25H17.7016C17.8261 6.24994 17.9478 6.28709 18.0511 6.35669C18.1544 6.42629 18.2345 6.52517 18.2812 6.64063L19.375 9.375" {...p} />
    <path d="M1.875 11.25H14.375" {...p} />
    <path d="M15 16.875C16.0355 16.875 16.875 16.0355 16.875 15C16.875 13.9645 16.0355 13.125 15 13.125C13.9645 13.125 13.125 13.9645 13.125 15C13.125 16.0355 13.9645 16.875 15 16.875Z" {...p} />
    <path d="M6.25 16.875C7.28553 16.875 8.125 16.0355 8.125 15C8.125 13.9645 7.28553 13.125 6.25 13.125C5.21447 13.125 4.375 13.9645 4.375 15C4.375 16.0355 5.21447 16.875 6.25 16.875Z" {...p} />
    <path d="M13.125 15H8.125" {...p} />
    <path d="M14.375 9.375H19.375V14.375C19.375 14.5408 19.3092 14.6997 19.1919 14.8169C19.0747 14.9342 18.9158 15 18.75 15H16.875" {...p} />
    <path d="M4.375 15H2.5C2.33424 15 2.17527 14.9342 2.05806 14.8169C1.94085 14.6997 1.875 14.5408 1.875 14.375V5.625C1.875 5.45924 1.94085 5.30027 2.05806 5.18306C2.17527 5.06585 2.33424 5 2.5 5H14.375V13.232" {...p} />
  </svg>
);

export const BadgeVerified = () => (
  <svg {...badgeSvg} aria-hidden="true">
    <path d="M4.25469 15.7453C3.53594 15.0266 4.0125 13.5164 3.64688 12.632C3.26719 11.7188 1.875 10.9766 1.875 10C1.875 9.02344 3.26719 8.28125 3.64688 7.36797C4.0125 6.48437 3.53594 4.97344 4.25469 4.25469C4.97344 3.53594 6.48437 4.0125 7.36797 3.64688C8.28516 3.26719 9.02344 1.875 10 1.875C10.9766 1.875 11.7188 3.26719 12.632 3.64688C13.5164 4.0125 15.0266 3.53594 15.7453 4.25469C16.4641 4.97344 15.9875 6.48359 16.3531 7.36797C16.7328 8.28516 18.125 9.02344 18.125 10C18.125 10.9766 16.7328 11.7188 16.3531 12.632C15.9875 13.5164 16.4641 15.0266 15.7453 15.7453C15.0266 16.4641 13.5164 15.9875 12.632 16.3531C11.7188 16.7328 10.9766 18.125 10 18.125C9.02344 18.125 8.28125 16.7328 7.36797 16.3531C6.48437 15.9875 4.97344 16.4641 4.25469 15.7453Z" {...p} />
    <path d="M6.875 10.625L8.75 12.5L13.125 8.125" {...p} />
  </svg>
);

export const BadgeCraft = () => (
  <svg {...badgeSvg} aria-hidden="true">
    <path d="M11.875 18.125L10 16.25L11.875 14.375" {...p} />
    <path d="M15.2047 5.875L14.518 8.43672L11.957 7.75" {...p} />
    <path d="M6.16953 10.9977L5.48203 8.4375L2.92188 9.12266" {...p} />
    <path d="M5.48192 8.4375L2.04442 14.375C1.93477 14.5649 1.87701 14.7804 1.87695 14.9997C1.8769 15.219 1.93454 15.4345 2.0441 15.6244C2.15366 15.8144 2.31128 15.9722 2.50112 16.0821C2.69097 16.1919 2.90636 16.2498 3.12567 16.25H6.87567" {...p} />
    <path d="M10 16.25H16.875C17.0943 16.2498 17.3097 16.1919 17.4996 16.0821C17.6894 15.9722 17.847 15.8144 17.9566 15.6244C18.0661 15.4345 18.1238 15.219 18.1237 14.9997C18.1237 14.7804 18.0659 14.5649 17.9562 14.375L16.1484 11.25" {...p} />
    <path d="M14.5187 8.43663L11.0812 2.49913C10.9715 2.30934 10.8137 2.15177 10.6238 2.04222C10.4339 1.93267 10.2185 1.875 9.99922 1.875C9.77997 1.875 9.56457 1.93267 9.37465 2.04222C9.18473 2.15177 9.02696 2.30934 8.91719 2.49913L7.10938 5.62413" {...p} />
  </svg>
);

/** A kliens badge komponense: fehér ikonkör, hoverre fekete háttér. */
export function FeatureBadge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="feature-badge">
      <div className="icon-circle">{icon}</div>
      <span>{label}</span>
    </div>
  );
}

export const IconInstagram = () => (
  <svg viewBox="0 0 24 24" {...s} aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="3.8" />
    <circle cx="17.2" cy="6.9" r=".9" fill="currentColor" stroke="none" />
  </svg>
);
export const IconFacebook = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
    <path d="M13.5 21v-7.2h2.5l.4-2.9h-2.9V9.1c0-.8.2-1.4 1.4-1.4h1.5V5.1C16.2 5 15.4 5 14.5 5c-2.2 0-3.7 1.3-3.7 3.8v2.1H8.3v2.9h2.5V21h2.7Z" />
  </svg>
);
export const IconTiktok = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
    <path d="M14.3 3h-2.5v11.6a2.1 2.1 0 1 1-1.6-2v-2.5a4.5 4.5 0 1 0 4.1 4.5V8.4a5 5 0 0 0 3.1 1.1V7A3 3 0 0 1 14.3 3Z" />
  </svg>
);

/** Kép helyőrzővel: ha nincs URL vagy nem töltődik be, monogramot mutat. */
export function Img({ src, alt, ratio, eager, className }: { src?: string; alt: string; ratio?: string; eager?: boolean; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={className}
        role="img"
        aria-label={alt}
        style={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%', aspectRatio: ratio, background: 'var(--blush)' }}
      >
        <span style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--brand)', opacity: .45 }}>{alt.slice(0, 1)}</span>
      </div>
    );
  }
  return <img className={className} src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} onError={() => setFailed(true)} />;
}

export function Stars({ value = 5 }: { value?: number }) {
  return <span className="stars" aria-label={`${value} az 5-ből`}>{'★'.repeat(Math.round(value))}</span>;
}

/** Csipkés szélű körcímke a termékkártyán. */
export function Burst({ label }: { label: string }) {
  const teeth = 22;
  const points = Array.from({ length: teeth * 2 }, (_, i) => {
    const angle = (Math.PI * i) / teeth - Math.PI / 2;
    const r = i % 2 === 0 ? 49 : 41;
    return `${(50 + r * Math.cos(angle)).toFixed(2)},${(50 + r * Math.sin(angle)).toFixed(2)}`;
  }).join(' ');

  return (
    <div className="burst">
      <svg viewBox="0 0 100 100" aria-hidden="true"><polygon points={points} fill="var(--blush)" /></svg>
      <span>{label}</span>
    </div>
  );
}

/** Blokk, ami a képernyőbe lépve finoman felcsúszik. */
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, cls } = useInView();
  return (
    <div ref={ref} className={`reveal ${cls} ${className}`.trim()} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
