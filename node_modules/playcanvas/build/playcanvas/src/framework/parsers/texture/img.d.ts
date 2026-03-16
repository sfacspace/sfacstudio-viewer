/**
 * Parser for browser-supported image formats.
 */
export class ImgParser extends TextureParser {
    constructor(registry: any, device: any);
    crossOrigin: string;
    maxRetries: number;
    device: any;
    load(url: any, callback: any, asset: any): void;
    open(url: any, data: any, device: any, textureOptions?: {}): Texture;
    _loadImage(url: any, originalUrl: any, crossOrigin: any, callback: any, asset: any): void;
    _loadImageBitmap(url: any, originalUrl: any, crossOrigin: any, callback: any, asset: any): void;
    _loadImageBitmapFromBlob(blob: any, callback: any): void;
}
import { TextureParser } from './texture.js';
import { Texture } from '../../../platform/graphics/texture.js';
