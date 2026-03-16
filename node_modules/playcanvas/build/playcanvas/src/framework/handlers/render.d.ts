/**
 * Resource handler used for loading {@link Render} resources.
 *
 * @category Graphics
 */
export class RenderHandler extends ResourceHandler {
    /**
     * Create a new RenderHandler instance.
     *
     * @param {AppBase} app - The running {@link AppBase}.
     * @ignore
     */
    constructor(app: AppBase);
    _registry: import("../asset/asset-registry.js").AssetRegistry;
    open(url: any, data: any): Render;
    patch(asset: any, registry: any): void;
}
import { ResourceHandler } from './handler.js';
import { Render } from '../../scene/render.js';
import type { AppBase } from '../app-base.js';
