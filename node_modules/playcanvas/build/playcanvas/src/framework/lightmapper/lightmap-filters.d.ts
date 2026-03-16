export class LightmapFilters {
    constructor(device: any);
    shaderDilate: any[];
    shaderDenoise: any[];
    device: any;
    constantTexSource: any;
    constantPixelOffset: any;
    pixelOffset: Float32Array<ArrayBuffer>;
    sigmas: Float32Array<ArrayBuffer>;
    constantSigmas: any;
    kernel: any;
    setSourceTexture(texture: any): void;
    prepare(textureWidth: any, textureHeight: any): void;
    prepareDenoise(filterRange: any, filterSmoothness: any, bakeHDR: any): void;
    constantKernel: any;
    bZnorm: any;
    getDenoise(bakeHDR: any): any;
    getDilate(device: any, bakeHDR: any): any;
    evaluateDenoiseUniforms(filterRange: any, filterSmoothness: any): void;
}
