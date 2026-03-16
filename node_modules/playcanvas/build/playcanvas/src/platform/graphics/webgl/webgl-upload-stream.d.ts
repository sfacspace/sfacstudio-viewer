/**
 * @import { UploadStream } from '../upload-stream.js'
 * @import { Texture } from '../texture.js'
 */
/**
 * WebGL implementation of UploadStream.
 * Can use either simple direct texture uploads or optimized PBO strategy with orphaning.
 *
 * @ignore
 */
export class WebglUploadStream {
    /**
     * @param {UploadStream} uploadStream - The upload stream.
     */
    constructor(uploadStream: UploadStream);
    /**
     * Available PBOs ready for immediate use.
     *
     * @type {Array<{pbo: WebGLBuffer, size: number}>}
     */
    availablePBOs: Array<{
        pbo: WebGLBuffer;
        size: number;
    }>;
    /**
     * PBOs currently in use by the GPU.
     *
     * @type {Array<{pbo: WebGLBuffer, size: number, sync: WebGLSync}>}
     */
    pendingPBOs: Array<{
        pbo: WebGLBuffer;
        size: number;
        sync: WebGLSync;
    }>;
    uploadStream: UploadStream;
    useSingleBuffer: boolean;
    destroy(): void;
    /**
     * Handles device lost event by clearing all PBO and sync object arrays.
     *
     * @protected
     */
    protected _onDeviceLost(): void;
    /**
     * Update PBOs: poll completed ones and remove undersized buffers.
     *
     * @param {number} minByteSize - Minimum size for buffers to keep. Smaller buffers are destroyed.
     */
    update(minByteSize: number): void;
    /**
     * Upload data to a texture using PBOs (optimized) or direct upload (simple).
     *
     * @param {Uint8Array|Uint32Array|Float32Array} data - The data to upload.
     * @param {Texture} target - The target texture.
     * @param {number} offset - The element offset in the target. Must be a multiple of texture width.
     * @param {number} size - The number of elements to upload. Must be a multiple of texture width.
     */
    upload(data: Uint8Array | Uint32Array | Float32Array, target: Texture, offset: number, size: number): void;
    /**
     * Direct texture upload (simple, blocking).
     *
     * @param {Uint8Array|Uint32Array|Float32Array} data - The data to upload.
     * @param {Texture} target - The target texture.
     * @param {number} offset - The element offset in the target.
     * @param {number} size - The number of elements to upload.
     * @private
     */
    private uploadDirect;
    /**
     * PBO-based upload with orphaning (optimized, potentially non-blocking).
     *
     * @param {Uint8Array|Uint32Array|Float32Array} data - The data to upload.
     * @param {import('../texture.js').Texture} target - The target texture.
     * @param {number} offset - The element offset in the target.
     * @param {number} size - The number of elements to upload.
     * @private
     */
    private uploadPBO;
}
import type { UploadStream } from '../upload-stream.js';
import type { Texture } from '../texture.js';
