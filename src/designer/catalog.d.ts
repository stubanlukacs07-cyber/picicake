export declare const PRODUCTS: any[];
export declare function productBySlug(slug: string): any;
export declare function sizeOf(product: any, sizeId: string): any;
export declare function shapesFor(product: any, sizeId: string): any[];
export declare function buildOrder(product: any, config: any): import('./types').DesignerOrder;
export declare function formatFt(n: number): string;
