export class WebglGpuProfiler extends GpuProfiler {
    constructor(device: any);
    device: any;
    /**
     * The pool of unused queries.
     *
     * @type {WebGLQuery[]}
     */
    freeQueries: WebGLQuery[];
    /**
     * The pool of queries for the current frame.
     *
     * @type {WebGLQuery[]}
     */
    frameQueries: WebGLQuery[];
    /**
     * A list of queries from the previous frames which are waiting for results.
     *
     * @type {FrameQueriesInfo[]}
     */
    previousFrameQueries: FrameQueriesInfo[];
    /**
     * Temporary array to storing the timings.
     *
     * @type {number[]}
     */
    timings: number[];
    ext: any;
    destroy(): void;
    restoreContext(): void;
    getQuery(): any;
    start(name: any): number;
    end(slot: any): void;
    frameStart(): void;
    frameGPUMarkerSlot: number;
    frameEnd(): void;
    request(): void;
}
import { GpuProfiler } from '../gpu-profiler.js';
/**
 * Class holding information about the queries for a single frame.
 */
declare class FrameQueriesInfo {
    /**
     * The render version of the frame.
     *
     * @type {number[]}
     */
    renderVersion: number[];
    /**
     * The queries for the frame.
     *
     * @type {WebGLQuery[]}
     */
    queries: WebGLQuery[];
    destroy(gl: any): void;
}
export {};
