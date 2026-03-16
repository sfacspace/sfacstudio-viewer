export class ShadowRendererDirectional {
    constructor(renderer: any, shadowRenderer: any);
    /** @type {Renderer} */
    renderer: Renderer;
    /** @type {ShadowRenderer} */
    shadowRenderer: ShadowRenderer;
    /** @type {GraphicsDevice} */
    device: GraphicsDevice;
    cull(light: any, comp: any, camera: any, casters?: any): void;
    generateSplitDistances(light: any, nearDist: any, farDist: any): void;
    /**
     * Create a render pass for directional light shadow rendering for a specified camera.
     *
     * @param {Light} light - The directional light.
     * @param {Camera} camera - The camera.
     * @returns {RenderPassShadowDirectional|null} - The render pass if the shadow rendering is
     * required, or null otherwise.
     */
    getLightRenderPass(light: Light, camera: Camera): RenderPassShadowDirectional | null;
}
import type { Renderer } from './renderer.js';
import type { ShadowRenderer } from './shadow-renderer.js';
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import type { Light } from '../light.js';
import type { Camera } from '../camera.js';
import { RenderPassShadowDirectional } from './render-pass-shadow-directional.js';
