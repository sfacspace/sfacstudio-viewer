/**
 * Class responsible for managing {@link GSplatManager} instances for Cameras and their Layers.
 *
 * @ignore
 */
export class GSplatDirector {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {Renderer} renderer - The renderer.
     * @param {Scene} scene - The scene.
     * @param {EventHandler} eventHandler - Event handler for firing events.
     */
    constructor(device: GraphicsDevice, renderer: Renderer, scene: Scene, eventHandler: EventHandler);
    /**
     * @type {GraphicsDevice}
     */
    device: GraphicsDevice;
    /**
     * Per camera data.
     *
     * @type {Map<Camera, GSplatCameraData>}
     */
    camerasMap: Map<Camera, GSplatCameraData>;
    /**
     * @type {Scene}
     */
    scene: Scene;
    /**
     * @type {EventHandler}
     */
    eventHandler: EventHandler;
    renderer: Renderer;
    destroy(): void;
    getCameraData(camera: any): GSplatCameraData;
    /**
     * Updates the director for the given layer composition cameras and layers.
     *
     * @param {LayerComposition} comp - The layer composition.
     */
    update(comp: LayerComposition): void;
}
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import type { Camera } from '../camera.js';
/**
 * Per camera data the director keeps track of.
 *
 * @ignore
 */
declare class GSplatCameraData {
    /**
     * @type {Map<Layer, GSplatLayerData>}
     */
    layersMap: Map<Layer, GSplatLayerData>;
    destroy(): void;
    removeLayerData(layer: any): void;
    getLayerData(device: any, director: any, layer: any, camera: any): GSplatLayerData;
}
import type { Scene } from '../scene.js';
import type { EventHandler } from '../../core/event-handler.js';
import type { Renderer } from '../renderer/renderer.js';
import type { LayerComposition } from '../composition/layer-composition.js';
import type { Layer } from '../layer.js';
/**
 * Per layer data the director keeps track of.
 *
 * @ignore
 */
declare class GSplatLayerData {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {GSplatDirector} director - The director.
     * @param {Layer} layer - The layer.
     * @param {Camera} camera - The camera.
     */
    constructor(device: GraphicsDevice, director: GSplatDirector, layer: Layer, camera: Camera);
    /**
     * @type {GSplatManager|null}
     */
    gsplatManager: GSplatManager | null;
    /**
     * @type {GSplatManager|null}
     */
    gsplatManagerShadow: GSplatManager | null;
    /**
     * Creates a new GSplatManager, sets its render mode, and fires the material:created event.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {GSplatDirector} director - The director.
     * @param {Layer} layer - The layer.
     * @param {GraphNode} cameraNode - The camera node.
     * @param {Camera} camera - The camera.
     * @param {number} renderMode - The render mode flags.
     * @returns {GSplatManager} The created manager.
     * @private
     */
    private createManager;
    /**
     * Updates the manager configuration based on current layer placements.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {GSplatDirector} director - The director.
     * @param {Layer} layer - The layer.
     * @param {Camera} camera - The camera.
     */
    updateConfiguration(device: GraphicsDevice, director: GSplatDirector, layer: Layer, camera: Camera): void;
    destroy(): void;
}
import { GSplatManager } from './gsplat-manager.js';
export {};
