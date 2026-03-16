/**
 * Callback used by {@link XrAnchors#create}.
 */
export type XrAnchorCreateCallback = (err: Error | null, anchor: XrAnchor | null) => void;
/**
 * @import { Quat } from '../../core/math/quat.js'
 * @import { Vec3 } from '../../core/math/vec3.js'
 * @import { XrAnchorForgetCallback } from './xr-anchor.js'
 * @import { XrManager } from './xr-manager.js'
 */
/**
 * @callback XrAnchorCreateCallback
 * Callback used by {@link XrAnchors#create}.
 * @param {Error|null} err - The Error object if failed to create an anchor or null.
 * @param {XrAnchor|null} anchor - The anchor that is tracked against real world geometry.
 * @returns {void}
 */
/**
 * Anchors provide an ability to specify a point in the world that needs to be updated to
 * correctly reflect the evolving understanding of the world by the underlying AR system,
 * such that the anchor remains aligned with the same place in the physical world.
 * Anchors tend to persist better relative to the real world, especially during a longer
 * session with lots of movement.
 *
 * ```javascript
 * app.xr.start(camera, pc.XRTYPE_AR, pc.XRSPACE_LOCALFLOOR, {
 *     anchors: true
 * });
 * ```
 *
 * @category XR
 */
export class XrAnchors extends EventHandler {
    /**
     * Fired when anchors become available.
     *
     * @event
     * @example
     * app.xr.anchors.on('available', () => {
     *     console.log('Anchors are available');
     * });
     */
    static EVENT_AVAILABLE: string;
    /**
     * Fired when anchors become unavailable.
     *
     * @event
     * @example
     * app.xr.anchors.on('unavailable', () => {
     *     console.log('Anchors are unavailable');
     * });
     */
    static EVENT_UNAVAILABLE: string;
    /**
     * Fired when an anchor failed to be created. The handler is passed an Error object.
     *
     * @event
     * @example
     * app.xr.anchors.on('error', (err) => {
     *     console.error(err.message);
     * });
     */
    static EVENT_ERROR: string;
    /**
     * Fired when a new {@link XrAnchor} is added. The handler is passed the {@link XrAnchor} that
     * was added.
     *
     * @event
     * @example
     * app.xr.anchors.on('add', (anchor) => {
     *     console.log('Anchor added');
     * });
     */
    static EVENT_ADD: string;
    /**
     * Fired when an {@link XrAnchor} is destroyed. The handler is passed the {@link XrAnchor} that
     * was destroyed.
     *
     * @event
     * @example
     * app.xr.anchors.on('destroy', (anchor) => {
     *     console.log('Anchor destroyed');
     * });
     */
    static EVENT_DESTROY: string;
    /**
     * Create a new XrAnchors instance.
     *
     * @param {XrManager} manager - WebXR Manager.
     * @ignore
     */
    constructor(manager: XrManager);
    /**
     * @type {XrManager}
     * @ignore
     */
    manager: XrManager;
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
     * @type {boolean}
     * @private
     */
    private _checkingAvailability;
    /**
     * @type {boolean}
     * @private
     */
    private _persistence;
    /**
     * List of anchor creation requests.
     *
     * @type {object[]}
     * @private
     */
    private _creationQueue;
    /**
     * Index of XrAnchors, with XRAnchor (native handle) used as a key.
     *
     * @type {Map<XRAnchor,XrAnchor>}
     * @private
     */
    private _index;
    /**
     * Index of XrAnchors, with UUID (persistent string) used as a key.
     *
     * @type {Map<string,XrAnchor>}
     * @private
     */
    private _indexByUuid;
    /**
     * @type {XrAnchor[]}
     * @private
     */
    private _list;
    /**
     * Map of callbacks to XRAnchors so that we can call its callback once an anchor is updated
     * with a pose for the first time.
     *
     * @type {Map<XrAnchor, XrAnchorCreateCallback>}
     * @private
     */
    private _callbacksAnchors;
    /** @private */
    private _onSessionStart;
    /** @private */
    private _onSessionEnd;
    /**
     * @param {XRAnchor} xrAnchor - XRAnchor that has been added.
     * @param {string|null} [uuid] - UUID string associated with persistent anchor.
     * @returns {XrAnchor} new instance of XrAnchor.
     * @private
     */
    private _createAnchor;
    /**
     * @param {XRAnchor} xrAnchor - XRAnchor that has been destroyed.
     * @param {XrAnchor} anchor - Anchor that has been destroyed.
     * @private
     */
    private _onAnchorDestroy;
    /**
     * Create an anchor using position and rotation, or from hit test result.
     *
     * @param {Vec3|XRHitTestResult} position - Position for an anchor or a hit test result.
     * @param {Quat|XrAnchorCreateCallback} [rotation] - Rotation for an anchor or a callback if
     * creating from a hit test result.
     * @param {XrAnchorCreateCallback} [callback] - Callback to fire when anchor was created or
     * failed to be created.
     * @example
     * // create an anchor using a position and rotation
     * app.xr.anchors.create(position, rotation, (err, anchor) => {
     *     if (!err) {
     *         // new anchor has been created
     *     }
     * });
     * @example
     * // create an anchor from a hit test result
     * hitTestSource.on('result', (position, rotation, inputSource, hitTestResult) => {
     *     app.xr.anchors.create(hitTestResult, (err, anchor) => {
     *         if (!err) {
     *             // new anchor has been created
     *         }
     *     });
     * });
     */
    create(position: Vec3 | XRHitTestResult, rotation?: Quat | XrAnchorCreateCallback, callback?: XrAnchorCreateCallback): void;
    /**
     * Restore anchor using persistent UUID.
     *
     * @param {string} uuid - UUID string associated with persistent anchor.
     * @param {XrAnchorCreateCallback} [callback] - Callback to fire when anchor was created or
     * failed to be created.
     * @example
     * // restore an anchor using uuid string
     * app.xr.anchors.restore(uuid, (err, anchor) => {
     *     if (!err) {
     *         // new anchor has been created
     *     }
     * });
     * @example
     * // restore all available persistent anchors
     * const uuids = app.xr.anchors.uuids;
     * for(let i = 0; i < uuids.length; i++) {
     *     app.xr.anchors.restore(uuids[i]);
     * }
     */
    restore(uuid: string, callback?: XrAnchorCreateCallback): void;
    /**
     * Forget an anchor by removing its UUID from underlying systems.
     *
     * @param {string} uuid - UUID string associated with persistent anchor.
     * @param {XrAnchorForgetCallback} [callback] - Callback to fire when anchor persistent data
     * was removed or error if failed.
     * @example
     * // forget all available anchors
     * const uuids = app.xr.anchors.uuids;
     * for (let i = 0; i < uuids.length; i++) {
     *     app.xr.anchors.forget(uuids[i]);
     * }
     */
    forget(uuid: string, callback?: XrAnchorForgetCallback): void;
    /**
     * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
     * @ignore
     */
    update(frame: XRFrame): void;
    /**
     * True if Anchors are supported.
     *
     * @type {boolean}
     */
    get supported(): boolean;
    /**
     * True if Anchors are available. This information is available only when session has started.
     *
     * @type {boolean}
     */
    get available(): boolean;
    /**
     * True if Anchors support persistence.
     *
     * @type {boolean}
     */
    get persistence(): boolean;
    /**
     * Array of UUID strings of persistent anchors, or null if not available.
     *
     * @type {null|string[]}
     */
    get uuids(): null | string[];
    /**
     * List of available {@link XrAnchor}s.
     *
     * @type {XrAnchor[]}
     */
    get list(): XrAnchor[];
}
import { XrAnchor } from './xr-anchor.js';
import { EventHandler } from '../../core/event-handler.js';
import type { XrManager } from './xr-manager.js';
import type { Vec3 } from '../../core/math/vec3.js';
import type { Quat } from '../../core/math/quat.js';
import type { XrAnchorForgetCallback } from './xr-anchor.js';
