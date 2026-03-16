export type GizmoTheme = {
    /**
     * - The axis colors.
     */
    shapeBase: { [K in "x" | "y" | "z" | "f" | "xyz"]: Color; };
    /**
     * - The hover colors.
     */
    shapeHover: { [K in "x" | "y" | "z" | "f" | "xyz"]: Color; };
    /**
     * - The guide line colors.
     */
    guideBase: { [K in "x" | "y" | "z"]: Color; };
    /**
     * - The guide occlusion value. Defaults to 0.8.
     */
    guideOcclusion: number;
    /**
     * - The disabled color.
     */
    disabled: Color;
};
/**
 * The base class for all transform gizmos.
 *
 * @category Gizmo
 */
export class TransformGizmo extends Gizmo {
    /**
     * Fired when when the transformation has started.
     *
     * @event
     * @example
     * const gizmo = new pc.TransformGizmo(camera, layer);
     * gizmo.on('transform:start', () => {
     *     console.log('Transformation started');
     * });
     */
    static EVENT_TRANSFORMSTART: string;
    /**
     * Fired during the transformation.
     *
     * @event
     * @example
     * const gizmo = new pc.TransformGizmo(camera, layer);
     * gizmo.on('transform:move', (pointDelta, angleDelta) => {
     *     console.log('Transformation moved by ${pointDelta} (angle: ${angleDelta})');
     * });
     */
    static EVENT_TRANSFORMMOVE: string;
    /**
     * Fired when when the transformation has ended.
     *
     * @event
     * @example
     * const gizmo = new pc.TransformGizmo(camera, layer);
     * gizmo.on('transform:end', () => {
     *     console.log('Transformation ended');
     * });
     */
    static EVENT_TRANSFORMEND: string;
    /**
     * Internal theme.
     *
     * @type {GizmoTheme}
     * @protected
     */
    protected _theme: GizmoTheme;
    /**
     * Internal gizmo starting rotation in world space.
     *
     * @type {Vec3}
     * @protected
     */
    protected _rootStartPos: Vec3;
    /**
     * Internal gizmo starting rotation in world space.
     *
     * @type {Quat}
     * @protected
     */
    protected _rootStartRot: Quat;
    /**
     * Internal object containing the gizmo shapes to render.
     *
     * @type {{ [key in GizmoAxis]?: Shape }}
     * @protected
     */
    protected _shapes: { [key in GizmoAxis]?: Shape; };
    /**
     * Internal mapping of mesh instances to gizmo shapes.
     *
     * @type {Map<MeshInstance, Shape>}
     * @private
     */
    private _shapeMap;
    /**
     * Internal currently hovered axes
     *
     * @type {Set<GizmoAxis>}
     * @private
     */
    private _hovering;
    /**
     * Internal currently hovered axis.
     *
     * @type {GizmoAxis | ''}
     * @private
     */
    private _hoverAxis;
    /**
     * Internal state of if currently hovered shape is a plane.
     *
     * @type {boolean}
     * @private
     */
    private _hoverIsPlane;
    /**
     * Internal currently selected axis.
     *
     * @type {GizmoAxis | ''}
     * @protected
     */
    protected _selectedAxis: GizmoAxis | "";
    /**
     * Internal state of if currently selected shape is a plane.
     *
     * @type {boolean}
     * @protected
     */
    protected _selectedIsPlane: boolean;
    /**
     * Internal selection starting coordinates in world space.
     *
     * @type {Vec3}
     * @protected
     */
    protected _selectionStartPoint: Vec3;
    /**
     * Whether snapping is enabled. Defaults to false.
     *
     * @type {boolean}
     */
    snap: boolean;
    /**
     * Snapping increment. Defaults to 1.
     *
     * @type {number}
     */
    snapIncrement: number;
    /**
     * Whether to hide the shapes when dragging. Defaults to 'selected'.
     *
     * @type {GizmoDragMode}
     */
    dragMode: GizmoDragMode;
    /**
     * Gets the current theme for the gizmo.
     *
     * @type {GizmoTheme}
     */
    get theme(): GizmoTheme;
    /**
     * @type {Color}
     * @deprecated Use {@link TransformGizmo#setTheme} instead.
     * @ignore
     */
    set xAxisColor(value: Color);
    /**
     * @type {Color}
     * @deprecated Use {@link TransformGizmo#theme} instead.
     * @ignore
     */
    get xAxisColor(): Color;
    /**
     * @type {Color}
     * @deprecated Use {@link TransformGizmo#setTheme} instead.
     * @ignore
     */
    set yAxisColor(value: Color);
    /**
     * @type {Color}
     * @deprecated Use {@link TransformGizmo#theme} instead.
     * @ignore
     */
    get yAxisColor(): Color;
    /**
     * @type {Color}
     * @deprecated Use {@link TransformGizmo#setTheme} instead.
     * @ignore
     */
    set zAxisColor(value: Color);
    /**
     * @type {Color}
     * @deprecated Use {@link TransformGizmo#theme} instead.
     * @ignore
     */
    get zAxisColor(): Color;
    /**
     * @type {number}
     * @deprecated Use {@link TransformGizmo#setTheme} instead.
     * @ignore
     */
    set colorAlpha(value: number);
    /**
     * @type {number}
     * @deprecated Use {@link TransformGizmo#theme} instead.
     * @ignore
     */
    get colorAlpha(): number;
    /**
     * @type {boolean}
     * @protected
     */
    protected get _dragging(): boolean;
    /**
     * @param {MeshInstance} [meshInstance] - The mesh instance.
     * @returns {GizmoAxis | ''} - The axis.
     * @private
     */
    private _getAxis;
    /**
     * @param {MeshInstance} [meshInstance] - The mesh instance.
     * @returns {boolean} - Whether the mesh instance is a plane.
     * @private
     */
    private _getIsPlane;
    /**
     * @param {MeshInstance} [meshInstance] - The mesh instance.
     * @private
     */
    private _hover;
    /**
     * @param {Vec3} mouseWPos - The mouse world position.
     * @returns {Ray} - The ray.
     * @protected
     */
    protected _createRay(mouseWPos: Vec3): Ray;
    /**
     * @param {string} axis - The axis to create the plane for.
     * @param {boolean} isFacing - Whether the axis is facing the camera.
     * @param {boolean} isLine - Whether the axis is a line.
     * @returns {Plane} - The plane.
     * @protected
     */
    protected _createPlane(axis: string, isFacing: boolean, isLine: boolean): Plane;
    /**
     * @param {string} axis - The axis
     * @param {Vec3} dir - The direction
     * @returns {Vec3} - The direction
     * @protected
     */
    protected _dirFromAxis(axis: string, dir: Vec3): Vec3;
    /**
     * @param {Vec3} point - The point to project.
     * @param {string} axis - The axis to project to.
     * @protected
     */
    protected _projectToAxis(point: Vec3, axis: string): void;
    /**
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     * @param {boolean} isFacing - Whether the axis is facing the camera.
     * @param {boolean} isLine - Whether the axis is a line.
     * @returns {Vec3} The point (space is {@link TransformGizmo#coordSpace}).
     * @protected
     */
    protected _screenToPoint(x: number, y: number, isFacing?: boolean, isLine?: boolean): Vec3;
    /**
     * @param {Vec3} pos - The position.
     * @param {Quat} rot - The rotation.
     * @param {GizmoAxis | ''} activeAxis - The active axis.
     * @param {boolean} activeIsPlane - Whether the active axis is a plane.
     * @protected
     */
    protected _drawGuideLines(pos: Vec3, rot: Quat, activeAxis: GizmoAxis | "", activeIsPlane: boolean): void;
    /**
     * @param {Vec3} pos - The position.
     * @param {Quat} rot - The rotation.
     * @param {'x' | 'y' | 'z'} axis - The axis.
     * @protected
     */
    protected _drawSpanLine(pos: Vec3, rot: Quat, axis: "x" | "y" | "z"): void;
    /**
     * @protected
     */
    protected _createTransform(): void;
    /**
     * Set the shape to be enabled or disabled.
     *
     * @param {GizmoAxis | 'face'} shapeAxis - The shape axis.
     * @param {boolean} enabled - The enabled state of shape.
     */
    enableShape(shapeAxis: GizmoAxis | "face", enabled: boolean): void;
    /**
     * Get the enabled state of the shape.
     *
     * @param {GizmoAxis | 'face'} shapeAxis - The shape axis. Can be:
     * @returns {boolean} - Then enabled state of the shape
     */
    isShapeEnabled(shapeAxis: GizmoAxis | "face"): boolean;
    /**
     * Sets the theme or partial theme for the gizmo.
     *
     * @param {{ [K in keyof GizmoTheme]?: Partial<GizmoTheme[K]> }} partial - The partial theme to set.
     */
    setTheme(partial: { [K in keyof GizmoTheme]?: Partial<GizmoTheme[K]>; }): void;
}
import { Color } from '../../core/math/color.js';
import { Gizmo } from './gizmo.js';
import { Vec3 } from '../../core/math/vec3.js';
import { Quat } from '../../core/math/quat.js';
import type { GizmoAxis } from './constants.js';
import type { Shape } from './shape/shape.js';
import type { GizmoDragMode } from './constants.js';
import { Ray } from '../../core/shape/ray.js';
import { Plane } from '../../core/shape/plane.js';
