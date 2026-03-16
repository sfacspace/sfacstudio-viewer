/**
 * The ScaleGizmo provides interactive 3D manipulation handles for scaling/resizing
 * {@link Entity}s in a {@link Scene}. It creates a visual widget with box-tipped lines along the
 * X, Y and Z axes, planes at their intersections, and a center box, allowing precise control over
 * object scaling through direct manipulation. The gizmo's visual appearance can be customized
 * away from the defaults as required.
 *
 * Note that the gizmo can be driven by both mouse+keyboard and touch input.
 *
 * ```javascript
 * // Create a layer for rendering all gizmos
 * const gizmoLayer = pc.Gizmo.createLayer(app);
 *
 * // Create a scale gizmo
 * const gizmo = new pc.ScaleGizmo(cameraComponent, gizmoLayer);
 *
 * // Create an entity to attach the gizmo to
 * const entity = new pc.Entity();
 * entity.addComponent('render', {
 *     type: 'box'
 * });
 * app.root.addChild(entity);
 *
 * // Attach the gizmo to the entity
 * gizmo.attach([entity]);
 * ```
 *
 * Relevant Engine API examples:
 *
 * - [Scale Gizmo](https://playcanvas.github.io/#/gizmos/transform-scale)
 * - [Editor](https://playcanvas.github.io/#/misc/editor)
 *
 * @category Gizmo
 */
export class ScaleGizmo extends TransformGizmo {
    /**
     * Creates a new ScaleGizmo object. Use {@link Gizmo.createLayer} to create the layer
     * required to display the gizmo.
     *
     * @param {CameraComponent} camera - The camera component.
     * @param {Layer} layer - The layer responsible for rendering the gizmo.
     * @example
     * const gizmo = new pc.ScaleGizmo(camera, layer);
     */
    constructor(camera: CameraComponent, layer: Layer);
    _shapes: {
        xyz: BoxShape;
        yz: PlaneShape;
        xz: PlaneShape;
        xy: PlaneShape;
        x: BoxLineShape;
        y: BoxLineShape;
        z: BoxLineShape;
    };
    /**
     * Internal mapping from each attached node to their starting scale.
     *
     * @type {Map<GraphNode, Vec3>}
     * @private
     */
    private _nodeScales;
    /**
     * Internal state if transform should use uniform scaling.
     *
     * @type {boolean}
     * @protected
     */
    protected _uniform: boolean;
    /**
     * Flips the planes to face the camera.
     *
     * @type {boolean}
     */
    flipPlanes: boolean;
    /**
     * The lower bound for scaling.
     *
     * @type {Vec3}
     */
    lowerBoundScale: Vec3;
    /**
     * Sets the uniform scaling state for planes.
     *
     * @type {boolean}
     */
    set uniform(value: boolean);
    /**
     * Gets the uniform scaling state for planes.
     *
     * @type {boolean}
     */
    get uniform(): boolean;
    /**
     * Sets the axis gap.
     *
     * @type {number}
     */
    set axisGap(value: number);
    /**
     * Gets the axis gap.
     *
     * @type {number}
     */
    get axisGap(): number;
    /**
     * Sets the axis line thickness.
     *
     * @type {number}
     */
    set axisLineThickness(value: number);
    /**
     * Gets the axis line thickness.
     *
     * @type {number}
     */
    get axisLineThickness(): number;
    /**
     * Sets the axis line length.
     *
     * @type {number}
     */
    set axisLineLength(value: number);
    /**
     * Gets the axis line length.
     *
     * @type {number}
     */
    get axisLineLength(): number;
    /**
     * Sets the axis line tolerance.
     *
     * @type {number}
     */
    set axisLineTolerance(value: number);
    /**
     * Gets the axis line tolerance.
     *
     * @type {number}
     */
    get axisLineTolerance(): number;
    /**
     * Sets the axis box size.
     *
     * @type {number}
     */
    set axisBoxSize(value: number);
    /**
     * Gets the axis box size.
     *
     * @type {number}
     */
    get axisBoxSize(): number;
    /**
     * Sets the plane size.
     *
     * @type {number}
     */
    set axisPlaneSize(value: number);
    /**
     * Gets the plane size.
     *
     * @type {number}
     */
    get axisPlaneSize(): number;
    /**
     * Sets the plane gap.
     *
     * @type {number}
     */
    set axisPlaneGap(value: number);
    /**
     * Gets the plane gap.
     *
     * @type {number}
     */
    get axisPlaneGap(): number;
    /**
     * Sets the axis center size.
     *
     * @type {number}
     */
    set axisCenterSize(value: number);
    /**
     * Gets the axis center size.
     *
     * @type {number}
     */
    get axisCenterSize(): number;
    /**
     * @type {boolean}
     * @deprecated Use {@link ScaleGizmo#flipPlanes} instead.
     * @ignore
     */
    set flipShapes(value: boolean);
    /**
     * @type {boolean}
     * @deprecated Use {@link ScaleGizmo#flipPlanes} instead.
     * @ignore
     */
    get flipShapes(): boolean;
    /**
     * @param {string} prop - The property name.
     * @param {any} value - The property value.
     * @private
     */
    private _setArrowProp;
    /**
     * @param {string} prop - The property name.
     * @param {any} value - The property value.
     * @private
     */
    private _setPlaneProp;
    /**
     * @private
     */
    private _shapesLookAtCamera;
    /**
     * @param {boolean} state - The state.
     * @private
     */
    private _drag;
    /**
     * @private
     */
    private _storeNodeScales;
    /**
     * @param {Vec3} scaleDelta - The point delta.
     * @private
     */
    private _setNodeScales;
    /**
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     * @returns {Vec3} The point (space is {@link TransformGizmo#coordSpace}).
     * @protected
     */
    protected _screenToPoint(x: number, y: number): Vec3;
}
import { TransformGizmo } from './transform-gizmo.js';
import { BoxShape } from './shape/box-shape.js';
import { PlaneShape } from './shape/plane-shape.js';
import { BoxLineShape } from './shape/boxline-shape.js';
import { Vec3 } from '../../core/math/vec3.js';
import type { CameraComponent } from '../../framework/components/camera/component.js';
import type { Layer } from '../../scene/layer.js';
