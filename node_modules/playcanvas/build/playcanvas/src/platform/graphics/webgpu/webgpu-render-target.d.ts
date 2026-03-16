/**
 * A WebGPU implementation of the RenderTarget.
 *
 * @ignore
 */
export class WebgpuRenderTarget {
    /**
     * @param {RenderTarget} renderTarget - The render target owning this implementation.
     */
    constructor(renderTarget: RenderTarget);
    /** @type {boolean} */
    initialized: boolean;
    /**
     * Unique key used by render pipeline creation
     *
     * @type {number}
     */
    key: number;
    /** @type {ColorAttachment[]} */
    colorAttachments: ColorAttachment[];
    /** @type {DepthAttachment|null} */
    depthAttachment: DepthAttachment | null;
    /**
     * Texture assigned each frame, and not owned by this render target. This is used on the
     * framebuffer to assign per frame texture obtained from the context.
     *
     * @type {GPUTexture}
     * @private
     */
    private assignedColorTexture;
    /**
     * Render pass descriptor used when starting a render pass for this render target.
     *
     * @type {GPURenderPassDescriptor}
     * @private
     */
    private renderPassDescriptor;
    /**
     * True if this is the backbuffer of the device.
     *
     * @type {boolean}
     */
    isBackbuffer: boolean;
    renderTarget: RenderTarget;
    /**
     * Release associated resources. Note that this needs to leave this instance in a state where
     * it can be re-initialized again, which is used by render target resizing.
     *
     * @param {WebgpuGraphicsDevice} device - The graphics device.
     */
    destroy(device: WebgpuGraphicsDevice): void;
    updateKey(): void;
    /**
     * Assign a color buffer. This allows the color buffer of the main framebuffer
     * to be swapped each frame to a buffer provided by the context.
     *
     * @param {WebgpuGraphicsDevice} device - The WebGPU graphics device.
     * @param {any} gpuTexture - The color buffer.
     */
    assignColorTexture(device: WebgpuGraphicsDevice, gpuTexture: any): void;
    setColorAttachment(index: any, multisampledBuffer: any, format: any): void;
    /**
     * Initialize render target for rendering one time.
     *
     * @param {WebgpuGraphicsDevice} device - The graphics device.
     * @param {RenderTarget} renderTarget - The render target.
     */
    init(device: WebgpuGraphicsDevice, renderTarget: RenderTarget): void;
    initDepthStencil(device: any, wgpu: any, renderTarget: any): void;
    /**
     * @param {WebgpuGraphicsDevice} device - The graphics device.
     * @param {GPUDevice} wgpu - The WebGPU device.
     * @param {RenderTarget} renderTarget - The render target.
     * @param {number} index - The color buffer index.
     * @returns {GPURenderPassColorAttachment} The color attachment.
     * @private
     */
    private initColor;
    /**
     * Update WebGPU render pass descriptor by RenderPass settings.
     *
     * @param {RenderPass} renderPass - The render pass to start.
     * @param {RenderTarget} renderTarget - The render target to render to.
     */
    setupForRenderPass(renderPass: RenderPass, renderTarget: RenderTarget): void;
    loseContext(): void;
    resolve(device: any, target: any, color: any, depth: any): void;
}
/**
 * Private class storing info about color buffer.
 *
 * @private
 */
declare class ColorAttachment {
    /**
     * @type {GPUTextureFormat}
     * @private
     */
    private format;
    /**
     * @type {GPUTexture}
     * @private
     */
    private multisampledBuffer;
    destroy(): void;
}
/**
 * Private class storing info about depth-stencil buffer.
 *
 * @private
 */
declare class DepthAttachment {
    /**
     * @param {string} gpuFormat - The WebGPU format (GPUTextureFormat).
     */
    constructor(gpuFormat: string);
    /**
     * @type {GPUTextureFormat}
     * @private
     */
    private format;
    /** @type {boolean} */
    hasStencil: boolean;
    /**
     * @type {GPUTexture|null}
     * @private
     */
    private depthTexture;
    /**
     * True if the depthTexture is internally allocated / owned
     *
     * @type {boolean}
     */
    depthTextureInternal: boolean;
    /**
     * Multi-sampled depth buffer allocated over the user provided depth buffer.
     *
     * @type {GPUTexture|null}
     * @private
     */
    private multisampledDepthBuffer;
    /**
     * Key used to store multisampledDepthBuffer in the cache.
     */
    multisampledDepthBufferKey: any;
    destroy(device: any): void;
}
import type { RenderTarget } from '../render-target.js';
import type { WebgpuGraphicsDevice } from '../webgpu/webgpu-graphics-device.js';
import type { RenderPass } from '../render-pass.js';
export {};
