export class GSplatOctreeInstance {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {GSplatOctree} octree - The octree.
     * @param {GSplatPlacement} placement - The placement.
     */
    constructor(device: GraphicsDevice, octree: GSplatOctree, placement: GSplatPlacement);
    /** @type {GSplatOctree} */
    octree: GSplatOctree;
    /** @type {GSplatPlacement} */
    placement: GSplatPlacement;
    /** @type {Set<GSplatPlacement>} */
    activePlacements: Set<GSplatPlacement>;
    /** @type {boolean} */
    dirtyModifiedPlacements: boolean;
    /** @type {GraphicsDevice} */
    device: GraphicsDevice;
    /**
     * Array of NodeInfo instances, one per octree node.
     * @type {NodeInfo[]}
     */
    nodeInfos: NodeInfo[];
    /**
     * Array of current placements per file. Index is fileIndex, value is GSplatPlacement or null.
     * Value null indicates file is not used / no placement.
     * @type {(GSplatPlacement|null)[]}
     */
    filePlacements: (GSplatPlacement | null)[];
    /**
     * Set of pending file loads (file indices).
     * @type {Set<number>}
     */
    pending: Set<number>;
    /**
     * Map of nodeIndex -> { oldFileIndex, newFileIndex } that needs to be decremented when the
     * new LOD resource loads. This ensures we decrement even if the node switches LOD again
     * before the new resource arrives.
     *
     * @type {Map<number, { oldFileIndex: number, newFileIndex: number }>}
     */
    pendingDecrements: Map<number, {
        oldFileIndex: number;
        newFileIndex: number;
    }>;
    /**
     * Files that became unused by this instance this update. Each entry represents a single decRef.
     *
     * @type {Set<number>}
     */
    removedCandidates: Set<number>;
    /**
     * Previous node position at which LOD was last updated. This is used to determine if LOD needs
     * to be updated as the octree splat moves.
     *
     * @type {Vec3}
     */
    previousPosition: Vec3;
    /**
     * Set when a resource has completed loading and LOD should be re-evaluated.
     *
     * @type {boolean}
     */
    needsLodUpdate: boolean;
    /**
     * Tracks prefetched file indices that are being loaded without active placements.
     * When any completes, we trigger LOD re-evaluation to allow promotion.
     *
     * @type {Set<number>}
     */
    prefetchPending: Set<number>;
    /**
     * Tracks invisible->visible pending adds per node: nodeIndex -> fileIndex.
     * Ensures only a single pending placement exists for a node while it's not yet displayed.
     * @type {Map<number, number>}
     */
    pendingVisibleAdds: Map<number, number>;
    /**
     * Cached splat budget value.
     * @type {number}
     */
    splatBudget: number;
    /**
     * Reusable array of node indices for budget enforcement sorting.
     * Lazy-allocated on first budget enforcement, then reused.
     * @type {Uint32Array|null}
     * @private
     */
    private _nodeIndices;
    /**
     * Returns the count of resources pending load or prefetch, including environment if loading.
     *
     * @type {number}
     */
    get pendingLoadCount(): number;
    /**
     * Environment placement.
     * @type {GSplatPlacement|null}
     */
    environmentPlacement: GSplatPlacement | null;
    /**
     * Event handle for device lost event.
     *
     * @type {EventHandle|null}
     * @private
     */
    private _deviceLostEvent;
    /**
     * Destroys this octree instance and clears internal references.
     */
    destroy(): void;
    /**
     * Handles device lost event by releasing all loaded resources.
     *
     * @private
     */
    private _onDeviceLost;
    /**
     * Returns the file indices currently referenced by this instance that should be decremented
     * when the instance is destroyed.
     *
     * @returns {number[]} Array of file indices to decRef.
     */
    getFileDecrements(): number[];
    /**
     * Calculate LOD index for a specific node using pre-calculated local camera position.
     * @param {Vec3} localCameraPosition - The camera position in local space.
     * @param {Vec3} localCameraForward - The camera forward direction in local space (normalized).
     * @param {number} nodeIndex - The node index.
     * @param {number} maxLod - The maximum LOD index (lodLevels - 1).
     * @param {number[]} lodDistances - Array of distance thresholds per LOD.
     * @param {number} lodBehindPenalty - Multiplier for behind-camera distance. 1 disables penalty.
     * @returns {number} The LOD index for this node, or -1 if node should not be rendered.
     */
    calculateNodeLod(localCameraPosition: Vec3, localCameraForward: Vec3, nodeIndex: number, maxLod: number, lodDistances: number[], lodBehindPenalty: number): number;
    /**
     * Selects desired LOD index for a node using the underfill strategy. When underfill is enabled,
     * it prefers already-loaded LODs within [optimalLodIndex .. optimalLodIndex + lodUnderfillLimit].
     * If none are loaded, it selects the coarsest available LOD within the range.
     *
     * @param {import('./gsplat-octree-node.js').GSplatOctreeNode} node - The octree node.
     * @param {number} optimalLodIndex - Optimal LOD index based on camera/distance.
     * @param {number} maxLod - Maximum LOD index.
     * @param {number} lodUnderfillLimit - Allowed coarse range above optimal.
     * @returns {number} Desired LOD index to display.
     */
    selectDesiredLodIndex(node: import("./gsplat-octree-node.js").GSplatOctreeNode, optimalLodIndex: number, maxLod: number, lodUnderfillLimit: number): number;
    /**
     * Prefetch only the next-better LOD toward optimal. This stages loading in steps across all
     * nodes, avoiding intermixing requests before coarse is present.
     *
     * @param {import('./gsplat-octree-node.js').GSplatOctreeNode} node - The octree node.
     * @param {number} desiredLodIndex - Currently selected LOD for display (may be coarser than optimal).
     * @param {number} optimalLodIndex - Target optimal LOD.
     */
    prefetchNextLod(node: import("./gsplat-octree-node.js").GSplatOctreeNode, desiredLodIndex: number, optimalLodIndex: number): void;
    /**
     * Updates the octree instance when LOD needs to be updated.
     *
     * @param {GraphNode} cameraNode - The camera node.
     * @param {import('./gsplat-params.js').GSplatParams} params - Global gsplat parameters.
     */
    updateLod(cameraNode: GraphNode, params: import("./gsplat-params.js").GSplatParams): void;
    /**
     * Evaluates optimal LOD indices for all nodes based on camera position and parameters.
     * This is Pass 1 of the LOD update process. Results are stored in nodeInfos array.
     *
     * @param {GraphNode} cameraNode - The camera node.
     * @param {number} maxLod - Maximum LOD index (lodLevels - 1).
     * @param {number[]} lodDistances - Array of distance thresholds per LOD.
     * @param {number} rangeMin - Minimum allowed LOD index.
     * @param {number} rangeMax - Maximum allowed LOD index.
     * @param {import('./gsplat-params.js').GSplatParams} params - Global gsplat parameters.
     * @returns {number} Total number of splats that would be used by optimal LODs.
     * @private
     */
    private evaluateNodeLods;
    /**
     * Adjusts optimal LOD indices to fit within the splat budget bidirectionally.
     * When over budget: degrades quality for lower-importance nodes first.
     * When under budget: upgrades quality for higher-importance nodes first.
     * Uses multiple passes, adjusting by one level per pass, until budget is reached
     * or all nodes hit their respective limits (rangeMin or rangeMax).
     *
     * @param {number} totalSplats - Current total splat count with optimal LODs.
     * @param {number} splatBudget - Target splat count to reach.
     * @param {number} rangeMin - Minimum allowed LOD index.
     * @param {number} rangeMax - Maximum allowed LOD index.
     * @private
     */
    private enforceSplatBudget;
    /**
     * Applies calculated LOD changes and manages file placements.
     * This is Pass 2 of the LOD update process. Reads from nodeInfos array populated by evaluateNodeLods().
     *
     * @param {number} maxLod - Maximum LOD index (lodLevels - 1).
     * @param {import('./gsplat-params.js').GSplatParams} params - Global gsplat parameters.
     * @private
     */
    private applyLodChanges;
    /**
     * Increments reference count for a file and creates placement immediately.
     *
     * @param {number} fileIndex - The file index.
     * @param {number} nodeIndex - The octree node index.
     * @param {number} lodIndex - The LOD index for this node.
     */
    incrementFileRef(fileIndex: number, nodeIndex: number, lodIndex: number): void;
    /**
     * Decrements reference count for a file and removes placement if needed.
     *
     * @param {number} fileIndex - The file index.
     * @param {number} nodeIndex - The octree node index.
     */
    decrementFileRef(fileIndex: number, nodeIndex: number): void;
    /**
     * Updates existing placement with loaded resource and adds to manager.
     *
     * @param {number} fileIndex - The file index.
     * @returns {boolean} True if placement was updated and added to manager, false otherwise.
     */
    addFilePlacement(fileIndex: number): boolean;
    /**
     * Tests if the octree instance has moved by more than the provided LOD update distance.
     *
     * @param {number} threshold - Distance threshold to trigger an update.
     * @returns {boolean} True if the octree instance has moved by more than the threshold, false otherwise.
     */
    testMoved(threshold: number): boolean;
    /**
     * Updates the previous position of the octree instance.
     */
    updateMoved(): void;
    /**
     * Updates the octree instance each frame.
     *
     * @param {Scene} scene - Optional scene for debug rendering.
     * @returns {boolean} True if octree instance is dirty, false otherwise.
     */
    update(scene: Scene): boolean;
    debugRender(scene: any): void;
    /**
     * Returns true if this instance requests LOD re-evaluation and resets the flag.
     * @returns {boolean} True if LOD should be re-evaluated.
     */
    consumeNeedsLodUpdate(): boolean;
    /**
     * Polls prefetched file indices for completion and updates state.
     */
    pollPrefetchCompletions(): void;
}
import type { GSplatOctree } from './gsplat-octree.js';
import { GSplatPlacement } from './gsplat-placement.js';
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
/**
 * Stores LOD state for a single octree node.
 *
 * @ignore
 */
declare class NodeInfo {
    /**
     * Current LOD index being rendered. -1 indicates node is not visible.
     * @type {number}
     */
    currentLod: number;
    /**
     * Optimal LOD index based on distance/visibility (before underfill).
     * @type {number}
     */
    optimalLod: number;
    /**
     * Importance of this node (0..1 range, higher = more important).
     * Used for budget enforcement - higher importance nodes maintain quality when budget is exceeded.
     * @type {number}
     */
    importance: number;
    /**
     * Resets all LOD values to -1 (invisible/uninitialized).
     */
    reset(): void;
}
import { Vec3 } from '../../core/math/vec3.js';
import type { GraphNode } from '../graph-node.js';
import type { Scene } from '../scene.js';
export {};
