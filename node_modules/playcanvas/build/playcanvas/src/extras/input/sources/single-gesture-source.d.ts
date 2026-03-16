/**
 * Single gesture input source.
 */
export type SingleGestureSourceDeltas = {
    /**
     * - The input deltas, represented as an array of [x, y] coordinates.
     */
    input: number[];
    /**
     * - The double tap delta.
     */
    doubleTap: number[];
};
/**
 * Single gesture input source.
 *
 * @category Input Source
 * @alpha
 *
 * @typedef {object} SingleGestureSourceDeltas
 * @property {number[]} input - The input deltas, represented as an array of [x, y] coordinates.
 * @property {number[]} doubleTap - The double tap delta.
 * @augments {InputSource<SingleGestureSourceDeltas>}
 */
export class SingleGestureSource extends InputSource<SingleGestureSourceDeltas> {
    constructor();
    /**
     * @type {ReturnType<typeof movementState>}
     * @private
     */
    private _movementState;
    /**
     * @type {'joystick' | 'touch'}
     * @private
     */
    private _layout;
    /**
     * @type {Map<number, { x: number, y: number }>}
     * @private
     */
    private _pointerData;
    /**
     * @type {{ x: number, y: number, time: number }}
     * @private
     */
    private _lastPointer;
    /**
     * @type {VirtualJoystick}
     * @private
     */
    private _joystick;
    /**
     * @private
     * @param {PointerEvent} event - The pointer event.
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
     * The layout of the single touch input source. The layout can be one of the following:
     *
     * - `joystick`: A virtual joystick.
     * - `touch`: A touch.
     *
     * Default is `joystick`.
     *
     * @type {'joystick' | 'touch'}
     */
    set layout(value: "touch" | "joystick");
    get layout(): "touch" | "joystick";
    get joystick(): VirtualJoystick;
}
import { InputSource } from '../input.js';
import { VirtualJoystick } from './virtual-joystick.js';
