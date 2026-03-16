export class LightsBuffer {
    constructor(device: any);
    areaLightsEnabled: boolean;
    device: any;
    cookiesEnabled: boolean;
    shadowsEnabled: boolean;
    maxLights: number;
    lightsFloat: Float32Array<ArrayBuffer>;
    lightsUint: Uint32Array<ArrayBuffer>;
    lightsTexture: Texture;
    _lightsTextureId: any;
    invMaxColorValue: number;
    invMaxAttenuation: number;
    boundsMin: Vec3;
    boundsDelta: Vec3;
    destroy(): void;
    createTexture(device: any, width: any, height: any, format: any, name: any): Texture;
    setBounds(min: any, delta: any): void;
    uploadTextures(): void;
    updateUniforms(): void;
    getSpotDirection(direction: any, spot: any): void;
    getLightAreaSizes(light: any): Float32Array<ArrayBuffer>;
    addLightData(light: any, lightIndex: any): void;
}
import { Texture } from '../../platform/graphics/texture.js';
import { Vec3 } from '../../core/math/vec3.js';
