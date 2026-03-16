/**
 * A wrapper over the GpuQuerySet object, allowing timestamp and occlusion queries. The results
 * are copied back using staging buffers to avoid blocking.
 */
export class WebgpuQuerySet {
    constructor(device: any, isTimestamp: any, capacity: any);
    /**
     * @type {GPUQuerySet}
     */
    querySet: GPUQuerySet;
    stagingBuffers: any[];
    activeStagingBuffer: any;
    /** @type {number} */
    bytesPerSlot: number;
    device: any;
    capacity: any;
    queryBuffer: any;
    destroy(): void;
    getStagingBuffer(): any;
    resolve(count: any): void;
    request(count: any, renderVersion: any): any;
}
