/**
 * Base class for render and compute pipelines.
 *
 * @ignore
 */
export class WebgpuPipeline {
    constructor(device: any);
    /** @type {WebgpuGraphicsDevice} */
    device: WebgpuGraphicsDevice;
    /**
     * @param {BindGroupFormat[]} bindGroupFormats - An array of bind group formats.
     * @returns {any} Returns the pipeline layout.
     */
    getPipelineLayout(bindGroupFormats: BindGroupFormat[]): any;
}
import type { WebgpuGraphicsDevice } from './webgpu-graphics-device.js';
import type { BindGroupFormat } from '../bind-group-format.js';
