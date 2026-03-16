/**
 * A Layer represents a renderable subset of the scene. It can contain a list of mesh instances,
 * lights and cameras, their render settings and also defines custom callbacks before, after or
 * during rendering. Layers are organized inside {@link LayerComposition} in a desired order.
 *
 * @category Graphics
 */
export class Layer {
    /**
     * Create a new Layer instance.
     *
     * @param {object} options - Object for passing optional arguments. These arguments are the
     * same as properties of the Layer.
     */
    constructor(options?: object);
    /**
     * Mesh instances assigned to this layer.
     *
     * @type {MeshInstance[]}
     * @ignore
     */
    meshInstances: MeshInstance[];
    /**
     * Mesh instances assigned to this layer, stored in a set.
     *
     * @type {Set<MeshInstance>}
     * @ignore
     */
    meshInstancesSet: Set<MeshInstance>;
    /**
     * Shadow casting instances assigned to this layer.
     *
     * @type {MeshInstance[]}
     * @ignore
     */
    shadowCasters: MeshInstance[];
    /**
     * Shadow casting instances assigned to this layer, stored in a set.
     *
     * @type {Set<MeshInstance>}
     * @ignore
     */
    shadowCastersSet: Set<MeshInstance>;
    /**
     * Visible (culled) mesh instances assigned to this layer. Looked up by the Camera.
     *
     * @type {WeakMap<Camera, CulledInstances>}
     * @private
     */
    private _visibleInstances;
    /**
     * All lights assigned to a layer.
     *
     * @type {Light[]}
     * @private
     */
    private _lights;
    /**
     * All lights assigned to a layer stored in a set.
     *
     * @type {Set<Light>}
     * @private
     */
    private _lightsSet;
    /**
     * Set of light used by clustered lighting (omni and spot, but no directional).
     *
     * @type {Set<Light>}
     * @private
     */
    private _clusteredLightsSet;
    /**
     * Lights separated by light type. Lights in the individual arrays are sorted by the key,
     * to match their order in _lightIdHash, so that their order matches the order expected by the
     * generated shader code.
     *
     * @type {Light[][]}
     * @private
     */
    private _splitLights;
    /**
     * True if _splitLights needs to be updated, which means if lights were added or removed from
     * the layer, or their key changed.
     *
     * @type {boolean}
     * @private
     */
    private _splitLightsDirty;
    /**
     * True if the objects rendered on the layer require light cube (emitters with lighting do).
     *
     * @type {boolean}
     * @ignore
     */
    requiresLightCube: boolean;
    /**
     * @type {CameraComponent[]}
     * @ignore
     */
    cameras: CameraComponent[];
    /**
     * @type {Set<Camera>}
     * @ignore
     */
    camerasSet: Set<Camera>;
    /**
     * @type {GSplatPlacement[]}
     * @ignore
     */
    gsplatPlacements: GSplatPlacement[];
    /**
     * @type {Set<GSplatPlacement>}
     * @ignore
     */
    gsplatPlacementsSet: Set<GSplatPlacement>;
    /**
     * @type {GSplatPlacement[]}
     * @ignore
     */
    gsplatShadowCasters: GSplatPlacement[];
    /**
     * @type {Set<GSplatPlacement>}
     * @ignore
     */
    gsplatShadowCastersSet: Set<GSplatPlacement>;
    /**
     * True if the gsplatPlacements array was modified.
     *
     * @type {boolean}
     * @ignore
     */
    gsplatPlacementsDirty: boolean;
    /**
     * True if the composition is invalidated.
     *
     * @ignore
     */
    _dirtyComposition: boolean;
    /**
     * A unique ID of the layer. Layer IDs are stored inside {@link ModelComponent#layers},
     * {@link RenderComponent#layers}, {@link CameraComponent#layers},
     * {@link LightComponent#layers} and {@link ElementComponent#layers} instead of names.
     * Can be used in {@link LayerComposition#getLayerById}.
     *
     * @type {number}
     */
    id: number;
    /**
     * Name of the layer. Can be used in {@link LayerComposition#getLayerByName}.
     *
     * @type {string}
     */
    name: string;
    /**
     * @type {boolean}
     * @private
     */
    private _enabled;
    /**
     * @type {number}
     * @private
     */
    private _refCounter;
    /**
     * Defines the method used for sorting opaque (that is, not semi-transparent) mesh
     * instances before rendering. Can be:
     *
     * - {@link SORTMODE_NONE}
     * - {@link SORTMODE_MANUAL}
     * - {@link SORTMODE_MATERIALMESH}
     * - {@link SORTMODE_BACK2FRONT}
     * - {@link SORTMODE_FRONT2BACK}
     *
     * Defaults to {@link SORTMODE_MATERIALMESH}.
     *
     * @type {number}
     */
    opaqueSortMode: number;
    /**
     * Defines the method used for sorting semi-transparent mesh instances before rendering. Can be:
     *
     * - {@link SORTMODE_NONE}
     * - {@link SORTMODE_MANUAL}
     * - {@link SORTMODE_MATERIALMESH}
     * - {@link SORTMODE_BACK2FRONT}
     * - {@link SORTMODE_FRONT2BACK}
     *
     * Defaults to {@link SORTMODE_BACK2FRONT}.
     *
     * @type {number}
     */
    transparentSortMode: number;
    renderTarget: any;
    /**
     * @type {boolean}
     * @private
     */
    private _clearColorBuffer;
    /**
     * @type {boolean}
     * @private
     */
    private _clearDepthBuffer;
    /**
     * @type {boolean}
     * @private
     */
    private _clearStencilBuffer;
    /**
     * Custom function that is called after the layer has been enabled. This happens when:
     *
     * - The layer is created with {@link Layer#enabled} set to true (which is the default value).
     * - {@link Layer#enabled} was changed from false to true
     *
     * @type {Function}
     */
    onEnable: Function;
    /**
     * Custom function that is called after the layer has been disabled. This happens when:
     *
     * - {@link Layer#enabled} was changed from true to false
     * - {@link Layer#decrementCounter} was called and set the counter to zero.
     *
     * @type {Function}
     */
    onDisable: Function;
    /**
     * @type {Function|null}
     * @ignore
     */
    customSortCallback: Function | null;
    /**
     * @type {Function|null}
     * @ignore
     */
    customCalculateSortValues: Function | null;
    _lightHash: number;
    _lightHashDirty: boolean;
    _lightIdHash: number;
    _lightIdHashDirty: boolean;
    skipRenderAfter: number;
    _skipRenderCounter: number;
    _renderTime: number;
    _forwardDrawCalls: number;
    _shadowDrawCalls: number;
    _shaderVersion: number;
    /**
     * Sets the enabled state of the layer. Disabled layers are skipped. Defaults to true.
     *
     * @type {boolean}
     */
    set enabled(val: boolean);
    /**
     * Gets the enabled state of the layer.
     *
     * @type {boolean}
     */
    get enabled(): boolean;
    /**
     * Sets whether the camera will clear the color buffer when it renders this layer.
     *
     * @type {boolean}
     */
    set clearColorBuffer(val: boolean);
    /**
     * Gets whether the camera will clear the color buffer when it renders this layer.
     *
     * @type {boolean}
     */
    get clearColorBuffer(): boolean;
    /**
     * Sets whether the camera will clear the depth buffer when it renders this layer.
     *
     * @type {boolean}
     */
    set clearDepthBuffer(val: boolean);
    /**
     * Gets whether the camera will clear the depth buffer when it renders this layer.
     *
     * @type {boolean}
     */
    get clearDepthBuffer(): boolean;
    /**
     * Sets whether the camera will clear the stencil buffer when it renders this layer.
     *
     * @type {boolean}
     */
    set clearStencilBuffer(val: boolean);
    /**
     * Gets whether the camera will clear the stencil buffer when it renders this layer.
     *
     * @type {boolean}
     */
    get clearStencilBuffer(): boolean;
    /**
     * Gets whether the layer contains omni or spot lights.
     *
     * @type {boolean}
     * @ignore
     */
    get hasClusteredLights(): boolean;
    /**
     * Gets the lights used by clustered lighting in a set.
     *
     * @type {Set<Light>}
     * @ignore
     */
    get clusteredLightsSet(): Set<Light>;
    /**
     * Increments the usage counter of this layer. By default, layers are created with counter set
     * to 1 (if {@link Layer.enabled} is true) or 0 (if it was false). Incrementing the counter
     * from 0 to 1 will enable the layer and call {@link Layer.onEnable}. Use this function to
     * "subscribe" multiple effects to the same layer. For example, if the layer is used to render
     * a reflection texture which is used by 2 mirrors, then each mirror can call this function
     * when visible and {@link Layer.decrementCounter} if invisible. In such case the reflection
     * texture won't be updated, when there is nothing to use it, saving performance.
     *
     * @ignore
     */
    incrementCounter(): void;
    /**
     * Decrements the usage counter of this layer. Decrementing the counter from 1 to 0 will
     * disable the layer and call {@link Layer.onDisable}.
     *
     * @ignore
     */
    decrementCounter(): void;
    /**
     * Adds a gsplat placement to this layer.
     *
     * @param {GSplatPlacement} placement - A placement of a gsplat.
     * @ignore
     */
    addGSplatPlacement(placement: GSplatPlacement): void;
    /**
     * Removes a gsplat placement from this layer.
     *
     * @param {GSplatPlacement} placement - A placement of a gsplat.
     * @ignore
     */
    removeGSplatPlacement(placement: GSplatPlacement): void;
    /**
     * Adds a gsplat placement to this layer as a shadow caster.
     *
     * @param {GSplatPlacement} placement - A placement of a gsplat.
     * @ignore
     */
    addGSplatShadowCaster(placement: GSplatPlacement): void;
    /**
     * Removes a gsplat placement from the shadow casters of this layer.
     *
     * @param {GSplatPlacement} placement - A placement of a gsplat.
     * @ignore
     */
    removeGSplatShadowCaster(placement: GSplatPlacement): void;
    /**
     * Adds an array of mesh instances to this layer.
     *
     * @param {MeshInstance[]} meshInstances - Array of {@link MeshInstance}.
     * @param {boolean} [skipShadowCasters] - Set it to true if you don't want these mesh instances
     * to cast shadows in this layer. Defaults to false.
     */
    addMeshInstances(meshInstances: MeshInstance[], skipShadowCasters?: boolean): void;
    /**
     * Removes multiple mesh instances from this layer.
     *
     * @param {MeshInstance[]} meshInstances - Array of {@link MeshInstance}. If they were added to
     * this layer, they will be removed.
     * @param {boolean} [skipShadowCasters] - Set it to true if you want to still cast shadows from
     * removed mesh instances or if they never did cast shadows before. Defaults to false.
     */
    removeMeshInstances(meshInstances: MeshInstance[], skipShadowCasters?: boolean): void;
    /**
     * Adds an array of mesh instances to this layer, but only as shadow casters (they will not be
     * rendered anywhere, but only cast shadows on other objects).
     *
     * @param {MeshInstance[]} meshInstances - Array of {@link MeshInstance}.
     */
    addShadowCasters(meshInstances: MeshInstance[]): void;
    /**
     * Removes multiple mesh instances from the shadow casters list of this layer, meaning they
     * will stop casting shadows.
     *
     * @param {MeshInstance[]} meshInstances - Array of {@link MeshInstance}. If they were added to
     * this layer, they will be removed.
     */
    removeShadowCasters(meshInstances: MeshInstance[]): void;
    /**
     * Removes all mesh instances from this layer.
     *
     * @param {boolean} [skipShadowCasters] - Set it to true if you want to continue the existing mesh
     * instances to cast shadows. Defaults to false, which removes shadow casters as well.
     */
    clearMeshInstances(skipShadowCasters?: boolean): void;
    markLightsDirty(): void;
    hasLight(light: any): boolean;
    /**
     * Adds a light to this layer.
     *
     * @param {LightComponent} light - A {@link LightComponent}.
     */
    addLight(light: LightComponent): void;
    /**
     * Removes a light from this layer.
     *
     * @param {LightComponent} light - A {@link LightComponent}.
     */
    removeLight(light: LightComponent): void;
    /**
     * Removes all lights from this layer.
     */
    clearLights(): void;
    get splitLights(): Light[][];
    evaluateLightHash(localLights: any, directionalLights: any, useIds: any): number;
    getLightHash(isClustered: any): number;
    getLightIdHash(): number;
    /**
     * Adds a camera to this layer.
     *
     * @param {CameraComponent} camera - A {@link CameraComponent}.
     */
    addCamera(camera: CameraComponent): void;
    /**
     * Removes a camera from this layer.
     *
     * @param {CameraComponent} camera - A {@link CameraComponent}.
     */
    removeCamera(camera: CameraComponent): void;
    /**
     * Removes all cameras from this layer.
     */
    clearCameras(): void;
    /**
     * @param {MeshInstance[]} drawCalls - Array of mesh instances.
     * @param {Vec3} camPos - Camera position.
     * @param {Vec3} camFwd - Camera forward vector.
     * @private
     */
    private _calculateSortDistances;
    /**
     * Get access to culled mesh instances for the provided camera.
     *
     * @param {Camera} camera - The camera.
     * @returns {CulledInstances} The culled mesh instances.
     * @ignore
     */
    getCulledInstances(camera: Camera): CulledInstances;
    /**
     * @param {Camera} camera - The camera to sort the visible mesh instances for.
     * @param {boolean} transparent - True if transparent sorting should be used.
     * @ignore
     */
    sortVisible(camera: Camera, transparent: boolean): void;
}
export class CulledInstances {
    /**
     * Visible opaque mesh instances.
     *
     * @type {MeshInstance[]}
     */
    opaque: MeshInstance[];
    /**
     * Visible transparent mesh instances.
     *
     * @type {MeshInstance[]}
     */
    transparent: MeshInstance[];
}
import type { MeshInstance } from './mesh-instance.js';
import type { CameraComponent } from '../framework/components/camera/component.js';
import type { Camera } from './camera.js';
import type { GSplatPlacement } from './gsplat-unified/gsplat-placement.js';
import type { Light } from './light.js';
import type { LightComponent } from '../framework/components/light/component.js';
