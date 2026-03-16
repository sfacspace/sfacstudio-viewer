export type BoxShapeArgs = {
    /**
     * - The size of the box.
     */
    size?: number;
};
/** @import { ShapeArgs } from './shape.js' */
/** @import { GraphicsDevice } from '../../../platform/graphics/graphics-device.js' */
/**
 * @typedef {object} BoxShapeArgs
 * @property {number} [size] - The size of the box.
 */
/**
 * @ignore
 */
export class BoxShape extends Shape {
    /**
     * Create a new BoxShape.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {ShapeArgs & BoxShapeArgs} args - The shape options.
     */
    constructor(device: GraphicsDevice, args?: ShapeArgs & BoxShapeArgs);
    /**
     * The internal size of the box.
     *
     * @type {number}
     * @private
     */
    private _size;
    /**
     * Set the rendered size of the box.
     *
     * @param {number} value - The new size of the box.
     */
    set size(value: number);
    /**
     * Get the rendered size of the box.
     *
     * @returns {number} The size of the box.
     */
    get size(): number;
}
import { Shape } from './shape.js';
import type { GraphicsDevice } from '../../../platform/graphics/graphics-device.js';
import type { ShapeArgs } from './shape.js';
