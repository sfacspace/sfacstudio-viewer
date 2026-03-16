/**
 * Keyboard and mouse input source class
 */
export type KeyboardMouseSourceDeltas = {
    /**
     * - The key deltas.
     */
    key: number[];
    /**
     * - The button deltas.
     */
    button: number[];
    /**
     * - The mouse deltas.
     */
    mouse: number[];
    /**
     * - The wheel deltas.
     */
    wheel: number[];
};
/**
 * Keyboard and mouse input source class
 *
 * @category Input Source
 * @alpha
 *
 * @typedef {object} KeyboardMouseSourceDeltas
 * @property {number[]} key - The key deltas.
 * @property {number[]} button - The button deltas.
 * @property {number[]} mouse - The mouse deltas.
 * @property {number[]} wheel - The wheel deltas.
 * @augments {InputSource<KeyboardMouseSourceDeltas>}
 */
export class KeyboardMouseSource extends InputSource<KeyboardMouseSourceDeltas> {
    /**
     * The key codes for the keyboard keys.
     *
     * @readonly
     */
    static readonly keyCode: {
        readonly A: 0;
        readonly B: 1;
        readonly C: 2;
        readonly D: 3;
        readonly E: 4;
        readonly F: 5;
        readonly G: 6;
        readonly H: 7;
        readonly I: 8;
        readonly J: 9;
        readonly K: 10;
        readonly L: 11;
        readonly M: 12;
        readonly N: 13;
        readonly O: 14;
        readonly P: 15;
        readonly Q: 16;
        readonly R: 17;
        readonly S: 18;
        readonly T: 19;
        readonly U: 20;
        readonly V: 21;
        readonly W: 22;
        readonly X: 23;
        readonly Y: 24;
        readonly Z: 25;
        readonly '0': 26;
        readonly '1': 27;
        readonly '2': 28;
        readonly '3': 29;
        readonly '4': 30;
        readonly '5': 31;
        readonly '6': 32;
        readonly '7': 33;
        readonly '8': 34;
        readonly '9': 35;
        readonly UP: 36;
        readonly DOWN: 37;
        readonly LEFT: 38;
        readonly RIGHT: 39;
        readonly SPACE: 40;
        readonly SHIFT: 41;
        readonly CTRL: 42;
    };
    /**
     * @param {object} [options] - The options.
     * @param {boolean} [options.pointerLock] - Whether to enable pointer lock.
     */
    constructor({ pointerLock }?: {
        pointerLock?: boolean;
    });
    /**
     * @type {ReturnType<typeof movementState>}
     * @private
     */
    private _movementState;
    /**
     * @type {number}
     * @private
     */
    private _pointerId;
    /**
     * @type {boolean}
     * @private
     */
    private _pointerLock;
    /**
     * @type {Map<string, number>}
     * @private
     */
    private _keyMap;
    /**
     * @type {number[]}
     * @private
     */
    private _keyPrev;
    /**
     * @type {number[]}
     * @private
     */
    private _keyNow;
    /**
     * @type {number[]}
     */
    _button: number[];
    /**
     * @param {WheelEvent} event - The wheel event.
     * @private
     */
    private _onWheel;
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
     * @param {KeyboardEvent} event - The keyboard event.
     * @private
     */
    private _onKeyDown;
    /**
     * @param {KeyboardEvent} event - The keyboard event.
     * @private
     */
    private _onKeyUp;
    /**
     * @private
     */
    private _clearButtons;
    /**
     * @param {string} code - The code.
     * @param {number} value - The value.
     * @private
     */
    private _setKey;
}
import { InputSource } from '../input.js';
