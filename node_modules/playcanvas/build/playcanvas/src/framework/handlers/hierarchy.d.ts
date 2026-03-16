/**
 * @import { AppBase } from '../app-base.js'
 */
export class HierarchyHandler extends ResourceHandler {
    /**
     * @param {AppBase} app - The running {@link AppBase}.
     */
    constructor(app: AppBase);
    load(url: any, callback: any): void;
    open(url: any, data: any): import("../entity.js").Entity;
}
import { ResourceHandler } from './handler.js';
import type { AppBase } from '../app-base.js';
