export type ShapeArgs = {
    /**
     * - The axis of the shape (e.g., 'x', 'y', 'z').
     */
    axis?: string;
    /**
     * - The position of the shape.
     */
    position?: Vec3;
    /**
     * - The rotation of the shape.
     */
    rotation?: Vec3;
    /**
     * - The scale of the shape.
     */
    scale?: Vec3;
    /**
     * - Whether the shape is disabled.
     */
    disabled?: boolean;
    /**
     * - Whether the shape is visible.
     */
    visible?: boolean;
    /**
     * - The layers the shape belongs to.
     */
    layers?: number[];
    /**
     * - The default color of the shape.
     */
    defaultColor?: Color;
    /**
     * - The hover color of the shape.
     */
    hoverColor?: Color;
    /**
     * - The disabled color of the shape.
     */
    disabledColor?: Color;
    /**
     * - The culling mode of the shape.
     */
    cull?: number;
    /**
     * - The depth of the shape. -1 = interpolated depth.
     */
    depth?: number;
};
/**
 * @typedef {object} ShapeArgs
 * @property {string} [axis] - The axis of the shape (e.g., 'x', 'y', 'z').
 * @property {Vec3} [position] - The position of the shape.
 * @property {Vec3} [rotation] - The rotation of the shape.
 * @property {Vec3} [scale] - The scale of the shape.
 * @property {boolean} [disabled] - Whether the shape is disabled.
 * @property {boolean} [visible] - Whether the shape is visible.
 * @property {number[]} [layers] - The layers the shape belongs to.
 * @property {Color} [defaultColor] - The default color of the shape.
 * @property {Color} [hoverColor] - The hover color of the shape.
 * @property {Color} [disabledColor] - The disabled color of the shape.
 * @property {number} [cull] - The culling mode of the shape.
 * @property {number} [depth] - The depth of the shape. -1 = interpolated depth.
 */
/**
 * @ignore
 */
export class Shape {
    /**
     * Create a shape.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {string} name - The name of the shape.
     * @param {ShapeArgs} args - The options for the shape.
     */
    constructor(device: GraphicsDevice, name: string, args: ShapeArgs);
    /**
     * The internal position of the shape.
     *
     * @type {Vec3}
     * @protected
     */
    protected _position: Vec3;
    /**
     * The internal rotation of the shape.
     *
     * @type {Vec3}
     * @protected
     */
    protected _rotation: Vec3;
    /**
     * The internal scale of the shape.
     *
     * @type {Vec3}
     * @protected
     */
    protected _scale: Vec3;
    /**
     * The internal render component layers of the shape.
     *
     * @type {number[]}
     * @protected
     */
    protected _layers: number[];
    /**
     * The internal material state of the shape.
     *
     * @type {ShaderMaterial}
     * @protected
     */
    protected _material: ShaderMaterial;
    /**
     * The internal disabled state of the shape.
     *
     * @protected
     * @type {boolean}
     */
    protected _disabled: boolean;
    /**
     * The internal visibility state of the shape.
     *
     * @type {boolean}
     * @protected
     */
    protected _visible: boolean;
    /**
     * The internal default color of the shape.
     *
     * @type {Color}
     * @protected
     */
    protected _defaultColor: Color;
    /**
     * The internal hover color of the shape.
     *
     * @type {Color}
     * @protected
     */
    protected _hoverColor: Color;
    /**
     * The internal disabled color of the shape.
     *
     * @type {Color}
     * @protected
     */
    protected _disabledColor: Color;
    /**
     * The internal culling state of the shape.
     *
     * @type {number}
     * @protected
     */
    protected _cull: number;
    /**
     * The internal depth state of the shape. -1 = interpolated depth.
     *
     * @type {number}
     * @protected
     */
    protected _depth: number;
    /**
     * The graphics device.
     *
     * @type {GraphicsDevice}
     */
    device: GraphicsDevice;
    /**
     * The axis of the shape.
     *
     * @type {string}
     */
    axis: string;
    /**
     * The entity of the shape.
     *
     * @type {Entity}
     */
    entity: Entity;
    /**
     * The triangle data of the shape.
     *
     * @type {TriData[]}
     */
    triData: TriData[];
    /**
     * The mesh instances of the shape.
     *
     * @type {MeshInstance[]}
     */
    meshInstances: MeshInstance[];
    /**
     * Set the disabled state of the shape.
     *
     * @type {boolean}
     */
    set disabled(value: boolean);
    /**
     * Get the disabled state of the shape.
     *
     * @type {boolean}
     */
    get disabled(): boolean;
    /**
     * Set the visibility state of the shape.
     *
     * @type {boolean}
     */
    set visible(value: boolean);
    /**
     * Get the visibility state of the shape.
     *
     * @type {boolean}
     */
    get visible(): boolean;
    /**
     * Create a render component for an entity.
     *
     * @param {Entity} entity - The entity to create the render component for.
     * @param {Mesh[]} meshes - The meshes to create the render component with.
     * @protected
     */
    protected _createRenderComponent(entity: Entity, meshes: Mesh[]): void;
    /**
     * Update the shape's transform.
     *
     * @protected
     */
    protected _update(): void;
    /**
     * Sets the hover state of the shape.
     *
     * @param {boolean} state - Whether the shape is hovered.
     * @returns {void}
     */
    hover(state: boolean): void;
    /**
     * Destroys the shape and its entity.
     *
     * @returns {void}
     */
    destroy(): void;
}
import { Vec3 } from '../../../core/math/vec3.js';
import { Color } from '../../../core/math/color.js';
import { ShaderMaterial } from '../../../scene/materials/shader-material.js';
import type { GraphicsDevice } from '../../../platform/graphics/graphics-device.js';
import { Entity } from '../../../framework/entity.js';
import type { TriData } from '../tri-data.js';
import { MeshInstance } from '../../../scene/mesh-instance.js';
import type { Mesh } from '../../../scene/mesh.js';
