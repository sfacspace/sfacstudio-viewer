/**
 * @import { AppBase } from '../app-base.js'
 */
/**
 * Resource handler used for loading {@link Scene} resources.
 *
 * @category Graphics
 */
export class SceneHandler extends ResourceHandler {
    /**
     * Create a new SceneHandler instance.
     *
     * @param {AppBase} app - The running {@link AppBase}.
     * @ignore
     */
    constructor(app: AppBase);
    load(url: any, callback: any): void;
    open(url: any, data: any): import("../../index.js").Scene;
}
import { ResourceHandler } from './handler.js';
import type { AppBase } from '../app-base.js';
