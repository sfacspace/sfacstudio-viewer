/**
 * Callback used by {@link XrHitTest#start} and {@link XrInputSource#hitTestStart}.
 */
export type XrHitTestStartCallback = (err: Error | null, hitTestSource: XrHitTestSource | null) => void;
/**
 * @import { Ray } from '../../core/shape/ray.js'
 * @import { XrInputSource } from './xr-input-source.js'
 * @import { XrManager } from './xr-manager.js'
 */
/**
 * @callback XrHitTestStartCallback
 * Callback used by {@link XrHitTest#start} and {@link XrInputSource#hitTestStart}.
 * @param {Error|null} err - The Error object if failed to create hit test source or null.
 * @param {XrHitTestSource|null} hitTestSource - Object that provides access to hit results against
 * real world geometry.
 * @returns {void}
 */
/**
 * The Hit Test interface allows initiating hit testing against real-world geometry from various
 * sources: the view, input sources, or an arbitrary ray in space. Results reflect the underlying
 * AR system's understanding of the real world.
 *
 * @category XR
 */
export class XrHitTest extends EventHandler {
    /**
     * Fired when hit test becomes available.
     *
     * @event
     * @example
     * app.xr.hitTest.on('available', () => {
     *     console.log('Hit Testing is available');
     * });
     */
    static EVENT_AVAILABLE: string;
    /**
     * Fired when hit test becomes unavailable.
     *
     * @event
     * @example
     * app.xr.hitTest.on('unavailable', () => {
     *     console.log('Hit Testing is unavailable');
     * });
     */
    static EVENT_UNAVAILABLE: string;
    /**
     * Fired when new {@link XrHitTestSource} is added to the list. The handler is passed the
     * {@link XrHitTestSource} object that has been added.
     *
     * @event
     * @example
     * app.xr.hitTest.on('add', (hitTestSource) => {
     *     // new hit test source is added
     * });
     */
    static EVENT_ADD: string;
    /**
     * Fired when {@link XrHitTestSource} is removed to the list. The handler is passed the
     * {@link XrHitTestSource} object that has been removed.
     *
     * @event
     * @example
     * app.xr.hitTest.on('remove', (hitTestSource) => {
     *     // hit test source is removed
     * });
     */
    static EVENT_REMOVE: string;
    /**
     * Fired when hit test source receives new results. It provides transform information that
     * tries to match real world picked geometry. The handler is passed the {@link XrHitTestSource}
     * that produced the hit result, the {@link Vec3} position, the {@link Quat} rotation and the
     * {@link XrInputSource} (if it is a transient hit test source).
     *
     * @event
     * @example
     * app.xr.hitTest.on('result', (hitTestSource, position, rotation, inputSource) => {
     *     target.setPosition(position);
     *     target.setRotation(rotation);
     * });
     */
    static EVENT_RESULT: string;
    /**
     * Fired when failed create hit test source. The handler is passed the Error object.
     *
     * @event
     * @example
     * app.xr.hitTest.on('error', (err) => {
     *     console.error(err.message);
     * });
     */
    static EVENT_ERROR: string;
    /**
     * Create a new XrHitTest instance.
     *
     * @param {XrManager} manager - WebXR Manager.
     * @ignore
     */
    constructor(manager: XrManager);
    /**
     * @type {XrManager}
     * @private
     */
    private manager;
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
     * List of active {@link XrHitTestSource}.
     *
     * @type {XrHitTestSource[]}
     */
    sources: XrHitTestSource[];
    /** @private */
    private _onSessionStart;
    /** @private */
    private _onSessionEnd;
    /**
     * Attempts to start hit test with provided reference space.
     *
     * @param {object} [options] - Optional object for passing arguments.
     * @param {string} [options.spaceType] - Reference space type. Defaults to
     * {@link XRSPACE_VIEWER}. Can be one of the following:
     *
     * - {@link XRSPACE_VIEWER}: Viewer - hit test will be facing relative to viewers space.
     * - {@link XRSPACE_LOCAL}: Local - represents a tracking space with a native origin near the
     * viewer at the time of creation.
     * - {@link XRSPACE_LOCALFLOOR}: Local Floor - represents a tracking space with a native origin
     * at the floor in a safe position for the user to stand. The y axis equals 0 at floor level.
     * Floor level value might be estimated by the underlying platform.
     * - {@link XRSPACE_BOUNDEDFLOOR}: Bounded Floor - represents a tracking space with its native
     * origin at the floor, where the user is expected to move within a pre-established boundary.
     * - {@link XRSPACE_UNBOUNDED}: Unbounded - represents a tracking space where the user is
     * expected to move freely around their environment, potentially long distances from their
     * starting point.
     *
     * @param {string} [options.profile] - if hit test source meant to match input source instead
     * of reference space, then name of profile of the {@link XrInputSource} should be provided.
     * @param {string[]} [options.entityTypes] - Optional list of underlying entity types against
     * which hit tests will be performed. Defaults to [ {@link XRTRACKABLE_PLANE} ]. Can be any
     * combination of the following:
     *
     * - {@link XRTRACKABLE_POINT}: Point - indicates that the hit test results will be computed
     * based on the feature points detected by the underlying Augmented Reality system.
     * - {@link XRTRACKABLE_PLANE}: Plane - indicates that the hit test results will be computed
     * based on the planes detected by the underlying Augmented Reality system.
     * - {@link XRTRACKABLE_MESH}: Mesh - indicates that the hit test results will be computed
     * based on the meshes detected by the underlying Augmented Reality system.
     *
     * @param {Ray} [options.offsetRay] - Optional ray by which
     * hit test ray can be offset.
     * @param {XrHitTestStartCallback} [options.callback] - Optional callback function called once
     * hit test source is created or failed.
     * @example
     * // start hit testing from viewer position facing forwards
     * app.xr.hitTest.start({
     *     spaceType: pc.XRSPACE_VIEWER,
     *     callback: (err, hitTestSource) => {
     *         if (err) return;
     *         hitTestSource.on('result', (position, rotation) => {
     *             // position and rotation of hit test result
     *         });
     *     }
     * });
     * @example
     * // start hit testing using an arbitrary ray
     * const ray = new pc.Ray(new pc.Vec3(0, 0, 0), new pc.Vec3(0, -1, 0));
     * app.xr.hitTest.start({
     *     spaceType: pc.XRSPACE_LOCAL,
     *     offsetRay: ray,
     *     callback: (err, hitTestSource) => {
     *         // hit test source that will sample real world geometry straight down
     *         // from the position where AR session started
     *     }
     * });
     * @example
     * // start hit testing for touch screen taps
     * app.xr.hitTest.start({
     *     profile: 'generic-touchscreen',
     *     callback: (err, hitTestSource) => {
     *         if (err) return;
     *         hitTestSource.on('result', (position, rotation, inputSource) => {
     *             // position and rotation of hit test result
     *             // that will be created from touch on mobile devices
     *         });
     *     }
     * });
     */
    start(options?: {
        spaceType?: string;
        profile?: string;
        entityTypes?: string[];
        offsetRay?: Ray;
        callback?: XrHitTestStartCallback;
    }): void;
    /**
     * @param {XRHitTestSource} xrHitTestSource - Hit test source.
     * @param {boolean} transient - True if hit test source is created from transient input source.
     * @param {XrInputSource|null} inputSource - Input Source with which hit test source is associated with.
     * @param {Function} callback - Callback called once hit test source is created.
     * @private
     */
    private _onHitTestSource;
    /**
     * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
     * @ignore
     */
    update(frame: XRFrame): void;
    /**
     * True if AR Hit Test is supported.
     *
     * @type {boolean}
     */
    get supported(): boolean;
    /**
     * True if Hit Test is available. This information is available only when the session has started.
     *
     * @type {boolean}
     */
    get available(): boolean;
}
import { XrHitTestSource } from './xr-hit-test-source.js';
import { EventHandler } from '../../core/event-handler.js';
import type { Ray } from '../../core/shape/ray.js';
import type { XrManager } from './xr-manager.js';
