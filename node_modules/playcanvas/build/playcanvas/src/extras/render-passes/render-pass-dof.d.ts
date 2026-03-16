/**
 * @import { GraphicsDevice } from '../../platform/graphics/graphics-device.js'
 * @import { CameraComponent } from '../../framework/components/camera/component.js'
 */
/**
 * Render pass implementation of Depth of Field effect.
 *
 * @category Graphics
 * @ignore
 */
export class RenderPassDof extends RenderPass {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {CameraComponent} cameraComponent - The camera component.
     * @param {Texture} sceneTexture - The full resolution texture.
     * @param {Texture} sceneTextureHalf - The half resolution texture.
     * @param {boolean} highQuality - Whether to use high quality setup.
     * @param {boolean} nearBlur - Whether to apply near blur.
     */
    constructor(device: GraphicsDevice, cameraComponent: CameraComponent, sceneTexture: Texture, sceneTextureHalf: Texture, highQuality: boolean, nearBlur: boolean);
    focusDistance: number;
    focusRange: number;
    blurRadius: number;
    blurRings: number;
    blurRingPoints: number;
    highQuality: boolean;
    /** @type {Texture|null} */
    cocTexture: Texture | null;
    /** @type {Texture|null} */
    blurTexture: Texture | null;
    /** @type {RenderPassCoC|null} */
    cocPass: RenderPassCoC | null;
    /** @type {RenderPassDownsample|null} */
    farPass: RenderPassDownsample | null;
    /** @type {RenderPassDofBlur|null} */
    blurPass: RenderPassDofBlur | null;
    cocRT: RenderTarget;
    farRt: RenderTarget;
    blurRt: RenderTarget;
    destroyRenderPasses(): void;
    destroyRT(rt: any): void;
    setupCocPass(device: any, cameraComponent: any, sourceTexture: any, nearBlur: any): RenderPassCoC;
    setupFarPass(device: any, sourceTexture: any, scale: any): RenderPassDownsample;
    setupBlurPass(device: any, nearTexture: any, nearBlur: any, scale: any): RenderPassDofBlur;
    createTexture(name: any, format: any): Texture;
    createRenderTarget(name: any, format: any): RenderTarget;
}
import { RenderPass } from '../../platform/graphics/render-pass.js';
import { Texture } from '../../platform/graphics/texture.js';
import { RenderPassCoC } from './render-pass-coc.js';
import { RenderPassDownsample } from './render-pass-downsample.js';
import { RenderPassDofBlur } from './render-pass-dof-blur.js';
import { RenderTarget } from '../../platform/graphics/render-target.js';
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import type { CameraComponent } from '../../framework/components/camera/component.js';
