/**
 * Render pass implementation of a Circle of Confusion texture generation, used by Depth of Field.
 * This pass generates a CoC texture based on the scene's depth buffer, and focus range and distance
 * parameters. The CoC texture stores far and near CoC values in the red and green channels.
 *
 * @category Graphics
 * @ignore
 */
export class RenderPassCoC extends RenderPassShaderQuad {
    constructor(device: any, cameraComponent: any, nearBlur: any);
    focusDistance: any;
    focusRange: any;
    cameraComponent: any;
    paramsId: any;
    paramsValue: Float32Array<ArrayBuffer>;
    cameraParams: Float32Array<ArrayBuffer>;
    cameraParamsId: any;
}
import { RenderPassShaderQuad } from '../../scene/graphics/render-pass-shader-quad.js';
