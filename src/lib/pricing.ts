import { SERVICE_FEE_RATE } from '../data/config';
import type { Selection } from './cart';

export type Totals = {
  subtotal: number;
  shipping: number;
  paymentFee: number;
  serviceFee: number;
  total: number;
};

/**
 * A 3%-os rendszerhasználati díj a teljes rendelésre (termékek + szállítás +
 * fizetési felár) számolódik, és felül jön rá. Ha csak a termékek értékére
 * kellene, elég a `base` képletet átírni.
 */
export function computeTotals(subtotal: number, shipping = 0, paymentFee = 0): Totals {
  const base = subtotal + shipping + paymentFee;
  const serviceFee = Math.round(base * SERVICE_FEE_RATE);
  return { subtotal, shipping, paymentFee, serviceFee, total: base + serviceFee };
}

/** A kiválasztott opciók csoportonként összefogva (a multi csoportoknál több érték). */
export function groupSelections(selections: Selection[]) {
  const out: { groupId: string; groupLabel: string; values: string[] }[] = [];
  for (const s of selections) {
    const found = out.find((g) => g.groupId === s.groupId);
    if (found) found.values.push(s.label);
    else out.push({ groupId: s.groupId, groupLabel: s.groupLabel, values: [s.label] });
  }
  return out;
}
