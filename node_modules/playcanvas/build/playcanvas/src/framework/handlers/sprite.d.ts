/**
 * Resource handler used for loading {@link Sprite} resources.
 *
 * @category Graphics
 */
export class SpriteHandler extends ResourceHandler {
    /**
     * Create a new SpriteHandler instance.
     *
     * @param {AppBase} app - The running {@link AppBase}.
     * @ignore
     */
    constructor(app: AppBase);
    _assets: import("../asset/asset-registry.js").AssetRegistry;
    _device: import("../../index.js").GraphicsDevice;
    load(url: any, callback: any): void;
    open(url: any, data: any): Sprite;
    patch(asset: any, assets: any): void;
    _updateAtlas(asset: any): void;
    _onAssetChange(asset: any, attribute: any, value: any, oldValue: any): void;
}
import { ResourceHandler } from './handler.js';
import { Sprite } from '../../scene/sprite.js';
import type { AppBase } from '../app-base.js';
