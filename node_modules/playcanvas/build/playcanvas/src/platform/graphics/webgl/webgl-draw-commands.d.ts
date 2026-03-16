/**
 * WebGL implementation of DrawCommands.
 *
 * @ignore
 */
export class WebglDrawCommands {
    /**
     * @param {number} indexSizeBytes - Size of index in bytes (1, 2 or 4). 0 for non-indexed.
     */
    constructor(indexSizeBytes: number);
    /** @type {number} */
    indexSizeBytes: number;
    /** @type {Int32Array|null} */
    glCounts: Int32Array | null;
    /** @type {Int32Array|null} */
    glOffsetsBytes: Int32Array | null;
    /** @type {Int32Array|null} */
    glInstanceCounts: Int32Array | null;
    /**
     * Allocate SoA arrays for multi-draw.
     * @param {number} maxCount - Number of sub-draws.
     */
    allocate(maxCount: number): void;
    /**
     * Write a single draw entry.
     * @param {number} i - Draw index.
     * @param {number} indexOrVertexCount - Count of indices/vertices.
     * @param {number} instanceCount - Instance count.
     * @param {number} firstIndexOrVertex - First index/vertex.
     */
    add(i: number, indexOrVertexCount: number, instanceCount: number, firstIndexOrVertex: number): void;
    /**
     * Calculate total primitives for stats (profiler builds only).
     * @param {number} count - Number of active draws.
     * @returns {number} Total primitive count.
     */
    update(count: number): number;
}
