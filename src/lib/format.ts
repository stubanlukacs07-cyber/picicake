/** Ezres tagolás ponttal — így jelenik meg a picicake.hu-n is (4.500 Ft, 11.000 Ft). */
const group = (value: number) =>
  Math.round(Math.abs(value)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const formatFt = (value: number) => `${value < 0 ? '−' : ''}${group(value)} Ft`;

export const formatDelta = (delta: number) =>
  delta === 0 ? '' : `${delta > 0 ? '+' : '−'}${group(delta)} Ft`;

/** Legkorábbi választható átvételi/szállítási nap (ma + átfutás). */
export const earliestDate = (leadTimeDays: number) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + leadTimeDays);
  return d;
};

export const toInputDate = (d: Date) => {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

export const formatDateHu = (value: string) => {
  if (!value) return '';
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
