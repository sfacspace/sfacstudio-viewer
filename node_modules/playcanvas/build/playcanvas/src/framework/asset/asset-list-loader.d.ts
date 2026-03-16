/**
 * @import { AssetRegistry } from './asset-registry.js'
 */
/**
 * Used to load a group of assets and fires a callback when all assets are loaded.
 *
 * ```javascript
 * const assets = [
 *     new Asset('model', 'container', { url: `http://example.com/asset.glb` }),
 *     new Asset('styling', 'css', { url: `http://example.com/asset.css` })
 * ];
 * const assetListLoader = new AssetListLoader(assets, app.assets);
 * assetListLoader.load((err, failed) => {
 *     if (err) {
 *         console.error(`${failed.length} assets failed to load`);
 *     } else {
 *         console.log(`${assets.length} assets loaded`);
 *    }
 * });
 * ```
 *
 * @category Asset
 */
export class AssetListLoader extends EventHandler {
    /**
     * Create a new AssetListLoader using a list of assets to load and the asset registry used to
     * load and manage them.
     *
     * @param {Asset[]|number[]} assetList - An array of {@link Asset} objects to load or an array
     * of Asset IDs to load.
     * @param {AssetRegistry} assetRegistry - The application's asset registry.
     * @example
     * const assetListLoader = new pc.AssetListLoader([
     *     new pc.Asset("texture1", "texture", { url: 'http://example.com/my/assets/here/texture1.png') }),
     *     new pc.Asset("texture2", "texture", { url: 'http://example.com/my/assets/here/texture2.png') })
     * ], app.assets);
     */
    constructor(assetList: Asset[] | number[], assetRegistry: AssetRegistry);
    /**
     * @type {Set<Asset>}
     * @private
     */
    private _assets;
    /**
     * @type {Set<Asset>}
     * @private
     */
    private _loadingAssets;
    /**
     * @type {Set<Asset>}
     * @private
     */
    private _waitingAssets;
    /** @private */
    private _loading;
    /** @private */
    private _loaded;
    /**
     * Array of assets that failed to load.
     *
     * @type {Asset[]}
     * @private
     */
    private _failed;
    _registry: AssetRegistry;
    /**
     * Removes all references to this asset list loader.
     */
    destroy(): void;
    _assetHasDependencies(asset: any): any;
    /**
     * Start loading asset list and call `done()` when all assets have loaded or failed to load.
     *
     * @param {Function} done - Callback called when all assets in the list are loaded. Passed
     * `(err, failed)` where `err` is `undefined` if no errors are encountered and failed contains
     * an array of assets that failed to load.
     * @param {object} [scope] - Scope to use when calling callback.
     */
    load(done: Function, scope?: object): void;
    _callback: Function;
    _scope: any;
    /**
     * Sets a callback which will be called when all assets in the list have been loaded.
     *
     * @param {Function} done - Callback called when all assets in the list are loaded.
     * @param {object} [scope] - Scope to use when calling callback.
     */
    ready(done: Function, scope?: object): void;
    _loadingComplete(): void;
    _onLoad(asset: any): void;
    _onError(err: any, asset: any): void;
    _onAddAsset(asset: any): void;
    _waitForAsset(assetId: any): void;
}
import { EventHandler } from '../../core/event-handler.js';
import type { AssetRegistry } from './asset-registry.js';
import { Asset } from './asset.js';
