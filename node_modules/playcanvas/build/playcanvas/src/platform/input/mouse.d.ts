/**
 * Callback used by {@link Mouse#enablePointerLock} and {@link Mouse#disablePointerLock}.
 */
export type LockMouseCallback = () => void;
/**
 * @callback LockMouseCallback
 * Callback used by {@link Mouse#enablePointerLock} and {@link Mouse#disablePointerLock}.
 * @returns {void}
 */
/**
 * Manages mouse input by tracking button states and dispatching events. Extends {@link EventHandler}
 * to fire `mousedown`, `mouseup`, `mousemove` and `mousewheel` events (see {@link MouseEvent}).
 *
 * Allows the state of mouse buttons to be queried to check if they are currently pressed or were
 * pressed/released since the last update. Provides methods to enable/disable pointer lock for
 * raw mouse movement input and control over the context menu. The Mouse instance must be attached
 * to a DOM element before it can detect mouse events.
 *
 * Your application's Mouse instance is managed and accessible via {@link AppBase#mouse}.
 *
 * @category Input
 */
export class Mouse extends EventHandler {
    /**
     * Fired when the mouse is moved. The handler is passed a {@link MouseEvent}.
     *
     * @event
     * @example
     * app.mouse.on('mousemove', (e) => {
     *     console.log(`Current mouse position is: ${e.x}, ${e.y}`);
     * });
     */
    static EVENT_MOUSEMOVE: string;
    /**
     * Fired when a mouse button is pressed. The handler is passed a {@link MouseEvent}.
     *
     * @event
     * @example
     * app.mouse.on('mousedown', (e) => {
     *     console.log(`The ${e.button} button was pressed at position: ${e.x}, ${e.y}`);
     * });
     */
    static EVENT_MOUSEDOWN: string;
    /**
     * Fired when a mouse button is released. The handler is passed a {@link MouseEvent}.
     *
     * @event
     * @example
     * app.mouse.on('mouseup', (e) => {
     *     console.log(`The ${e.button} button was released at position: ${e.x}, ${e.y}`);
     * });
     */
    static EVENT_MOUSEUP: string;
    /**
     * Fired when a mouse wheel is moved. The handler is passed a {@link MouseEvent}.
     *
     * @event
     * @example
     * app.mouse.on('mousewheel', (e) => {
     *     console.log(`The mouse wheel was moved by ${e.wheelDelta}`);
     * });
     */
    static EVENT_MOUSEWHEEL: string;
    /**
     * Check if the mouse pointer has been locked, using {@link Mouse#enablePointerLock}.
     *
     * @returns {boolean} True if locked.
     */
    static isPointerLocked(): boolean;
    /**
     * Create a new Mouse instance.
     *
     * @param {Element} [element] - The Element that the mouse events are attached to.
     */
    constructor(element?: Element);
    /** @private */
    private _lastX;
    /** @private */
    private _lastY;
    /** @private */
    private _buttons;
    /** @private */
    private _lastbuttons;
    /** @private */
    private _target;
    /** @private */
    private _attached;
    _upHandler: any;
    _downHandler: any;
    _moveHandler: any;
    _wheelHandler: any;
    _contextMenuHandler: (event: any) => void;
    /**
     * Attach mouse events to an Element.
     *
     * @param {Element} element - The DOM element to attach the mouse to.
     */
    attach(element: Element): void;
    /**
     * Remove mouse events from the element that it is attached to.
     */
    detach(): void;
    /**
     * Disable the context menu usually activated with right-click.
     */
    disableContextMenu(): void;
    /**
     * Enable the context menu usually activated with right-click. This option is active by
     * default.
     */
    enableContextMenu(): void;
    /**
     * Request that the browser hides the mouse cursor and locks the mouse to the element. Allowing
     * raw access to mouse movement input without risking the mouse exiting the element. Notes:
     *
     * - In some browsers this will only work when the browser is running in fullscreen mode. See
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API Fullscreen API} for
     * more details.
     * - Enabling pointer lock can only be initiated by a user action e.g. in the event handler for
     * a mouse or keyboard input.
     *
     * @param {LockMouseCallback} [success] - Function called if the request for mouse lock is
     * successful.
     * @param {LockMouseCallback} [error] - Function called if the request for mouse lock is
     * unsuccessful.
     */
    enablePointerLock(success?: LockMouseCallback, error?: LockMouseCallback): void;
    /**
     * Return control of the mouse cursor to the user.
     *
     * @param {LockMouseCallback} [success] - Function called when the mouse lock is disabled.
     */
    disablePointerLock(success?: LockMouseCallback): void;
    /**
     * Update method, should be called once per frame.
     */
    update(): void;
    /**
     * Returns true if the mouse button is currently pressed.
     *
     * @param {number} button - The mouse button to test. Can be:
     *
     * - {@link MOUSEBUTTON_LEFT}
     * - {@link MOUSEBUTTON_MIDDLE}
     * - {@link MOUSEBUTTON_RIGHT}
     *
     * @returns {boolean} True if the mouse button is current pressed.
     */
    isPressed(button: number): boolean;
    /**
     * Returns true if the mouse button was pressed this frame (since the last call to update).
     *
     * @param {number} button - The mouse button to test. Can be:
     *
     * - {@link MOUSEBUTTON_LEFT}
     * - {@link MOUSEBUTTON_MIDDLE}
     * - {@link MOUSEBUTTON_RIGHT}
     *
     * @returns {boolean} True if the mouse button was pressed since the last update.
     */
    wasPressed(button: number): boolean;
    /**
     * Returns true if the mouse button was released this frame (since the last call to update).
     *
     * @param {number} button - The mouse button to test. Can be:
     *
     * - {@link MOUSEBUTTON_LEFT}
     * - {@link MOUSEBUTTON_MIDDLE}
     * - {@link MOUSEBUTTON_RIGHT}
     *
     * @returns {boolean} True if the mouse button was released since the last update.
     */
    wasReleased(button: number): boolean;
    _handleUp(event: any): void;
    _handleDown(event: any): void;
    _handleMove(event: any): void;
    _handleWheel(event: any): void;
    _getTargetCoords(event: any): {
        x: number;
        y: number;
    };
}
import { EventHandler } from '../../core/event-handler.js';
