/**
 * Glues many mesh instances into a single one for better performance.
 *
 * @category Graphics
 */
export class BatchManager {
    /**
     * Create a new BatchManager instance.
     *
     * @param {GraphicsDevice} device - The graphics device used by the batch manager.
     * @param {Entity} root - The entity under which batched models are added.
     * @param {Scene} scene - The scene that the batch manager affects.
     */
    constructor(device: GraphicsDevice, root: Entity, scene: Scene);
    device: GraphicsDevice;
    rootNode: Entity;
    scene: Scene;
    _init: boolean;
    _batchGroups: {};
    _batchGroupCounter: number;
    _batchList: any[];
    _dirtyGroups: any[];
    _stats: {
        createTime: number;
        updateLastFrameTime: number;
    };
    destroy(): void;
    /**
     * Adds new global batch group.
     *
     * @param {string} name - Custom name.
     * @param {boolean} dynamic - Is this batch group dynamic? Will these objects move/rotate/scale
     * after being batched?
     * @param {number} maxAabbSize - Maximum size of any dimension of a bounding box around batched
     * objects.
     * {@link BatchManager#prepare} will split objects into local groups based on this size.
     * @param {number} [id] - Optional custom unique id for the group (will be generated
     * automatically otherwise).
     * @param {number[]} [layers] - Optional layer ID array. Default is [{@link LAYERID_WORLD}].
     * The whole batch group will belong to these layers. Layers of source models will be ignored.
     * @returns {BatchGroup} Group object.
     */
    addGroup(name: string, dynamic: boolean, maxAabbSize: number, id?: number, layers?: number[]): BatchGroup;
    /**
     * Remove global batch group by id. Note, this traverses the entire scene graph and clears the
     * batch group id from all components.
     *
     * @param {number} id - Batch Group ID.
     */
    removeGroup(id: number): void;
    /**
     * Mark a specific batch group as dirty. Dirty groups are re-batched before the next frame is
     * rendered. Note, re-batching a group is a potentially expensive operation.
     *
     * @param {number} id - Batch Group ID to mark as dirty.
     */
    markGroupDirty(id: number): void;
    /**
     * Retrieves a {@link BatchGroup} object with a corresponding name, if it exists, or null
     * otherwise.
     *
     * @param {string} name - Name.
     * @returns {BatchGroup|null} The batch group matching the name or null if not found.
     */
    getGroupByName(name: string): BatchGroup | null;
    /**
     * Return a list of all {@link Batch} objects that belong to the Batch Group supplied.
     *
     * @param {number} batchGroupId - The id of the batch group.
     * @returns {Batch[]} A list of batches that are used to render the batch group.
     * @private
     */
    private getBatches;
    _removeModelsFromBatchGroup(node: any, id: any): void;
    insert(type: any, groupId: any, node: any): void;
    remove(type: any, groupId: any, node: any): void;
    _extractRender(node: any, arr: any, group: any, groupMeshInstances: any): any;
    _extractModel(node: any, arr: any, group: any, groupMeshInstances: any): any;
    _extractElement(node: any, arr: any, group: any): void;
    _collectAndRemoveMeshInstances(groupMeshInstances: any, groupIds: any): void;
    /**
     * Destroys all batches and creates new based on scene models. Hides original models. Called by
     * engine automatically on app start, and if batchGroupIds on models are changed.
     *
     * @param {number[]} [groupIds] - Optional array of batch group IDs to update. Otherwise all
     * groups are updated.
     */
    generate(groupIds?: number[]): void;
    /**
     * Takes a list of mesh instances to be batched and sorts them into lists one for each draw
     * call. The input list will be split, if:
     *
     * - Mesh instances use different materials.
     * - Mesh instances have different parameters (e.g. lightmaps or static lights).
     * - Mesh instances have different shader defines (shadow receiving, being aligned to screen
     * space, etc).
     * - Too many vertices for a single batch (65535 is maximum).
     * - Too many instances for a single batch (hardware-dependent, expect 128 on low-end and 1024
     * on high-end).
     * - Bounding box of a batch is larger than maxAabbSize in any dimension.
     *
     * @param {MeshInstance[]} meshInstances - Input list of mesh instances
     * @param {boolean} dynamic - Are we preparing for a dynamic batch? Instance count will matter
     * then (otherwise not).
     * @param {number} maxAabbSize - Maximum size of any dimension of a bounding box around batched
     * objects.
     * @param {boolean} translucent - Are we batching UI elements or sprites
     * This is useful to keep a balance between the number of draw calls and the number of drawn
     * triangles, because smaller batches can be hidden when not visible in camera.
     * @returns {MeshInstance[][]} An array of arrays of mesh instances, each valid to pass to
     * {@link BatchManager#create}.
     */
    prepare(meshInstances: MeshInstance[], dynamic: boolean, maxAabbSize: number, translucent: boolean): MeshInstance[][];
    collectBatchedMeshData(meshInstances: any, dynamic: any): {
        streams: {};
        batchNumVerts: number;
        batchNumIndices: number;
        material: any;
    };
    /**
     * Takes a mesh instance list that has been prepared by {@link BatchManager#prepare}, and
     * returns a {@link Batch} object. This method assumes that all mesh instances provided can be
     * rendered in a single draw call.
     *
     * @param {MeshInstance[]} meshInstances - Input list of mesh instances.
     * @param {boolean} dynamic - Is it a static or dynamic batch? Will objects be transformed
     * after batching?
     * @param {number} [batchGroupId] - Link this batch to a specific batch group. This is done
     * automatically with default batches.
     * @returns {Batch} The resulting batch object.
     */
    create(meshInstances: MeshInstance[], dynamic: boolean, batchGroupId?: number): Batch;
    vertexFormats: {};
    /**
     * Updates bounding boxes for all dynamic batches. Called automatically.
     *
     * @ignore
     */
    updateAll(): void;
    /**
     * Clones a batch. This method doesn't rebuild batch geometry, but only creates a new model and
     * batch objects, linked to different source mesh instances.
     *
     * @param {Batch} batch - A batch object.
     * @param {MeshInstance[]} clonedMeshInstances - New mesh instances.
     * @returns {Batch} New batch object.
     */
    clone(batch: Batch, clonedMeshInstances: MeshInstance[]): Batch;
    /**
     * Removes the batch model from all layers and destroys it.
     *
     * @param {Batch} batch - A batch object.
     * @private
     */
    private destroyBatch;
}
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import type { Entity } from '../../framework/entity.js';
import type { Scene } from '../scene.js';
import { BatchGroup } from './batch-group.js';
import { MeshInstance } from '../mesh-instance.js';
import { Batch } from './batch.js';
