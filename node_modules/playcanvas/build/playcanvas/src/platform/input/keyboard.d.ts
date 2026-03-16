/**
 * Manages keyboard input by tracking key states and dispatching events. Extends {@link EventHandler}
 * in order to fire `keydown` and `keyup` events (see {@link KeyboardEvent}).
 *
 * Allows the state of individual keys to be queried to check if they are currently pressed or were
 * pressed/released since the last update. The class automatically handles browser visibility
 * changes and window blur events by clearing key states. The Keyboard instance must be attached to
 * a DOM element before it can detect key events.
 *
 * Your application's Keyboard instance is managed and accessible via {@link AppBase#keyboard}.
 *
 * @category Input
 */
export class Keyboard extends EventHandler {
    /**
     * Fired when a key is pressed. The handler is passed a {@link KeyboardEvent}.
     *
     * @event
     * @example
     * const onKeyDown = (e) => {
     *     if (e.key === pc.KEY_SPACE) {
     *         // space key pressed
     *     }
     *     e.event.preventDefault(); // Use original browser event to prevent browser action.
     * };
     *
     * app.keyboard.on('keydown', onKeyDown, this);
     */
    static EVENT_KEYDOWN: string;
    /**
     * Fired when a key is released. The handler is passed a {@link KeyboardEvent}.
     *
     * @event
     * @example
     * const onKeyUp = (e) => {
     *     if (e.key === pc.KEY_SPACE) {
     *         // space key released
     *     }
     *     e.event.preventDefault(); // Use original browser event to prevent browser action.
     * };
     *
     * app.keyboard.on('keyup', onKeyUp, this);
     */
    static EVENT_KEYUP: string;
    /**
     * Create a new Keyboard instance.
     *
     * @param {Element|Window} [element] - Element to attach Keyboard to. Note that elements like
     * &lt;div&gt; can't accept focus by default. To use keyboard events on an element like this it
     * must have a value of 'tabindex' e.g. tabindex="0". See
     * [here](https://www.w3.org/WAI/GL/WCAG20/WD-WCAG20-TECHS/SCR29.html) for more details.
     * @param {object} [options] - Optional options object.
     * @param {boolean} [options.preventDefault] - Call preventDefault() in key event handlers.
     * This stops the default action of the event occurring. e.g. Ctrl+T will not open a new
     * browser tab.
     * @param {boolean} [options.stopPropagation] - Call stopPropagation() in key event handlers.
     * This stops the event bubbling up the DOM so no parent handlers will be notified of the
     * event.
     * @example
     * // attach keyboard listeners to the window
     * const keyboard = new pc.Keyboard(window);
     */
    constructor(element?: Element | Window, options?: {
        preventDefault?: boolean;
        stopPropagation?: boolean;
    });
    /** @private */
    private _element;
    /** @private */
    private _keymap;
    /** @private */
    private _lastmap;
    _keyDownHandler: any;
    _keyUpHandler: any;
    _keyPressHandler: any;
    _visibilityChangeHandler: any;
    _windowBlurHandler: any;
    preventDefault: boolean;
    stopPropagation: boolean;
    /**
     * Attach the keyboard event handlers to an Element.
     *
     * @param {Element|Window} element - The element to listen for keyboard events on.
     */
    attach(element: Element | Window): void;
    /**
     * Detach the keyboard event handlers from the element it is attached to.
     */
    detach(): void;
    /**
     * Convert a key code into a key identifier.
     *
     * @param {number} keyCode - The key code.
     * @returns {string} The key identifier.
     * @private
     */
    private toKeyIdentifier;
    /**
     * Process the browser keydown event.
     *
     * @param {globalThis.KeyboardEvent} event - The browser keyboard event.
     * @private
     */
    private _handleKeyDown;
    /**
     * Process the browser keyup event.
     *
     * @param {globalThis.KeyboardEvent} event - The browser keyboard event.
     * @private
     */
    private _handleKeyUp;
    /**
     * Process the browser keypress event.
     *
     * @param {globalThis.KeyboardEvent} event - The browser keyboard event.
     * @private
     */
    private _handleKeyPress;
    /**
     * Handle the browser visibilitychange event.
     *
     * @private
     */
    private _handleVisibilityChange;
    /**
     * Handle the browser blur event.
     *
     * @private
     */
    private _handleWindowBlur;
    /**
     * Called once per frame to update internal state.
     *
     * @ignore
     */
    update(): void;
    /**
     * Return true if the key is currently down.
     *
     * @param {number} key - The keyCode of the key to test. See the KEY_* constants.
     * @returns {boolean} True if the key was pressed, false if not.
     */
    isPressed(key: number): boolean;
    /**
     * Returns true if the key was pressed since the last update.
     *
     * @param {number} key - The keyCode of the key to test. See the KEY_* constants.
     * @returns {boolean} True if the key was pressed.
     */
    wasPressed(key: number): boolean;
    /**
     * Returns true if the key was released since the last update.
     *
     * @param {number} key - The keyCode of the key to test. See the KEY_* constants.
     * @returns {boolean} True if the key was pressed.
     */
    wasReleased(key: number): boolean;
}
import { EventHandler } from '../../core/event-handler.js';
