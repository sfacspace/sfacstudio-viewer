/**
 * @import { TouchDevice } from './touch-device.js'
 */
/**
 * This function takes a browser Touch object and returns the coordinates of the touch relative to
 * the target DOM element.
 *
 * @param {globalThis.Touch} touch - The browser Touch object.
 * @returns {object} The coordinates of the touch relative to the touch.target DOM element. In the
 * format \{x, y\}.
 * @category Input
 */
export function getTouchTargetCoords(touch: globalThis.Touch): object;
/**
 * A instance of a single point touch on a {@link TouchDevice}.
 *
 * @category Input
 */
export class Touch {
    /**
     * Create a new Touch object from the browser Touch.
     *
     * @param {globalThis.Touch} touch - The browser Touch object.
     */
    constructor(touch: globalThis.Touch);
    /**
     * The identifier of the touch.
     *
     * @type {number}
     */
    id: number;
    /**
     * The x coordinate relative to the element that the TouchDevice is attached to.
     *
     * @type {number}
     */
    x: number;
    /**
     * The y coordinate relative to the element that the TouchDevice is attached to.
     *
     * @type {number}
     */
    y: number;
    /**
     * The target DOM element of the touch event.
     *
     * @type {Element}
     */
    target: Element;
    /**
     * The original browser Touch object.
     *
     * @type {globalThis.Touch}
     */
    touch: globalThis.Touch;
}
/**
 * The TouchEvent object is passed into all event handlers registered on the {@link TouchDevice}.
 * The events are:
 *
 * - {@link TouchDevice.EVENT_TOUCHSTART}
 * - {@link TouchDevice.EVENT_TOUCHEND}
 * - {@link TouchDevice.EVENT_TOUCHMOVE}
 * - {@link TouchDevice.EVENT_TOUCHCANCEL}
 *
 * @category Input
 */
export class TouchEvent {
    /**
     * Create a new TouchEvent instance. It is created from an existing browser event.
     *
     * @param {TouchDevice} device - The source device of the touch events.
     * @param {globalThis.TouchEvent} event - The original browser TouchEvent.
     */
    constructor(device: TouchDevice, event: globalThis.TouchEvent);
    /**
     * The target DOM element that the event was fired from.
     *
     * @type {Element}
     */
    element: Element;
    /**
     * The original browser TouchEvent.
     *
     * @type {globalThis.TouchEvent}
     */
    event: globalThis.TouchEvent;
    /**
     * A list of all touches currently in contact with the device.
     *
     * @type {Touch[]}
     */
    touches: Touch[];
    /**
     * A list of touches that have changed since the last event.
     *
     * @type {Touch[]}
     */
    changedTouches: Touch[];
    /**
     * Get an event from one of the touch lists by the id. It is useful to access touches by their
     * id so that you can be sure you are referencing the same touch.
     *
     * @param {number} id - The identifier of the touch.
     * @param {Touch[]} list - An array of touches to search.
     * @returns {Touch|null} The {@link Touch} object or null.
     */
    getTouchById(id: number, list: Touch[]): Touch | null;
}
import type { TouchDevice } from './touch-device.js';
