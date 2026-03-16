/**
 * A vertex buffer is the mechanism via which the application specifies vertex data to the graphics
 * hardware.
 *
 * @category Graphics
 */
export class VertexBuffer {
    /**
     * Create a new VertexBuffer instance.
     *
     * @param {GraphicsDevice} graphicsDevice - The graphics device used to manage this vertex
     * buffer.
     * @param {VertexFormat} format - The vertex format of this vertex buffer.
     * @param {number} numVertices - The number of vertices that this vertex buffer will hold.
     * @param {object} [options] - Object for passing optional arguments.
     * @param {number} [options.usage] - The usage type of the vertex buffer (see BUFFER_*).
     * Defaults to BUFFER_STATIC.
     * @param {ArrayBuffer} [options.data] - Initial data.
     * @param {boolean} [options.storage] - Defines if the vertex buffer can be used as a storage
     * buffer by a compute shader. Defaults to false. Only supported on WebGPU.
     */
    constructor(graphicsDevice: GraphicsDevice, format: VertexFormat, numVertices: number, options?: {
        usage?: number;
        data?: ArrayBuffer;
        storage?: boolean;
    }, ...args: any[]);
    usage: number;
    device: GraphicsDevice;
    format: VertexFormat;
    numVertices: number;
    id: number;
    impl: any;
    numBytes: number;
    storage: ArrayBuffer;
    /**
     * Frees resources associated with this vertex buffer.
     */
    destroy(): void;
    adjustVramSizeTracking(vram: any, size: any): void;
    /**
     * Called when the rendering context was lost. It releases all context related resources.
     *
     * @ignore
     */
    loseContext(): void;
    /**
     * Returns the data format of the specified vertex buffer.
     *
     * @returns {VertexFormat} The data format of the specified vertex buffer.
     */
    getFormat(): VertexFormat;
    /**
     * Returns the usage type of the specified vertex buffer. This indicates whether the buffer can
     * be modified once and used many times {@link BUFFER_STATIC}, modified repeatedly and used
     * many times {@link BUFFER_DYNAMIC} or modified once and used at most a few times
     * {@link BUFFER_STREAM}.
     *
     * @returns {number} The usage type of the vertex buffer (see BUFFER_*).
     */
    getUsage(): number;
    /**
     * Returns the number of vertices stored in the specified vertex buffer.
     *
     * @returns {number} The number of vertices stored in the vertex buffer.
     */
    getNumVertices(): number;
    /**
     * Returns a mapped memory block representing the content of the vertex buffer.
     *
     * @returns {ArrayBuffer} An array containing the byte data stored in the vertex buffer.
     */
    lock(): ArrayBuffer;
    /**
     * Notifies the graphics engine that the client side copy of the vertex buffer's memory can be
     * returned to the control of the graphics driver.
     */
    unlock(): void;
    /**
     * Copies data into vertex buffer's memory.
     *
     * @param {ArrayBuffer} [data] - Source data to copy.
     * @returns {boolean} True if function finished successfully, false otherwise.
     */
    setData(data?: ArrayBuffer): boolean;
}
import type { GraphicsDevice } from './graphics-device.js';
import type { VertexFormat } from './vertex-format.js';
