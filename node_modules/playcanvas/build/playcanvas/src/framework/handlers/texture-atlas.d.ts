/**
 * Resource handler used for loading {@link TextureAtlas} resources.
 *
 * @category Graphics
 */
export class TextureAtlasHandler extends ResourceHandler {
    /**
     * Create a new TextureAtlasHandler instance.
     *
     * @param {AppBase} app - The running {@link AppBase}.
     * @ignore
     */
    constructor(app: AppBase);
    _loader: import("./loader.js").ResourceLoader;
    load(url: any, callback: any): void;
    open(url: any, data: any, asset: any): TextureAtlas;
    patch(asset: any, assets: any): void;
    _onAssetChange(asset: any, attribute: any, value: any): void;
}
import { ResourceHandler } from './handler.js';
import { TextureAtlas } from '../../scene/texture-atlas.js';
import type { AppBase } from '../app-base.js';
