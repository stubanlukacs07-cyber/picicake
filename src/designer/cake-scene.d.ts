export type CakeSceneApi = {
  update(config: any, product: any): void;
  artState(): any;
  setArtState(art: any, product: any): void;
  setTool(tool: string): void;
  setAutoRotate(on: boolean): void;
  resetView(): void;
  snapshot(scale?: number): string;
  dispose(): void;
  [key: string]: any;
};

export declare function createCakeScene(
  mount: HTMLElement,
  opts?: { onChange?: (info: any) => void; onSelect?: (sel: any) => void },
): CakeSceneApi;
