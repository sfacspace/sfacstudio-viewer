/**
 * Callback used by {@link Asset#ready} and called when an asset is ready.
 */
export type AssetReadyCallback = (asset: Asset) => void;
/**
 * @callback AssetReadyCallback
 * Callback used by {@link Asset#ready} and called when an asset is ready.
 * @param {Asset} asset - The ready asset.
 * @returns {void}
 */
/**
 * An asset record of a file or data resource that can be loaded by the engine. The asset contains
 * four important fields:
 *
 * - `file`: contains the details of a file (filename, url) which contains the resource data, e.g.
 * an image file for a texture asset.
 * - `data`: contains a JSON blob which contains either the resource data for the asset (e.g.
 * material data) or additional data for the file (e.g. material mappings for a model).
 * - `options`: contains a JSON blob with handler-specific load options.
 * - `resource`: contains the final resource when it is loaded. (e.g. a {@link StandardMaterial} or
 * a {@link Texture}).
 *
 * See the {@link AssetRegistry} for details on loading resources from assets.
 *
 * @category Asset
 */
export class Asset extends EventHandler {
    /**
     * Fired when the asset has completed loading.
     *
     * @event
     * @example
     * asset.on('load', (asset) => {
     *     console.log(`Asset loaded: ${asset.name}`);
     * });
     */
    static EVENT_LOAD: string;
    /**
     * Fired just before the asset unloads the resource. This allows for the opportunity to prepare
     * for an asset that will be unloaded. E.g. Changing the texture of a model to a default before
     * the one it was using is unloaded.
     *
     * @event
     * @example
     * asset.on('unload', (asset) => {
     *    console.log(`Asset about to unload: ${asset.name}`);
     * });
     */
    static EVENT_UNLOAD: string;
    /**
     * Fired when the asset is removed from the asset registry.
     *
     * @event
     * @example
     * asset.on('remove', (asset) => {
     *    console.log(`Asset removed: ${asset.name}`);
     * });
     */
    static EVENT_REMOVE: string;
    /**
     * Fired if the asset encounters an error while loading.
     *
     * @event
     * @example
     * asset.on('error', (err, asset) => {
     *    console.error(`Error loading asset ${asset.name}: ${err}`);
     * });
     */
    static EVENT_ERROR: string;
    /**
     * Fired when one of the asset properties `file`, `data`, `resource` or `resources` is changed.
     *
     * @event
     * @example
     * asset.on('change', (asset, property, newValue, oldValue) => {
     *    console.log(`Asset ${asset.name} has property ${property} changed from ${oldValue} to ${newValue}`);
     * });
     */
    static EVENT_CHANGE: string;
    /**
     * Fired when the asset's stream download progresses.
     *
     * Please note:
     * - only gsplat assets current emit this event
     * - totalBytes may not be reliable as it is based on the content-length header of the response
     *
     * @event
     * @example
     * asset.on('progress', (receivedBytes, totalBytes) => {
     *    console.log(`Asset ${asset.name} progress ${readBytes / totalBytes}`);
     * });
     */
    static EVENT_PROGRESS: string;
    /**
     * Fired when we add a new localized asset id to the asset.
     *
     * @event
     * @example
     * asset.on('add:localized', (locale, assetId) => {
     *    console.log(`Asset ${asset.name} has added localized asset ${assetId} for locale ${locale}`);
     * });
     */
    static EVENT_ADDLOCALIZED: string;
    /**
     * Fired when we remove a localized asset id from the asset.
     *
     * @event
     * @example
     * asset.on('remove:localized', (locale, assetId) => {
     *   console.log(`Asset ${asset.name} has removed localized asset ${assetId} for locale ${locale}`);
     * });
     */
    static EVENT_REMOVELOCALIZED: string;
    /**
     * Helper function to resolve asset file data and return the contents as an ArrayBuffer. If the
     * asset file contents are present, that is returned. Otherwise the file data is be downloaded
     * via http.
     *
     * @param {string} loadUrl - The URL as passed into the handler
     * @param {ResourceLoaderCallback} callback - The callback function to receive results.
     * @param {Asset} [asset] - The asset
     * @param {number} maxRetries - Number of retries if http download is required
     * @ignore
     */
    static fetchArrayBuffer(loadUrl: string, callback: ResourceLoaderCallback, asset?: Asset, maxRetries?: number): void;
    /**
     * Create a new Asset record. Generally, Assets are created in the loading process and you
     * won't need to create them by hand.
     *
     * @param {string} name - A non-unique but human-readable name which can be later used to
     * retrieve the asset.
     * @param {"animation"|"audio"|"binary"|"container"|"cubemap"|"css"|"font"|"gsplat"|"json"|"html"|"material"|"model"|"render"|"script"|"shader"|"sprite"|"template"|"text"|"texture"|"textureatlas"} type - Type of asset.
     * @param {object} [file] - Details about the file the asset is made from. At the least must
     * contain the 'url' field. For assets that don't contain file data use null.
     * @param {string} [file.url] - The URL of the resource file that contains the asset data.
     * @param {string} [file.filename] - The filename of the resource file or null if no filename
     * was set (e.g from using {@link AssetRegistry#loadFromUrl}).
     * @param {number} [file.size] - The size of the resource file or null if no size was set
     * (e.g. from using {@link AssetRegistry#loadFromUrl}).
     * @param {string} [file.hash] - The MD5 hash of the resource file data and the Asset data
     * field or null if hash was set (e.g from using {@link AssetRegistry#loadFromUrl}).
     * @param {ArrayBuffer} [file.contents] - Optional file contents. This is faster than wrapping
     * the data in a (base64 encoded) blob. Currently only used by container assets.
     * @param {object|string} [data] - JSON object or string with additional data about the asset.
     * (e.g. for texture and model assets) or contains the asset data itself (e.g. in the case of
     * materials).
     * @param {object} [options] - The asset handler options. For container options see
     * {@link ContainerHandler}.
     * @param {'anonymous'|'use-credentials'|null} [options.crossOrigin] - For use with texture assets
     * that are loaded using the browser. This setting overrides the default crossOrigin specifier.
     * For more details on crossOrigin and its use, see
     * https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/crossOrigin.
     * @example
     * const asset = new pc.Asset("a texture", "texture", {
     *     url: "http://example.com/my/assets/here/texture.png"
     * });
     */
    constructor(name: string, type: "animation" | "audio" | "binary" | "container" | "cubemap" | "css" | "font" | "gsplat" | "json" | "html" | "material" | "model" | "render" | "script" | "shader" | "sprite" | "template" | "text" | "texture" | "textureatlas", file?: {
        url?: string;
        filename?: string;
        size?: number;
        hash?: string;
        contents?: ArrayBuffer;
    }, data?: object | string, options?: {
        crossOrigin?: "anonymous" | "use-credentials" | null;
    });
    /**
     * @type {AssetFile | null}
     * @private
     */
    private _file;
    /**
     * A string-assetId dictionary that maps locale to asset id.
     *
     * @type {object}
     * @private
     */
    private _i18n;
    /**
     * Whether to preload the asset.
     *
     * @type {boolean}
     * @private
     */
    private _preload;
    /**
     * This is where the loaded resource(s) are stored.
     *
     * @type {object[]}
     * @private
     */
    private _resources;
    /**
     * The asset id.
     *
     * @type {number}
     */
    id: number;
    /**
     * True if the asset has finished attempting to load the resource. It is not guaranteed
     * that the resources are available as there could have been a network error.
     *
     * @type {boolean}
     */
    loaded: boolean;
    /**
     * True if the resource is currently being loaded.
     *
     * @type {boolean}
     */
    loading: boolean;
    /**
     * Optional JSON data that contains the asset handler options.
     *
     * @type {object}
     */
    options: object;
    /**
     * The asset registry that this Asset belongs to.
     *
     * @type {AssetRegistry|null}
     */
    registry: AssetRegistry | null;
    /**
     * Asset tags. Enables finding of assets by tags using the {@link AssetRegistry#findByTag} method.
     *
     * @type {Tags}
     */
    tags: Tags;
    /**
     * The type of the asset.
     *
     * @type {"animation"|"audio"|"binary"|"container"|"cubemap"|"css"|"font"|"gsplat"|"json"|"html"|"material"|"model"|"render"|"script"|"shader"|"sprite"|"template"|"text"|"texture"|"textureatlas"}
     */
    type: "animation" | "audio" | "binary" | "container" | "cubemap" | "css" | "font" | "gsplat" | "json" | "html" | "material" | "model" | "render" | "script" | "shader" | "sprite" | "template" | "text" | "texture" | "textureatlas";
    /**
     * The URL object.
     *
     * @type {string | null}
     * @ignore
     */
    urlObject: string | null;
    _name: string;
    _data: any;
    /**
     * Sets the file details or null if no file.
     *
     * @type {object}
     */
    set file(value: object);
    /**
     * Gets the file details or null if no file.
     *
     * @type {object}
     */
    get file(): object;
    /**
     * Sets the asset name.
     *
     * @type {string}
     */
    set name(value: string);
    /**
     * Gets the asset name.
     *
     * @type {string}
     */
    get name(): string;
    /**
     * Sets optional asset JSON data. This contains either the complete resource data (such as in
     * the case of a material) or additional data (such as in the case of a model which contains
     * mappings from mesh to material).
     *
     * @type {object}
     */
    set data(value: object);
    /**
     * Gets optional asset JSON data.
     *
     * @type {object}
     */
    get data(): object;
    /**
     * Sets the asset resource. For example, a {@link StandardMaterial} or a {@link Texture}.
     *
     * @type {object}
     */
    set resource(value: object);
    /**
     * Gets the asset resource.
     *
     * @type {object}
     */
    get resource(): object;
    /**
     * Sets the asset resources. Some assets can hold more than one runtime resource (cube maps,
     * for example).
     *
     * @type {object[]}
     */
    set resources(value: object[]);
    /**
     * Gets the asset resources.
     *
     * @type {object[]}
     */
    get resources(): object[];
    /**
     * Sets whether to preload an asset. If true, the asset will be loaded during the preload phase
     * of application initialization or when calling {@link AssetRegistry#add}.
     *
     * @type {boolean}
     */
    set preload(value: boolean);
    /**
     * Gets whether to preload an asset.
     *
     * @type {boolean}
     */
    get preload(): boolean;
    set loadFaces(value: any);
    get loadFaces(): any;
    _loadFaces: any;
    /**
     * Return the URL required to fetch the file for this asset.
     *
     * @returns {string|null} The URL. Returns null if the asset has no associated file.
     * @example
     * const assets = app.assets.find("My Image", "texture");
     * const img = "&lt;img src='" + assets[0].getFileUrl() + "'&gt;";
     */
    getFileUrl(): string | null;
    /**
     * Construct an asset URL from this asset's location and a relative path. If the relativePath
     * is a blob or Base64 URI, then return that instead.
     *
     * @param {string} relativePath - The relative path to be concatenated to this asset's base url.
     * @returns {string} Resulting URL of the asset.
     * @ignore
     */
    getAbsoluteUrl(relativePath: string): string;
    /**
     * Returns the asset id of the asset that corresponds to the specified locale.
     *
     * @param {string} locale - The desired locale e.g. Ar-AR.
     * @returns {number} An asset id or null if there is no asset specified for the desired locale.
     * @ignore
     */
    getLocalizedAssetId(locale: string): number;
    /**
     * Adds a replacement asset id for the specified locale. When the locale in
     * {@link AppBase#i18n} changes then references to this asset will be replaced with the
     * specified asset id. (Currently only supported by the {@link ElementComponent}).
     *
     * @param {string} locale - The locale e.g. Ar-AR.
     * @param {number} assetId - The asset id.
     * @ignore
     */
    addLocalizedAssetId(locale: string, assetId: number): void;
    /**
     * Removes a localized asset.
     *
     * @param {string} locale - The locale e.g. Ar-AR.
     * @ignore
     */
    removeLocalizedAssetId(locale: string): void;
    /**
     * Take a callback which is called as soon as the asset is loaded. If the asset is already
     * loaded the callback is called straight away.
     *
     * @param {AssetReadyCallback} callback - The function called when the asset is ready. Passed
     * the (asset) arguments.
     * @param {object} [scope] - Scope object to use when calling the callback.
     * @example
     * const asset = app.assets.find("My Asset");
     * asset.ready((asset) => {
     *     // asset loaded
     * });
     * app.assets.load(asset);
     */
    ready(callback: AssetReadyCallback, scope?: object): void;
    reload(): void;
    /**
     * Destroys the associated resource and marks asset as unloaded.
     *
     * @example
     * const asset = app.assets.find("My Asset");
     * asset.unload();
     * // asset.resource is null
     */
    unload(): void;
}
import { EventHandler } from '../../core/event-handler.js';
import type { AssetRegistry } from './asset-registry.js';
import { Tags } from '../../core/tags.js';
import type { ResourceLoaderCallback } from '../handlers/loader.js';
