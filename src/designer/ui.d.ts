export declare function initDesigner(
  root: HTMLElement,
  opts?: { onGoToProduct?: (order: import('./types').DesignerOrder) => void },
): Promise<() => void>;

export declare const STORE: string;
export declare function defaults(slug?: string): any;
export declare function normalise(cfg: any): any;
