/**
 * @import { AppBase } from '../app-base.js'
 * @import { ResourceHandlerCallback } from '../handlers/handler.js'
 */
export class SogsParser {
    /**
     * @param {AppBase} app - The app instance.
     * @param {number} maxRetries - Maximum amount of retries.
     */
    constructor(app: AppBase, maxRetries: number);
    /** @type {AppBase} */
    app: AppBase;
    /** @type {number} */
    maxRetries: number;
    /**
     * Checks if loading should be aborted due to asset unload or invalid device.
     *
     * @param {Asset} asset - The asset being loaded.
     * @param {boolean} unloaded - Whether the asset was unloaded during async loading.
     * @returns {boolean} True if loading should be aborted.
     * @private
     */
    private _shouldAbort;
    loadTextures(url: any, callback: any, asset: any, meta: any): Promise<void>;
    /**
     * @param {object} url - The URL of the resource to load.
     * @param {string} url.load - The URL to use for loading the resource.
     * @param {string} url.original - The original URL useful for identifying the resource type.
     * @param {ResourceHandlerCallback} callback - The callback used when
     * the resource is loaded or an error occurs.
     * @param {Asset} asset - Container asset.
     */
    load(url: {
        load: string;
        original: string;
    }, callback: ResourceHandlerCallback, asset: Asset): void;
}
import type { AppBase } from '../app-base.js';
import type { ResourceHandlerCallback } from '../handlers/handler.js';
import { Asset } from '../../framework/asset/asset.js';
