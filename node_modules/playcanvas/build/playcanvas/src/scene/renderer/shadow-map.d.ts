export class ShadowMap {
    static create(device: any, light: any): ShadowMap;
    static createAtlas(device: any, resolution: any, shadowType: any): ShadowMap;
    static create2dMap(device: any, size: any, shadowType: any): ShadowMap;
    static createCubemap(device: any, size: any, shadowType: any): ShadowMap;
    constructor(texture: any, targets: any);
    texture: any;
    cached: boolean;
    renderTargets: any;
    destroy(): void;
}
