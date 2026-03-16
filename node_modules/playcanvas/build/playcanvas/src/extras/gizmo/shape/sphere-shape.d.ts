export type SphereShapeArgs = {
    /**
     * - The radius of the sphere.
     */
    radius?: number;
};
/** @import { ShapeArgs } from './shape.js' */
/** @import { GraphicsDevice } from '../../../platform/graphics/graphics-device.js' */
/**
 * @typedef {object} SphereShapeArgs
 * @property {number} [radius] - The radius of the sphere.
 */
/**
 * @ignore
 */
export class SphereShape extends Shape {
    /**
     * Create a new SphereShape.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {ShapeArgs & SphereShapeArgs} args - The shape options.
     */
    constructor(device: GraphicsDevice, args?: ShapeArgs & SphereShapeArgs);
    /**
     * The internal size of the sphere.
     *
     * @type {number}
     * @private
     */
    private _radius;
    /**
     * Set the rendered radius of the sphere.
     *
     * @param {number} value - The new radius of the sphere.
     */
    set radius(value: number);
    /**
     * Get the rendered radius of the sphere.
     *
     * @returns {number} The radius of the sphere.
     */
    get radius(): number;
}
import { Shape } from './shape.js';
import type { GraphicsDevice } from '../../../platform/graphics/graphics-device.js';
import type { ShapeArgs } from './shape.js';
