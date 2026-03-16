/**
 * Texture parser for ktx2 files.
 */
export class Ktx2Parser extends TextureParser {
    constructor(registry: any, device: any);
    maxRetries: number;
    device: any;
    load(url: any, callback: any, asset: any): void;
    open(url: any, data: any, device: any, textureOptions?: {}): Texture;
    parse(arraybuffer: any, url: any, callback: any, asset: any): any;
}
import { TextureParser } from './texture.js';
import { Texture } from '../../../platform/graphics/texture.js';
