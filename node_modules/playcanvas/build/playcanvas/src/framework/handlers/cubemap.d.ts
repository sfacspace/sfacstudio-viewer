/**
 * @import { AppBase } from '../app-base.js'
 */
/**
 * Resource handler used for loading cubemap {@link Texture} resources.
 *
 * @category Graphics
 */
export class CubemapHandler extends ResourceHandler {
    /**
     * Create a new CubemapHandler instance.
     *
     * @param {AppBase} app - The running {@link AppBase}.
     * @ignore
     */
    constructor(app: AppBase);
    _device: import("../../index.js").GraphicsDevice;
    _registry: import("../asset/asset-registry.js").AssetRegistry;
    _loader: import("./loader.js").ResourceLoader;
    load(url: any, callback: any, asset: any): void;
    open(url: any, data: any, asset: any): any;
    patch(asset: any, registry: any): void;
    getAssetIds(cubemapAsset: any): any[];
    compareAssetIds(assetIdA: any, assetIdB: any): boolean;
    update(cubemapAsset: any, assetIds: any, assets: any): void;
    cmpArrays(arr1: any, arr2: any): boolean;
    resolveId(value: any): any;
    loadAssets(cubemapAsset: any, callback: any): void;
}
import { ResourceHandler } from './handler.js';
import type { AppBase } from '../app-base.js';
