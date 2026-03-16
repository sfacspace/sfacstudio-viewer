/**
 * @import { BindGroupFormat } from './bind-group-format.js'
 * @import { GraphicsDevice } from './graphics-device.js'
 * @import { UniformBufferFormat } from './uniform-buffer-format.js'
 * @import { VertexFormat } from './vertex-format.js'
 */
/**
 * Options to drive shader processing to add support for bind groups and uniform buffers.
 *
 * @ignore
 */
export class ShaderProcessorOptions {
    /**
     * Constructs shader processing options, used to process the shader for uniform buffer support.
     *
     * @param {UniformBufferFormat} [viewUniformFormat] - Format of the uniform buffer.
     * @param {BindGroupFormat} [viewBindGroupFormat] - Format of the bind group.
     * @param {VertexFormat} [vertexFormat] - Format of the vertex buffer.
     */
    constructor(viewUniformFormat?: UniformBufferFormat, viewBindGroupFormat?: BindGroupFormat, vertexFormat?: VertexFormat);
    /** @type {UniformBufferFormat[]} */
    uniformFormats: UniformBufferFormat[];
    /** @type {BindGroupFormat[]} */
    bindGroupFormats: BindGroupFormat[];
    /** @type {VertexFormat[]} */
    vertexFormat: VertexFormat[];
    /**
     * Get the bind group index for the uniform name.
     *
     * @param {string} name - The name of the uniform.
     * @returns {boolean} - Returns true if the uniform exists, false otherwise.
     */
    hasUniform(name: string): boolean;
    /**
     * Get the bind group texture slot for the texture uniform name.
     *
     * @param {string} name - The name of the texture uniform.
     * @returns {boolean} - Returns true if the texture uniform exists, false otherwise.
     */
    hasTexture(name: string): boolean;
    getVertexElement(semantic: any): any;
    /**
     * Generate unique key representing the processing options.
     *
     * @param {GraphicsDevice} device - The device.
     * @returns {string} - Returns the key.
     */
    generateKey(device: GraphicsDevice): string;
}
import type { UniformBufferFormat } from './uniform-buffer-format.js';
import type { BindGroupFormat } from './bind-group-format.js';
import type { VertexFormat } from './vertex-format.js';
import type { GraphicsDevice } from './graphics-device.js';
