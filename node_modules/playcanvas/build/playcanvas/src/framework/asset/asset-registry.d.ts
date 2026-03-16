/**
 * Callback used by {@link AssetRegistry#filter} to filter assets.
 */
export type FilterAssetCallback = (asset: Asset) => boolean;
/**
 * Callback used by {@link AssetRegistry#loadFromUrl} and called when an asset is loaded (or an
 * error occurs).
 */
export type LoadAssetCallback = (err: string | null, asset?: Asset) => void;
/**
 * Callback used by {@link ResourceLoader#load} and called when an asset is choosing a bundle
 * to load from. Return a single bundle to ensure asset is loaded from it.
 */
export type BundlesFilterCallback = (bundles: Asset[]) => Asset;
/**
 * @import { BundleRegistry } from '../bundle/bundle-registry.js'
 * @import { ResourceLoader } from '../handlers/loader.js'
 */
/**
 * @callback FilterAssetCallback
 * Callback used by {@link AssetRegistry#filter} to filter assets.
 * @param {Asset} asset - The current asset to filter.
 * @returns {boolean} Return `true` to include asset to result list.
 */
/**
 * @callback LoadAssetCallback
 * Callback used by {@link AssetRegistry#loadFromUrl} and called when an asset is loaded (or an
 * error occurs).
 * @param {string|null} err - The error message is null if no errors were encountered.
 * @param {Asset} [asset] - The loaded asset if no errors were encountered.
 * @returns {void}
 */
/**
 * @callback BundlesFilterCallback
 * Callback used by {@link ResourceLoader#load} and called when an asset is choosing a bundle
 * to load from. Return a single bundle to ensure asset is loaded from it.
 * @param {Asset[]} bundles - List of bundle assets which contain the asset.
 * @returns {Asset} Return a single bundle asset to ensure asset is loaded from it.
 */
/**
 * Container for all assets that are available to this application. Note that PlayCanvas scripts
 * are provided with an AssetRegistry instance as `app.assets`.
 *
 * @category Asset
 */
export class AssetRegistry extends EventHandler {
    /**
     * Fired when an asset completes loading. This event is available in three forms. They are as
     * follows:
     *
     * 1. `load` - Fired when any asset finishes loading.
     * 2. `load:[id]` - Fired when a specific asset has finished loading, where `[id]` is the
     * unique id of the asset.
     * 3. `load:url:[url]` - Fired when an asset finishes loading whose URL matches `[url]`, where
     * `[url]` is the URL of the asset.
     *
     * @event
     * @example
     * app.assets.on('load', (asset) => {
     *     console.log(`Asset loaded: ${asset.name}`);
     * });
     * @example
     * const id = 123456;
     * const asset = app.assets.get(id);
     * app.assets.on('load:' + id, (asset) => {
     *     console.log(`Asset loaded: ${asset.name}`);
     * });
     * app.assets.load(asset);
     * @example
     * const id = 123456;
     * const asset = app.assets.get(id);
     * app.assets.on('load:url:' + asset.file.url, (asset) => {
     *     console.log(`Asset loaded: ${asset.name}`);
     * });
     * app.assets.load(asset);
     */
    static EVENT_LOAD: string;
    /**
     * Fired when an asset is added to the registry. This event is available in three forms. They
     * are as follows:
     *
     * 1. `add` - Fired when any asset is added to the registry.
     * 2. `add:[id]` - Fired when an asset is added to the registry, where `[id]` is the unique id
     * of the asset.
     * 3. `add:url:[url]` - Fired when an asset is added to the registry and matches the URL
     * `[url]`, where `[url]` is the URL of the asset.
     *
     * @event
     * @example
     * app.assets.on('add', (asset) => {
     *    console.log(`Asset added: ${asset.name}`);
     * });
     * @example
     * const id = 123456;
     * app.assets.on('add:' + id, (asset) => {
     *    console.log(`Asset added: ${asset.name}`);
     * });
     * @example
     * const id = 123456;
     * const asset = app.assets.get(id);
     * app.assets.on('add:url:' + asset.file.url, (asset) => {
     *    console.log(`Asset added: ${asset.name}`);
     * });
     */
    static EVENT_ADD: string;
    /**
     * Fired when an asset is removed from the registry. This event is available in three forms.
     * They are as follows:
     *
     * 1. `remove` - Fired when any asset is removed from the registry.
     * 2. `remove:[id]` - Fired when an asset is removed from the registry, where `[id]` is the
     * unique id of the asset.
     * 3. `remove:url:[url]` - Fired when an asset is removed from the registry and matches the
     * URL `[url]`, where `[url]` is the URL of the asset.
     *
     * @event
     * @param {Asset} asset - The asset that was removed.
     * @example
     * app.assets.on('remove', (asset) => {
     *    console.log(`Asset removed: ${asset.name}`);
     * });
     * @example
     * const id = 123456;
     * app.assets.on('remove:' + id, (asset) => {
     *    console.log(`Asset removed: ${asset.name}`);
     * });
     * @example
     * const id = 123456;
     * const asset = app.assets.get(id);
     * app.assets.on('remove:url:' + asset.file.url, (asset) => {
     *    console.log(`Asset removed: ${asset.name}`);
     * });
     */
    static EVENT_REMOVE: string;
    /**
     * Fired when an error occurs during asset loading. This event is available in two forms. They
     * are as follows:
     *
     * 1. `error` - Fired when any asset reports an error in loading.
     * 2. `error:[id]` - Fired when an asset reports an error in loading, where `[id]` is the
     * unique id of the asset.
     *
     * @event
     * @example
     * const id = 123456;
     * const asset = app.assets.get(id);
     * app.assets.on('error', (err, asset) => {
     *     console.error(err);
     * });
     * app.assets.load(asset);
     * @example
     * const id = 123456;
     * const asset = app.assets.get(id);
     * app.assets.on('error:' + id, (err, asset) => {
     *     console.error(err);
     * });
     * app.assets.load(asset);
     */
    static EVENT_ERROR: string;
    /**
     * Create an instance of an AssetRegistry.
     *
     * @param {ResourceLoader} loader - The ResourceLoader used to load the asset files.
     */
    constructor(loader: ResourceLoader);
    /**
     * @type {Set<Asset>}
     * @private
     */
    private _assets;
    /**
     * @type {ResourceLoader}
     * @private
     */
    private _loader;
    /**
     * @type {Map<number, Asset>}
     * @private
     */
    private _idToAsset;
    /**
     * @type {Map<string, Asset>}
     * @private
     */
    private _urlToAsset;
    /**
     * @type {Map<string, Set<Asset>>}
     * @private
     */
    private _nameToAsset;
    /**
     * Index for looking up by tags.
     *
     * @private
     */
    private _tags;
    /**
     * A URL prefix that will be added to all asset loading requests.
     *
     * @type {string|null}
     */
    prefix: string | null;
    /**
     * BundleRegistry
     *
     * @type {BundleRegistry|null}
     */
    bundles: BundleRegistry | null;
    /**
     * The ResourceLoader used to load asset files.
     *
     * @type {ResourceLoader}
     * @ignore
     */
    get loader(): ResourceLoader;
    /**
     * Create a filtered list of assets from the registry.
     *
     * @param {object} [filters] - Filter options.
     * @param {boolean} [filters.preload] - Filter by preload setting.
     * @returns {Asset[]} The filtered list of assets.
     */
    list(filters?: {
        preload?: boolean;
    }): Asset[];
    /**
     * Add an asset to the registry. If {@link Asset#preload} is `true`, it will also get loaded.
     *
     * @param {Asset} asset - The asset to add.
     * @example
     * const asset = new pc.Asset("My Asset", "texture", {
     *     url: "../path/to/image.jpg"
     * });
     * app.assets.add(asset);
     */
    add(asset: Asset): void;
    /**
     * Remove an asset from the registry.
     *
     * @param {Asset} asset - The asset to remove.
     * @returns {boolean} True if the asset was successfully removed and false otherwise.
     * @example
     * const asset = app.assets.get(100);
     * app.assets.remove(asset);
     */
    remove(asset: Asset): boolean;
    /**
     * Retrieve an asset from the registry by its id field.
     *
     * @param {number} id - The id of the asset to get.
     * @returns {Asset|undefined} The asset.
     * @example
     * const asset = app.assets.get(100);
     */
    get(id: number): Asset | undefined;
    /**
     * Retrieve an asset from the registry by its file's URL field.
     *
     * @param {string} url - The url of the asset to get.
     * @returns {Asset|undefined} The asset.
     * @example
     * const asset = app.assets.getByUrl("../path/to/image.jpg");
     */
    getByUrl(url: string): Asset | undefined;
    /**
     * Load the asset's file from a remote source. Listen for `load` events on the asset to find
     * out when it is loaded.
     *
     * @param {Asset} asset - The asset to load.
     * @param {object} [options] - Options for asset loading.
     * @param {boolean} [options.bundlesIgnore] - If set to true, then asset will not try to load
     * from a bundle. Defaults to false.
     * @param {boolean} [options.force] - If set to true, then the check of asset being loaded or
     * is already loaded is bypassed, which forces loading of asset regardless.
     * @param {BundlesFilterCallback} [options.bundlesFilter] - A callback that will be called
     * when loading an asset that is contained in any of the bundles. It provides an array of
     * bundles and will ensure asset is loaded from bundle returned from a callback. By default,
     * the smallest filesize bundle is chosen.
     * @example
     * // load some assets
     * const assetsToLoad = [
     *     app.assets.find("My Asset"),
     *     app.assets.find("Another Asset")
     * ];
     * let count = 0;
     * assetsToLoad.forEach((assetToLoad) => {
     *     assetToLoad.ready((asset) => {
     *         count++;
     *         if (count === assetsToLoad.length) {
     *             // done
     *         }
     *     });
     *     app.assets.load(assetToLoad);
     * });
     */
    load(asset: Asset, options?: {
        bundlesIgnore?: boolean;
        force?: boolean;
        bundlesFilter?: BundlesFilterCallback;
    }): void;
    /**
     * Use this to load and create an asset if you don't have assets created. Usually you would
     * only use this if you are not integrated with the PlayCanvas Editor.
     *
     * @param {string} url - The url to load.
     * @param {string} type - The type of asset to load.
     * @param {LoadAssetCallback} callback - Function called when asset is loaded, passed (err,
     * asset), where err is null if no errors were encountered.
     * @example
     * app.assets.loadFromUrl("../path/to/texture.jpg", "texture", function (err, asset) {
     *     const texture = asset.resource;
     * });
     */
    loadFromUrl(url: string, type: string, callback: LoadAssetCallback): void;
    /**
     * Use this to load and create an asset when both the URL and filename are required. For
     * example, use this function when loading BLOB assets, where the URL does not adequately
     * identify the file.
     *
     * @param {string} url - The url to load.
     * @param {string} filename - The filename of the asset to load.
     * @param {string} type - The type of asset to load.
     * @param {LoadAssetCallback} callback - Function called when asset is loaded, passed (err,
     * asset), where err is null if no errors were encountered.
     * @example
     * const file = magicallyObtainAFile();
     * app.assets.loadFromUrlAndFilename(URL.createObjectURL(file), "texture.png", "texture", function (err, asset) {
     *     const texture = asset.resource;
     * });
     */
    loadFromUrlAndFilename(url: string, filename: string, type: string, callback: LoadAssetCallback): void;
    loadFromUrlError: any;
    _loadModel(modelAsset: any, continuation: any): void;
    _loadMaterials(modelAsset: any, mapping: any, callback: any): void;
    _loadTextures(materialAsset: any, callback: any): void;
    _onTagAdd(tag: any, asset: any): void;
    _onTagRemove(tag: any, asset: any): void;
    _onNameChange(asset: any, name: any, nameOld: any): void;
    /**
     * Return all Assets that satisfy the search query. Query can be simply a string, or comma
     * separated strings, to have inclusive results of assets that match at least one query. A
     * query that consists of an array of tags can be used to match assets that have each tag of
     * array.
     *
     * @param {...*} query - Name of a tag or array of tags.
     * @returns {Asset[]} A list of all Assets matched query.
     * @example
     * const assets = app.assets.findByTag("level-1");
     * // returns all assets that tagged by `level-1`
     * @example
     * const assets = app.assets.findByTag("level-1", "level-2");
     * // returns all assets that tagged by `level-1` OR `level-2`
     * @example
     * const assets = app.assets.findByTag(["level-1", "monster"]);
     * // returns all assets that tagged by `level-1` AND `monster`
     * @example
     * const assets = app.assets.findByTag(["level-1", "monster"], ["level-2", "monster"]);
     * // returns all assets that tagged by (`level-1` AND `monster`) OR (`level-2` AND `monster`)
     */
    findByTag(...query: any[]): Asset[];
    /**
     * Return all Assets that satisfy a filter callback.
     *
     * @param {FilterAssetCallback} callback - The callback function that is used to filter assets.
     * Return `true` to include an asset in the returned array.
     * @returns {Asset[]} A list of all Assets found.
     * @example
     * const assets = app.assets.filter(asset => asset.name.includes('monster'));
     * console.log(`Found ${assets.length} assets with a name containing 'monster'`);
     */
    filter(callback: FilterAssetCallback): Asset[];
    /**
     * Return the first Asset with the specified name and type found in the registry.
     *
     * @param {string} name - The name of the Asset to find.
     * @param {string} [type] - The type of the Asset to find.
     * @returns {Asset|null} A single Asset or null if no Asset is found.
     * @example
     * const asset = app.assets.find("myTextureAsset", "texture");
     */
    find(name: string, type?: string): Asset | null;
    /**
     * Return all Assets with the specified name and type found in the registry.
     *
     * @param {string} name - The name of the Assets to find.
     * @param {string} [type] - The type of the Assets to find.
     * @returns {Asset[]} A list of all Assets found.
     * @example
     * const assets = app.assets.findAll('brick', 'texture');
     * console.log(`Found ${assets.length} texture assets named 'brick'`);
     */
    findAll(name: string, type?: string): Asset[];
    /**
     * Logs all assets in the registry to the console. Used for debugging with TRACEID_ASSETS.
     *
     * @ignore
     */
    log(): void;
}
import { Asset } from './asset.js';
import { EventHandler } from '../../core/event-handler.js';
import type { BundleRegistry } from '../bundle/bundle-registry.js';
import type { ResourceLoader } from '../handlers/loader.js';
