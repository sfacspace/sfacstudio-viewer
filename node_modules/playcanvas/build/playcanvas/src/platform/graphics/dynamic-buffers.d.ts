/**
 * The DynamicBuffers class provides a dynamic memory allocation system for uniform buffer data,
 * particularly for non-persistent uniform buffers. This class utilizes a bump allocator to
 * efficiently allocate aligned memory space from a set of large buffers managed internally. To
 * utilize this system, the user writes data to CPU-accessible staging buffers. When submitting
 * command buffers that require these buffers, the system automatically uploads the data to the GPU
 * buffers. This approach ensures efficient memory management and smooth data transfer between the
 * CPU and GPU.
 *
 * @ignore
 */
export class DynamicBuffers {
    /**
     * Create the system of dynamic buffers.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {number} bufferSize - The size of the underlying large buffers.
     * @param {number} bufferAlignment - Alignment of each allocation.
     */
    constructor(device: GraphicsDevice, bufferSize: number, bufferAlignment: number);
    /**
     * Allocation size of the underlying buffers.
     *
     * @type {number}
     */
    bufferSize: number;
    /**
     * Internally allocated gpu buffers.
     *
     * @type {DynamicBuffer[]}
     */
    gpuBuffers: DynamicBuffer[];
    /**
     * Internally allocated staging buffers (CPU writable)
     *
     * @type {DynamicBuffer[]}
     */
    stagingBuffers: DynamicBuffer[];
    /**
     * @type {UsedBuffer[]}
     */
    usedBuffers: UsedBuffer[];
    /**
     * @type {UsedBuffer|null}
     */
    activeBuffer: UsedBuffer | null;
    device: GraphicsDevice;
    bufferAlignment: number;
    /**
     * Destroy the system of dynamic buffers.
     */
    destroy(): void;
    /**
     * Allocate an aligned space of the given size from a dynamic buffer.
     *
     * @param {DynamicBufferAllocation} allocation - The allocation info to fill.
     * @param {number} size - The size of the allocation.
     */
    alloc(allocation: DynamicBufferAllocation, size: number): void;
    scheduleSubmit(): void;
    submit(): void;
}
/**
 * A container for storing the return values of an allocation function.
 *
 * @ignore
 */
export class DynamicBufferAllocation {
    /**
     * The storage access to the allocated data in the staging buffer.
     *
     * @type {Int32Array}
     */
    storage: Int32Array;
    /**
     * The gpu buffer this allocation will be copied to.
     *
     * @type {DynamicBuffer}
     */
    gpuBuffer: DynamicBuffer;
    /**
     * Offset in the gpuBuffer where the data will be copied to.
     *
     * @type {number}
     */
    offset: number;
}
import type { DynamicBuffer } from './dynamic-buffer.js';
/**
 * @import { DynamicBuffer } from './dynamic-buffer.js'
 * @import { GraphicsDevice } from './graphics-device.js'
 */
/**
 * A container for storing the used areas of a pair of staging and gpu buffers.
 *
 * @ignore
 */
declare class UsedBuffer {
    /** @type {DynamicBuffer} */
    gpuBuffer: DynamicBuffer;
    /** @type {DynamicBuffer} */
    stagingBuffer: DynamicBuffer;
    /**
     * The beginning position of the used area that needs to be copied from staging to to the GPU
     * buffer.
     *
     * @type {number}
     */
    offset: number;
    /**
     * Used byte size of the buffer, from the offset.
     *
     * @type {number}
     */
    size: number;
}
import type { GraphicsDevice } from './graphics-device.js';
export {};
