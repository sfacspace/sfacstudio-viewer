/**
 * Texture parser for ktx files.
 */
export class KtxParser extends TextureParser {
    constructor(registry: any);
    maxRetries: number;
    load(url: any, callback: any, asset: any): void;
    open(url: any, data: any, device: any, textureOptions?: {}): Texture;
    parse(data: any): {
        format: any;
        width: number;
        height: number;
        levels: any[][];
        cubemap: boolean;
    };
}
import { TextureParser } from './texture.js';
import { Texture } from '../../../platform/graphics/texture.js';
