/**
 * @import { BoundingBox } from '../../../core/shape/bounding-box.js'
 * @import { Entity } from '../../entity.js'
 * @import { EventHandle } from '../../../core/event-handle.js'
 * @import { Material } from '../../../scene/materials/material.js'
 * @import { RenderComponentSystem } from './system.js'
 */
/**
 * The RenderComponent enables an {@link Entity} to render 3D meshes. The {@link type} property can
 * be set to one of several predefined shapes (such as `box`, `sphere`, `cone` and so on).
 * Alternatively, the component can be configured to manage an arbitrary array of
 * {@link MeshInstance}s. These can either be created programmatically or loaded from an
 * {@link Asset}.
 *
 * The {@link MeshInstance}s managed by this component are positioned, rotated, and scaled in world
 * space by the world transformation matrix of the owner {@link Entity}. This world matrix is
 * derived by combining the entity's local transformation (position, rotation, and scale) with the
 * world transformation matrix of its parent entity in the scene hierarchy.
 *
 * You should never need to use the RenderComponent constructor directly. To add a RenderComponent
 * to an Entity, use {@link Entity#addComponent}:
 *
 * ```javascript
 * const entity = new pc.Entity();
 * entity.addComponent('render', {
 *     type: 'box'
 * });
 * ```
 *
 * Once the RenderComponent is added to the entity, you can access it via the {@link Entity#render}
 * property:
 *
 * ```javascript
 * entity.render.type = 'capsule';  // Set the render component's type
 *
 * console.log(entity.render.type); // Get the render component's type and print it
 * ```
 *
 * Relevant Engine API examples:
 *
 * - [Loading Render Assets](https://playcanvas.github.io/#/graphics/render-asset)
 * - [Primitive Shapes](https://playcanvas.github.io/#/graphics/shapes)
 * - [Spinning Cube](https://playcanvas.github.io/#/misc/hello-world)
 *
 * @category Graphics
 */
export class RenderComponent extends Component {
    /**
     * Create a new RenderComponent.
     *
     * @param {RenderComponentSystem} system - The ComponentSystem that created this Component.
     * @param {Entity} entity - The Entity that this Component is attached to.
     */
    constructor(system: RenderComponentSystem, entity: Entity);
    /**
     * @type {'asset'|'box'|'capsule'|'cone'|'cylinder'|'plane'|'sphere'|'torus'}
     * @private
     */
    private _type;
    /** @private */
    private _castShadows;
    /** @private */
    private _receiveShadows;
    /** @private */
    private _castShadowsLightmap;
    /** @private */
    private _lightmapped;
    /** @private */
    private _lightmapSizeMultiplier;
    /**
     * Mark meshes as non-movable (optimization).
     *
     * @type {boolean}
     */
    isStatic: boolean;
    /** @private */
    private _batchGroupId;
    /** @private */
    private _layers;
    /** @private */
    private _renderStyle;
    /**
     * @type {MeshInstance[]}
     * @private
     */
    private _meshInstances;
    /**
     * @type {BoundingBox|null}
     * @private
     */
    private _customAabb;
    /**
     * Used by lightmapper.
     *
     * @type {{x: number, y: number, z: number, uv: number}|null}
     * @ignore
     */
    _area: {
        x: number;
        y: number;
        z: number;
        uv: number;
    } | null;
    /**
     * @type {AssetReference}
     * @private
     */
    private _assetReference;
    /**
     * @type {AssetReference[]}
     * @private
     */
    private _materialReferences;
    /**
     * Material used to render meshes other than asset type. It gets priority when set to
     * something else than defaultMaterial, otherwise materialASsets[0] is used.
     *
     * @type {Material}
     * @private
     */
    private _material;
    /**
     * A reference to the entity to be used as the root bone for any skinned meshes that
     * are rendered by this component.
     *
     * @type {Entity|null}
     * @private
     */
    private _rootBone;
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
     * @type {EventHandle|null}
     * @private
     */
    private _evtSetMeshes;
    /**
     * Sets the render style of this component's {@link MeshInstance}s. Can be:
     *
     * - {@link RENDERSTYLE_SOLID}
     * - {@link RENDERSTYLE_WIREFRAME}
     * - {@link RENDERSTYLE_POINTS}
     *
     * Defaults to {@link RENDERSTYLE_SOLID}.
     *
     * @type {number}
     */
    set renderStyle(renderStyle: number);
    /**
     * Gets the render style of this component's {@link MeshInstance}s.
     *
     * @type {number}
     */
    get renderStyle(): number;
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
     * - **"asset"**: Renders geometry defined in an {@link Asset} of type `render`. This asset,
     *   assigned to the {@link asset} property, contains one or more {@link MeshInstance}s.
     *   Alternatively, {@link meshInstances} can be set programmatically.
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
     * Sets the array of meshInstances contained in the component.
     *
     * @type {MeshInstance[]}
     */
    set meshInstances(value: MeshInstance[]);
    /**
     * Gets the array of meshInstances contained in the component.
     *
     * @type {MeshInstance[]}
     */
    get meshInstances(): MeshInstance[];
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
     * Sets the material {@link Material} that will be used to render the component. The material
     * is ignored for renders of type 'asset'.
     *
     * @type {Material}
     */
    set material(value: Material);
    /**
     * Gets the material {@link Material} that will be used to render the component.
     *
     * @type {Material}
     */
    get material(): Material;
    /**
     * Sets the material assets that will be used to render the component. Each material
     * corresponds to the respective mesh instance.
     *
     * @type {Asset[]|number[]}
     */
    set materialAssets(value: Asset[] | number[]);
    /**
     * Gets the material assets that will be used to render the component.
     *
     * @type {Asset[]|number[]}
     */
    get materialAssets(): Asset[] | number[];
    /**
     * Sets the render asset (or asset id) for the render component. This only applies to render components with
     * type 'asset'.
     *
     * @type {Asset|number}
     */
    set asset(value: number);
    /**
     * Gets the render asset id for the render component.
     *
     * @type {number}
     */
    get asset(): number;
    /**
     * Assign asset id to the component, without updating the component with the new asset.
     * This can be used to assign the asset id to already fully created component.
     *
     * @param {Asset|number} asset - The render asset or asset id to assign.
     * @ignore
     */
    assignAsset(asset: Asset | number): void;
    /**
     * Sets the root bone entity (or entity guid) for the render component.
     *
     * @type {Entity|string|null}
     */
    set rootBone(value: Entity | null);
    /**
     * Gets the root bone entity for the render component.
     *
     * @type {Entity|null}
     */
    get rootBone(): Entity | null;
    /** @private */
    private destroyMeshInstances;
    /** @private */
    private addToLayers;
    removeFromLayers(): void;
    /** @private */
    private onRemoveChild;
    /** @private */
    private onInsertChild;
    onRemove(): void;
    materialAsset: any;
    onLayersChanged(oldComp: any, newComp: any): void;
    onLayerAdded(layer: any): void;
    onLayerRemoved(layer: any): void;
    /**
     * Stop rendering {@link MeshInstance}s without removing them from the scene hierarchy. This
     * method sets the {@link MeshInstance#visible} property of every MeshInstance to false. Note,
     * this does not remove the mesh instances from the scene hierarchy or draw call list. So the
     * render component still incurs some CPU overhead.
     */
    hide(): void;
    /**
     * Enable rendering of the component's {@link MeshInstance}s if hidden using
     * {@link RenderComponent#hide}. This method sets the {@link MeshInstance#visible} property on
     * all mesh instances to true.
     */
    show(): void;
    _onRenderAssetAdded(): void;
    _onRenderAssetLoad(): void;
    _onSetMeshes(meshes: any): void;
    _clearSkinInstances(): void;
    _cloneSkinInstances(): void;
    _cloneMeshes(meshes: any): void;
    _onRenderAssetUnload(): void;
    _onRenderAssetRemove(): void;
    _onMaterialAdded(index: any, component: any, asset: any): void;
    _updateMainMaterial(index: any, material: any): void;
    _onMaterialLoad(index: any, component: any, asset: any): void;
    _onMaterialRemove(index: any, component: any, asset: any): void;
    _onMaterialUnload(index: any, component: any, asset: any): void;
    resolveDuplicatedEntityReferenceProperties(oldRender: any, duplicatedIdsMap: any): void;
}
import { Component } from '../component.js';
import type { BoundingBox } from '../../../core/shape/bounding-box.js';
import { MeshInstance } from '../../../scene/mesh-instance.js';
import type { Material } from '../../../scene/materials/material.js';
import { Asset } from '../../asset/asset.js';
import type { Entity } from '../../entity.js';
import type { RenderComponentSystem } from './system.js';
