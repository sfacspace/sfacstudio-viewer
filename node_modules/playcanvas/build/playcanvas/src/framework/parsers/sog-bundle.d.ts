export class SogBundleParser {
    constructor(app: any, maxRetries?: number);
    /** @type {AppBase} */
    app: AppBase;
    /** @type {number} */
    maxRetries: number;
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
    }, callback: ResourceHandlerCallback, asset: Asset): Promise<void>;
}
import type { AppBase } from '../app-base.js';
import type { ResourceHandlerCallback } from '../handlers/handler.js';
import { Asset } from '../../framework/asset/asset.js';
