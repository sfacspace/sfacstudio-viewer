/**
 * @import { AppBase } from '../app-base.js'
 */
/**
 * Loads Bundle Assets.
 *
 * @ignore
 */
export class BundleHandler extends ResourceHandler {
    /**
     * Create a new BundleHandler instance.
     *
     * @param {AppBase} app - The running {@link AppBase}.
     */
    constructor(app: AppBase);
    _assets: import("../asset/asset-registry.js").AssetRegistry;
    _fetchRetries(url: any, options: any, retries?: number): Promise<any>;
    load(url: any, callback: any): void;
    /**
     * Open the bundle.
     *
     * @param {string} url - The URL of the resource to open.
     * @param {Bundle} bundle - Bundle to open.
     * @returns {Bundle} The bundle.
     */
    open(url: string, bundle: Bundle): Bundle;
}
import { ResourceHandler } from './handler.js';
import { Bundle } from '../bundle/bundle.js';
import type { AppBase } from '../app-base.js';
