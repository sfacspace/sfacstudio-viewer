/**
 * Render pass implementation of a depth-aware bilateral blur filter.
 *
 * @category Graphics
 * @ignore
 */
export class RenderPassDepthAwareBlur extends RenderPassShaderQuad {
    constructor(device: any, sourceTexture: any, cameraComponent: any, horizontal: any);
    sourceTexture: any;
    sourceTextureId: import("../../index.js").ScopeId;
    sourceInvResolutionId: import("../../index.js").ScopeId;
    sourceInvResolutionValue: Float32Array<ArrayBuffer>;
    filterSizeId: import("../../index.js").ScopeId;
}
import { RenderPassShaderQuad } from '../../scene/graphics/render-pass-shader-quad.js';
