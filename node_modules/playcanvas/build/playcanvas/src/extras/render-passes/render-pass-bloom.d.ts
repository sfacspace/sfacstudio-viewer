/**
 * @import { GraphicsDevice } from '../../platform/graphics/graphics-device.js'
 */
/**
 * Render pass implementation of HDR bloom effect.
 *
 * @category Graphics
 * @ignore
 */
export class RenderPassBloom extends RenderPass {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {Texture} sourceTexture - The source texture, usually at half the resolution of the
     * render target getting blurred.
     * @param {number} format - The texture format.
     */
    constructor(device: GraphicsDevice, sourceTexture: Texture, format: number);
    bloomTexture: Texture;
    blurLevel: number;
    bloomRenderTarget: RenderTarget;
    textureFormat: number;
    renderTargets: any[];
    _sourceTexture: Texture;
    destroyRenderTargets(startIndex?: number): void;
    destroyRenderPasses(): void;
    createRenderTarget(index: any): RenderTarget;
    createRenderTargets(count: any): void;
    calcMipLevels(width: any, height: any, minSize: any): number;
    createRenderPasses(numPasses: any): void;
}
import { RenderPass } from '../../platform/graphics/render-pass.js';
import { Texture } from '../../platform/graphics/texture.js';
import { RenderTarget } from '../../platform/graphics/render-target.js';
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
