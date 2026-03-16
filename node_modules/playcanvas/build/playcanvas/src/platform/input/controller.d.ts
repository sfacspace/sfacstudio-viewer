/**
 * @import { GamePads } from './game-pads.js'
 */
/**
 * A general input handler which handles both mouse and keyboard input assigned to named actions.
 * This allows you to define input handlers separately to defining keyboard/mouse configurations.
 *
 * @category Input
 */
export class Controller {
    /**
     * Create a new instance of a Controller.
     *
     * @param {Element} [element] - Element to attach Controller to.
     * @param {object} [options] - Optional arguments.
     * @param {Keyboard} [options.keyboard] - A Keyboard object to use.
     * @param {Mouse} [options.mouse] - A Mouse object to use.
     * @param {GamePads} [options.gamepads] - A Gamepads object to use.
     * @example
     * const c = new pc.Controller(document);
     *
     * // Register the "fire" action and assign it to both the Enter key and the space bar.
     * c.registerKeys("fire", [pc.KEY_ENTER, pc.KEY_SPACE]);
     */
    constructor(element?: Element, options?: {
        keyboard?: Keyboard;
        mouse?: Mouse;
        gamepads?: GamePads;
    });
    /**
     * @type {Keyboard|null}
     * @private
     */
    private _keyboard;
    /**
     * @type {Mouse|null}
     * @private
     */
    private _mouse;
    /**
     * @type {GamePads|null}
     * @private
     */
    private _gamepads;
    /**
     * @type {Element|null}
     * @private
     */
    private _element;
    /** @private */
    private _actions;
    /** @private */
    private _axes;
    /** @private */
    private _axesValues;
    /**
     * Attach Controller to an Element. This is required before you can monitor for key/mouse
     * inputs.
     *
     * @param {Element} element - The element to attach mouse and keyboard event handler too.
     */
    attach(element: Element): void;
    /**
     * Detach Controller from an Element. This should be done before the Controller is destroyed.
     */
    detach(): void;
    /**
     * Disable the context menu usually activated with the right mouse button.
     */
    disableContextMenu(): void;
    /**
     * Enable the context menu usually activated with the right mouse button. This is enabled by
     * default.
     */
    enableContextMenu(): void;
    /**
     * Update the Keyboard and Mouse handlers.
     *
     * @param {object} dt - The time since the last frame.
     */
    update(dt: object): void;
    /**
     * Helper function to append an action.
     *
     * @param {string} action_name - The name of the action.
     * @param {object} action - An action object to add.
     * @param {ACTION_KEYBOARD | ACTION_MOUSE | ACTION_GAMEPAD} action.type - The name of the action.
     * @param {number[]} [action.keys] - Keyboard: A list of keycodes e.g. `[pc.KEY_A, pc.KEY_ENTER]`.
     * @param {number} [action.button] - Mouse: e.g. `pc.MOUSEBUTTON_LEFT` - Gamepad: e.g. `pc.PAD_FACE_1`
     * @param {number} [action.pad] - Gamepad: An index of the pad to register (use {@link PAD_1}, etc).
     */
    appendAction(action_name: string, action: {
        type: "keyboard" | "mouse" | "gamepad";
        keys?: number[];
        button?: number;
        pad?: number;
    }): void;
    /**
     * Create or update a action which is enabled when the supplied keys are pressed.
     *
     * @param {string} action - The name of the action.
     * @param {number[]} keys - A list of keycodes.
     */
    registerKeys(action: string, keys: number[]): void;
    /**
     * Create or update an action which is enabled when the supplied mouse button is pressed.
     *
     * @param {string} action - The name of the action.
     * @param {number} button - The mouse button.
     */
    registerMouse(action: string, button: number): void;
    /**
     * Create or update an action which is enabled when the gamepad button is pressed.
     *
     * @param {string} action - The name of the action.
     * @param {number} pad - The index of the pad to register (use {@link PAD_1}, etc).
     * @param {number} button - The pad button.
     */
    registerPadButton(action: string, pad: number, button: number): void;
    /**
     * Register an action against a controller axis.
     *
     * @param {object} [options] - Optional options object.
     * @param {number} [options.pad] - The index of the game pad to register for (use {@link PAD_1}, etc).
     */
    registerAxis(options?: {
        pad?: number;
    }): void;
    /**
     * Returns true if the current action is enabled.
     *
     * @param {string} actionName - The name of the action.
     * @returns {boolean} True if the action is enabled.
     */
    isPressed(actionName: string): boolean;
    /**
     * Returns true if the action was enabled this since the last update.
     *
     * @param {string} actionName - The name of the action.
     * @returns {boolean} True if the action was enabled this since the last update.
     */
    wasPressed(actionName: string): boolean;
    getAxis(name: any): number;
    _enableMouse(): void;
    _enableKeyboard(): void;
}
import { Keyboard } from './keyboard.js';
import { Mouse } from './mouse.js';
import type { GamePads } from './game-pads.js';
