import { getProduct } from '../data/products';
import type { DesignerOrder, Preset } from './types';

/**
 * A tervező kimenetét a termékoldal opcióira képezi le.
 * Csak olyan értéket ad át, ami az adott terméknél tényleg létezik — így
 * nem keletkezik érvénytelen választás a legördülőkben.
 */
export function toPreset(order: DesignerOrder): Preset {
  const product = getProduct(order.slug);
  const picks: Record<string, string> = {};
  const checked: Record<string, string[]> = {};

  const groupOf = (id: string) => product?.options?.find((g) => g.id === id);
  const exists = (id: string, label: string) =>
    Boolean(groupOf(id)?.choices.some((c) => c.label === label));

  for (const pick of order.picks) {
    if (exists(pick.group, pick.value)) picks[pick.group] = pick.value;
  }
  for (const extra of order.checked) {
    if (!exists(extra.group, extra.label)) continue;
    checked[extra.group] = [...(checked[extra.group] ?? []), extra.label];
  }

  const summary = [
    ...order.picks.map((p) => `${p.label}: ${p.value}`),
    ...(order.checked.length ? [`Extrák: ${order.checked.map((c) => c.label).join(', ')}`] : []),
  ].join(' · ');

  return {
    slug: order.slug,
    picks,
    checked,
    felirat: order.felirat,
    images: order.images ?? [],
    summary,
  };
}
