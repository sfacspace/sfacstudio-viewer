export type ArrowShapeArgs = {
    /**
     * - The gap between the arrow base and the center
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
     * - The thickness of the arrow head
     */
    arrowThickness?: number;
    /**
     * - The length of the arrow head
     */
    arrowLength?: number;
    /**
     * - The tolerance for intersection tests
     */
    tolerance?: number;
};
/**
 * @typedef {object} ArrowShapeArgs
 * @property {number} [gap] - The gap between the arrow base and the center
 * @property {number} [lineThickness] - The thickness of the line
 * @property {number} [lineLength] - The length of the line
 * @property {number} [arrowThickness] - The thickness of the arrow head
 * @property {number} [arrowLength] - The length of the arrow head
 * @property {number} [tolerance] - The tolerance for intersection tests
 */
/**
 * @ignore
 */
export class ArrowShape extends Shape {
    /**
     * Create a new ArrowShape.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {ShapeArgs & ArrowShapeArgs} args - The shape options.
     */
    constructor(device: GraphicsDevice, args?: ShapeArgs & ArrowShapeArgs);
    /**
     * The internal gap between the arrow base and the center.
     *
     * @type {number}
     * @private
     */
    private _gap;
    /**
     * The internal line thickness of the arrow.
     *
     * @type {number}
     * @private
     */
    private _lineThickness;
    /**
     * The internal line length of the arrow.
     *
     * @type {number}
     * @private
     */
    private _lineLength;
    /**
     * The internal arrow thickness of the arrow.
     *
     * @type {number}
     * @private
     */
    private _arrowThickness;
    /**
     * The internal arrow length of the arrow.
     *
     * @type {number}
     * @private
     */
    private _arrowLength;
    /**
     * The internal tolerance of the arrow.
     *
     * @type {number}
     * @private
     */
    private _tolerance;
    /**
     * The internal head entity of the arrow.
     *
     * @type {Entity}
     * @private
     */
    private _head;
    /**
     * The internal line entity of the arrow.
     *
     * @type {Entity}
     * @private
     */
    private _line;
    /**
     * Set the gap between the arrow base and the center.
     *
     * @type {number}
     */
    set gap(value: number);
    /**
     * Get the gap between the arrow base and the center.
     *
     * @type {number}
     */
    get gap(): number;
    /**
     * Set the line thickness of the arrow.
     *
     * @type {number}
     */
    set lineThickness(value: number);
    /**
     * Get the line thickness of the arrow.
     *
     * @type {number}
     */
    get lineThickness(): number;
    /**
     * Set the line length of the arrow.
     *
     * @type {number}
     */
    set lineLength(value: number);
    /**
     * Get the line length of the arrow.
     *
     * @type {number}
     */
    get lineLength(): number;
    /**
     * Set the arrow thickness of the arrow.
     *
     * @type {number}
     */
    set arrowThickness(value: number);
    /**
     * Get the arrow thickness of the arrow.
     *
     * @type {number}
     */
    get arrowThickness(): number;
    /**
     * Set the arrow length of the arrow.
     *
     * @type {number}
     */
    set arrowLength(value: number);
    /**
     * Get the arrow length of the arrow.
     *
     * @type {number}
     */
    get arrowLength(): number;
    /**
     * Set the tolerance of the arrow.
     *
     * @type {number}
     */
    set tolerance(value: number);
    /**
     * Get the tolerance of the arrow.
     *
     * @type {number}
     */
    get tolerance(): number;
}
import { Shape } from './shape.js';
import type { GraphicsDevice } from '../../../platform/graphics/graphics-device.js';
import type { ShapeArgs } from './shape.js';
