/**
 * @import { WebgpuGraphicsDevice } from './webgpu-graphics-device.js'
 */
/**
 * A WebGPU implementation of the Buffer.
 *
 * @ignore
 */
export class WebgpuBuffer {
    constructor(usageFlags?: number);
    /**
     * @type {GPUBuffer|null}
     * @private
     */
    private buffer;
    usageFlags: number;
    destroy(device: any): void;
    get initialized(): boolean;
    loseContext(): void;
    allocate(device: any, size: any): void;
    /**
     * @param {WebgpuGraphicsDevice} device - Graphics device.
     * @param {*} storage -
     */
    unlock(device: WebgpuGraphicsDevice, storage: any): void;
    read(device: any, offset: any, size: any, data: any, immediate: any): any;
    write(device: any, bufferOffset: any, data: any, dataOffset: any, size: any): void;
    clear(device: any, offset: any, size: any): void;
}
import type { WebgpuGraphicsDevice } from './webgpu-graphics-device.js';
