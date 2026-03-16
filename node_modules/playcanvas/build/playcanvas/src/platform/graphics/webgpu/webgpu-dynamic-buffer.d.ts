export class WebgpuDynamicBuffer extends DynamicBuffer {
    constructor(device: any, size: any, isStaging: any);
    /**
     * @type {GPUBuffer}
     * @private
     */
    private buffer;
    /**
     * CPU access over the whole buffer.
     *
     * @type {ArrayBuffer}
     */
    mappedRange: ArrayBuffer;
    destroy(device: any): void;
    /**
     * Called when the staging buffer is mapped for writing.
     */
    onAvailable(): void;
    alloc(offset: any, size: any): Int32Array<ArrayBuffer>;
}
import { DynamicBuffer } from '../dynamic-buffer.js';
