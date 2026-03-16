/**
 * A render pass implementation of Temporal Anti-Aliasing (TAA).
 *
 * @category Graphics
 * @ignore
 */
export class RenderPassTAA extends RenderPassShaderQuad {
    constructor(device: any, sourceTexture: any, cameraComponent: any);
    /**
     * The index of the history texture to render to.
     *
     * @type {number}
     */
    historyIndex: number;
    /**
     * @type {Texture}
     */
    historyTexture: Texture;
    /**
     * @type {Texture[]}
     */
    historyTextures: Texture[];
    /**
     * @type {RenderTarget[]}
     */
    historyRenderTargets: RenderTarget[];
    sourceTexture: any;
    cameraComponent: any;
    sourceTextureId: any;
    textureSizeId: any;
    textureSize: Float32Array<ArrayBuffer>;
    historyTextureId: any;
    viewProjPrevId: any;
    viewProjInvId: any;
    jittersId: any;
    cameraParams: Float32Array<ArrayBuffer>;
    cameraParamsId: any;
    setup(): void;
    update(): Texture;
}
import { RenderPassShaderQuad } from '../../scene/graphics/render-pass-shader-quad.js';
import { Texture } from '../../platform/graphics/texture.js';
import { RenderTarget } from '../../platform/graphics/render-target.js';
