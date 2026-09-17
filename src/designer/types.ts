/** A tervező kimenete (catalog.js → buildOrder), kiegészítve a mentett képpel. */
export type DesignerOrder = {
  slug: string;
  picks: { group: string; label: string; value: string; delta: number }[];
  checked: { group: string; label: string; delta: number }[];
  felirat?: string;
  total: number;
  images?: string[];
  config?: unknown;
};

/** A termékoldal ezt kapja meg útvonal-állapotban. */
export type Preset = {
  slug: string;
  picks: Record<string, string>;
  checked: Record<string, string[]>;
  felirat?: string;
  szinek?: string;
  images?: string[];
  summary?: string;
};
