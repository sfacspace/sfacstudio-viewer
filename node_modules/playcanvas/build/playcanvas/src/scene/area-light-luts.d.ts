export class AreaLightLuts {
    static createTexture(device: any, format: any, size: any, postfix?: string): Texture;
    static applyTextures(device: any, texture1: any, texture2: any): void;
    static createPlaceholder(device: any): void;
    static set(device: any, ltcMat1: any, ltcMat2: any): void;
}
import { Texture } from '../platform/graphics/texture.js';
