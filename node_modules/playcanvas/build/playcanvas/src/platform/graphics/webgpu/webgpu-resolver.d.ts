/**
 * @import { WebgpuGraphicsDevice } from './webgpu-graphics-device.js'
 * @import { WebgpuShader } from './webgpu-shader.js'
 */
/**
 * A WebGPU helper class implementing custom resolve of multi-sampled textures.
 *
 * @ignore
 */
export class WebgpuResolver {
    constructor(device: any);
    /** @type {WebgpuGraphicsDevice} */
    device: WebgpuGraphicsDevice;
    /**
     * Cache of render pipelines for each texture format, to avoid their per frame creation.
     *
     * @type {Map<GPUTextureFormat, GPURenderPipeline>}
     * @private
     */
    private pipelineCache;
    shader: Shader;
    destroy(): void;
    /**
     * @param {GPUTextureFormat} format - Texture format.
     * @returns {GPURenderPipeline} Pipeline for the given format.
     * @private
     */
    private getPipeline;
    /**
     * @param {GPUTextureFormat} format - Texture format.
     * @returns {GPURenderPipeline} Pipeline for the given format.
     * @private
     */
    private createPipeline;
    /**
     * @param {GPUCommandEncoder} commandEncoder - Command encoder to use for the resolve.
     * @param {GPUTexture} sourceTexture - Source multi-sampled depth texture to resolve.
     * @param {GPUTexture} destinationTexture - Destination depth texture to resolve to.
     * @private
     */
    private resolveDepth;
}
import type { WebgpuGraphicsDevice } from './webgpu-graphics-device.js';
import { Shader } from '../shader.js';
