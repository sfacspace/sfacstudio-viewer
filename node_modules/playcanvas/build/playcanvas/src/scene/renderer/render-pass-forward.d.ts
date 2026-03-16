/**
 * @import { CameraComponent } from '../../framework/components/camera/component.js'
 * @import { LayerComposition } from '../composition/layer-composition.js'
 * @import { Layer } from '../layer.js'
 * @import { Renderer } from './renderer.js'
 * @import { Scene } from '../scene.js'
 */
/**
 * A render pass used render a set of layers using a camera.
 *
 * @ignore
 */
export class RenderPassForward extends RenderPass {
    constructor(device: any, layerComposition: any, scene: any, renderer: any);
    /**
     * @type {LayerComposition}
     */
    layerComposition: LayerComposition;
    /**
     * @type {Scene}
     */
    scene: Scene;
    /**
     * @type {Renderer}
     */
    renderer: Renderer;
    /**
     * @type {RenderAction[]}
     */
    renderActions: RenderAction[];
    /**
     * The gamma correction setting for the render pass. In not set, setting from the camera is used.
     *
     * @type {number|undefined}
     */
    gammaCorrection: number | undefined;
    /**
     * The tone mapping setting for the render pass. In not set, setting from the camera is used.
     *
     * @type {number|undefined}
     */
    toneMapping: number | undefined;
    /**
     * If true, do not clear the depth buffer before rendering, as it was already primed by a depth
     * pre-pass.
     *
     * @type {boolean}
     */
    noDepthClear: boolean;
    get rendersAnything(): boolean;
    addRenderAction(renderAction: any): void;
    /**
     * Adds a layer to be rendered by this render pass.
     *
     * @param {CameraComponent} cameraComponent - The camera component that is used to render the
     * layers.
     * @param {Layer} layer - The layer to be added.
     * @param {boolean} transparent - True if the layer is transparent.
     * @param {boolean} autoClears - True if the render target should be cleared based on the camera
     * and layer clear flags. Defaults to true.
     */
    addLayer(cameraComponent: CameraComponent, layer: Layer, transparent: boolean, autoClears?: boolean): void;
    /**
     * Adds layers to be rendered by this render pass, starting from the given index of the layer
     * in the layer composition, till the end of the layer list, or till the last layer with the
     * given id and transparency is reached (inclusive). Note that only layers that are rendered by
     * the specified camera are added.
     *
     * @param {LayerComposition} composition - The layer composition containing the layers to be
     * added, typically the scene layer composition.
     * @param {CameraComponent} cameraComponent - The camera component that is used to render the
     * layers.
     * @param {number} startIndex - The index of the first layer to be considered for adding.
     * @param {boolean} firstLayerClears - True if the first layer added should clear the render
     * target.
     * @param {number} [lastLayerId] - The id of the last layer to be added. If not specified, all
     * layers till the end of the layer list are added.
     * @param {boolean} [lastLayerIsTransparent] - True if the last layer to be added is transparent.
     * Defaults to true.
     * @returns {number} Returns the index of last layer added.
     */
    addLayers(composition: LayerComposition, cameraComponent: CameraComponent, startIndex: number, firstLayerClears: boolean, lastLayerId?: number, lastLayerIsTransparent?: boolean): number;
    updateDirectionalShadows(): void;
    updateClears(): void;
    /**
     * @param {RenderAction} renderAction - The render action.
     * @param {boolean} firstRenderAction - True if this is the first render action in the render pass.
     */
    renderRenderAction(renderAction: RenderAction, firstRenderAction: boolean): void;
    log(device: any, index: any): void;
}
import { RenderPass } from '../../platform/graphics/render-pass.js';
import type { LayerComposition } from '../composition/layer-composition.js';
import type { Scene } from '../scene.js';
import type { Renderer } from './renderer.js';
import { RenderAction } from '../composition/render-action.js';
import type { CameraComponent } from '../../framework/components/camera/component.js';
import type { Layer } from '../layer.js';
