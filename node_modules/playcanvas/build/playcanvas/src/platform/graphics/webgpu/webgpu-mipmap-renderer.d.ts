/**
 * @import { WebgpuGraphicsDevice } from './webgpu-graphics-device.js'
 * @import { WebgpuShader } from './webgpu-shader.js'
 * @import { WebgpuTexture } from './webgpu-texture.js'
 */
/**
 * A WebGPU helper class implementing texture mipmap generation.
 *
 * @ignore
 */
export class WebgpuMipmapRenderer {
    constructor(device: any);
    /** @type {WebgpuGraphicsDevice} */
    device: WebgpuGraphicsDevice;
    /**
     * Cache of render pipelines keyed by texture format.
     *
     * @type {Map<string, GPURenderPipeline>}
     * @private
     */
    private pipelineCache;
    shader: Shader;
    minSampler: any;
    destroy(): void;
    /**
     * Generates mipmaps for the specified WebGPU texture.
     *
     * @param {WebgpuTexture} webgpuTexture - The texture to generate mipmaps for.
     */
    generate(webgpuTexture: WebgpuTexture): void;
}
import type { WebgpuGraphicsDevice } from './webgpu-graphics-device.js';
import { Shader } from '../shader.js';
import type { WebgpuTexture } from './webgpu-texture.js';
