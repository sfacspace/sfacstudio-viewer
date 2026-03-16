/**
 * @import { BindGroup } from '../../platform/graphics/bind-group.js'
 * @import { Layer } from '../layer.js'
 * @import { RenderTarget } from '../../platform/graphics/render-target.js'
 */
/**
 * Class representing an entry in the final order of rendering of cameras and layers in the engine
 * this is populated at runtime based on LayerComposition
 *
 * @ignore
 */
export class RenderAction {
    camera: any;
    /** @type {Layer|null} */
    layer: Layer | null;
    transparent: boolean;
    /**
     * Render target this render action renders to.
     *
     * @type {RenderTarget|null}
     */
    renderTarget: RenderTarget | null;
    lightClusters: any;
    clearColor: boolean;
    clearDepth: boolean;
    clearStencil: boolean;
    triggerPostprocess: boolean;
    firstCameraUse: boolean;
    lastCameraUse: boolean;
    /** @type {BindGroup[]} */
    viewBindGroups: BindGroup[];
    useCameraPasses: boolean;
    destroy(): void;
    setupClears(camera: any, layer: any): void;
}
import type { Layer } from '../layer.js';
import type { RenderTarget } from '../../platform/graphics/render-target.js';
import type { BindGroup } from '../../platform/graphics/bind-group.js';
