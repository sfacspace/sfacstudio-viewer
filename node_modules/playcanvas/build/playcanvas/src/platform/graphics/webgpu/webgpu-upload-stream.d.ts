/**
 * WebGPU implementation of UploadStream.
 * Can use either simple direct writes or optimized staging buffer strategy.
 *
 * @ignore
 */
export class WebgpuUploadStream {
    /**
     * @param {UploadStream} uploadStream - The upload stream.
     */
    constructor(uploadStream: UploadStream);
    /**
     * Available staging buffers ready for immediate use.
     *
     * @type {GPUBuffer[]}
     * @private
     */
    private availableStagingBuffers;
    /**
     * Staging buffers currently in use by the GPU.
     *
     * @type {GPUBuffer[]}
     * @private
     */
    private pendingStagingBuffers;
    _destroyed: boolean;
    uploadStream: UploadStream;
    useSingleBuffer: boolean;
    /**
     * Handles device lost event.
     * TODO: Implement proper WebGPU device lost handling if needed.
     *
     * @protected
     */
    protected _onDeviceLost(): void;
    destroy(): void;
    /**
     * Update staging buffers: recycle completed ones and remove undersized buffers.
     *
     * @param {number} minByteSize - Minimum size for buffers to keep. Smaller buffers are destroyed.
     */
    update(minByteSize: number): void;
    /**
     * Upload data to a storage buffer using staging buffers (optimized) or direct write (simple).
     *
     * @param {Uint8Array|Uint32Array|Float32Array} data - The data to upload.
     * @param {import('../storage-buffer.js').StorageBuffer} target - The target storage buffer.
     * @param {number} offset - The element offset in the target. Byte offset must be a multiple of 4.
     * @param {number} size - The number of elements to upload. Byte size must be a multiple of 4.
     */
    upload(data: Uint8Array | Uint32Array | Float32Array, target: import("../storage-buffer.js").StorageBuffer, offset: number, size: number): void;
    /**
     * Direct storage buffer write (simple, blocking).
     *
     * @param {Uint8Array|Uint32Array|Float32Array} data - The data to upload.
     * @param {import('../storage-buffer.js').StorageBuffer} target - The target storage buffer.
     * @param {number} offset - The element offset in the target.
     * @param {number} size - The number of elements to upload.
     * @private
     */
    private uploadDirect;
    /**
     * Staging buffer-based upload.
     *
     * @param {Uint8Array|Uint32Array|Float32Array} data - The data to upload.
     * @param {import('../storage-buffer.js').StorageBuffer} target - The target storage buffer.
     * @param {number} offset - The element offset in the target.
     * @param {number} size - The number of elements to upload.
     * @private
     */
    private uploadStaging;
}
import type { UploadStream } from '../upload-stream.js';
