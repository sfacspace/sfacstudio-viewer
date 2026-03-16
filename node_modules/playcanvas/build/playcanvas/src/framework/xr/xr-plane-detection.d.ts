/**
 * @import { XrManager } from './xr-manager.js'
 */
/**
 * Plane Detection provides the ability to detect real world surfaces based on estimations of the
 * underlying AR system.
 *
 * ```javascript
 * // start session with plane detection enabled
 * app.xr.start(camera, pc.XRTYPE_VR, pc.XRSPACE_LOCALFLOOR, {
 *     planeDetection: true
 * });
 * ```
 *
 * ```javascript
 * app.xr.planeDetection.on('add', (plane) => {
 *     // new plane been added
 * });
 * ```
 *
 * @category XR
 */
export class XrPlaneDetection extends EventHandler {
    /**
     * Fired when plane detection becomes available.
     *
     * @event
     * @example
     * app.xr.planeDetection.on('available', () => {
     *     console.log('Plane detection is available');
     * });
     */
    static EVENT_AVAILABLE: string;
    /**
     * Fired when plane detection becomes unavailable.
     *
     * @event
     * @example
     * app.xr.planeDetection.on('unavailable', () => {
     *     console.log('Plane detection is unavailable');
     * });
     */
    static EVENT_UNAVAILABLE: string;
    /**
     * Fired when new {@link XrPlane} is added to the list. The handler is passed the
     * {@link XrPlane} instance that has been added.
     *
     * @event
     * @example
     * app.xr.planeDetection.on('add', (plane) => {
     *     // new plane is added
     * });
     */
    static EVENT_ADD: string;
    /**
     * Fired when a {@link XrPlane} is removed from the list. The handler is passed the
     * {@link XrPlane} instance that has been removed.
     *
     * @event
     * @example
     * app.xr.planeDetection.on('remove', (plane) => {
     *     // new plane is removed
     * });
     */
    static EVENT_REMOVE: string;
    /**
     * Create a new XrPlaneDetection instance.
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
     * @type {boolean}
     * @private
     */
    private _available;
    /**
     * @type {Map<XRPlane, XrPlane>}
     * @private
     */
    private _planesIndex;
    /**
     * @type {XrPlane[]}
     * @private
     */
    private _planes;
    /** @private */
    private _onSessionStart;
    /** @private */
    private _onSessionEnd;
    /**
     * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
     * @ignore
     */
    update(frame: XRFrame): void;
    /**
     * True if Plane Detection is supported.
     *
     * @type {boolean}
     */
    get supported(): boolean;
    /**
     * True if Plane Detection is available. This information is available only when the session has started.
     *
     * @type {boolean}
     */
    get available(): boolean;
    /**
     * Array of {@link XrPlane} instances that contain individual plane information.
     *
     * @type {XrPlane[]}
     */
    get planes(): XrPlane[];
}
import { EventHandler } from '../../core/event-handler.js';
import { XrPlane } from './xr-plane.js';
import type { XrManager } from './xr-manager.js';
