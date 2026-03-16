/**
 * A WebGPU implementation of the BindGroupFormat, which is a wrapper over GPUBindGroupLayout.
 *
 * @ignore
 */
export class WebgpuBindGroupFormat {
    /**
     * @param {BindGroupFormat} bindGroupFormat - Bind group format.
     */
    constructor(bindGroupFormat: BindGroupFormat);
    /**
     * Unique key, used for caching
     *
     * @type {number}
     */
    key: number;
    desc: any;
    /**
     * @type {GPUBindGroupLayout}
     * @private
     */
    private bindGroupLayout;
    destroy(): void;
    loseContext(): void;
    /**
     * @param {any} bindGroupFormat - The format of the bind group.
     * @returns {any} Returns the bind group descriptor.
     */
    createDescriptor(bindGroupFormat: any): any;
}
import type { BindGroupFormat } from '../bind-group-format.js';
