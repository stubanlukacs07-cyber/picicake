import { useMemo, useState } from 'react';
import { toInputDate } from '../lib/format';
import { IconLeft, IconRight } from './Bits';

const DOW = ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'];
const MONTHS = [
  'január', 'február', 'március', 'április', 'május', 'június',
  'július', 'augusztus', 'szeptember', 'október', 'november', 'december',
];

type Props = {
  value: string;
  onChange: (date: string) => void;
  /** Legkorábbi választható nap (YYYY-MM-DD). */
  min: string;
  /** Meddig lehet előre foglalni. */
  monthsAhead?: number;
  /** Betelt napok (YYYY-MM-DD). Később endpointból is jöhet. */
  unavailable?: string[];
};

export default function Calendar({ value, onChange, min, monthsAhead = 3, unavailable = [] }: Props) {
  const minDate = new Date(`${min}T12:00:00`);
  const [cursor, setCursor] = useState(() => {
    const base = value ? new Date(`${value}T12:00:00`) : minDate;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const maxDate = useMemo(() => {
    const d = new Date(minDate);
    d.setMonth(d.getMonth() + monthsAhead);
    return d;
  }, [min, monthsAhead]);

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    // hétfővel kezdődő hét
    const offset = (first.getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const out: (Date | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= days; d += 1) out.push(new Date(year, month, d, 12));
    return out;
  }, [cursor]);

  const canPrev = cursor > new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const canNext = cursor < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  const shift = (n: number) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1));

  return (
    <div className="cal">
      <div className="cal__head">
        <button type="button" className="cal__nav" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Előző hónap">
          <IconLeft />
        </button>
        <strong>{cursor.getFullYear()}. {MONTHS[cursor.getMonth()]}</strong>
        <button type="button" className="cal__nav" onClick={() => shift(1)} disabled={!canNext} aria-label="Következő hónap">
          <IconRight />
        </button>
      </div>

      <div className="cal__grid" role="grid" aria-label="Válassz napot">
        {DOW.map((d) => <div className="cal__dow" key={d}>{d}</div>)}
        {cells.map((date, i) => {
          if (!date) return <div className="cal__spacer" key={`e${i}`} aria-hidden="true" />;
          const iso = toInputDate(date);
          const disabled = date < minDate || date > maxDate || unavailable.includes(iso);
          return (
            <button
              key={iso}
              type="button"
              className="cal__day"
              disabled={disabled}
              aria-pressed={iso === value}
              aria-label={`${date.getFullYear()}. ${MONTHS[date.getMonth()]} ${date.getDate()}.`}
              onClick={() => onChange(iso)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
