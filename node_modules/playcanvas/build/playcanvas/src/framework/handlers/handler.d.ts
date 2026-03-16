/**
 * Callback used by {@link ResourceHandler#load} when a resource is loaded (or an error occurs).
 */
export type ResourceHandlerCallback = (err: string | null, response?: any) => void;
/**
 * @import { AppBase } from '../app-base.js'
 * @import { AssetRegistry } from '../asset/asset-registry.js'
 * @import { Asset } from '../asset/asset.js'
 */
/**
 * @callback ResourceHandlerCallback
 * Callback used by {@link ResourceHandler#load} when a resource is loaded (or an error occurs).
 * @param {string|null} err - The error message in the case where the load fails.
 * @param {any} [response] - The raw data that has been successfully loaded.
 * @returns {void}
 */
/**
 * Base class for ResourceHandlers used by {@link ResourceLoader}.
 */
export class ResourceHandler {
    /**
     * @param {AppBase} app - The running {@link AppBase}.
     * @param {string} handlerType - The type of the resource the handler handles.
     */
    constructor(app: AppBase, handlerType: string);
    /**
     * Type of the resource the handler handles.
     *
     * @type {string}
     */
    handlerType: string;
    /**
     * The running app instance.
     *
     * @type {AppBase}
     */
    _app: AppBase;
    /** @private */
    private _maxRetries;
    /**
     * Sets the number of times to retry a failed request for the resource.
     *
     * @type {number}
     */
    set maxRetries(value: number);
    /**
     * Gets the number of times to retry a failed request for the resource.
     *
     * @type {number}
     */
    get maxRetries(): number;
    /**
     * Load a resource from a remote URL. The base implementation does nothing.
     *
     * @param {string|object} url - Either the URL of the resource to load or a structure
     * containing the load and original URL.
     * @param {string} [url.load] - The URL to be used for loading the resource.
     * @param {string} [url.original] - The original URL to be used for identifying the resource
     * format. This is necessary when loading, for example from blob.
     * @param {ResourceHandlerCallback} callback - The callback used when the resource is loaded or
     * an error occurs.
     * @param {Asset} [asset] - Optional asset that is passed by ResourceLoader.
     */
    load(url: string | object, callback: ResourceHandlerCallback, asset?: Asset): void;
    /**
     * The open function is passed the raw resource data. The handler can then process the data
     * into a format that can be used at runtime. The base implementation simply returns the data.
     *
     * @param {string} url - The URL of the resource to open.
     * @param {*} data - The raw resource data passed by callback from {@link ResourceHandler#load}.
     * @param {Asset} [asset] - Optional asset that is passed by ResourceLoader.
     * @returns {*} The parsed resource data.
     */
    open(url: string, data: any, asset?: Asset): any;
    /**
     * The patch function performs any operations on a resource that requires a dependency on its
     * asset data or any other asset data. The base implementation does nothing.
     *
     * @param {Asset} asset - The asset to patch.
     * @param {AssetRegistry} assets - The asset registry.
     */
    patch(asset: Asset, assets: AssetRegistry): void;
}
import type { AppBase } from '../app-base.js';
import type { Asset } from '../asset/asset.js';
import type { AssetRegistry } from '../asset/asset-registry.js';
