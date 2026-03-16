/**
 * @import { FrameGraph } from '../../scene/frame-graph.js'
 * @import { GraphicsDevice } from '../../platform/graphics/graphics-device.js'
 * @import { Light } from '../../scene/light.js'
 * @import { Renderer } from './renderer.js'
 * @import { ShadowRenderer } from './shadow-renderer.js'
 */
export class ShadowRendererLocal {
    constructor(renderer: any, shadowRenderer: any);
    shadowLights: any[];
    /** @type {Renderer} */
    renderer: Renderer;
    /** @type {ShadowRenderer} */
    shadowRenderer: ShadowRenderer;
    /** @type {GraphicsDevice} */
    device: GraphicsDevice;
    cull(light: any, comp: any, casters?: any): void;
    prepareLights(shadowLights: any, lights: any): any;
    /**
     * Prepare render passes for rendering of shadows for local non-clustered lights. Each shadow face
     * is a separate render pass as it renders to a separate render target.
     *
     * @param {FrameGraph} frameGraph - The frame graph.
     * @param {Light[]} localLights - The list of local lights.
     */
    buildNonClusteredRenderPasses(frameGraph: FrameGraph, localLights: Light[]): void;
}
import type { Renderer } from './renderer.js';
import type { ShadowRenderer } from './shadow-renderer.js';
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import type { FrameGraph } from '../../scene/frame-graph.js';
import type { Light } from '../../scene/light.js';
