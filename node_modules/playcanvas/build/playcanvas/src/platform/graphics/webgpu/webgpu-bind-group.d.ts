/**
 * @import { BindGroup } from '../bind-group.js'
 * @import { WebgpuGraphicsDevice } from './webgpu-graphics-device.js'
 * @import { WebgpuTexture } from './webgpu-texture.js'
 */
/**
 * A WebGPU implementation of the BindGroup, which is a wrapper over GPUBindGroup.
 *
 * @ignore
 */
export class WebgpuBindGroup {
    /**
     * @type {GPUBindGroup}
     * @private
     */
    private bindGroup;
    update(bindGroup: any): void;
    destroy(): void;
    /**
     * Creates a bind group descriptor in WebGPU format
     *
     * @param {WebgpuGraphicsDevice} device - Graphics device.
     * @param {BindGroup} bindGroup - Bind group to create the
     * descriptor for.
     * @returns {object} - Returns the generated descriptor of type GPUBindGroupDescriptor, which
     * can be used to create a GPUBindGroup
     */
    createDescriptor(device: WebgpuGraphicsDevice, bindGroup: BindGroup): object;
    debugFormat: string;
}
import type { WebgpuGraphicsDevice } from './webgpu-graphics-device.js';
import type { BindGroup } from '../bind-group.js';
