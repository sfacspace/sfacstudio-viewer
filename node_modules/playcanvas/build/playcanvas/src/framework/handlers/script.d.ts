/**
 * Resource handler for loading JavaScript files dynamically.  Two types of JavaScript files can be
 * loaded, PlayCanvas scripts which contain calls to {@link createScript}, or regular JavaScript
 * files, such as third-party libraries.
 *
 * @category Script
 */
export class ScriptHandler extends ResourceHandler {
    /**
     * Create a new ScriptHandler instance.
     *
     * @param {AppBase} app - The running {@link AppBase}.
     * @ignore
     */
    constructor(app: AppBase);
    _scripts: {};
    _cache: {};
    clearCache(): void;
    load(url: any, callback: any): void;
    open(url: any, data: any): any;
    patch(asset: any, assets: any): void;
    _loadScript(url: any, callback: any): void;
    _loadModule(url: any, callback: any): void;
}
import { ResourceHandler } from './handler.js';
import type { AppBase } from '../app-base.js';
