/**
 * @import { RenderPass } from '../platform/graphics/render-pass.js'
 * @import { RenderTarget } from '../platform/graphics/render-target.js'
 * @import { Texture } from '../platform/graphics/texture.js'
 */
/**
 * A frame graph represents a single rendering frame as a sequence of render passes.
 *
 * @ignore
 */
export class FrameGraph {
    /** @type {RenderPass[]} */
    renderPasses: RenderPass[];
    /**
     * Map used during frame graph compilation. It maps a render target to its previous occurrence.
     *
     *  @type {Map<RenderTarget, RenderPass>}
     */
    renderTargetMap: Map<RenderTarget, RenderPass>;
    /**
     * Add a render pass to the frame.
     *
     * @param {RenderPass} renderPass - The render pass to add.
     */
    addRenderPass(renderPass: RenderPass): void;
    reset(): void;
    compile(): void;
    render(device: any): void;
}
import type { RenderPass } from '../platform/graphics/render-pass.js';
import type { RenderTarget } from '../platform/graphics/render-target.js';
