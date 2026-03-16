/**
 * A storage buffer represents a memory which both the CPU and the GPU can access. Typically it is
 * used to provide data for compute shader, and to store the result of the computation.
 * Note that this class is only supported on the WebGPU platform.
 *
 * @category Graphics
 */
export class StorageBuffer {
    /**
     * Create a new StorageBuffer instance.
     *
     * @param {GraphicsDevice} graphicsDevice - The graphics device used to manage this storage buffer.
     * @param {number} byteSize - The size of the storage buffer in bytes.
     * @param {number} [bufferUsage] - The usage type of the storage buffer. Can be a combination
     * of {@link BUFFERUSAGE_READ}, {@link BUFFERUSAGE_WRITE}, {@link BUFFERUSAGE_COPY_SRC} and
     * {@link BUFFERUSAGE_COPY_DST} flags. This parameter can be omitted if no special usage is
     * required.
     * @param {boolean} [addStorageUsage] - If true, automatically adds BUFFERUSAGE_STORAGE flag.
     * Set to false for staging buffers that use BUFFERUSAGE_WRITE. Defaults to true.
     */
    constructor(graphicsDevice: GraphicsDevice, byteSize: number, bufferUsage?: number, addStorageUsage?: boolean);
    id: number;
    device: GraphicsDevice;
    byteSize: number;
    bufferUsage: number;
    impl: any;
    /**
     * Frees resources associated with this storage buffer.
     */
    destroy(): void;
    adjustVramSizeTracking(vram: any, size: any): void;
    /**
     * Read the contents of a storage buffer.
     *
     * @param {number} [offset] - The byte offset of data to read. Defaults to 0.
     * @param {number} [size] - The byte size of data to read. Defaults to the full size of the
     * buffer minus the offset.
     * @param {ArrayBufferView|null} [data] - Typed array to populate with the data read from the
     * storage buffer. When typed array is supplied, enough space needs to be reserved, otherwise
     * only partial data is copied. If not specified, the data is returned in an Uint8Array.
     * Defaults to null.
     * @param {boolean} [immediate] - If true, the read operation will be executed as soon as
     * possible. This has a performance impact, so it should be used only when necessary. Defaults
     * to false.
     * @returns {Promise<ArrayBufferView>} A promise that resolves with the data read from the
     * storage buffer.
     * @ignore
     */
    read(offset?: number, size?: number, data?: ArrayBufferView | null, immediate?: boolean): Promise<ArrayBufferView>;
    /**
     * Issues a write operation of the provided data into a storage buffer.
     *
     * @param {number} bufferOffset - The offset in bytes to start writing to the storage buffer.
     * @param {ArrayBufferView} data - The data to write to the storage buffer.
     * @param {number} dataOffset - Offset in data to begin writing from. Given in elements if data
     * is a TypedArray and bytes otherwise.
     * @param {number} size - Size of content to write from data to buffer. Given in elements if
     * data is a TypedArray and bytes otherwise.
     */
    write(bufferOffset: number, data: ArrayBufferView, dataOffset: number, size: number): void;
    /**
     * Clear the content of a storage buffer to 0.
     *
     * @param {number} [offset] - The byte offset of data to clear. Defaults to 0.
     * @param {number} [size] - The byte size of data to clear. Defaults to the full size of the
     * buffer minus the offset.
     */
    clear(offset?: number, size?: number): void;
    /**
     * Copy data from another storage buffer into this storage buffer.
     *
     * @param {StorageBuffer} srcBuffer - The source storage buffer to copy from.
     * @param {number} [srcOffset] - The byte offset in the source buffer. Defaults to 0.
     * @param {number} [dstOffset] - The byte offset in this buffer. Defaults to 0.
     * @param {number} [size] - The byte size of data to copy. Defaults to the full size of the
     * source buffer minus the source offset.
     */
    copy(srcBuffer: StorageBuffer, srcOffset?: number, dstOffset?: number, size?: number): void;
}
import type { GraphicsDevice } from './graphics-device.js';
