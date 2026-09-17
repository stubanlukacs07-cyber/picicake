import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { HERO_SLIDES } from '../data/products';

const SLIDE_MS = 6000;

/**
 * Kezdőlapi slider. A jelenlegi oldal megoldásának React változata:
 * áttűnés, bal oldali szövegblokk, és a lenti pontok közül az aktív
 * sávvá alakul, benne haladó kitöltéssel.
 */
export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  /* A váltás ütemezése minden dia után újraindul. Szándékosan NEM állítjuk meg
     egérrel: korábban a haladássáv végigment, de a dia nem váltott, mert a
     kurzor a slider fölött volt. */
  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => setIndex((i) => (i + 1) % HERO_SLIDES.length),
      SLIDE_MS,
    );
    return () => window.clearTimeout(timer.current);
  }, [index]);

  // A második dia képét előre betöltjük, hogy ne pislogjon váltáskor.
  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, []);

  const active = HERO_SLIDES[index];

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Kiemelt ajánlatok"
    >
      <div className="hero__stage">
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={slide.image}
            className="hero__slide"
            data-active={i === index}
            style={{ backgroundImage: `url("${slide.image}")` }}
            role="group"
            aria-roledescription="dia"
            aria-label={`${i + 1} / ${HERO_SLIDES.length}`}
            aria-hidden={i !== index}
          />
        ))}

        <div className="hero__overlay" key={active.title}>
          <span className="hero__label">{active.label}</span>
          <h1 className="hero__title">{active.title}</h1>
          <Link to={active.to} className="btn btn--outline-light">{active.cta}</Link>
        </div>
      </div>

      <div className="hero__dots">
        {HERO_SLIDES.map((slide, i) => (
          <button
            key={slide.image}
            type="button"
            className="hero__dot"
            aria-current={i === index}
            aria-label={`${i + 1}. dia: ${slide.title}`}
            style={i === index ? ({ '--slide-ms': `${SLIDE_MS}ms` } as React.CSSProperties) : undefined}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
