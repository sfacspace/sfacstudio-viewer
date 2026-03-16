/**
 * @import { GraphicsDevice } from '../../platform/graphics/graphics-device.js'
 * @import { Shader } from '../../platform/graphics/shader.js'
 */
/**
 * Manages the intervals texture generation for GSplat LOD system using GPU acceleration. A list of
 * intervals is provided to the update method, and the texture is generated on the GPU. The texture
 * is then used to map target indices to source splat indices.
 *
 * @ignore
 */
export class GSplatIntervalTexture {
    /**
     * @param {GraphicsDevice} device - The graphics device
     */
    constructor(device: GraphicsDevice);
    /** @type {GraphicsDevice} */
    device: GraphicsDevice;
    /**
     * Texture that maps target indices to source splat indices based on intervals
     *
     * @type {Texture|null}
     */
    texture: Texture | null;
    /**
     * Render target for the intervals texture
     *
     * @type {RenderTarget|null}
     */
    rt: RenderTarget | null;
    /**
     * Texture that stores interval data (start + accumulated sum pairs) for GPU processing
     *
     * @type {Texture|null}
     */
    intervalsDataTexture: Texture | null;
    /**
     * Shader for generating intervals texture on GPU
     *
     * @type {Shader|null}
     */
    shader: Shader | null;
    destroy(): void;
    /**
     * Creates shader for GPU-based intervals texture generation
     */
    getShader(): Shader;
    /**
     * Creates a texture with specified parameters
     */
    createTexture(name: any, format: any, width: any, height: any): Texture;
    /**
     * Updates the intervals texture based on provided intervals array
     *
     * @param {number[]} intervals - Array of intervals (start, end pairs)
     * @param {number} totalIntervalSplats - Total number of splats referenced by the intervals
     * @returns {number} The number of active splats
     */
    update(intervals: number[], totalIntervalSplats: number): number;
}
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import { Texture } from '../../platform/graphics/texture.js';
import { RenderTarget } from '../../platform/graphics/render-target.js';
import type { Shader } from '../../platform/graphics/shader.js';
