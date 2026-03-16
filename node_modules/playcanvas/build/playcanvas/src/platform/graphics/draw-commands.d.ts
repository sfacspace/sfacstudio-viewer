/**
 * Container holding parameters for multi-draw commands.
 *
 * Obtain an instance via {@link MeshInstance#setMultiDraw} and populate it using
 * {@link DrawCommands#add} followed by {@link DrawCommands#update}.
 *
 * @category Graphics
 */
export class DrawCommands {
    /**
     * @param {import('./graphics-device.js').GraphicsDevice} device - The graphics device.
     * @param {number} [indexSizeBytes] - Size of index in bytes for WebGL multi-draw (1, 2 or 4).
     * @ignore
     */
    constructor(device: import("./graphics-device.js").GraphicsDevice, indexSizeBytes?: number);
    /**
     * Graphics device used to determine backend (WebGPU vs WebGL).
     *
     * @type {import('./graphics-device.js').GraphicsDevice}
     * @ignore
     */
    device: import("./graphics-device.js").GraphicsDevice;
    /**
     * Size of single index in bytes for WebGL multi-draw (1, 2 or 4). 0 represents non-indexed draw.
     *
     * @type {number}
     * @ignore
     */
    indexSizeBytes: number;
    /**
     * Maximum number of multi-draw calls the space is allocated for. Ignored for indirect draw commands.
     *
     * @type {number}
     * @private
     */
    private _maxCount;
    /**
     * Maximum number of multi-draw calls the space is allocated for.
     *
     * @type {number}
     */
    get maxCount(): number;
    /**
     * Platform-specific implementation.
     *
     * @type {any}
     * @ignore
     */
    impl: any;
    /**
     * Number of draw calls to perform.
     *
     * @type {number}
     * @private
     */
    private _count;
    /**
     * Number of draw calls to perform.
     *
     * @type {number}
     */
    get count(): number;
    /**
     * Slot index of the first indirect draw call. Ignored for multi-draw commands.
     *
     * @type {number}
     * @ignore
     */
    slotIndex: number;
    /**
     * Total number of primitives across all sub-draws (pre-calculated).
     *
     * @type {number}
     * @ignore
     */
    primitiveCount: number;
    /**
     * @ignore
     */
    destroy(): void;
    /**
     * Allocates persistent storage for the draw commands.
     *
     * @param {number} maxCount - Maximum number of draw calls to allocate storage for.
     * @ignore
     */
    allocate(maxCount: number): void;
    /**
     * Writes one draw command into the allocated storage.
     *
     * @param {number} i - Draw index to update.
     * @param {number} indexOrVertexCount - Number of indices or vertices to draw.
     * @param {number} instanceCount - Number of instances to draw (use 1 if not instanced).
     * @param {number} firstIndexOrVertex - Starting index (in indices, not bytes) or starting vertex.
     * @param {number} [baseVertex] - Signed base vertex (WebGPU only). Defaults to 0.
     * @param {number} [firstInstance] - First instance (WebGPU only). Defaults to 0.
     */
    add(i: number, indexOrVertexCount: number, instanceCount: number, firstIndexOrVertex: number, baseVertex?: number, firstInstance?: number): void;
    /**
     * Finalize and set draw count after all commands have been added.
     *
     * @param {number} count - Number of draws to execute.
     */
    update(count: number): void;
}
