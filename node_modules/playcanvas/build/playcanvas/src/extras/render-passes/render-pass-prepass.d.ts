/**
 * A render pass which typically executes before the rendering of the main scene, and renders data
 * that is required for the main rendering pass (and also in following passes) into separate render
 * targets. This can include depth, normals, velocity, etc, used by TAA, motion blur, SSAO, etc.
 *
 * @category Graphics
 * @ignore
 */
export class RenderPassPrepass extends RenderPass {
    constructor(device: any, scene: any, renderer: any, camera: any, options: any);
    /** @type {BindGroup[]} */
    viewBindGroups: BindGroup[];
    /** @type {Texture} */
    linearDepthTexture: Texture;
    /** @type {Color} */
    linearDepthClearValue: Color;
    scene: any;
    renderer: any;
    camera: any;
    setupRenderTarget(options: any): void;
    linearDepthFormat: number;
}
import { RenderPass } from '../../platform/graphics/render-pass.js';
import type { BindGroup } from '../../platform/graphics/bind-group.js';
import { Texture } from '../../platform/graphics/texture.js';
import { Color } from '../../core/math/color.js';
