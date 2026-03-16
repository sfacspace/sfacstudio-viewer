/**
 * Resource handler used for loading 2D and 3D {@link Texture} resources.
 *
 * @category Graphics
 */
export class TextureHandler extends ResourceHandler {
    /**
     * Create a new TextureHandler instance.
     *
     * @param {AppBase} app - The running {@link AppBase}.
     * @ignore
     */
    constructor(app: AppBase);
    _device: import("../../index.js").GraphicsDevice;
    _assets: import("../asset/asset-registry.js").AssetRegistry;
    imgParser: ImgParser;
    parsers: {
        dds: DdsParser;
        ktx: KtxParser;
        ktx2: Ktx2Parser;
        basis: BasisParser;
        hdr: HdrParser;
    };
    set crossOrigin(value: string);
    get crossOrigin(): string;
    _getUrlWithoutParams(url: any): any;
    _getParser(url: any): any;
    _getTextureOptions(asset: any): {
        profilerHint: number;
    };
    load(url: any, callback: any, asset: any): void;
    open(url: any, data: any, asset: any): any;
    patch(asset: any, assets: any): void;
}
import { ResourceHandler } from './handler.js';
import { ImgParser } from '../parsers/texture/img.js';
import { DdsParser } from '../parsers/texture/dds.js';
import { KtxParser } from '../parsers/texture/ktx.js';
import { Ktx2Parser } from '../parsers/texture/ktx2.js';
import { BasisParser } from '../parsers/texture/basis.js';
import { HdrParser } from '../parsers/texture/hdr.js';
import type { AppBase } from '../app-base.js';
