/**
 * @import { GSplatInfo } from './gsplat-info.js'
 * @import { GSplatOctree } from './gsplat-octree.js'
 */
export class GSplatWorldState {
    constructor(device: any, version: any, splats: any);
    /**
     * The version of the world state.
     *
     * @type {number}
     */
    version: number;
    /**
     * Whether the sort parameters have been set on the sorter.
     *
     * @type {boolean}
     */
    sortParametersSet: boolean;
    /**
     * Whether the world state has been sorted before.
     *
     * @type {boolean}
     */
    sortedBefore: boolean;
    /**
     * An array of all splats managed by this world state.
     *
     * @type {GSplatInfo[]}
     */
    splats: GSplatInfo[];
    /**
     * The texture size of work buffer.
     *
     * @type {number}
     */
    textureSize: number;
    /**
     * Total number of pixels actually used in the texture (excluding unused regions).
     * This is the count that should be sent to the sort worker and renderer.
     *
     * @type {number}
     */
    totalUsedPixels: number;
    /**
     * Files to decrement when this state becomes active.
     * Array of tuples: [octree, fileIndex]
     * @type {Array<[GSplatOctree, number]>}
     */
    pendingReleases: Array<[GSplatOctree, number]>;
    /**
     * Estimates the square texture size that can store all splats, using binary search to find the
     * smallest size that fits.
     *
     * @param {GSplatInfo[]} splats - The splats to allocate space for.
     * @param {number} maxSize - Max texture size (width and height).
     * @returns {boolean} - True if the texture size was found.
     */
    estimateTextureSize(splats: GSplatInfo[], maxSize: number): boolean;
    destroy(): void;
    /**
     * Assigns lines to each splat based on the texture size.
     *
     * @param {GSplatInfo[]} splats - The splats to assign lines to.
     * @param {number} size - The texture size.
     */
    assignLines(splats: GSplatInfo[], size: number): void;
}
import type { GSplatInfo } from './gsplat-info.js';
import type { GSplatOctree } from './gsplat-octree.js';
