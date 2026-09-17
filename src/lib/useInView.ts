import { useEffect, useRef, useState } from 'react';

/**
 * Megjelenéskor induló animációkhoz: igazra állítja a jelzőt, amint az elem
 * belép a képernyőbe. Csökkentett animációt kérő beállítás esetén azonnal igaz,
 * így semmi nem marad láthatatlan.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(threshold = 0.04) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -60px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, inView, cls: inView ? 'is-in' : '' };
}
