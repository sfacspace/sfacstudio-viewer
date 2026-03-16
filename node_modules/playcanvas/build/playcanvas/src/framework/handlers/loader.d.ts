/**
 * Callback used by {@link ResourceLoader#load} when a resource is loaded (or an error occurs).
 */
export type ResourceLoaderCallback = (err: string | null, resource?: any) => void;
/**
 * @import { AppBase } from '../app-base.js'
 * @import { AssetRegistry } from '../asset/asset-registry.js'
 * @import { Asset } from '../asset/asset.js'
 * @import { BundlesFilterCallback } from '../asset/asset-registry.js'
 * @import { ResourceHandler } from './handler.js'
 */
/**
 * @callback ResourceLoaderCallback
 * Callback used by {@link ResourceLoader#load} when a resource is loaded (or an error occurs).
 * @param {string|null} err - The error message in the case where the load fails.
 * @param {any} [resource] - The resource that has been successfully loaded.
 * @returns {void}
 */
/**
 * Load resource data, potentially from remote sources. Caches resource on load to prevent multiple
 * requests. Add ResourceHandlers to handle different types of resources.
 */
export class ResourceLoader {
    static makeKey(url: any, type: any): string;
    /**
     * Create a new ResourceLoader instance.
     *
     * @param {AppBase} app - The application.
     */
    constructor(app: AppBase);
    _handlers: {};
    _requests: {};
    _cache: {};
    _app: AppBase;
    /**
     * Add a {@link ResourceHandler} for a resource type. Handler should support at least `load()`
     * and `open()`. Handlers can optionally support patch(asset, assets) to handle dependencies on
     * other assets.
     *
     * @param {string} type - The name of the resource type that the handler will be registered
     * with. Can be:
     *
     * - {@link ASSET_ANIMATION}
     * - {@link ASSET_AUDIO}
     * - {@link ASSET_IMAGE}
     * - {@link ASSET_JSON}
     * - {@link ASSET_MODEL}
     * - {@link ASSET_MATERIAL}
     * - {@link ASSET_TEXT}
     * - {@link ASSET_TEXTURE}
     * - {@link ASSET_CUBEMAP}
     * - {@link ASSET_SHADER}
     * - {@link ASSET_CSS}
     * - {@link ASSET_HTML}
     * - {@link ASSET_SCRIPT}
     * - {@link ASSET_CONTAINER}
     *
     * @param {ResourceHandler} handler - An instance of a resource handler
     * supporting at least `load()` and `open()`.
     * @example
     * const loader = new ResourceLoader();
     * loader.addHandler("json", new pc.JsonHandler());
     */
    addHandler(type: string, handler: ResourceHandler): void;
    /**
     * Remove a {@link ResourceHandler} for a resource type.
     *
     * @param {string} type - The name of the type that the handler will be removed.
     */
    removeHandler(type: string): void;
    /**
     * Get a {@link ResourceHandler} for a resource type.
     *
     * @param {string} type - The name of the resource type that the handler is registered with.
     * @returns {ResourceHandler|undefined} The registered handler, or
     * undefined if the requested handler is not registered.
     */
    getHandler(type: string): ResourceHandler | undefined;
    /**
     * Make a request for a resource from a remote URL. Parse the returned data using the handler
     * for the specified type. When loaded and parsed, use the callback to return an instance of
     * the resource.
     *
     * @param {string} url - The URL of the resource to load.
     * @param {string} type - The type of resource expected.
     * @param {ResourceLoaderCallback} callback - The callback used when the resource is loaded or
     * an error occurs. Passed (err, resource) where err is null if there are no errors.
     * @param {Asset} [asset] - Optional asset that is passed into
     * handler.
     * @param {object} [options] - Additional options for loading.
     * @param {boolean} [options.bundlesIgnore] - If set to true, then asset will not try to load
     * from a bundle. Defaults to false.
     * @param {BundlesFilterCallback} [options.bundlesFilter] - A callback that will be called
     * when loading an asset that is contained in any of the bundles. It provides an array of
     * bundles and will ensure asset is loaded from bundle returned from a callback. By default,
     * the smallest filesize bundle is chosen.
     * @example
     * app.loader.load("../path/to/texture.png", "texture", function (err, texture) {
     *     // use texture here
     * });
     */
    load(url: string, type: string, callback: ResourceLoaderCallback, asset?: Asset, options?: {
        bundlesIgnore?: boolean;
        bundlesFilter?: BundlesFilterCallback;
    }): void;
    _loadNull(handler: any, callback: any, asset: any): void;
    _onSuccess(key: any, result: any, extra: any): void;
    _onFailure(key: any, err: any): void;
    /**
     * Convert raw resource data into a resource instance. E.g. Take 3D model format JSON and
     * return a {@link Model}.
     *
     * @param {string} type - The type of resource.
     * @param {*} data - The raw resource data.
     * @returns {*} The parsed resource data.
     */
    open(type: string, data: any): any;
    /**
     * Perform any operations on a resource, that requires a dependency on its asset data or any
     * other asset data.
     *
     * @param {Asset} asset - The asset to patch.
     * @param {AssetRegistry} assets - The asset registry.
     */
    patch(asset: Asset, assets: AssetRegistry): void;
    /**
     * Remove resource from cache.
     *
     * @param {string} url - The URL of the resource.
     * @param {string} type - The type of resource.
     */
    clearCache(url: string, type: string): void;
    /**
     * Check cache for resource from a URL. If present, return the cached value.
     *
     * @param {string} url - The URL of the resource to get from the cache.
     * @param {string} type - The type of the resource.
     * @returns {*} The resource loaded from the cache.
     */
    getFromCache(url: string, type: string): any;
    /**
     * Enables retrying of failed requests when loading assets.
     *
     * @param {number} maxRetries - The maximum number of times to retry loading an asset. Defaults
     * to 5.
     * @ignore
     */
    enableRetry(maxRetries?: number): void;
    /**
     * Disables retrying of failed requests when loading assets.
     *
     * @ignore
     */
    disableRetry(): void;
    /**
     * Destroys the resource loader.
     */
    destroy(): void;
}
import type { AppBase } from '../app-base.js';
import type { ResourceHandler } from './handler.js';
import type { Asset } from '../asset/asset.js';
import type { BundlesFilterCallback } from '../asset/asset-registry.js';
import type { AssetRegistry } from '../asset/asset-registry.js';
