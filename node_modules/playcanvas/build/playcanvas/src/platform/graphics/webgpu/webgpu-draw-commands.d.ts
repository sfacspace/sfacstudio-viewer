/**
 * @import { GraphicsDevice } from '../graphics-device.js'
 */
/**
 * WebGPU implementation of DrawCommands.
 *
 * @ignore
 */
export class WebgpuDrawCommands {
    /**
     * @param {GraphicsDevice} device - Graphics device.
     */
    constructor(device: GraphicsDevice);
    /** @type {GraphicsDevice} */
    device: GraphicsDevice;
    /** @type {Uint32Array|null} */
    gpuIndirect: Uint32Array | null;
    /** @type {Int32Array|null} */
    gpuIndirectSigned: Int32Array | null;
    /**
     * @type {StorageBuffer|null}
     */
    storage: StorageBuffer | null;
    /**
     * Allocate AoS buffer and backing storage buffer.
     * @param {number} maxCount - Number of sub-draws.
     */
    allocate(maxCount: number): void;
    /**
     * Write a single draw entry.
     * @param {number} i - Draw index.
     * @param {number} indexOrVertexCount - Count of indices/vertices.
     * @param {number} instanceCount - Instance count.
     * @param {number} firstIndexOrVertex - First index/vertex.
     * @param {number} baseVertex - Base vertex (signed).
     * @param {number} firstInstance - First instance.
     */
    add(i: number, indexOrVertexCount: number, instanceCount: number, firstIndexOrVertex: number, baseVertex?: number, firstInstance?: number): void;
    /**
     * Upload AoS data to storage buffer.
     * @param {number} count - Number of active draws.
     * @returns {number} Total primitive count.
     */
    update(count: number): number;
    destroy(): void;
}
import type { GraphicsDevice } from '../graphics-device.js';
import { StorageBuffer } from '../storage-buffer.js';
