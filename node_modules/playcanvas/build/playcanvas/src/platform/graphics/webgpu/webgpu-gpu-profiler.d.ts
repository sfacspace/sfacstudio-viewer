export class WebgpuGpuProfiler extends GpuProfiler {
    constructor(device: any);
    device: any;
    /** @type {number} */
    frameGPUMarkerSlot: number;
    timestampQueriesSet: WebgpuQuerySet;
    destroy(): void;
    frameStart(): void;
    frameEnd(): void;
    request(): void;
}
import { GpuProfiler } from '../gpu-profiler.js';
import { WebgpuQuerySet } from './webgpu-query-set.js';
