/**
 * @import { Keyboard } from './keyboard.js'
 */
/**
 * The KeyboardEvent is passed into all event handlers registered on the {@link Keyboard}. The
 * events are:
 *
 * - {@link Keyboard.EVENT_KEYDOWN}
 * - {@link Keyboard.EVENT_KEYUP}
 *
 * @category Input
 */
export class KeyboardEvent {
    /**
     * Create a new KeyboardEvent.
     *
     * @param {Keyboard} keyboard - The keyboard object which is firing the event.
     * @param {globalThis.KeyboardEvent} event - The original browser event that was fired.
     * @example
     * const onKeyDown = function (e) {
     *     if (e.key === pc.KEY_SPACE) {
     *         // space key pressed
     *     }
     *     e.event.preventDefault(); // Use original browser event to prevent browser action.
     * };
     * app.keyboard.on("keydown", onKeyDown, this);
     */
    constructor(keyboard: Keyboard, event: globalThis.KeyboardEvent);
    /**
     * The keyCode of the key that has changed. See the KEY_* constants.
     *
     * @type {number|null}
     */
    key: number | null;
    /**
     * The element that fired the keyboard event.
     *
     * @type {Element|null}
     */
    element: Element | null;
    /**
     * The original browser event which was fired.
     *
     * @type {globalThis.KeyboardEvent|null}
     */
    event: globalThis.KeyboardEvent | null;
}
import type { Keyboard } from './keyboard.js';
