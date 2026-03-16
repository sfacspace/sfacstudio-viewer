export type BoxLineShapeArgs = {
    /**
     * - The gap between the box and the line
     */
    gap?: number;
    /**
     * - The thickness of the line
     */
    lineThickness?: number;
    /**
     * - The length of the line
     */
    lineLength?: number;
    /**
     * - The size of the box
     */
    boxSize?: number;
    /**
     * - The tolerance for intersection tests
     */
    tolerance?: number;
};
/**
 * @typedef {object} BoxLineShapeArgs
 * @property {number} [gap] - The gap between the box and the line
 * @property {number} [lineThickness] - The thickness of the line
 * @property {number} [lineLength] - The length of the line
 * @property {number} [boxSize] - The size of the box
 * @property {number} [tolerance] - The tolerance for intersection tests
 */
/**
 * @ignore
 */
export class BoxLineShape extends Shape {
    /**
     * Create a new BoxLineShape.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {ShapeArgs & BoxLineShapeArgs} args - The shape options.
     */
    constructor(device: GraphicsDevice, args?: ShapeArgs & BoxLineShapeArgs);
    /**
     * The internal gap between the box and the line.
     *
     * @type {number}
     * @private
     */
    private _gap;
    /**
     * The internal line thickness of the box line.
     *
     * @type {number}
     * @private
     */
    private _lineThickness;
    /**
     * The internal line length of the box line.
     *
     * @type {number}
     * @private
     */
    private _lineLength;
    /**
     * The internal box size of the box line.
     *
     * @type {number}
     * @private
     */
    private _boxSize;
    /**
     * The internal tolerance of the box line.
     *
     * @type {number}
     * @private
     */
    private _tolerance;
    /**
     * The internal box entity of the box line.
     *
     * @type {Entity}
     * @private
     */
    private _box;
    /**
     * The internal line entity of the box line.
     *
     * @type {Entity}
     * @private
     */
    private _line;
    /**
     * The internal flipped state of the box line.
     *
     * @type {boolean}
     * @private
     */
    private _flipped;
    /**
     * Set the gap between the box and the line.
     *
     * @type {number}
     */
    set gap(value: number);
    /**
     * Get the gap between the box and the line.
     *
     * @type {number}
     */
    get gap(): number;
    /**
     * Set the line thickness of the box line.
     *
     * @type {number}
     */
    set lineThickness(value: number);
    /**
     * Get the line thickness of the box line.
     *
     * @type {number}
     */
    get lineThickness(): number;
    /**
     * Set the line length of the box line.
     *
     * @type {number}
     */
    set lineLength(value: number);
    /**
     * Get the line length of the box line.
     *
     * @type {number}
     */
    get lineLength(): number;
    /**
     * Set the box size of the box line.
     *
     * @type {number}
     */
    set boxSize(value: number);
    /**
     * Get the box size of the box line.
     *
     * @type {number}
     */
    get boxSize(): number;
    /**
     * Set the tolerance of the box line.
     *
     * @type {number}
     */
    set tolerance(value: number);
    /**
     * Get the tolerance of the box line.
     *
     * @type {number}
     */
    get tolerance(): number;
    /**
     * Set the flipped state of the box line.
     *
     * @type {boolean}
     */
    set flipped(value: boolean);
    /**
     * Get the flipped state of the box line.
     *
     * @type {boolean}
     */
    get flipped(): boolean;
}
import { Shape } from './shape.js';
import type { GraphicsDevice } from '../../../platform/graphics/graphics-device.js';
import type { ShapeArgs } from './shape.js';
