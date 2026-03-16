/**
 * Manages touch input by handling and dispatching touch events. Extends {@link EventHandler}
 * to fire `touchstart`, `touchend`, `touchmove`, and `touchcancel` events (see {@link TouchEvent}).
 *
 * Detects and processes touch interactions with the attached DOM element, allowing applications
 * to respond to common touch gestures. The TouchDevice instance must be attached to a DOM element
 * before it can detect touch events.
 *
 * Your application's TouchDevice instance is managed and accessible via {@link AppBase#touch}.
 *
 * @category Input
 */
export class TouchDevice extends EventHandler {
    /**
     * Fired when a touch starts. The handler is passed a {@link TouchEvent}.
     *
     * @event
     * @example
     * app.touch.on('touchstart', (e) => {
     *     console.log(`Touch started at position: ${e.x}, ${e.y}`);
     * });
     */
    static EVENT_TOUCHSTART: string;
    /**
     * Fired when a touch ends. The handler is passed a {@link TouchEvent}.
     *
     * @event
     * @example
     * app.touch.on('touchend', (e) => {
     *     console.log(`Touch ended at position: ${e.x}, ${e.y}`);
     * });
     */
    static EVENT_TOUCHEND: string;
    /**
     * Fired when a touch moves. The handler is passed a {@link TouchEvent}.
     *
     * @event
     * @example
     * app.touch.on('touchmove', (e) => {
     *     console.log(`Touch moved to position: ${e.x}, ${e.y}`);
     * });
     */
    static EVENT_TOUCHMOVE: string;
    /**
     * Fired when a touch is interrupted in some way. The exact reasons for canceling a touch can
     * vary from device to device. For example, a modal alert pops up during the interaction; the
     * touch point leaves the document area, or there are more touch points than the device
     * supports, in which case the earliest touch point is canceled. The handler is passed a
     * {@link TouchEvent}.
     *
     * @event
     * @example
     * app.touch.on('touchcancel', (e) => {
     *     console.log(`Touch canceled at position: ${e.x}, ${e.y}`);
     * });
     */
    static EVENT_TOUCHCANCEL: string;
    /**
     * Create a new touch device and attach it to an element.
     *
     * @param {Element} element - The element to attach listen for events on.
     */
    constructor(element: Element);
    _element: Element;
    _startHandler: any;
    _endHandler: any;
    _moveHandler: any;
    _cancelHandler: any;
    /**
     * Attach a device to an element in the DOM. If the device is already attached to an element
     * this method will detach it first.
     *
     * @param {Element} element - The element to attach to.
     */
    attach(element: Element): void;
    /**
     * Detach a device from the element it is attached to.
     */
    detach(): void;
    _handleTouchStart(e: any): void;
    _handleTouchEnd(e: any): void;
    _handleTouchMove(e: any): void;
    _handleTouchCancel(e: any): void;
}
import { EventHandler } from '../../core/event-handler.js';
