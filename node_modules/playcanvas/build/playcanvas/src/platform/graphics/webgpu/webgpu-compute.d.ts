/**
 * A WebGPU implementation of the Compute.
 *
 * @ignore
 */
export class WebgpuCompute {
    constructor(compute: any);
    /** @type {UniformBuffer[]} */
    uniformBuffers: UniformBuffer[];
    /** @type {BindGroup} */
    bindGroup: BindGroup;
    compute: any;
    pipeline: any;
    destroy(): void;
    updateBindGroup(): void;
    dispatch(x: any, y: any, z: any): void;
}
import { UniformBuffer } from '../uniform-buffer.js';
import { BindGroup } from '../bind-group.js';
