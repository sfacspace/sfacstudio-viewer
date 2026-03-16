/**
 * @import { AssetRegistry } from '../../asset/asset-registry.js'
 */
/**
 * A utility class for programmatically loading and unloading gsplat resources. This class provides
 * a simple interface for loading gsplat assets dynamically and manages their lifecycle, including
 * keeping track of loaded assets for efficient unloading.
 *
 * @category Asset
 * @ignore
 */
export class GSplatAssetLoader extends GSplatAssetLoaderBase {
    /**
     * Create a new GSplatAssetLoader.
     *
     * @param {AssetRegistry} registry - The asset registry to use for loading assets.
     */
    constructor(registry: AssetRegistry);
    /**
     * Map of URL to Asset instances that this loader has created.
     *
     * @type {Map<string, Asset>}
     * @private
     */
    private _urlToAsset;
    /**
     * The asset registry to use for loading assets.
     *
     * @type {AssetRegistry}
     * @private
     */
    private _registry;
    /**
     * Maximum number of assets that can be loading concurrently.
     *
     * @type {number}
     * @private
     */
    private maxConcurrentLoads;
    /**
     * Maximum number of retry attempts for failed loads.
     *
     * @type {number}
     * @private
     */
    private maxRetries;
    /**
     * Set of URLs currently being loaded.
     *
     * @type {Set<string>}
     * @private
     */
    private _currentlyLoading;
    /**
     * Queue of URLs waiting to be loaded.
     *
     * @type {string[]}
     * @private
     */
    private _loadQueue;
    /**
     * Map tracking retry attempts per URL.
     *
     * @type {Map<string, number>}
     * @private
     */
    private _retryCount;
    /**
     * Whether this asset loader has been destroyed.
     *
     * @type {boolean}
     * @private
     */
    private _destroyed;
    /**
     * Checks if the loader can start new loads. Returns false if the 'gsplat' handler
     * has been removed from the registry (e.g., during app destruction).
     *
     * @returns {boolean} True if loading is possible, false otherwise.
     * @private
     */
    private _canLoad;
    /**
     * Starts loading an asset immediately.
     *
     * @param {string} url - The URL of the gsplat file to load.
     * @private
     */
    private _startLoading;
    /**
     * Called when an asset successfully loads.
     *
     * @param {string} url - The URL of the loaded asset.
     * @param {Asset} asset - The loaded asset.
     * @private
     */
    private _onAssetLoadSuccess;
    /**
     * Called when an asset fails to load.
     *
     * @param {string} url - The URL of the failed asset.
     * @param {Asset} asset - The asset that failed to load.
     * @param {string|Error} err - The error that occurred.
     * @private
     */
    private _onAssetLoadError;
    /**
     * Processes the next item in the load queue if there's capacity.
     *
     * @private
     */
    private _processQueue;
}
import { GSplatAssetLoaderBase } from '../../../scene/gsplat-unified/gsplat-asset-loader-base.js';
import type { AssetRegistry } from '../../asset/asset-registry.js';
