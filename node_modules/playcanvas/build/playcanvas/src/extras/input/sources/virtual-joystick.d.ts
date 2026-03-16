export class VirtualJoystick {
    /**
     * @param {object} options - The options.
     * @param {number} [options.range] - The inner max distance of the joystick.
     */
    constructor({ range }?: {
        range?: number;
    });
    /**
     * @type {number}
     * @private
     */
    private _range;
    /**
     * @type {Vec2}
     * @private
     */
    private _position;
    /**
     * @type {Vec2}
     * @private
     */
    private _value;
    /**
     * The vector value of the joystick, normalized to the range of -1 to 1.
     *
     * @type {Vec2}
     */
    get value(): Vec2;
    /**
     * @param {number} x - The x position.
     * @param {number} y - The y position.
     * @returns {number[]} - An array containing the base and stick positions.
     */
    down(x: number, y: number): number[];
    /**
     * @param {number} x - The x position of the stick
     * @param {number} y - The y position of the stick
     * @returns {number[]} - An array containing the base and stick positions.
     */
    move(x: number, y: number): number[];
    /**
     * Resets the joystick to its initial state.
     *
     * @returns {number[]} - An array containing the base and stick positions, both set to -1.
     */
    up(): number[];
}
import { Vec2 } from '../../../core/math/vec2.js';
