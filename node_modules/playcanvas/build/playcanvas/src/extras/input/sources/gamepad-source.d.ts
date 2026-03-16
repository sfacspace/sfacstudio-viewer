/**
 * Game pad input source class
 */
export type GamepadSourceDeltas = {
    /**
     * - The button deltas, represented as an array of button states (0 or 1).
     */
    buttons: number[];
    /**
     * - The left stick deltas, represented as an array of [x, y] coordinates.
     */
    leftStick: number[];
    /**
     * - The right stick deltas, represented as an array of [x, y] coordinates.
     */
    rightStick: number[];
};
/**
 * Game pad input source class
 *
 * @category Input Source
 * @alpha
 *
 * @typedef {object} GamepadSourceDeltas
 * @property {number[]} buttons - The button deltas, represented as an array of button states (0 or 1).
 * @property {number[]} leftStick - The left stick deltas, represented as an array of [x, y] coordinates.
 * @property {number[]} rightStick - The right stick deltas, represented as an array of [x, y] coordinates.
 * @augments {InputSource<GamepadSourceDeltas>}
 */
export class GamepadSource extends InputSource<GamepadSourceDeltas> {
    /**
     * The button codes (based on Xbox controller layout).
     *
     * @readonly
     */
    static readonly buttonCode: {
        readonly A: 0;
        readonly B: 1;
        readonly X: 2;
        readonly Y: 3;
        readonly LB: 4;
        readonly RB: 5;
        readonly LT: 6;
        readonly RT: 7;
        readonly SELECT: 8;
        readonly START: 9;
        readonly LEFT_STICK: 10;
        readonly RIGHT_STICK: 11;
    };
    constructor();
    /**
     * @type {number[]}
     * @private
     */
    private _buttonPrev;
}
import { InputSource } from '../input.js';
