/**
 * @import { CameraComponent } from '../../framework/components/camera/component.js'
 * @import { Layer } from '../layer.js'
 * @import { Camera } from '../camera.js'
 */
/**
 * Layer Composition is a collection of {@link Layer} that is fed to {@link Scene#layers} to define
 * rendering order.
 *
 * @category Graphics
 */
export class LayerComposition extends EventHandler {
    /**
     * Create a new layer composition.
     *
     * @param {string} [name] - Optional non-unique name of the layer composition. Defaults to
     * "Untitled" if not specified.
     */
    constructor(name?: string);
    /**
     * A read-only array of {@link Layer} sorted in the order they will be rendered.
     *
     * @type {Layer[]}
     */
    layerList: Layer[];
    /**
     * A mapping of {@link Layer#id} to {@link Layer}.
     *
     * @type {Map<number, Layer>}
     * @ignore
     */
    layerIdMap: Map<number, Layer>;
    /**
     * A mapping of {@link Layer#name} to {@link Layer}.
     *
     * @type {Map<string, Layer>}
     * @ignore
     */
    layerNameMap: Map<string, Layer>;
    /**
     * A mapping of {@link Layer} to its opaque index in {@link LayerComposition#layerList}.
     *
     * @type {Map<Layer, number>}
     * @ignore
     */
    layerOpaqueIndexMap: Map<Layer, number>;
    /**
     * A mapping of {@link Layer} to its transparent index in {@link LayerComposition#layerList}.
     *
     * @type {Map<Layer, number>}
     * @ignore
     */
    layerTransparentIndexMap: Map<Layer, number>;
    /**
     * A read-only array of boolean values, matching {@link LayerComposition#layerList}. True means only
     * semi-transparent objects are rendered, and false means opaque.
     *
     * @type {boolean[]}
     * @ignore
     */
    subLayerList: boolean[];
    /**
     * A read-only array of boolean values, matching {@link LayerComposition#layerList}. True means the
     * layer is rendered, false means it's skipped.
     *
     * @type {boolean[]}
     */
    subLayerEnabled: boolean[];
    /**
     * An array of {@link CameraComponent}s.
     *
     * @type {CameraComponent[]}
     * @ignore
     */
    cameras: CameraComponent[];
    /**
     * A set of {@link Camera}s.
     *
     * @type {Set<Camera>}
     * @ignore
     */
    camerasSet: Set<Camera>;
    /**
     * The actual rendering sequence, generated based on layers and cameras
     *
     * @type {RenderAction[]}
     * @ignore
     */
    _renderActions: RenderAction[];
    /**
     * True if the composition needs to be updated before rendering.
     *
     * @ignore
     */
    _dirty: boolean;
    name: string;
    _opaqueOrder: {};
    _transparentOrder: {};
    destroy(): void;
    destroyRenderActions(): void;
    markDirty(): void;
    _update(): void;
    getNextRenderAction(renderActionIndex: any): RenderAction;
    addDummyRenderAction(renderActionIndex: any, camera: any): void;
    addRenderAction(renderActionIndex: any, layer: any, isTransparent: any, camera: any, cameraFirstRenderAction: any, postProcessMarked: any): RenderAction;
    propagateRenderTarget(startIndex: any, fromCamera: any): void;
    _logRenderActions(): void;
    _isLayerAdded(layer: any): boolean;
    _isSublayerAdded(layer: any, transparent: any): boolean;
    /**
     * Adds a layer (both opaque and semi-transparent parts) to the end of the {@link LayerComposition#layerList}.
     *
     * @param {Layer} layer - A {@link Layer} to add.
     */
    push(layer: Layer): void;
    /**
     * Inserts a layer (both opaque and semi-transparent parts) at the chosen index in the
     * {@link LayerComposition#layerList}.
     *
     * @param {Layer} layer - A {@link Layer} to add.
     * @param {number} index - Insertion position.
     */
    insert(layer: Layer, index: number): void;
    /**
     * Removes a layer (both opaque and semi-transparent parts) from {@link LayerComposition#layerList}.
     *
     * @param {Layer} layer - A {@link Layer} to remove.
     */
    remove(layer: Layer): void;
    /**
     * Adds part of the layer with opaque (non semi-transparent) objects to the end of the
     * {@link LayerComposition#layerList}.
     *
     * @param {Layer} layer - A {@link Layer} to add.
     */
    pushOpaque(layer: Layer): void;
    /**
     * Inserts an opaque part of the layer (non semi-transparent mesh instances) at the chosen
     * index in the {@link LayerComposition#layerList}.
     *
     * @param {Layer} layer - A {@link Layer} to add.
     * @param {number} index - Insertion position.
     */
    insertOpaque(layer: Layer, index: number): void;
    /**
     * Removes an opaque part of the layer (non semi-transparent mesh instances) from
     * {@link LayerComposition#layerList}.
     *
     * @param {Layer} layer - A {@link Layer} to remove.
     */
    removeOpaque(layer: Layer): void;
    /**
     * Adds part of the layer with semi-transparent objects to the end of the {@link LayerComposition#layerList}.
     *
     * @param {Layer} layer - A {@link Layer} to add.
     */
    pushTransparent(layer: Layer): void;
    /**
     * Inserts a semi-transparent part of the layer at the chosen index in the {@link LayerComposition#layerList}.
     *
     * @param {Layer} layer - A {@link Layer} to add.
     * @param {number} index - Insertion position.
     */
    insertTransparent(layer: Layer, index: number): void;
    /**
     * Removes a transparent part of the layer from {@link LayerComposition#layerList}.
     *
     * @param {Layer} layer - A {@link Layer} to remove.
     */
    removeTransparent(layer: Layer): void;
    /**
     * Gets index of the opaque part of the supplied layer in the {@link LayerComposition#layerList}.
     *
     * @param {Layer} layer - A {@link Layer} to find index of.
     * @returns {number} The index of the opaque part of the specified layer, or -1 if it is not
     * part of the composition.
     */
    getOpaqueIndex(layer: Layer): number;
    /**
     * Gets index of the semi-transparent part of the supplied layer in the {@link LayerComposition#layerList}.
     *
     * @param {Layer} layer - A {@link Layer} to find index of.
     * @returns {number} The index of the semi-transparent part of the specified layer, or -1 if it
     * is not part of the composition.
     */
    getTransparentIndex(layer: Layer): number;
    isEnabled(layer: any, transparent: any): boolean;
    /**
     * Update maps of layer IDs and names to match the layer list.
     *
     * @private
     */
    private _updateLayerMaps;
    /**
     * Finds a layer inside this composition by its ID. Null is returned, if nothing is found.
     *
     * @param {number} id - An ID of the layer to find.
     * @returns {Layer|null} The layer corresponding to the specified ID. Returns null if layer is
     * not found.
     */
    getLayerById(id: number): Layer | null;
    /**
     * Finds a layer inside this composition by its name. Null is returned, if nothing is found.
     *
     * @param {string} name - The name of the layer to find.
     * @returns {Layer|null} The layer corresponding to the specified name. Returns null if layer
     * is not found.
     */
    getLayerByName(name: string): Layer | null;
    _updateOpaqueOrder(startIndex: any, endIndex: any): void;
    _updateTransparentOrder(startIndex: any, endIndex: any): void;
    _sortLayersDescending(layersA: any, layersB: any, order: any): number;
    /**
     * Used to determine which array of layers has any transparent sublayer that is on top of all
     * the transparent sublayers in the other array.
     *
     * @param {number[]} layersA - IDs of layers.
     * @param {number[]} layersB - IDs of layers.
     * @returns {number} Returns a negative number if any of the transparent sublayers in layersA
     * is on top of all the transparent sublayers in layersB, or a positive number if any of the
     * transparent sublayers in layersB is on top of all the transparent sublayers in layersA, or 0
     * otherwise.
     * @private
     */
    private sortTransparentLayers;
    /**
     * Used to determine which array of layers has any opaque sublayer that is on top of all the
     * opaque sublayers in the other array.
     *
     * @param {number[]} layersA - IDs of layers.
     * @param {number[]} layersB - IDs of layers.
     * @returns {number} Returns a negative number if any of the opaque sublayers in layersA is on
     * top of all the opaque sublayers in layersB, or a positive number if any of the opaque
     * sublayers in layersB is on top of all the opaque sublayers in layersA, or 0 otherwise.
     * @private
     */
    private sortOpaqueLayers;
}
import { EventHandler } from '../../core/event-handler.js';
import type { Layer } from '../layer.js';
import type { CameraComponent } from '../../framework/components/camera/component.js';
import type { Camera } from '../camera.js';
import { RenderAction } from './render-action.js';
