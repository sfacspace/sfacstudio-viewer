/**
 * The TranslateGizmo provides interactive 3D manipulation handles for translating/moving
 * {@link Entity}s in a {@link Scene}. It creates a visual widget with arrows along the X, Y
 * and Z axes, planes at their intersections, and a center sphere, allowing precise control over
 * object positioning through direct manipulation. The gizmo's visual appearance can be customized
 * away from the defaults as required.
 *
 * Note that the gizmo can be driven by both mouse+keyboard and touch input.
 *
 * ```javascript
 * // Create a layer for rendering all gizmos
 * const gizmoLayer = pc.Gizmo.createLayer(app);
 *
 * // Create a translate gizmo
 * const gizmo = new pc.TranslateGizmo(cameraComponent, gizmoLayer);
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
 * - [Translate Gizmo](https://playcanvas.github.io/#/gizmos/transform-translate)
 * - [Editor](https://playcanvas.github.io/#/misc/editor)
 *
 * @category Gizmo
 */
export class TranslateGizmo extends TransformGizmo {
    /**
     * Creates a new TranslateGizmo object. Use {@link Gizmo.createLayer} to create the layer
     * required to display the gizmo.
     *
     * @param {CameraComponent} camera - The camera component.
     * @param {Layer} layer - The layer responsible for rendering the gizmo.
     * @example
     * const gizmo = new pc.TranslateGizmo(camera, layer);
     */
    constructor(camera: CameraComponent, layer: Layer);
    _shapes: {
        xyz: SphereShape;
        yz: PlaneShape;
        xz: PlaneShape;
        xy: PlaneShape;
        x: ArrowShape;
        y: ArrowShape;
        z: ArrowShape;
    };
    /**
     * Internal mapping from each attached node to their starting position in local space.
     *
     * @type {Map<GraphNode, Vec3>}
     * @private
     */
    private _nodeLocalPositions;
    /**
     * Internal mapping from each attached node to their starting position in world space.
     *
     * @type {Map<GraphNode, Vec3>}
     * @private
     */
    private _nodePositions;
    /**
     * Flips the planes to face the camera.
     *
     * @type {boolean}
     */
    flipPlanes: boolean;
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
     * Sets the arrow thickness.
     *
     * @type {number}
     */
    set axisArrowThickness(value: number);
    /**
     * Gets the arrow thickness.
     *
     * @type {number}
     */
    get axisArrowThickness(): number;
    /**
     * Sets the arrow length.
     *
     * @type {number}
     */
    set axisArrowLength(value: number);
    /**
     * Gets the arrow length.
     *
     * @type {number}
     */
    get axisArrowLength(): number;
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
     * @deprecated Use {@link TranslateGizmo#flipPlanes} instead.
     * @ignore
     */
    set flipShapes(value: boolean);
    /**
     * @type {boolean}
     * @deprecated Use {@link TranslateGizmo#flipPlanes} instead.
     * @ignore
     */
    get flipShapes(): boolean;
    /**
     * @param {string} prop - The property to set.
     * @param {any} value - The value to set.
     * @private
     */
    private _setArrowProp;
    /**
     * @param {string} prop - The property to set.
     * @param {any} value - The value to set.
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
    private _storeNodePositions;
    /**
     * @param {Vec3} translateDelta - The delta to apply to the node positions.
     * @private
     */
    private _setNodePositions;
    /**
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     * @returns {Vec3} The point (space is {@link TransformGizmo#coordSpace}).
     * @protected
     */
    protected _screenToPoint(x: number, y: number): Vec3;
    /**
     * @param {Vec3} pos - The position.
     * @param {Quat} rot - The rotation.
     * @param {GizmoAxis} activeAxis - The active axis.
     * @param {boolean} activeIsPlane - Whether the active axis is a plane.
     * @override
     */
    override _drawGuideLines(pos: Vec3, rot: Quat, activeAxis: GizmoAxis, activeIsPlane: boolean): void;
}
import { TransformGizmo } from './transform-gizmo.js';
import { SphereShape } from './shape/sphere-shape.js';
import { PlaneShape } from './shape/plane-shape.js';
import { ArrowShape } from './shape/arrow-shape.js';
import { Vec3 } from '../../core/math/vec3.js';
import { Quat } from '../../core/math/quat.js';
import type { GizmoAxis } from './constants.js';
import type { CameraComponent } from '../../framework/components/camera/component.js';
import type { Layer } from '../../scene/layer.js';
