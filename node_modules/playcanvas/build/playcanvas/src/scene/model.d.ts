/**
 * @import { GraphNode } from './graph-node.js'
 */
/**
 * A model is a graphical object that can be added to or removed from a scene. It contains a
 * hierarchy and any number of mesh instances.
 *
 * @category Graphics
 */
export class Model {
    /**
     * The root node of the model's graph node hierarchy.
     *
     * @type {GraphNode|null}
     */
    graph: GraphNode | null;
    /**
     * An array of MeshInstances contained in this model.
     *
     * @type {MeshInstance[]}
     */
    meshInstances: MeshInstance[];
    /**
     * An array of SkinInstances contained in this model.
     *
     * @type {SkinInstance[]}
     */
    skinInstances: SkinInstance[];
    /**
     * An array of MorphInstances contained in this model.
     *
     * @type {MorphInstance[]}
     */
    morphInstances: MorphInstance[];
    cameras: any[];
    lights: any[];
    _shadersVersion: number;
    _immutable: boolean;
    getGraph(): GraphNode;
    setGraph(graph: any): void;
    getCameras(): any[];
    setCameras(cameras: any): void;
    getLights(): any[];
    setLights(lights: any): void;
    getMaterials(): import("./materials/material.js").Material[];
    /**
     * Clones a model. The returned model has a newly created hierarchy and mesh instances, but
     * meshes are shared between the clone and the specified model.
     *
     * @returns {Model} A clone of the specified model.
     * @example
     * const clonedModel = model.clone();
     */
    clone(): Model;
    /**
     * Destroys skinning texture and possibly deletes vertex/index buffers of a model. Mesh is
     * reference-counted, so buffers are only deleted if all models with referencing mesh instances
     * were deleted. That means all in-scene models + the "base" one (asset.resource) which is
     * created when the model is parsed. It is recommended to use asset.unload() instead, which
     * will also remove the model from the scene.
     */
    destroy(): void;
    /**
     * Generates the necessary internal data for a model to be renderable as wireframe. Once this
     * function has been called, any mesh instance in the model can have its renderStyle property
     * set to {@link RENDERSTYLE_WIREFRAME}.
     *
     * @example
     * model.generateWireframe();
     * for (let i = 0; i < model.meshInstances.length; i++) {
     *     model.meshInstances[i].renderStyle = pc.RENDERSTYLE_WIREFRAME;
     * }
     */
    generateWireframe(): void;
}
import type { GraphNode } from './graph-node.js';
import { MeshInstance } from './mesh-instance.js';
import { SkinInstance } from './skin-instance.js';
import { MorphInstance } from './morph-instance.js';
