/**
 * @import { XrManager } from './xr-manager.js'
 */
/**
 * DOM Overlay provides the ability to use DOM elements as an overlay in a WebXR AR session. It
 * requires that the root DOM element is provided for session start. That way, input source
 * `select` events are first tested against DOM Elements and then propagated down to the XR
 * Session. If this propagation is not desirable, use the `beforexrselect` event on a DOM element
 * and the `preventDefault` function to stop propagation.
 *
 * ```javascript
 * app.xr.domOverlay.root = element;
 * app.xr.start(camera, pc.XRTYPE_AR, pc.XRSPACE_LOCALFLOOR);
 * ```
 *
 * ```javascript
 * // Disable input source firing `select` event when some descendant element of DOM overlay root
 * // is touched/clicked. This is useful when the user interacts with UI elements and there should
 * // not be `select` events behind UI.
 * someElement.addEventListener('beforexrselect', (evt) => {
 *     evt.preventDefault();
 * });
 * ```
 *
 * @category XR
 */
export class XrDomOverlay {
    /**
     * Create a new XrDomOverlay instance.
     *
     * @param {XrManager} manager - WebXR Manager.
     * @ignore
     */
    constructor(manager: XrManager);
    /**
     * @type {XrManager}
     * @private
     */
    private _manager;
    /**
     * @type {boolean}
     * @private
     */
    private _supported;
    /**
     * @type {Element|null}
     * @private
     */
    private _root;
    /**
     * True if DOM Overlay is supported.
     *
     * @type {boolean}
     */
    get supported(): boolean;
    /**
     * True if DOM Overlay is available. This information becomes available only when the session has
     * started and a valid root DOM element has been provided.
     *
     * @type {boolean}
     */
    get available(): boolean;
    /**
     * State of the DOM Overlay, which defines how the root DOM element is rendered. Can be:
     *
     * - `screen` - indicates that the DOM element is covering the whole physical screen, matching
     * XR viewports.
     * - `floating` - indicates that the underlying platform renders the DOM element as floating in
     * space, which can move during the WebXR session or allow the application to move the element.
     * - `head-locked` - indicates that the DOM element follows the user's head movement
     * consistently, appearing similar to a helmet heads-up display.
     *
     * @type {"screen"|"floating"|"head-locked"|null}
     */
    get state(): "screen" | "floating" | "head-locked" | null;
    /**
     * Sets the DOM element to be used as the root for DOM Overlay. Can be changed only when the XR
     * session is not running.
     *
     * @type {Element|null}
     * @example
     * app.xr.domOverlay.root = element;
     * app.xr.start(camera, pc.XRTYPE_AR, pc.XRSPACE_LOCALFLOOR);
     */
    set root(value: Element | null);
    /**
     * Gets the DOM element to be used as the root for DOM Overlay.
     *
     * @type {Element|null}
     */
    get root(): Element | null;
}
import type { XrManager } from './xr-manager.js';
