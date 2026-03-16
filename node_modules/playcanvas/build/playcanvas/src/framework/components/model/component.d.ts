/**
 * @import { BoundingBox } from '../../../core/shape/bounding-box.js'
 * @import { Entity } from '../../entity.js'
 * @import { EventHandle } from '../../../core/event-handle.js'
 * @import { LayerComposition } from '../../../scene/composition/layer-composition.js'
 * @import { Layer } from '../../../scene/layer.js'
 * @import { Material } from '../../../scene/materials/material.js'
 * @import { ModelComponentSystem } from './system.js'
 */
/**
 * The ModelComponent enables an {@link Entity} to render 3D models. The {@link type} property can
 * be set to one of several predefined shapes (such as `box`, `sphere`, `cone` and so on).
 * Alternatively, the component can be configured to manage an arbitrary {@link Model}. This can
 * either be created programmatically or loaded from an {@link Asset}.
 *
 * The {@link Model} managed by this component is positioned, rotated, and scaled in world space by
 * the world transformation matrix of the owner {@link Entity}. This world matrix is derived by
 * combining the entity's local transformation (position, rotation, and scale) with the world
 * transformation matrix of its parent entity in the scene hierarchy.
 *
 * You should never need to use the ModelComponent constructor directly. To add a ModelComponent
 * to an Entity, use {@link Entity#addComponent}:
 *
 * ```javascript
 * const entity = new pc.Entity();
 * entity.addComponent('model', {
 *     type: 'box'
 * });
 * ```
 *
 * Once the ModelComponent is added to the entity, you can access it via the {@link Entity#model}
 * property:
 *
 * ```javascript
 * entity.model.type = 'capsule';  // Set the model component's type
 *
 * console.log(entity.model.type); // Get the model component's type and print it
 * ```
 *
 * @category Graphics
 */
export class ModelComponent extends Component {
    /**
     * Create a new ModelComponent instance.
     *
     * @param {ModelComponentSystem} system - The ComponentSystem that created this Component.
     * @param {Entity} entity - The Entity that this Component is attached to.
     */
    constructor(system: ModelComponentSystem, entity: Entity);
    /**
     * @type {'asset'|'box'|'capsule'|'cone'|'cylinder'|'plane'|'sphere'|'torus'}
     * @private
     */
    private _type;
    /**
     * @type {Asset|number|null}
     * @private
     */
    private _asset;
    /**
     * @type {Model|null}
     * @private
     */
    private _model;
    /**
     * @type {Object<string, number>}
     * @private
     */
    private _mapping;
    /**
     * @type {boolean}
     * @private
     */
    private _castShadows;
    /**
     * @type {boolean}
     * @private
     */
    private _receiveShadows;
    /**
     * @type {Asset|number|null}
     * @private
     */
    private _materialAsset;
    /**
     * @type {Material}
     * @private
     */
    private _material;
    /**
     * @type {boolean}
     * @private
     */
    private _castShadowsLightmap;
    /**
     * @type {boolean}
     * @private
     */
    private _lightmapped;
    /**
     * @type {number}
     * @private
     */
    private _lightmapSizeMultiplier;
    /**
     * Mark meshes as non-movable (optimization).
     *
     * @type {boolean}
     */
    isStatic: boolean;
    /**
     * @type {number[]}
     * @private
     */
    private _layers;
    /**
     * @type {number}
     * @private
     */
    private _batchGroupId;
    /**
     * @type {BoundingBox|null}
     * @private
     */
    private _customAabb;
    _area: any;
    _materialEvents: any;
    /**
     * @type {boolean}
     * @private
     */
    private _clonedModel;
    _batchGroup: any;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtLayersChanged;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtLayerAdded;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtLayerRemoved;
    /**
     * Sets the array of mesh instances contained in the component's model.
     *
     * @type {MeshInstance[]|null}
     */
    set meshInstances(value: MeshInstance[] | null);
    /**
     * Gets the array of mesh instances contained in the component's model.
     *
     * @type {MeshInstance[]|null}
     */
    get meshInstances(): MeshInstance[] | null;
    /**
     * Sets the custom object space bounding box that is used for visibility culling of attached
     * mesh instances. This is an optimization, allowing an oversized bounding box to be specified
     * for skinned characters in order to avoid per frame bounding box computations based on bone
     * positions.
     *
     * @type {BoundingBox|null}
     */
    set customAabb(value: BoundingBox | null);
    /**
     * Gets the custom object space bounding box that is used for visibility culling of attached
     * mesh instances.
     *
     * @type {BoundingBox|null}
     */
    get customAabb(): BoundingBox | null;
    /**
     * Sets the type of the component, determining the source of the geometry to be rendered.
     * The geometry, whether it's a primitive shape or originates from an asset, is rendered
     * using the owning entity's final world transform. This world transform is calculated by
     * concatenating (multiplying) the local transforms (position, rotation, scale) of the
     * entity and all its ancestors in the scene hierarchy. This process positions, orientates,
     * and scales the geometry in world space.
     *
     * Can be one of the following values:
     *
     * - **"asset"**: Renders geometry defined in an {@link Asset} of type `model`. This asset,
     *   assigned to the {@link asset} property, contains a {@link Model}. Alternatively,
     *   {@link model} can be set programmatically.
     * - **"box"**: A unit cube (sides of length 1) centered at the local space origin.
     * - **"capsule"**: A shape composed of a cylinder and two hemispherical caps that is aligned
     *   with the local Y-axis. It is centered at the local space origin and has an unscaled height
     *   of 2 and a radius of 0.5.
     * - **"cone"**: A cone aligned with the local Y-axis. It is centered at the local space
     *   origin, with its base in the local XZ plane at Y = -0.5 and its tip at Y = +0.5. It has
     *   an unscaled height of 1 and a base radius of 0.5.
     * - **"cylinder"**: A cylinder aligned with the local Y-axis. It is centered at the local
     *   space origin with an unscaled height of 1 and a radius of 0.5.
     * - **"plane"**: A flat plane in the local XZ plane at Y = 0 (normal along +Y). It is
     *   centered at the local space origin with unscaled dimensions of 1x1 units along local X and
     *   Z axes.
     * - **"sphere"**: A sphere with a radius of 0.5. It is centered at the local space origin and
     *   has poles at Y = -0.5 and Y = +0.5.
     * - **"torus"**: A doughnut shape lying in the local XZ plane at Y = 0. It is centered at
     *   the local space origin with a tube radius of 0.2 and a ring radius of 0.3.
     *
     * @type {'asset'|'box'|'capsule'|'cone'|'cylinder'|'plane'|'sphere'|'torus'}
     */
    set type(value: "asset" | "box" | "capsule" | "cone" | "cylinder" | "plane" | "sphere" | "torus");
    /**
     * Gets the type of the component.
     *
     * @type {'asset'|'box'|'capsule'|'cone'|'cylinder'|'plane'|'sphere'|'torus'}
     */
    get type(): "asset" | "box" | "capsule" | "cone" | "cylinder" | "plane" | "sphere" | "torus";
    /**
     * Sets the model owned by this component.
     *
     * @type {Model|null}
     */
    set model(value: Model | null);
    /**
     * Gets the model owned by this component. In this case a model is not set or loaded, this will
     * return null.
     *
     * @type {Model|null}
     */
    get model(): Model | null;
    /**
     * Sets the model asset (or asset id) for the component. This only applies to model components
     * with type 'asset'.
     *
     * @type {Asset|number|null}
     */
    set asset(value: Asset | number | null);
    /**
     * Gets the model asset id for the component.
     *
     * @type {Asset|number|null}
     */
    get asset(): Asset | number | null;
    /**
     * Sets whether the component is affected by the runtime lightmapper. If true, the meshes will
     * be lightmapped after using lightmapper.bake().
     *
     * @type {boolean}
     */
    set lightmapped(value: boolean);
    /**
     * Gets whether the component is affected by the runtime lightmapper.
     *
     * @type {boolean}
     */
    get lightmapped(): boolean;
    /**
     * Sets the dictionary that holds material overrides for each mesh instance. Only applies to
     * model components of type 'asset'. The mapping contains pairs of mesh instance index to
     * material asset id.
     *
     * @type {Object<string, number>}
     */
    set mapping(value: {
        [x: string]: number;
    });
    /**
     * Gets the dictionary that holds material overrides for each mesh instance.
     *
     * @type {Object<string, number>}
     */
    get mapping(): {
        [x: string]: number;
    };
    /**
     * Sets whether attached meshes will cast shadows for lights that have shadow casting enabled.
     *
     * @type {boolean}
     */
    set castShadows(value: boolean);
    /**
     * Gets whether attached meshes will cast shadows for lights that have shadow casting enabled.
     *
     * @type {boolean}
     */
    get castShadows(): boolean;
    /**
     * Sets whether shadows will be cast on attached meshes.
     *
     * @type {boolean}
     */
    set receiveShadows(value: boolean);
    /**
     * Gets whether shadows will be cast on attached meshes.
     *
     * @type {boolean}
     */
    get receiveShadows(): boolean;
    /**
     * Sets whether meshes instances will cast shadows when rendering lightmaps.
     *
     * @type {boolean}
     */
    set castShadowsLightmap(value: boolean);
    /**
     * Gets whether meshes instances will cast shadows when rendering lightmaps.
     *
     * @type {boolean}
     */
    get castShadowsLightmap(): boolean;
    /**
     * Sets the lightmap resolution multiplier.
     *
     * @type {number}
     */
    set lightmapSizeMultiplier(value: number);
    /**
     * Gets the lightmap resolution multiplier.
     *
     * @type {number}
     */
    get lightmapSizeMultiplier(): number;
    /**
     * Sets the array of layer IDs ({@link Layer#id}) to which the mesh instances belong. Don't
     * push, pop, splice or modify this array. If you want to change it, set a new one instead.
     *
     * @type {number[]}
     */
    set layers(value: number[]);
    /**
     * Gets the array of layer IDs ({@link Layer#id}) to which the mesh instances belong.
     *
     * @type {number[]}
     */
    get layers(): number[];
    /**
     * Sets the batch group for the mesh instances in this component (see {@link BatchGroup}).
     * Default is -1 (no group).
     *
     * @type {number}
     */
    set batchGroupId(value: number);
    /**
     * Gets the batch group for the mesh instances in this component (see {@link BatchGroup}).
     *
     * @type {number}
     */
    get batchGroupId(): number;
    /**
     * Sets the material {@link Asset} that will be used to render the component. The material is
     * ignored for renders of type 'asset'.
     *
     * @type {Asset|number|null}
     */
    set materialAsset(value: Asset | number | null);
    /**
     * Gets the material {@link Asset} that will be used to render the component.
     *
     * @type {Asset|number|null}
     */
    get materialAsset(): Asset | number | null;
    /**
     * Sets the {@link Material} that will be used to render the model. The material is ignored for
     * renders of type 'asset'.
     *
     * @type {Material}
     */
    set material(value: Material);
    /**
     * Gets the {@link Material} that will be used to render the model.
     *
     * @type {Material}
     */
    get material(): Material;
    addModelToLayers(): void;
    removeModelFromLayers(): void;
    onRemoveChild(): void;
    onInsertChild(): void;
    onRemove(): void;
    /**
     * @param {LayerComposition} oldComp - The old layer composition.
     * @param {LayerComposition} newComp - The new layer composition.
     * @private
     */
    private onLayersChanged;
    /**
     * @param {Layer} layer - The layer that was added.
     * @private
     */
    private onLayerAdded;
    /**
     * @param {Layer} layer - The layer that was removed.
     * @private
     */
    private onLayerRemoved;
    /**
     * @param {number} index - The index of the mesh instance.
     * @param {string} event - The event name.
     * @param {number} id - The asset id.
     * @param {*} handler - The handler function to be bound to the specified event.
     * @private
     */
    private _setMaterialEvent;
    /** @private */
    private _unsetMaterialEvents;
    /**
     * @param {string} idOrPath - The asset id or path.
     * @returns {Asset|null} The asset.
     * @private
     */
    private _getAssetByIdOrPath;
    /**
     * @param {string} path - The path of the model asset.
     * @returns {string|null} The model asset URL or null if the asset is not in the registry.
     * @private
     */
    private _getMaterialAssetUrl;
    /**
     * @param {Asset} materialAsset -The material asset to load.
     * @param {MeshInstance} meshInstance - The mesh instance to assign the material to.
     * @param {number} index - The index of the mesh instance.
     * @private
     */
    private _loadAndSetMeshInstanceMaterial;
    /**
     * Stop rendering model without removing it from the scene hierarchy. This method sets the
     * {@link MeshInstance#visible} property of every MeshInstance in the model to false Note, this
     * does not remove the model or mesh instances from the scene hierarchy or draw call list. So
     * the model component still incurs some CPU overhead.
     *
     * @example
     * this.timer = 0;
     * this.visible = true;
     * // ...
     * // blink model every 0.1 seconds
     * this.timer += dt;
     * if (this.timer > 0.1) {
     *     if (!this.visible) {
     *         this.entity.model.show();
     *         this.visible = true;
     *     } else {
     *         this.entity.model.hide();
     *         this.visible = false;
     *     }
     *     this.timer = 0;
     * }
     */
    hide(): void;
    /**
     * Enable rendering of the model if hidden using {@link ModelComponent#hide}. This method sets
     * all the {@link MeshInstance#visible} property on all mesh instances to true.
     */
    show(): void;
    /**
     * @param {Asset} asset - The material asset to bind events to.
     * @private
     */
    private _bindMaterialAsset;
    /**
     * @param {Asset} asset - The material asset to unbind events from.
     * @private
     */
    private _unbindMaterialAsset;
    /**
     * @param {Asset} asset - The material asset on which an asset add event has been fired.
     * @private
     */
    private _onMaterialAssetAdd;
    /**
     * @param {Asset} asset - The material asset on which an asset load event has been fired.
     * @private
     */
    private _onMaterialAssetLoad;
    /**
     * @param {Asset} asset - The material asset on which an asset unload event has been fired.
     * @private
     */
    private _onMaterialAssetUnload;
    /**
     * @param {Asset} asset - The material asset on which an asset remove event has been fired.
     * @private
     */
    private _onMaterialAssetRemove;
    /**
     * @param {Asset} asset - The material asset on which an asset change event has been fired.
     * @private
     */
    private _onMaterialAssetChange;
    /**
     * @param {Asset} asset - The model asset to bind events to.
     * @private
     */
    private _bindModelAsset;
    /**
     * @param {Asset} asset - The model asset to unbind events from.
     * @private
     */
    private _unbindModelAsset;
    /**
     * @param {Asset} asset - The model asset on which an asset add event has been fired.
     * @private
     */
    private _onModelAssetAdded;
    /**
     * @param {Asset} asset - The model asset on which an asset load event has been fired.
     * @private
     */
    private _onModelAssetLoad;
    /**
     * @param {Asset} asset - The model asset on which an asset unload event has been fired.
     * @private
     */
    private _onModelAssetUnload;
    /**
     * @param {Asset} asset - The model asset on which an asset change event has been fired.
     * @param {string} attr - The attribute that was changed.
     * @param {*} _new - The new value of the attribute.
     * @param {*} _old - The old value of the attribute.
     * @private
     */
    private _onModelAssetChange;
    /**
     * @param {Asset} asset - The model asset on which an asset remove event has been fired.
     * @private
     */
    private _onModelAssetRemove;
    /**
     * @param {Material} material - The material to be set.
     * @private
     */
    private _setMaterial;
}
import { Component } from '../component.js';
import { MeshInstance } from '../../../scene/mesh-instance.js';
import type { BoundingBox } from '../../../core/shape/bounding-box.js';
import { Model } from '../../../scene/model.js';
import { Asset } from '../../asset/asset.js';
import type { Material } from '../../../scene/materials/material.js';
import type { ModelComponentSystem } from './system.js';
import type { Entity } from '../../entity.js';
