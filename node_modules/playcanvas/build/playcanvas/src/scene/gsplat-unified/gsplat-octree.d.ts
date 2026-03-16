/**
 * @import { GSplatResource } from '../gsplat/gsplat-resource.js'
 * @import { GSplatOctreeNodeLod } from './gsplat-octree-node.js'
 * @import { GSplatAssetLoaderBase } from './gsplat-asset-loader-base.js'
 */
export class GSplatOctree {
    /**
     * @param {string} assetFileUrl - The file URL of the container asset.
     * @param {Object} data - The parsed JSON data containing info, filenames and tree.
     */
    constructor(assetFileUrl: string, data: any);
    /**
     * @type {GSplatOctreeNode[]}
     */
    nodes: GSplatOctreeNode[];
    /**
     * @type {{ url: string, lodLevel: number }[]}
     */
    files: {
        url: string;
        lodLevel: number;
    }[];
    /**
     * @type {number}
     */
    lodLevels: number;
    /**
     * The file URL of the container asset, used as the base for resolving relative URLs.
     *
     * @type {string}
     */
    assetFileUrl: string;
    /**
     * Resources of individual files, identified by their file index.
     *
     * @type {Map<number, GSplatResource>}
     */
    fileResources: Map<number, GSplatResource>;
    /**
     * Reference counts for each file by file index. Index is fileIndex, value is reference count.
     * When a file reaches zero references, it is scheduled for cooldown and unload.
     *
     * @type {Int32Array}
     */
    fileRefCounts: Int32Array;
    /**
     * Cooldown timers for files that reached zero references. Key is fileIndex, value is ticks
     * remaining.
     *
     * @type {Map<number, number>}
     */
    cooldowns: Map<number, number>;
    /**
     * Optional environment asset URL.
     *
     * @type {string|null}
     */
    environmentUrl: string | null;
    /**
     * Loaded environment resource.
     *
     * @type {GSplatResource|null}
     */
    environmentResource: GSplatResource | null;
    /**
     * Reference count for environment usage.
     *
     * @type {number}
     */
    environmentRefCount: number;
    /**
     * Asset loader used for loading/unloading resources.
     *
     * @type {GSplatAssetLoaderBase|null}
     */
    assetLoader: GSplatAssetLoaderBase | null;
    /**
     * Whether this octree has been destroyed.
     *
     * @type {boolean}
     */
    destroyed: boolean;
    /**
     * Number of update ticks before unloading unused file resources. Set from GSplatParams.
     *
     * @type {number}
     * @private
     */
    private cooldownTicks;
    /**
     * Destroys the octree and clears internal state. Does not force-unload resources as they may
     * still be referenced by managers. Resources will be cleaned up when their reference counts
     * reach zero through the normal cleanup mechanisms.
     */
    destroy(): void;
    /**
     * Trace out per-LOD counts of currently loaded file resources.
     * @private
     */
    private _traceLodCounts;
    /**
     * Recursively extracts leaf nodes (nodes with 'lods' property) from the hierarchical tree.
     *
     * @param {Object} node - The current tree node to process.
     * @param {Array} leafNodes - Array to collect leaf nodes.
     * @private
     */
    private _extractLeafNodes;
    getFileResource(fileIndex: any): GSplatResource;
    /**
     * Increments reference count for a file by index and cancels any pending cooldown.
     *
     * @param {number} fileIndex - Index of the file in `files` array.
     */
    incRefCount(fileIndex: number): void;
    /**
     * Decrements reference count for a file by index. When it reaches zero, either unload
     * immediately (if cooldownTicks is 0) or schedule for cooldown.
     *
     * @param {number} fileIndex - Index of the file in `files` array.
     * @param {number} cooldownTicks - Number of update ticks before unloading when unused. If 0,
     * unload immediately.
     */
    decRefCount(fileIndex: number, cooldownTicks: number): void;
    /**
     * Unloads a resource for a file index if currently loaded.
     *
     * @param {number} fileIndex - Index of the file in `files` array.
     */
    unloadResource(fileIndex: number): void;
    /**
     * Advances cooldowns for zero-ref files and unloads those whose timers expired.
     *
     * @param {number} cooldownTicks - Number of ticks for new cooldowns, synced from GSplatParams.
     */
    updateCooldownTick(cooldownTicks: number): void;
    /**
     * Ensures a file resource is loaded and available. This function:
     * - Starts loading if not already started
     * - Checks if loading completed and stores the resource if available
     *
     * @param {number} fileIndex - The index of the file in the `files` array.
     */
    ensureFileResource(fileIndex: number): void;
    /**
     * Increments reference count for environment.
     */
    incEnvironmentRefCount(): void;
    /**
     * Decrements reference count for environment. When it reaches zero, immediately unload.
     */
    decEnvironmentRefCount(): void;
    /**
     * Ensures environment resource is loaded and available.
     */
    ensureEnvironmentResource(): void;
    /**
     * Unloads environment resource if currently loaded.
     */
    unloadEnvironmentResource(): void;
}
import { GSplatOctreeNode } from './gsplat-octree-node.js';
import type { GSplatResource } from '../gsplat/gsplat-resource.js';
import type { GSplatAssetLoaderBase } from './gsplat-asset-loader-base.js';
