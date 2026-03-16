/**
 * Render pass implementation of Screen-Space Ambient Occlusion (SSAO) based on the non-linear depth
 * buffer.
 *
 * @category Graphics
 * @ignore
 */
export class RenderPassSsao extends RenderPassShaderQuad {
    constructor(device: any, sourceTexture: any, cameraComponent: any, blurEnabled: any);
    /**
     * The filter radius.
     *
     * @type {number}
     */
    radius: number;
    /**
     * The intensity.
     *
     * @type {number}
     */
    intensity: number;
    /**
     * The power controlling the falloff curve.
     *
     * @type {number}
     */
    power: number;
    /**
     * The number of samples to take.
     *
     * @type {number}
     */
    sampleCount: number;
    /**
     * The minimum angle in degrees that creates an occlusion. Helps to reduce fake occlusions due
     * to low geometry tessellation.
     *
     * @type {number}
     */
    minAngle: number;
    /**
     * Enable randomization of the sample pattern. Useful when TAA is used to remove the noise,
     * instead of blurring.
     */
    randomize: boolean;
    /**
     * The texture containing the occlusion information in the red channel.
     *
     * @type {Texture}
     * @readonly
     */
    readonly ssaoTexture: Texture;
    /** @type {number} */
    _scale: number;
    _blueNoise: BlueNoise;
    sourceTexture: any;
    cameraComponent: any;
    ssaoTextureId: any;
    ssaoTextureSizeInvId: any;
    /**
     * The scale multiplier for the render target size.
     *
     * @type {number}
     */
    set scale(value: number);
    get scale(): number;
    createRenderTarget(name: any): RenderTarget;
}
import { RenderPassShaderQuad } from '../../scene/graphics/render-pass-shader-quad.js';
import { Texture } from '../../platform/graphics/texture.js';
import { BlueNoise } from '../../core/math/blue-noise.js';
import { RenderTarget } from '../../platform/graphics/render-target.js';
