/**
 * Parser for basis files.
 */
export class BasisParser extends TextureParser {
    constructor(registry: any, device: any);
    device: any;
    maxRetries: number;
    load(url: any, callback: any, asset: any): void;
    open(url: any, data: any, device: any, textureOptions?: {}): Texture;
}
import { TextureParser } from './texture.js';
import { Texture } from '../../../platform/graphics/texture.js';
