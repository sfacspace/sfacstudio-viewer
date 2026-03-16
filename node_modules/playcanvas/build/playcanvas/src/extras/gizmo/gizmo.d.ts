/**
 * The base class for all gizmos.
 *
 * @category Gizmo
 */
export class Gizmo extends EventHandler {
    /**
     * Fired when the pointer is down on the gizmo.
     *
     * @event
     * @example
     * const gizmo = new pc.Gizmo(camera, layer);
     * gizmo.on('pointer:down', (x, y, meshInstance) => {
     *     console.log(`Pointer was down on ${meshInstance.node.name} at ${x}, ${y}`);
     * });
     */
    static EVENT_POINTERDOWN: string;
    /**
     * Fired when the pointer is moving over the gizmo.
     *
     * @event
     * @example
     * const gizmo = new pc.Gizmo(camera, layer);
     * gizmo.on('pointer:move', (x, y, meshInstance) => {
     *     console.log(`Pointer was moving on ${meshInstance.node.name} at ${x}, ${y}`);
     * });
     */
    static EVENT_POINTERMOVE: string;
    /**
     * Fired when the pointer is up off the gizmo.
     *
     * @event
     * @example
     * const gizmo = new pc.Gizmo(camera, layer);
     * gizmo.on('pointer:up', (x, y, meshInstance) => {
     *     console.log(`Pointer was up on ${meshInstance.node.name} at ${x}, ${y}`);
     * })
     */
    static EVENT_POINTERUP: string;
    /**
     * Fired when the gizmo's position is updated.
     *
     * @event
     * @example
     * const gizmo = new pc.Gizmo(camera, layer);
     * gizmo.on('position:update', (position) => {
     *     console.log(`The gizmo's position was updated to ${position}`);
     * })
     */
    static EVENT_POSITIONUPDATE: string;
    /**
     * Fired when the gizmo's rotation is updated.
     *
     * @event
     * @example
     * const gizmo = new pc.Gizmo(camera, layer);
     * gizmo.on('rotation:update', (rotation) => {
     *     console.log(`The gizmo's rotation was updated to ${rotation}`);
     * });
     */
    static EVENT_ROTATIONUPDATE: string;
    /**
     * Fired when the gizmo's scale is updated.
     *
     * @event
     * @example
     * const gizmo = new pc.Gizmo(camera, layer);
     * gizmo.on('scale:update', (scale) => {
     *     console.log(`The gizmo's scale was updated to ${scale}`);
     * });
     */
    static EVENT_SCALEUPDATE: string;
    /**
     * Fired when graph nodes are attached.
     *
     * @event
     * @example
     * const gizmo = new pc.Gizmo(camera, layer);
     * gizmo.on('nodes:attach', () => {
     *     console.log('Graph nodes attached');
     * });
     */
    static EVENT_NODESATTACH: string;
    /**
     * Fired when graph nodes are detached.
     *
     * @event
     * @example
     * const gizmo = new pc.Gizmo(camera, layer);
     * gizmo.on('nodes:detach', () => {
     *     console.log('Graph nodes detached');
     * });
     */
    static EVENT_NODESDETACH: string;
    /**
     * Fired when when the gizmo render has updated.
     *
     * @event
     * @example
     * const gizmo = new pc.TransformGizmo(camera, layer);
     * gizmo.on('render:update', () => {
     *     console.log('Gizmo render has been updated');
     * });
     */
    static EVENT_RENDERUPDATE: string;
    /**
     * Creates a new gizmo layer and adds it to the scene.
     *
     * @param {AppBase} app - The app.
     * @param {string} [layerName] - The layer name. Defaults to 'Gizmo'.
     * @param {number} [layerIndex] - The layer index. Defaults to the end of the layer list.
     * @returns {Layer} The new layer.
     */
    static createLayer(app: AppBase, layerName?: string, layerIndex?: number): Layer;
    /**
     * Creates a new Gizmo object.
     *
     * @param {CameraComponent} camera - The camera component.
     * @param {Layer} layer - The render layer. This can be provided by the user or will be created
     * and added to the scene and camera if not provided. Successive gizmos will share the same layer
     * and will be removed from the camera and scene when the last gizmo is destroyed.
     * @param {string} [name] - The name of the gizmo. Defaults to 'gizmo'.
     * @example
     * const gizmo = new pc.Gizmo(camera, layer);
     */
    constructor(camera: CameraComponent, layer: Layer, name?: string);
    /**
     * Internal version of the gizmo size. Defaults to 1.
     *
     * @type {number}
     * @private
     */
    private _size;
    /**
     * Internal version of the gizmo scale. Defaults to 1.
     *
     * @type {number}
     * @protected
     */
    protected _scale: number;
    /**
     * Internal version of coordinate space. Defaults to 'world'.
     *
     * @type {GizmoSpace}
     * @protected
     */
    protected _coordSpace: GizmoSpace;
    /**
     * Internal reference to the app containing the gizmo.
     *
     * @type {AppBase}
     * @protected
     */
    protected _app: AppBase;
    /**
     * Internal reference to the graphics device of the app.
     *
     * @type {GraphicsDevice}
     * @protected
     */
    protected _device: GraphicsDevice;
    /**
     * Internal list of app event handles for the gizmo.
     *
     * @type {EventHandle[]}
     * @protected
     */
    protected _handles: EventHandle[];
    /**
     * Internal array of mouse buttons that can interact with the gizmo.
     *
     * @type {[boolean, boolean, boolean]}
     * @protected
     */
    protected _mouseButtons: [boolean, boolean, boolean];
    /**
     * Internal reference to camera component to view the gizmo.
     *
     * @type {CameraComponent}
     * @protected
     */
    protected _camera: CameraComponent;
    /**
     * Internal reference to layer to render the gizmo..
     *
     * @type {Layer}
     * @protected
     */
    protected _layer: Layer;
    /**
     * Internal flag to track if a render update is required.
     *
     * @type {boolean}
     * @protected
     */
    protected _renderUpdate: boolean;
    /**
     * The graph nodes attached to the gizmo.
     *
     * @type {GraphNode[]}
     */
    nodes: GraphNode[];
    /**
     * The root gizmo entity.
     *
     * @type {Entity}
     */
    root: Entity;
    /**
     * The intersection shapes for the gizmo.
     *
     * @type {Shape[]}
     */
    intersectShapes: Shape[];
    /**
     * Flag to indicate whether to call `preventDefault` on pointer events.
     *
     * @type {boolean}
     */
    preventDefault: boolean;
    /**
     * @param {PointerEvent} e - The pointer event.
     * @private
     */
    private _onPointerDown;
    /**
     * @param {PointerEvent} e - The pointer event.
     * @private
     */
    private _onPointerMove;
    /**
     * @param {PointerEvent} e - The pointer event.
     * @private
     */
    private _onPointerUp;
    /**
     * Sets the gizmo enabled state.
     *
     * @type {boolean}
     */
    set enabled(state: boolean);
    /**
     * Gets the gizmo enabled state.
     *
     * @type {boolean}
     */
    get enabled(): boolean;
    /**
     * Array of mouse buttons that can interact with the gizmo. The button indices are defined as:
     *
     *  - 0: Left button
     *  - 1: Middle button
     *  - 2: Right button
     *
     * The full list of button indices can be found here:
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button}
     *
     * @type {[boolean, boolean, boolean]}
     */
    get mouseButtons(): [boolean, boolean, boolean];
    /**
     * Sets the gizmo render layer.
     *
     * @param {Layer} layer - The layer to render the gizmo.
     */
    set layer(layer: Layer);
    /**
     * Gets the gizmo render layer.
     *
     * @type {Layer}
     */
    get layer(): Layer;
    /**
     * Sets the camera component to view the gizmo.
     *
     * @type {CameraComponent} camera - The camera component.
     */
    set camera(camera: CameraComponent);
    /**
     * Gets the camera component to view the gizmo.
     *
     * @type {CameraComponent} The camera component.
     */
    get camera(): CameraComponent;
    /**
     * Sets the gizmo coordinate space. Defaults to 'world'
     *
     * @type {GizmoSpace}
     */
    set coordSpace(value: GizmoSpace);
    /**
     * Gets the gizmo coordinate space.
     *
     * @type {GizmoSpace}
     */
    get coordSpace(): GizmoSpace;
    /**
     * Sets the gizmo size. Defaults to 1.
     *
     * @type {number}
     */
    set size(value: number);
    /**
     * Gets the gizmo size.
     *
     * @type {number}
     */
    get size(): number;
    /**
     * @type {Vec3}
     * @protected
     */
    protected get facingDir(): Vec3;
    /**
     * @type {Vec3}
     * @protected
     */
    protected get cameraDir(): Vec3;
    /**
     * @protected
     */
    protected _updatePosition(): void;
    /**
     * @protected
     */
    protected _updateRotation(): void;
    /**
     * @protected
     */
    protected _updateScale(): void;
    /**
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     * @returns {MeshInstance[]} - The mesh instances.
     * @private
     */
    private _getSelection;
    /**
     * Attach an array of graph nodes to the gizmo.
     *
     * @param {GraphNode[] | GraphNode} [nodes] - The graph nodes. Defaults to [].
     * @example
     * const gizmo = new pc.Gizmo(camera, layer);
     * gizmo.attach([boxA, boxB]);
     */
    attach(nodes?: GraphNode[] | GraphNode): void;
    /**
     * Detaches all graph nodes from the gizmo.
     *
     * @example
     * const gizmo = new pc.Gizmo(camera, layer);
     * gizmo.attach([boxA, boxB]);
     * gizmo.detach();
     */
    detach(): void;
    /**
     * Pre-render method. This is called before the gizmo is rendered.
     *
     * @example
     * const gizmo = new pc.Gizmo(camera, layer);
     * gizmo.attach([boxA, boxB]);
     * gizmo.prerender();
     */
    prerender(): void;
    /**
     * Updates the gizmo position, rotation, and scale.
     *
     * @example
     * const gizmo = new pc.Gizmo(camera, layer);
     * gizmo.attach([boxA, boxB]);
     * gizmo.update();
     */
    update(): void;
    /**
     * Detaches all graph nodes and destroys the gizmo instance.
     *
     * @example
     * const gizmo = new pc.Gizmo(camera, layer);
     * gizmo.attach([boxA, boxB]);
     * gizmo.destroy();
     */
    destroy(): void;
}
import { EventHandler } from '../../core/event-handler.js';
import type { GizmoSpace } from './constants.js';
import type { AppBase } from '../../framework/app-base.js';
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import type { EventHandle } from '../../core/event-handle.js';
import type { CameraComponent } from '../../framework/components/camera/component.js';
import { Layer } from '../../scene/layer.js';
import type { GraphNode } from '../../scene/graph-node.js';
import { Entity } from '../../framework/entity.js';
import type { Shape } from './shape/shape.js';
import { Vec3 } from '../../core/math/vec3.js';
