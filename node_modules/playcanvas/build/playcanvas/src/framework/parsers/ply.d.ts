export type DataType = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;
export type PlyProperty = {
    /**
     * - E.g. 'float'.
     */
    type: string;
    /**
     * - E.g. 'x', 'y', 'z', 'f_dc_0' etc.
     */
    name: string;
    /**
     * - Data type, e.g. instance of Float32Array.
     */
    storage: DataType;
    /**
     * - BYTES_PER_ELEMENT of given data type.
     */
    byteSize: number;
};
export type PlyElement = {
    /**
     * - E.g. 'vertex'.
     */
    name: string;
    /**
     * - Given count.
     */
    count: number;
    /**
     * - The properties.
     */
    properties: PlyProperty[];
};
export class PlyParser {
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
    /**
     * @param {string} url - The URL.
     * @param {GSplatResource} data - The data.
     * @returns {GSplatResource} Return the data.
     */
    open(url: string, data: GSplatResource): GSplatResource;
}
import type { AppBase } from '../app-base.js';
import type { ResourceHandlerCallback } from '../handlers/handler.js';
import type { Asset } from '../asset/asset.js';
import { GSplatResource } from '../../scene/gsplat/gsplat-resource.js';
