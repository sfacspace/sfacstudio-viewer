/**
 * Input handler for accessing GamePad input.
 *
 * @category Input
 */
export class GamePads extends EventHandler {
    /**
     * Fired when a gamepad is connected. The handler is passed the {@link GamePad} object that was
     * connected.
     *
     * @event
     * @example
     * const onPadConnected = (pad) => {
     *     if (!pad.mapping) {
     *         // Map the gamepad as the system could not find the proper map.
     *     } else {
     *         // Make the gamepad pulse.
     *     }
     * };
     *
     * app.keyboard.on("gamepadconnected", onPadConnected, this);
     */
    static EVENT_GAMEPADCONNECTED: string;
    /**
     * Fired when a gamepad is disconnected. The handler is passed the {@link GamePad} object that
     * was disconnected.
     *
     * @event
     * @example
     * const onPadDisconnected = (pad) => {
     *     // Pause the game.
     * };
     *
     * app.keyboard.on("gamepaddisconnected", onPadDisconnected, this);
     */
    static EVENT_GAMEPADDISCONNECTED: string;
    /**
     * Whether gamepads are supported by this device.
     *
     * @type {boolean}
     */
    gamepadsSupported: boolean;
    /**
     * The list of current gamepads.
     *
     * @type {GamePad[]}
     */
    current: GamePad[];
    /**
     * The list of previous buttons states
     *
     * @type {boolean[][]}
     * @private
     */
    private _previous;
    _ongamepadconnectedHandler: any;
    _ongamepaddisconnectedHandler: any;
    /**
     * Sets the threshold for axes to return values. Must be between 0 and 1.
     *
     * @type {number}
     * @ignore
     */
    set deadZone(value: number);
    /**
     * Gets the threshold for axes to return values.
     *
     * @type {number}
     * @ignore
     */
    get deadZone(): number;
    /**
     * Gets the list of previous button states.
     *
     * @type {boolean[][]}
     * @ignore
     */
    get previous(): boolean[][];
    /**
     * Callback function when a gamepad is connecting.
     *
     * @param {GamepadEvent} event - The event containing the connecting gamepad.
     * @private
     */
    private _ongamepadconnected;
    /**
     * Callback function when a gamepad is disconnecting.
     *
     * @param {GamepadEvent} event - The event containing the disconnecting gamepad.
     * @private
     */
    private _ongamepaddisconnected;
    /**
     * Update the previous state of the gamepads. This must be called every frame for
     * `wasPressed` and `wasTouched` to work.
     *
     * @ignore
     */
    update(): void;
    /**
     * Poll for the latest data from the gamepad API.
     *
     * @param {GamePad[]} [pads] - An optional array used to receive the gamepads mapping. This
     * array will be returned by this function.
     * @returns {GamePad[]} An array of gamepads and mappings for the model of gamepad that is
     * attached.
     * @example
     * const gamepads = new pc.GamePads();
     * const pads = gamepads.poll();
     */
    poll(pads?: GamePad[]): GamePad[];
    /**
     * Destroy the event listeners.
     *
     * @ignore
     */
    destroy(): void;
    /**
     * Retrieve the order for buttons and axes for given HTML5 Gamepad.
     *
     * @param {Gamepad} pad - The HTML5 Gamepad object.
     * @returns {object} Object defining the order of buttons and axes for given HTML5 Gamepad.
     */
    getMap(pad: Gamepad): object;
    /**
     * Returns true if the button on the pad requested is pressed.
     *
     * @param {number} orderIndex - The order index of the pad to check, use constants {@link PAD_1}, {@link PAD_2}, etc. For gamepad index call the function from the pad.
     * @param {number} button - The button to test, use constants {@link PAD_FACE_1}, etc.
     * @returns {boolean} True if the button is pressed.
     */
    isPressed(orderIndex: number, button: number): boolean;
    /**
     * Returns true if the button was pressed since the last frame.
     *
     * @param {number} orderIndex - The index of the pad to check, use constants {@link PAD_1}, {@link PAD_2}, etc. For gamepad index call the function from the pad.
     * @param {number} button - The button to test, use constants {@link PAD_FACE_1}, etc.
     * @returns {boolean} True if the button was pressed since the last frame.
     */
    wasPressed(orderIndex: number, button: number): boolean;
    /**
     * Returns true if the button was released since the last frame.
     *
     * @param {number} orderIndex - The index of the pad to check, use constants {@link PAD_1}, {@link PAD_2}, etc. For gamepad index call the function from the pad.
     * @param {number} button - The button to test, use constants {@link PAD_FACE_1}, etc.
     * @returns {boolean} True if the button was released since the last frame.
     */
    wasReleased(orderIndex: number, button: number): boolean;
    /**
     * Get the value of one of the analog axes of the pad.
     *
     * @param {number} orderIndex - The index of the pad to check, use constants {@link PAD_1}, {@link PAD_2}, etc. For gamepad index call the function from the pad.
     * @param {number} axis - The axis to get the value of, use constants {@link PAD_L_STICK_X}, etc.
     * @returns {number} The value of the axis between -1 and 1.
     */
    getAxis(orderIndex: number, axis: number): number;
    /**
     * Make the gamepad vibrate.
     *
     * @param {number} orderIndex - The index of the pad to check, use constants {@link PAD_1}, {@link PAD_2}, etc. For gamepad index call the function from the pad.
     * @param {number} intensity - Intensity for the vibration in the range 0 to 1.
     * @param {number} duration - Duration for the vibration in milliseconds.
     * @param {object} [options] - Options for special vibration pattern.
     * @param {number} [options.startDelay] - Delay before the pattern starts, in milliseconds. Defaults to 0.
     * @param {number} [options.strongMagnitude] - Intensity for strong actuators in the range 0 to 1. Defaults to intensity.
     * @param {number} [options.weakMagnitude] - Intensity for weak actuators in the range 0 to 1. Defaults to intensity.
     * @returns {Promise<boolean>} Return a Promise resulting in true if the pulse was successfully completed.
     */
    pulse(orderIndex: number, intensity: number, duration: number, options?: {
        startDelay?: number;
        strongMagnitude?: number;
        weakMagnitude?: number;
    }): Promise<boolean>;
    /**
     * Make all gamepads vibrate.
     *
     * @param {number} intensity - Intensity for the vibration in the range 0 to 1.
     * @param {number} duration - Duration for the vibration in milliseconds.
     * @param {object} [options] - Options for special vibration pattern.
     * @param {number} [options.startDelay] - Delay before the pattern starts, in milliseconds. Defaults to 0.
     * @param {number} [options.strongMagnitude] - Intensity for strong actuators in the range 0 to 1. Defaults to intensity.
     * @param {number} [options.weakMagnitude] - Intensity for weak actuators in the range 0 to 1. Defaults to intensity.
     * @returns {Promise<boolean[]>} Return a Promise resulting in an array of booleans defining if the pulse was successfully completed for every gamepads.
     */
    pulseAll(intensity: number, duration: number, options?: {
        startDelay?: number;
        strongMagnitude?: number;
        weakMagnitude?: number;
    }): Promise<boolean[]>;
    /**
     * Find a connected {@link GamePad} from its identifier.
     *
     * @param {string} id - The identifier to search for.
     * @returns {GamePad|null} The {@link GamePad} with the matching identifier or null if no gamepad is found or the gamepad is not connected.
     */
    findById(id: string): GamePad | null;
    /**
     * Find a connected {@link GamePad} from its device index.
     *
     * @param {number} index - The device index to search for.
     * @returns {GamePad|null} The {@link GamePad} with the matching device index or null if no gamepad is found or the gamepad is not connected.
     */
    findByIndex(index: number): GamePad | null;
}
/**
 * A GamePad stores information about a gamepad from the Gamepad API.
 *
 * @category Input
 */
export class GamePad {
    /**
     * Create a new GamePad Instance.
     *
     * @param {Gamepad} gamepad - The original Gamepad API gamepad.
     * @param {object} map - The buttons and axes map.
     * @ignore
     */
    constructor(gamepad: Gamepad, map: object);
    /**
     * The compiled mapping to reduce lookup delay when retrieving buttons
     *
     * @type {object}
     * @private
     */
    private _compiledMapping;
    /**
     * The identifier for the gamepad. Its structure depends on device.
     *
     * @type {string}
     */
    id: string;
    /**
     * The index for this controller. A gamepad that is disconnected and reconnected will retain the same index.
     *
     * @type {number}
     */
    index: number;
    /**
     * The buttons present on the GamePad. Order is provided by API, use GamePad#buttons instead.
     *
     * @type {GamePadButton[]}
     * @private
     */
    private _buttons;
    /**
     * The axes values from the GamePad. Order is provided by API, use GamePad#axes instead.
     *
     * @type {number[]}
     * @private
     */
    private _axes;
    /**
     * Previous value for the analog axes present on the gamepad. Values are between -1 and 1.
     *
     * @type {number[]}
     * @private
     */
    private _previousAxes;
    /**
     * The gamepad mapping detected by the browser. Value is either "standard", "xr-standard", "" or "custom". When empty string, you may need to update the mapping yourself. "custom" means you updated the mapping.
     *
     * @type {string}
     */
    mapping: string;
    /**
     * The buttons and axes map.
     *
     * @type {object}
     */
    map: object;
    /**
     * The hand this gamepad is usually handled on. Only relevant for XR pads. Value is either "left", "right" or "none".
     *
     * @type {string}
     */
    hand: string;
    /**
     * The original Gamepad API gamepad.
     *
     * @type {Gamepad}
     * @ignore
     */
    pad: Gamepad;
    /**
     * Gets whether the gamepad is connected.
     *
     * @type {boolean}
     */
    get connected(): boolean;
    /**
     * Compile the buttons mapping to reduce lookup delay.
     *
     * @private
     */
    private _compileMapping;
    /**
     * Update the existing GamePad Instance.
     *
     * @param {Gamepad} gamepad - The original Gamepad API gamepad.
     * @ignore
     */
    update(gamepad: Gamepad): this;
    /**
     * Update the map for this gamepad.
     *
     * @param {object} map - The new mapping for this gamepad.
     * @param {string[]} map.buttons - Buttons mapping for this gamepad.
     * @param {string[]} map.axes - Axes mapping for this gamepad.
     * @param {object} [map.synthesizedButtons] - Information about buttons to pull from axes for this gamepad. Requires definition of axis index, min value and max value.
     * @param {"custom"} [map.mapping] - New mapping format. Will be forced into "custom".
     * @example
     * this.pad.updateMap({
     *     buttons: [[
     *         'PAD_FACE_1',
     *         'PAD_FACE_2',
     *         'PAD_FACE_3',
     *         'PAD_FACE_4',
     *         'PAD_L_SHOULDER_1',
     *         'PAD_R_SHOULDER_1',
     *         'PAD_L_SHOULDER_2',
     *         'PAD_R_SHOULDER_2',
     *         'PAD_SELECT',
     *         'PAD_START',
     *         'PAD_L_STICK_BUTTON',
     *         'PAD_R_STICK_BUTTON',
     *         'PAD_VENDOR'
     *     ],
     *     axes: [
     *         'PAD_L_STICK_X',
     *         'PAD_L_STICK_Y',
     *         'PAD_R_STICK_X',
     *         'PAD_R_STICK_Y'
     *     ],
     *     synthesizedButtons: {
     *         PAD_UP: { axis: 0, min: 0, max: 1 },
     *         PAD_DOWN: { axis: 0, min: -1, max: 0 },
     *         PAD_LEFT: { axis: 0, min: -1, max: 0 },
     *         PAD_RIGHT: { axis: 0, min: 0, max: 1 }
     *     }
     * });
     */
    updateMap(map: {
        buttons: string[];
        axes: string[];
        synthesizedButtons?: object;
        mapping?: "custom";
    }): void;
    /**
     * Reset gamepad mapping to default.
     */
    resetMap(): void;
    /**
     * Gets the values from analog axes present on the GamePad. Values are between -1 and 1.
     *
     * @type {number[]}
     */
    get axes(): number[];
    /**
     * Gets the buttons present on the GamePad.
     *
     * @type {GamePadButton[]}
     */
    get buttons(): GamePadButton[];
    /**
     * Make the gamepad vibrate.
     *
     * @param {number} intensity - Intensity for the vibration in the range 0 to 1.
     * @param {number} duration - Duration for the vibration in milliseconds.
     * @param {object} [options] - Options for special vibration pattern.
     * @param {number} [options.startDelay] - Delay before the pattern starts, in milliseconds. Defaults to 0.
     * @param {number} [options.strongMagnitude] - Intensity for strong actuators in the range 0 to 1. Defaults to intensity.
     * @param {number} [options.weakMagnitude] - Intensity for weak actuators in the range 0 to 1. Defaults to intensity.
     * @returns {Promise<boolean>} Return a Promise resulting in true if the pulse was successfully completed.
     */
    pulse(intensity: number, duration: number, options?: {
        startDelay?: number;
        strongMagnitude?: number;
        weakMagnitude?: number;
    }): Promise<boolean>;
    /**
     * Retrieve a button from its index.
     *
     * @param {number} index - The index to return the button for.
     * @returns {GamePadButton} The button for the searched index. May be a placeholder if none found.
     */
    getButton(index: number): GamePadButton;
    /**
     * Returns true if the button is pressed.
     *
     * @param {number} button - The button to test, use constants {@link PAD_FACE_1}, etc.
     * @returns {boolean} True if the button is pressed.
     */
    isPressed(button: number): boolean;
    /**
     * Return true if the button was pressed since the last update.
     *
     * @param {number} button - The button to test, use constants {@link PAD_FACE_1}, etc.
     * @returns {boolean} Return true if the button was pressed, false if not.
     */
    wasPressed(button: number): boolean;
    /**
     * Return true if the button was released since the last update.
     *
     * @param {number} button - The button to test, use constants {@link PAD_FACE_1}, etc.
     * @returns {boolean} Return true if the button was released, false if not.
     */
    wasReleased(button: number): boolean;
    /**
     * Returns true if the button is touched.
     *
     * @param {number} button - The button to test, use constants {@link PAD_FACE_1}, etc.
     * @returns {boolean} True if the button is touched.
     */
    isTouched(button: number): boolean;
    /**
     * Return true if the button was touched since the last update.
     *
     * @param {number} button - The button to test, use constants {@link PAD_FACE_1}, etc.
     * @returns {boolean} Return true if the button was touched, false if not.
     */
    wasTouched(button: number): boolean;
    /**
     * Returns the value of a button between 0 and 1, with 0 representing a button that is not pressed, and 1 representing a button that is fully pressed.
     *
     * @param {number} button - The button to retrieve, use constants {@link PAD_FACE_1}, etc.
     * @returns {number} The value of the button between 0 and 1.
     */
    getValue(button: number): number;
    /**
     * Get the value of one of the analog axes of the pad.
     *
     * @param {number} axis - The axis to get the value of, use constants {@link PAD_L_STICK_X}, etc.
     * @returns {number} The value of the axis between -1 and 1.
     */
    getAxis(axis: number): number;
}
/**
 * A GamePadButton stores information about a button from the Gamepad API.
 *
 * @category Input
 */
export class GamePadButton {
    /**
     * Create a new GamePadButton instance.
     *
     * @param {number|GamepadButton} current - The original Gamepad API gamepad button.
     * @param {number|GamepadButton} [previous] - The previous Gamepad API gamepad button.
     * @ignore
     */
    constructor(current: number | GamepadButton, previous?: number | GamepadButton);
    /**
     * The value for the button between 0 and 1, with 0 representing a button that is not pressed, and 1 representing a button that is fully pressed.
     *
     * @type {number}
     */
    value: number;
    /**
     * Whether the button is currently down.
     *
     * @type {boolean}
     */
    pressed: boolean;
    /**
     * Whether the button is currently touched.
     *
     * @type {boolean}
     */
    touched: boolean;
    /**
     * Whether the button was pressed.
     *
     * @type {boolean}
     */
    wasPressed: boolean;
    /**
     * Whether the button was released since the last update.
     *
     * @type {boolean}
     */
    wasReleased: boolean;
    /**
     * Whether the button was touched since the last update.
     *
     * @type {boolean}
     */
    wasTouched: boolean;
    /**
     * Update the existing GamePadButton Instance.
     *
     * @param {GamepadButton} button - The original Gamepad API gamepad button.
     * @ignore
     */
    update(button: GamepadButton): void;
}
import { EventHandler } from '../../core/event-handler.js';
