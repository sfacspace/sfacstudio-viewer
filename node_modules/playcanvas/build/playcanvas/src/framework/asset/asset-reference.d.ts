/**
 * @import { Asset } from './asset.js'
 * @import { AssetRegistry } from './asset-registry.js'
 * @import { EventHandle } from '../../core/event-handle.js'
 */
/**
 * An object that manages the case where an object holds a reference to an asset and needs to be
 * notified when changes occur in the asset. e.g. notifications include load, add and remove
 * events.
 *
 * @category Asset
 */
export class AssetReference {
    /**
     * Create a new AssetReference instance.
     *
     * @param {string} propertyName - The name of the property that the asset is stored under,
     * passed into callbacks to enable updating.
     * @param {Asset|object} parent - The parent object that contains the asset reference, passed
     * into callbacks to enable updating. Currently an asset, but could be component or other.
     * @param {AssetRegistry} registry - The asset registry that stores all assets.
     * @param {object} callbacks - A set of functions called when the asset state changes: load,
     * add, remove.
     * @param {object} [callbacks.load] - The function called when the asset loads
     * load(propertyName, parent, asset).
     * @param {object} [callbacks.add] - The function called when the asset is added to the
     * registry add(propertyName, parent, asset).
     * @param {object} [callbacks.remove] - The function called when the asset is remove from the
     * registry remove(propertyName, parent, asset).
     * @param {object} [callbacks.unload] - The function called when the asset is unloaded
     * unload(propertyName, parent, asset).
     * @param {object} [scope] - The scope to call the callbacks in.
     * @example
     * const reference = new pc.AssetReference('textureAsset', this, this.app.assets, {
     *     load: this.onTextureAssetLoad,
     *     add: this.onTextureAssetAdd,
     *     remove: this.onTextureAssetRemove
     * }, this);
     * reference.id = this.textureAsset.id;
     */
    constructor(propertyName: string, parent: Asset | object, registry: AssetRegistry, callbacks: {
        load?: object;
        add?: object;
        remove?: object;
        unload?: object;
    }, scope?: object);
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtLoadById;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtUnloadById;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtAddById;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtRemoveById;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtLoadByUrl;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtAddByUrl;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtRemoveByUrl;
    propertyName: string;
    parent: any;
    _scope: any;
    _registry: AssetRegistry;
    /**
     * Sets the asset id which this references. One of either id or url must be set to
     * initialize an asset reference.
     *
     * @type {number}
     */
    set id(value: number);
    /**
     * Gets the asset id which this references.
     *
     * @type {number}
     */
    get id(): number;
    /**
     * Sets the asset url which this references. One of either id or url must be called to
     * initialize an asset reference.
     *
     * @type {string|null}
     */
    set url(value: string | null);
    /**
     * Gets the asset url which this references.
     *
     * @type {string|null}
     */
    get url(): string | null;
    asset: any;
    _onAssetLoad: any;
    _onAssetAdd: any;
    _onAssetRemove: any;
    _onAssetUnload: any;
    _id: number;
    _url: string;
    _bind(): void;
    _unbind(): void;
    _onLoad(asset: any): void;
    _onAdd(asset: any): void;
    _onRemove(asset: any): void;
    _onUnload(asset: any): void;
}
import type { AssetRegistry } from './asset-registry.js';
import type { Asset } from './asset.js';
