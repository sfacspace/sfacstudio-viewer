/**
 * Multi-touch input source class
 */
export type MultiTouchSourceDeltas = {
    /**
     * - The touch deltas, represented as an array of [x, y] coordinates.
     */
    touch: number[];
    /**
     * - The count deltas, represented as an array of integers.
     */
    count: number[];
    /**
     * - The pinch deltas, represented as an array of integers.
     */
    pinch: number[];
};
/**
 * Multi-touch input source class
 *
 * @category Input Source
 * @alpha
 *
 * @typedef {object} MultiTouchSourceDeltas
 * @property {number[]} touch - The touch deltas, represented as an array of [x, y] coordinates.
 * @property {number[]} count - The count deltas, represented as an array of integers.
 * @property {number[]} pinch - The pinch deltas, represented as an array of integers.
 * @augments {InputSource<MultiTouchSourceDeltas>}
 */
export class MultiTouchSource extends InputSource<MultiTouchSourceDeltas> {
    constructor();
    /**
     * @type {ReturnType<typeof movementState>}
     * @private
     */
    private _movementState;
    /**
     * @type {Map<number, PointerEvent>}
     * @private
     */
    private _pointerEvents;
    /**
     * @type {Vec2}
     * @private
     */
    private _pointerPos;
    /**
     * @type {number}
     * @private
     */
    private _pinchDist;
    /**
     * @param {PointerEvent} event - The pointer event.
     * @private
     */
    private _onPointerDown;
    /**
     * @param {PointerEvent} event - The pointer event.
     * @private
     */
    private _onPointerMove;
    /**
     * @param {PointerEvent} event - The pointer event.
     * @private
     */
    private _onPointerUp;
    /**
     * @param {MouseEvent} event - The mouse event.
     * @private
     */
    private _onContextMenu;
    /**
     * @param {Vec2} out - The output vector.
     * @returns {Vec2} The mid point.
     * @private
     */
    private _getMidPoint;
    /**
     * @returns {number} The pinch distance.
     * @private
     */
    private _getPinchDist;
}
import { InputSource } from '../input.js';
