/**
 * The RotateGizmo provides interactive 3D manipulation handles for rotating/reorienting
 * {@link Entity}s in a {@link Scene}. It creates a visual widget with a draggable ring for each
 * axis of rotation, plus a fourth ring for rotation in the camera's view plane, allowing precise
 * control over object orientation through direct manipulation. The gizmo's visual appearance can
 * be customized away from the defaults as required.
 *
 * Note that the gizmo can be driven by both mouse+keyboard and touch input.
 *
 * ```javascript
 * // Create a layer for rendering all gizmos
 * const gizmoLayer = pc.Gizmo.createLayer(app);
 *
 * // Create a rotate gizmo
 * const gizmo = new pc.RotateGizmo(cameraComponent, gizmoLayer);
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
 * - [Rotate Gizmo](https://playcanvas.github.io/#/gizmos/transform-rotate)
 * - [Editor](https://playcanvas.github.io/#/misc/editor)
 *
 * @category Gizmo
 */
export class RotateGizmo extends TransformGizmo {
    /**
     * Creates a new RotateGizmo object. Use {@link Gizmo.createLayer} to create the layer
     * required to display the gizmo.
     *
     * @param {CameraComponent} camera - The camera component.
     * @param {Layer} layer - The layer responsible for rendering the gizmo.
     * @example
     * const gizmo = new pc.RotateGizmo(camera, layer);
     */
    constructor(camera: CameraComponent, layer: Layer);
    _shapes: {
        z: ArcShape;
        x: ArcShape;
        y: ArcShape;
        f: ArcShape;
        xyz: SphereShape;
    };
    /**
     * Internal selection starting angle in world space.
     *
     * @type {number}
     * @private
     */
    private _selectionStartAngle;
    /**
     * Internal mapping from each attached node to their starting rotation in local space.
     *
     * @type {Map<GraphNode, Quat>}
     * @private
     */
    private _nodeLocalRotations;
    /**
     * Internal mapping from each attached node to their starting rotation in world space.
     *
     * @type {Map<GraphNode, Quat>}
     * @private
     */
    private _nodeRotations;
    /**
     * Internal mapping from each attached node to their offset position from the gizmo.
     *
     * @type {Map<GraphNode, Vec3>}
     * @private
     */
    private _nodeOffsets;
    /**
     * Internal vector for storing the mouse position in screen space.
     *
     * @type {Vec2}
     * @private
     */
    private _screenPos;
    /**
     * Internal vector for storing the mouse start position in screen space.
     *
     * @type {Vec2}
     * @private
     */
    private _screenStartPos;
    /**
     * Internal vector for the start point of the guide line angle.
     *
     * @type {Vec3}
     * @private
     */
    private _guideAngleStart;
    /**
     * Internal vector for the end point of the guide line angle.
     *
     * @type {Vec3}
     * @private
     */
    private _guideAngleEnd;
    /**
     * Internal mesh lines for guide angles.
     *
     * @type {[MeshLine, MeshLine]}
     * @private
     */
    private _guideAngleLines;
    /**
     * Internal copy of facing direction to avoid unnecessary updates.
     *
     * @type {Vec3}
     * @private
     */
    private _facingDir;
    /**
     * The rotation mode of the gizmo. This can be either:
     *
     * - 'absolute': The rotation is calculated based on the mouse displacement relative to the
     * initial click point.
     * - 'orbit': The rotation is calculated based on the gizmos position around the center of
     * rotation.
     *
     * @type {'absolute' | 'orbit'}
     */
    rotationMode: "absolute" | "orbit";
    /**
     * Sets the XYZ tube radius.
     *
     * @type {number}
     */
    set xyzTubeRadius(value: number);
    /**
     * Gets the XYZ tube radius.
     *
     * @type {number}
     */
    get xyzTubeRadius(): number;
    /**
     * Sets the XYZ ring radius.
     *
     * @type {number}
     */
    set xyzRingRadius(value: number);
    /**
     * Gets the XYZ ring radius.
     *
     * @type {number}
     */
    get xyzRingRadius(): number;
    /**
     * Sets the face tube radius.
     *
     * @type {number}
     */
    set faceTubeRadius(value: number);
    /**
     * Gets the face tube radius.
     *
     * @type {number}
     */
    get faceTubeRadius(): number;
    /**
     * Sets the face ring radius.
     *
     * @type {number}
     */
    set faceRingRadius(value: number);
    /**
     * Gets the face ring radius.
     *
     * @type {number}
     */
    get faceRingRadius(): number;
    /**
     * Sets the center radius.
     *
     * @type {number}
     */
    set centerRadius(value: number);
    /**
     * Gets the center radius.
     *
     * @type {number}
     */
    get centerRadius(): number;
    /**
     * Sets the ring tolerance.
     *
     * @type {number}
     */
    set ringTolerance(value: number);
    /**
     * Gets the ring tolerance.
     *
     * @type {number}
     */
    get ringTolerance(): number;
    /**
     * Sets the angle guide line thickness.
     *
     * @type {number}
     */
    set angleGuideThickness(value: number);
    /**
     * Gets the angle guide line thickness.
     *
     * @type {number}
     */
    get angleGuideThickness(): number;
    /**
     * @type {boolean}
     * @deprecated Use {@link RotationGizmo#rotationMode} instead.
     * @ignore
     */
    set orbitRotation(value: boolean);
    /**
     * @type {boolean}
     * @deprecated Use {@link RotationGizmo#rotationMode} instead.
     * @ignore
     */
    get orbitRotation(): boolean;
    /**
     * @param {string} prop - The property.
     * @param {any} value - The value.
     * @private
     */
    private _setDiskProp;
    /**
     * @private
     */
    private _storeGuidePoints;
    /**
     * @param {number} angleDelta - The angle delta.
     * @private
     */
    private _updateGuidePoints;
    /**
     * @param {boolean} state - The state.
     * @private
     */
    private _angleGuide;
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
    private _storeNodeRotations;
    /**
     * @param {GizmoAxis} axis - The axis.
     * @param {Vec3} angleAxis - The angle axis.
     * @param {number} angleDelta - The angle delta.
     * @private
     */
    private _setNodeRotations;
    /**
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     * @returns {Vec3} The point (space is {@link TransformGizmo#coordSpace}).
     * @protected
     */
    protected _screenToPoint(x: number, y: number): Vec3;
    /**
     * @param {Vec3} point - The point.
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     * @returns {number} The angle.
     * @protected
     */
    protected _calculateArcAngle(point: Vec3, x: number, y: number): number;
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
import { ArcShape } from './shape/arc-shape.js';
import { SphereShape } from './shape/sphere-shape.js';
import { Vec3 } from '../../core/math/vec3.js';
import { Quat } from '../../core/math/quat.js';
import type { GizmoAxis } from './constants.js';
import type { CameraComponent } from '../../framework/components/camera/component.js';
import type { Layer } from '../../scene/layer.js';
