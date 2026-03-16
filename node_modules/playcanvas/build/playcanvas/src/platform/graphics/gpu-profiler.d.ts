/**
 * Base class of a simple GPU profiler.
 *
 * @ignore
 */
export class GpuProfiler {
    /**
     * Profiling slots allocated for the current frame, storing the names of the slots.
     *
     * @type {string[]}
     * @ignore
     */
    frameAllocations: string[];
    /**
     * Map of past frame allocations, indexed by renderVersion
     *
     * @type {Map<number, string[]>}
     * @ignore
     */
    pastFrameAllocations: Map<number, string[]>;
    /**
     * True if enabled in the current frame.
     *
     * @private
     */
    private _enabled;
    /**
     * The enable request for the next frame.
     *
     * @private
     */
    private _enableRequest;
    /**
     * The time it took to render the last frame on GPU, or 0 if the profiler is not enabled.
     *
     * @private
     */
    private _frameTime;
    /**
     * Per-pass timing data, with accumulated timings for passes with the same name.
     *
     * @type {Map<string, number>}
     * @private
     */
    private _passTimings;
    /**
     * Cache for parsed pass names to avoid repeated string operations.
     *
     * @type {Map<string, string>}
     * @private
     */
    private _nameCache;
    /**
     * The maximum number of slots that can be allocated during the frame.
     *
     * @type {number}
     */
    maxCount: number;
    loseContext(): void;
    /**
     * True to enable the profiler.
     *
     * @type {boolean}
     */
    set enabled(value: boolean);
    get enabled(): boolean;
    /**
     * Get the per-pass timing data.
     *
     * @type {Map<string, number>}
     * @ignore
     */
    get passTimings(): Map<string, number>;
    processEnableRequest(): void;
    request(renderVersion: any): void;
    /**
     * Parse a render pass name to a simplified form for stats.
     * Uses a cache to avoid repeated string operations.
     *
     * @param {string} name - The original pass name (e.g., "RenderPassCompose").
     * @returns {string} The parsed name (e.g., "compose").
     * @private
     */
    private _parsePassName;
    report(renderVersion: any, timings: any): void;
    /**
     * Allocate a slot for GPU timing during the frame. This slot is valid only for the current
     * frame. This allows multiple timers to be used during the frame, each with a unique name.
     *
     * @param {string} name - The name of the slot.
     * @returns {number} The assigned slot index, or -1 if the slot count exceeds the maximum number
     * of slots.
     *
     * @ignore
     */
    getSlot(name: string): number;
    /**
     * Number of slots allocated during the frame.
     *
     * @ignore
     */
    get slotCount(): number;
}
