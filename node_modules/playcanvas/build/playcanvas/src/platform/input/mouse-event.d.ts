/**
 * @import { Mouse } from './mouse.js'
 */
/**
 * Returns true if pointer lock is currently enabled.
 *
 * @returns {boolean} True if pointer lock is currently enabled.
 */
export function isMousePointerLocked(): boolean;
/**
 * The MouseEvent object is passed into all event handlers registered on the {@link Mouse}. The
 * events are:
 *
 * - {@link Mouse.EVENT_MOUSEDOWN}
 * - {@link Mouse.EVENT_MOUSEUP}
 * - {@link Mouse.EVENT_MOUSEMOVE}
 * - {@link Mouse.EVENT_MOUSEWHEEL}
 *
 * @category Input
 */
export class MouseEvent {
    /**
     * Create a new MouseEvent instance.
     *
     * @param {Mouse} mouse - The Mouse device that is firing this event.
     * @param {globalThis.MouseEvent|globalThis.WheelEvent} event - The original browser event that fired.
     */
    constructor(mouse: Mouse, event: globalThis.MouseEvent | globalThis.WheelEvent);
    /**
     * The x coordinate of the mouse pointer relative to the element {@link Mouse} is attached to.
     *
     * @type {number}
     */
    x: number;
    /**
     * The y coordinate of the mouse pointer relative to the element {@link Mouse} is attached to.
     *
     * @type {number}
     */
    y: number;
    /**
     * The change in x coordinate since the last mouse event.
     *
     * @type {number}
     */
    dx: number;
    /**
     * The change in y coordinate since the last mouse event.
     *
     * @type {number}
     */
    dy: number;
    /**
     * The mouse button associated with this event. Can be:
     *
     * - {@link MOUSEBUTTON_LEFT}
     * - {@link MOUSEBUTTON_MIDDLE}
     * - {@link MOUSEBUTTON_RIGHT}
     *
     * @type {number}
     */
    button: number;
    /**
     * A value representing the amount the mouse wheel has moved, only valid for
     * {@link Mouse.EVENT_MOUSEWHEEL} events.
     *
     * @type {number}
     */
    wheelDelta: number;
    /**
     * The element that the mouse was fired from.
     *
     * @type {Element}
     */
    element: Element;
    /**
     * True if the ctrl key was pressed when this event was fired.
     *
     * @type {boolean}
     */
    ctrlKey: boolean;
    /**
     * True if the alt key was pressed when this event was fired.
     *
     * @type {boolean}
     */
    altKey: boolean;
    /**
     * True if the shift key was pressed when this event was fired.
     *
     * @type {boolean}
     */
    shiftKey: boolean;
    /**
     * True if the meta key was pressed when this event was fired.
     *
     * @type {boolean}
     */
    metaKey: boolean;
    /**
     * The original browser event.
     *
     * @type {globalThis.MouseEvent|globalThis.WheelEvent}
     */
    event: globalThis.MouseEvent | globalThis.WheelEvent;
    buttons: boolean[];
}
import type { Mouse } from './mouse.js';
