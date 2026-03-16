export class WebgpuDynamicBuffers extends DynamicBuffers {
    /**
     * Staging buffers which are getting copied over to gpu buffers in the the command buffer waiting
     * to be submitted. When those command buffers are submitted, we can mapAsync these staging
     * buffers for reuse.
     *
     * @type {WebgpuDynamicBuffer[]}
     */
    pendingStagingBuffers: WebgpuDynamicBuffer[];
    createBuffer(device: any, size: any, isStaging: any): WebgpuDynamicBuffer;
    /**
     * Called when all scheduled command buffers are submitted to the device.
     */
    onCommandBuffersSubmitted(): void;
}
import { DynamicBuffers } from '../dynamic-buffers.js';
import { WebgpuDynamicBuffer } from './webgpu-dynamic-buffer.js';
