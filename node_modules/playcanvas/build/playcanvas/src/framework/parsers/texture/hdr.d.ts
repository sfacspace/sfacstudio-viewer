/**
 * Texture parser for hdr files.
 */
export class HdrParser extends TextureParser {
    constructor(registry: any);
    maxRetries: number;
    load(url: any, callback: any, asset: any): void;
    open(url: any, data: any, device: any, textureOptions?: {}): Texture;
    parse(data: any): {
        width: number;
        height: number;
        levels: Uint8Array<any>[];
    };
    _readPixels(readStream: any, width: any, height: any, flipY: any): Uint8Array<any>;
    _readPixelsFlat(readStream: any, width: any, height: any): Uint8Array<any>;
}
import { TextureParser } from './texture.js';
import { Texture } from '../../../platform/graphics/texture.js';
