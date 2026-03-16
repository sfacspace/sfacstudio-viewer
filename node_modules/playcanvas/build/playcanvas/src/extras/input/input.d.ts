/** @import { HandleEventCallback } from '../../core/event-handler.js' */
/**
 * Represents an input delta.
 *
 * @category Input Source
 * @alpha
 */
export class InputDelta {
    /**
     * @param {number | number[]} arg - The size of the delta or an array of initial values.
     */
    constructor(arg: number | number[]);
    /**
     * @type {number[]}
     * @private
     */
    private _value;
    /**
     * Adds another InputDelta instance to this one.
     *
     * @param {InputDelta} other - The other InputDelta instance to add.
     * @returns {InputDelta} Self for chaining.
     */
    add(other: InputDelta): InputDelta;
    /**
     * Appends offsets to the current delta values.
     *
     * @param {number[]} offsets - The offsets.
     * @returns {InputDelta} Self for chaining.
     */
    append(offsets: number[]): InputDelta;
    /**
     * Copies the values from another InputDelta instance to this one.
     *
     * @param {InputDelta} other - The other InputDelta instance to copy from.
     * @returns {InputDelta} Self for chaining.
     */
    copy(other: InputDelta): InputDelta;
    /**
     * The magnitude of the delta, calculated as the square root of the sum of squares
     * of the values.
     *
     * @returns {number} - The magnitude of the delta.
     */
    length(): number;
    /**
     * Returns the current value of the delta and resets it to zero.
     *
     * @returns {number[]} - The current value of the delta.
     */
    read(): number[];
}
/**
 * Represents an input frame, which contains a map of input deltas.
 *
 * @category Input Source
 * @alpha
 *
 * @template {Record<string, number[]>} T - The shape of the input frame.
 */
export class InputFrame<T extends Record<string, number[]>> {
    /**
     * @param {T} data - The input frame data, where each key corresponds to an input delta.
     */
    constructor(data: T);
    /**
     * @type {{ [K in keyof T]: InputDelta }}
     */
    deltas: { [K in keyof T]: InputDelta; };
    /**
     * Returns the current frame state and resets the deltas to zero.
     *
     * @returns {{ [K in keyof T]: number[] }} - The flushed input frame with current deltas.
     */
    read(): { [K in keyof T]: number[]; };
}
/**
 * The base class for all input devices.
 *
 * @category Input Source
 * @alpha
 *
 * @template {Record<string, number[]>} T - The shape of the input source.
 * @augments {InputFrame<T>}
 */
export class InputSource<T extends Record<string, number[]>> extends InputFrame<T> {
    /**
     * @type {HTMLElement | null}
     * @protected
     */
    protected _element: HTMLElement | null;
    /**
     * @type {EventHandler}
     * @private
     */
    private _events;
    /**
     * Adds an event listener for the specified event.
     *
     * @param {string} event - The event name to listen for.
     * @param {HandleEventCallback} callback - The callback function to execute when the event is
     * triggered.
     */
    on(event: string, callback: HandleEventCallback): void;
    /**
     * Removes an event listener for the specified event.
     *
     * @param {string} event - The event name to stop listening for.
     * @param {HandleEventCallback} callback - The callback function to remove.
     */
    off(event: string, callback: HandleEventCallback): void;
    /**
     * Fires an event with the given name and arguments.
     *
     * @param {string} event - The event name to fire.
     * @param {...any} args - The arguments to pass to the event listeners.
     */
    fire(event: string, ...args: any[]): void;
    /**
     * @param {HTMLElement} element - The element.
     */
    attach(element: HTMLElement): void;
    detach(): void;
    destroy(): void;
}
/**
 * The base class for all input consumers, which are used to process input frames.
 *
 * @category Input Consumer
 * @alpha
 */
export class InputConsumer {
    /**
     * @param {InputFrame} frame - The input frame.
     * @param {number} dt - The delta time.
     * @returns {any} - The controller pose.
     */
    update(frame: InputFrame<any>, dt: number): any;
}
/**
 * The base class for all input controllers.
 *
 * @category Input Consumer
 * @alpha
 */
export class InputController extends InputConsumer {
    /**
     * @type {Pose}
     * @protected
     */
    protected _pose: Pose;
    /**
     * @param {Pose} pose - The initial pose of the controller.
     * @param {boolean} [smooth] - Whether to smooth the transition.
     */
    attach(pose: Pose, smooth?: boolean): void;
    detach(): void;
    /**
     * @param {InputFrame} frame - The input frame.
     * @param {number} dt - The delta time.
     * @returns {Pose} - The controller pose.
     * @override
     */
    override update(frame: InputFrame<any>, dt: number): Pose;
    destroy(): void;
}
import type { HandleEventCallback } from '../../core/event-handler.js';
import { Pose } from './pose.js';
