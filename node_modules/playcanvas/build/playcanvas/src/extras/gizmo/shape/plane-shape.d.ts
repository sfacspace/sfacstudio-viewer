export type PlaneShapeArgs = {
    /**
     * - The size of the plane
     */
    size?: number;
    /**
     * - The gap between the plane and the center
     */
    gap?: number;
};
/**
 * @typedef {object} PlaneShapeArgs
 * @property {number} [size] - The size of the plane
 * @property {number} [gap] - The gap between the plane and the center
 */
/**
 * @ignore
 */
export class PlaneShape extends Shape {
    /**
     * Create a new PlaneShape.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {ShapeArgs & PlaneShapeArgs} args - The shape options.
     */
    constructor(device: GraphicsDevice, args?: ShapeArgs & PlaneShapeArgs);
    /**
     * The size of the plane.
     *
     * @type {number}
     * @private
     */
    private _size;
    /**
     * The gap between the plane and the center.
     *
     * @type {number}
     * @private
     */
    private _gap;
    /**
     * The internal flipped state of the plane.
     *
     * @type {Vec3}
     * @private
     */
    private _flipped;
    /**
     * Set the size of the plane.
     *
     * @type {number}
     */
    set size(value: number);
    /**
     * Get the size of the plane.
     *
     * @type {number}
     */
    get size(): number;
    /**
     * Set the gap between the plane and the center.
     *
     * @type {number}
     */
    set gap(value: number);
    /**
     * Get the gap between the plane and the center.
     *
     * @type {number}
     */
    get gap(): number;
    /**
     * Set the flipped state of the plane.
     *
     * @type {Vec3}
     */
    set flipped(value: Vec3);
    /**
     * Get the flipped state of the plane.
     *
     * @type {Vec3}
     */
    get flipped(): Vec3;
}
import { Shape } from './shape.js';
import { Vec3 } from '../../../core/math/vec3.js';
import type { GraphicsDevice } from '../../../platform/graphics/graphics-device.js';
import type { ShapeArgs } from './shape.js';
