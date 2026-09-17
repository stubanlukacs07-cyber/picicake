import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../data/products';

export type Selection = { groupId: string; groupLabel: string; label: string; delta: number };

export type CartLine = {
  /** slug + a kiválasztott opciók — így ugyanaz a termék más opcióval külön sor. */
  id: string;
  slug: string;
  name: string;
  image?: string;
  basePrice: number;
  unitPrice: number;
  qty: number;
  selections: Selection[];
  perishable: boolean;
  /** A 3D tervezőben mentett illusztrációk (data URL-ek), ha onnan jött a tétel. */
  designImages?: string[];
};

type Action =
  | { type: 'add'; line: CartLine }
  | { type: 'remove'; id: string }
  | { type: 'qty'; id: string; qty: number }
  | { type: 'clear' }
  | { type: 'hydrate'; lines: CartLine[] };

const STORAGE_KEY = 'picicake.cart.v1';

function reducer(state: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case 'hydrate':
      return action.lines;
    case 'add': {
      const existing = state.find((l) => l.id === action.line.id);
      if (existing) {
        return state.map((l) => (l.id === action.line.id ? { ...l, qty: l.qty + action.line.qty } : l));
      }
      return [...state, action.line];
    }
    case 'remove':
      return state.filter((l) => l.id !== action.id);
    case 'qty':
      return state
        .map((l) => (l.id === action.id ? { ...l, qty: Math.max(0, action.qty) } : l))
        .filter((l) => l.qty > 0);
    case 'clear':
      return [];
    default:
      return state;
  }
}

function read(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

function write(lines: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* privát mód / letiltott storage: a kosár csak a session idejére él */
  }
}

export const lineId = (slug: string, selections: Selection[]) =>
  [slug, ...selections.map((s) => `${s.groupId}:${s.label}`)].join('|');

export const buildLine = (product: Product, selections: Selection[], qty: number, designImages?: string[]): CartLine => {
  const unitPrice = product.price + selections.reduce((sum, s) => sum + s.delta, 0);
  return {
    id: lineId(product.slug, selections),
    slug: product.slug,
    name: product.name,
    image: product.images[0],
    basePrice: product.price,
    unitPrice,
    qty,
    selections,
    perishable: Boolean(product.perishable),
    designImages,
  };
};

type CartApi = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  hasPerishable: boolean;
  add: (product: Product, selections: Selection[], qty?: number, designImages?: string[]) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  justAdded: string | null;
};

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, [] as CartLine[]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const hydrated = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    dispatch({ type: 'hydrate', lines: read() });
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) write(lines);
  }, [lines]);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const add = useCallback((product: Product, selections: Selection[], qty = 1, designImages?: string[]) => {
    const line = buildLine(product, selections, qty, designImages);
    dispatch({ type: 'add', line });
    setJustAdded(line.id);
    setDrawerOpen(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setJustAdded(null), 2600);
  }, []);

  const remove = useCallback((id: string) => dispatch({ type: 'remove', id }), []);
  const setQty = useCallback((id: string, qty: number) => dispatch({ type: 'qty', id, qty }), []);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);

  const value = useMemo<CartApi>(() => {
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
    return {
      lines,
      count,
      subtotal,
      hasPerishable: lines.some((l) => l.perishable),
      add,
      remove,
      setQty,
      clear,
      drawerOpen,
      openDrawer,
      closeDrawer,
      justAdded,
    };
  }, [lines, drawerOpen, justAdded, add, remove, setQty, clear, openDrawer, closeDrawer]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart csak CartProvider-en belül használható');
  return ctx;
}
