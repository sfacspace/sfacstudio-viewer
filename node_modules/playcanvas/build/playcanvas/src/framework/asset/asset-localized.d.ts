export class LocalizedAsset extends EventHandler {
    constructor(app: any);
    _app: any;
    _autoLoad: boolean;
    _disableLocalization: boolean;
    /** @type {number} */
    _defaultAsset: number;
    /** @type {number} */
    _localizedAsset: number;
    /**
     * @param {Asset | number} value - The asset or id.
     */
    set defaultAsset(value: Asset | number);
    get defaultAsset(): Asset | number;
    /**
     * @param {Asset | number} value - The asset or id.
     */
    set localizedAsset(value: Asset | number);
    get localizedAsset(): Asset | number;
    set autoLoad(value: boolean);
    get autoLoad(): boolean;
    set disableLocalization(value: boolean);
    get disableLocalization(): boolean;
    _bindDefaultAsset(): void;
    _unbindDefaultAsset(): void;
    _onDefaultAssetAdd(asset: any): void;
    _onDefaultAssetRemove(asset: any): void;
    _bindLocalizedAsset(): void;
    _unbindLocalizedAsset(): void;
    _onLocalizedAssetAdd(asset: any): void;
    _onLocalizedAssetLoad(asset: any): void;
    _onLocalizedAssetChange(asset: any, name: any, newValue: any, oldValue: any): void;
    _onLocalizedAssetRemove(asset: any): void;
    _onLocaleAdd(locale: any, assetId: any): void;
    _onLocaleRemove(locale: any, assetId: any): void;
    _onSetLocale(locale: any): void;
    destroy(): void;
}
import { EventHandler } from '../../core/event-handler.js';
import { Asset } from './asset.js';
