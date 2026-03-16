/**
 * @import { XrManager } from './xr-manager.js'
 */
/**
 * Mesh Detection provides the ability to detect real world meshes based on the
 * scanning and reconstruction by the underlying AR system.
 *
 * ```javascript
 * // start session with plane detection enabled
 * app.xr.start(camera, pc.XRTYPE_AR, pc.XRSPACE_LOCALFLOOR, {
 *     meshDetection: true
 * });
 * ```
 *
 * ```javascript
 * app.xr.meshDetection.on('add', (mesh) => {
 *     // new mesh been added
 * });
 * ```
 *
 * @category XR
 */
export class XrMeshDetection extends EventHandler {
    /**
     * Fired when mesh detection becomes available.
     *
     * @event
     * @example
     * app.xr.meshDetection.on('available', () => {
     *     console.log('Mesh detection is available');
     * });
     */
    static EVENT_AVAILABLE: string;
    /**
     * Fired when mesh detection becomes unavailable.
     *
     * @event
     * @example
     * app.xr.meshDetection.on('unavailable', () => {
     *     console.log('Mesh detection is unavailable');
     * });
     */
    static EVENT_UNAVAILABLE: string;
    /**
     * Fired when new {@link XrMesh} is added to the list. The handler is passed the {@link XrMesh}
     * instance that has been added.
     *
     * @event
     * @example
     * app.xr.meshDetection.on('add', (mesh) => {
     *     // a new XrMesh has been added
     * });
     */
    static EVENT_ADD: string;
    /**
     * Fired when a {@link XrMesh} is removed from the list. The handler is passed the
     * {@link XrMesh} instance that has been removed.
     *
     * @event
     * @example
     * app.xr.meshDetection.on('remove', (mesh) => {
     *     // XrMesh has been removed
     * });
     */
    static EVENT_REMOVE: string;
    /**
     * Create a new XrMeshDetection instance.
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
     * @type {Map<XRMesh, XrMesh>}
     * @private
     */
    private _index;
    /**
     * @type {XrMesh[]}
     * @private
     */
    private _list;
    /**
     * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
     * @ignore
     */
    update(frame: XRFrame): void;
    /**
     * @param {XrMesh} mesh - XrMesh to remove.
     * @private
     */
    private _removeMesh;
    /** @private */
    private _onSessionStart;
    /** @private */
    private _onSessionEnd;
    /**
     * True if Mesh Detection is supported.
     *
     * @type {boolean}
     */
    get supported(): boolean;
    /**
     * True if Mesh Detection is available. This information is available only when session has started.
     *
     * @type {boolean}
     */
    get available(): boolean;
    /**
     * Array of {@link XrMesh} instances that contain transform, vertices and label information.
     *
     * @type {XrMesh[]}
     */
    get meshes(): XrMesh[];
}
import { EventHandler } from '../../core/event-handler.js';
import { XrMesh } from './xr-mesh.js';
import type { XrManager } from './xr-manager.js';
