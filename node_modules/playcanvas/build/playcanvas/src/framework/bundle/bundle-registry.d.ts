/**
 * @import { Asset } from '../asset/asset.js'
 * @import { AssetRegistry } from '../asset/asset-registry.js'
 */
/**
 * Keeps track of which assets are in bundles and loads files from bundles.
 *
 * @ignore
 */
export class BundleRegistry {
    /**
     * Create a new BundleRegistry instance.
     *
     * @param {AssetRegistry} assets - The asset registry.
     */
    constructor(assets: AssetRegistry);
    /**
     * Index of bundle assets.
     * @type {Map<number, Asset>}
     * @private
     */
    private _idToBundle;
    /**
     * Index of asset id to set of bundle assets.
     * @type {Map<number, Set<Asset>>}
     * @private
     */
    private _assetToBundles;
    /**
     * Index of file url to set of bundle assets.
     * @type {Map<string, Set<Asset>>}
     * @private
     */
    private _urlsToBundles;
    /**
     * Index of file request to load callbacks.
     * @type {Map<string, function[]>}
     * @private
     */
    private _fileRequests;
    _assets: AssetRegistry;
    /**
     * Called when asset is added to AssetRegistry.
     *
     * @param {Asset} asset - The asset that has been added.
     * @private
     */
    private _onAssetAdd;
    _unbindAssetEvents(id: any): void;
    _indexAssetInBundle(id: any, bundle: any): void;
    _indexAssetFileUrls(asset: any): void;
    _getAssetFileUrls(asset: any): any[];
    _onAssetRemove(asset: any): void;
    _onBundleLoadStart(asset: any): void;
    _onBundleLoad(asset: any): void;
    _onBundleError(err: any): void;
    _findLoadedOrLoadingBundleForUrl(url: any): any;
    /**
     * Lists all of the available bundles that reference the specified asset.
     *
     * @param {Asset} asset - The asset to search by.
     * @returns {Asset[]|null} An array of bundle assets or null if the
     * asset is not in any bundle.
     */
    listBundlesForAsset(asset: Asset): Asset[] | null;
    /**
     * Lists all bundle assets.
     *
     * @returns {Asset[]} An array of bundle assets.
     */
    list(): Asset[];
    /**
     * Returns true if there is a bundle that contains the specified URL.
     *
     * @param {string} url - The url.
     * @returns {boolean} True or false.
     */
    hasUrl(url: string): boolean;
    /**
     * Returns true if there is a bundle that contains the specified URL and that bundle is either
     * loaded or currently being loaded.
     *
     * @param {string} url - The url.
     * @returns {boolean} True or false.
     */
    urlIsLoadedOrLoading(url: string): boolean;
    /**
     * Loads the specified file URL from a bundle that is either loaded or currently being loaded.
     *
     * @param {string} url - The URL. Make sure you are using a relative URL that does not contain
     * any query parameters.
     * @param {Function} callback - The callback is called when the file has been loaded or if an
     * error occurs. The callback expects the first argument to be the error message (if any) and
     * the second argument is the file blob URL.
     * @example
     * const url = asset.getFileUrl().split('?')[0]; // get normalized asset URL
     * this.app.bundles.loadFile(url, function (err, data) {
     *     // do something with the data
     * });
     */
    loadUrl(url: string, callback: Function): void;
    /**
     * Destroys the registry, and releases its resources. Does not unload bundle assets as these
     * should be unloaded by the {@link AssetRegistry}.
     */
    destroy(): void;
}
import type { AssetRegistry } from '../asset/asset-registry.js';
import type { Asset } from '../asset/asset.js';
