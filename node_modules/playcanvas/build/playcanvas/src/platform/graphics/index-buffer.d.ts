/**
 * An index buffer stores index values into a {@link VertexBuffer}. Indexed graphical primitives
 * can normally utilize less memory that unindexed primitives (if vertices are shared).
 *
 * Typically, index buffers are set on {@link Mesh} objects.
 *
 * @category Graphics
 */
export class IndexBuffer {
    /**
     * Create a new IndexBuffer instance.
     *
     * @param {GraphicsDevice} graphicsDevice - The graphics device used to manage this index buffer.
     * @param {number} format - The type of each index to be stored in the index buffer. Can be:
     *
     * - {@link INDEXFORMAT_UINT8}
     * - {@link INDEXFORMAT_UINT16}
     * - {@link INDEXFORMAT_UINT32}
     * @param {number} numIndices - The number of indices to be stored in the index buffer.
     * @param {number} [usage] - The usage type of the vertex buffer. Can be:
     *
     * - {@link BUFFER_DYNAMIC}
     * - {@link BUFFER_STATIC}
     * - {@link BUFFER_STREAM}
     *
     * Defaults to {@link BUFFER_STATIC}.
     * @param {ArrayBuffer} [initialData] - Initial data. If left unspecified, the index buffer
     * will be initialized to zeros.
     * @param {object} [options] - Object for passing optional arguments.
     * @param {boolean} [options.storage] - Defines if the index buffer can be used as a storage
     * buffer by a compute shader. Defaults to false. Only supported on WebGPU.
     * @example
     * // Create an index buffer holding 3 16-bit indices. The buffer is marked as
     * // static, hinting that the buffer will never be modified.
     * const indices = new UInt16Array([0, 1, 2]);
     * const indexBuffer = new pc.IndexBuffer(graphicsDevice,
     *                                        pc.INDEXFORMAT_UINT16,
     *                                        3,
     *                                        pc.BUFFER_STATIC,
     *                                        indices);
     */
    constructor(graphicsDevice: GraphicsDevice, format: number, numIndices: number, usage?: number, initialData?: ArrayBuffer, options?: {
        storage?: boolean;
    });
    device: GraphicsDevice;
    format: number;
    numIndices: number;
    usage: number;
    id: number;
    impl: any;
    bytesPerIndex: number;
    numBytes: number;
    storage: ArrayBuffer;
    /**
     * Frees resources associated with this index buffer.
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
     * Returns the data format of the specified index buffer.
     *
     * @returns {number} The data format of the specified index buffer. Can be:
     *
     * - {@link INDEXFORMAT_UINT8}
     * - {@link INDEXFORMAT_UINT16}
     * - {@link INDEXFORMAT_UINT32}
     */
    getFormat(): number;
    /**
     * Returns the number of indices stored in the specified index buffer.
     *
     * @returns {number} The number of indices stored in the specified index buffer.
     */
    getNumIndices(): number;
    /**
     * Gives access to the block of memory that stores the buffer's indices.
     *
     * @returns {ArrayBuffer} A contiguous block of memory where index data can be written to.
     */
    lock(): ArrayBuffer;
    /**
     * Signals that the block of memory returned by a call to the lock function is ready to be
     * given to the graphics hardware. Only unlocked index buffers can be set on the currently
     * active device.
     */
    unlock(): void;
    /**
     * Set preallocated data on the index buffer.
     *
     * @param {ArrayBuffer} data - The index data to set.
     * @returns {boolean} True if the data was set successfully, false otherwise.
     * @ignore
     */
    setData(data: ArrayBuffer): boolean;
    /**
     * Get the appropriate typed array from an index buffer.
     *
     * @returns {Uint8Array|Uint16Array|Uint32Array} The typed array containing the index data.
     * @private
     */
    private _lockTypedArray;
    /**
     * Copies the specified number of elements from data into index buffer. Optimized for
     * performance from both typed array as well as array.
     *
     * @param {Uint8Array|Uint16Array|Uint32Array|number[]} data - The data to write.
     * @param {number} count - The number of indices to write.
     * @ignore
     */
    writeData(data: Uint8Array | Uint16Array | Uint32Array | number[], count: number): void;
    /**
     * Copies index data from index buffer into provided data array.
     *
     * @param {Uint8Array|Uint16Array|Uint32Array|number[]} data - The data array to write to.
     * @returns {number} The number of indices read.
     * @ignore
     */
    readData(data: Uint8Array | Uint16Array | Uint32Array | number[]): number;
}
import type { GraphicsDevice } from './graphics-device.js';
