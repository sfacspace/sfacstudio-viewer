/**
 * @import { MeshInstance } from '../mesh-instance.js'
 * @import { Scene } from '../scene.js'
 */
/**
 * Holds information about batched mesh instances. Created in {@link BatchManager#create}.
 *
 * @category Graphics
 */
export class Batch {
    /**
     * Create a new Batch instance.
     *
     * @param {MeshInstance[]} meshInstances - The mesh instances to be batched.
     * @param {boolean} dynamic - Whether this batch is dynamic (supports transforming mesh
     * instances at runtime).
     * @param {number} batchGroupId - Link this batch to a specific batch group. This is done
     * automatically with default batches.
     */
    constructor(meshInstances: MeshInstance[], dynamic: boolean, batchGroupId: number);
    /** @private */
    private _aabb;
    /**
     * An array of original mesh instances, from which this batch was generated.
     *
     * @type {MeshInstance[]}
     */
    origMeshInstances: MeshInstance[];
    /**
     * A single combined mesh instance, the result of batching.
     *
     * @type {MeshInstance}
     */
    meshInstance: MeshInstance;
    /**
     * Whether this batch is dynamic (supports transforming mesh instances at runtime).
     *
     * @type {boolean}
     */
    dynamic: boolean;
    /**
     * Link this batch to a specific batch group. This is done automatically with default batches.
     *
     * @type {number}
     */
    batchGroupId: number;
    /**
     * Removes the batch from the layers and destroys it.
     *
     * @param {Scene} scene - The scene.
     * @param {number[]} layers - The layers to remove the batch from.
     */
    destroy(scene: Scene, layers: number[]): void;
    addToLayers(scene: any, layers: any): void;
    removeFromLayers(scene: any, layers: any): void;
    updateBoundingBox(): void;
    /**
     * @deprecated
     * @ignore
     * @type {undefined}
     */
    get model(): undefined;
}
import type { MeshInstance } from '../mesh-instance.js';
import type { Scene } from '../scene.js';
