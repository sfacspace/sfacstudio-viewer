/**
 * Render pass implementation of a up-sample filter.
 *
 * @category Graphics
 * @ignore
 */
export class RenderPassUpsample extends RenderPassShaderQuad {
    constructor(device: any, sourceTexture: any);
    sourceTexture: any;
    sourceTextureId: any;
    sourceInvResolutionId: any;
    sourceInvResolutionValue: Float32Array<ArrayBuffer>;
}
import { RenderPassShaderQuad } from '../../scene/graphics/render-pass-shader-quad.js';
