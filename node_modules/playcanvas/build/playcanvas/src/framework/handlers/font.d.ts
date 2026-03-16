/**
 * Resource handler used for loading {@link Font} resources.
 *
 * @category User Interface
 */
export class FontHandler extends ResourceHandler {
    /**
     * Create a new FontHandler instance.
     *
     * @param {AppBase} app - The running {@link AppBase}.
     * @ignore
     */
    constructor(app: AppBase);
    _loader: import("./loader.js").ResourceLoader;
    load(url: any, callback: any, asset: any): void;
    _loadTextures(url: any, data: any, callback: any): void;
    open(url: any, data: any, asset: any): Font;
    patch(asset: any, assets: any): void;
}
import { ResourceHandler } from './handler.js';
import { Font } from '../font/font.js';
import type { AppBase } from '../app-base.js';
