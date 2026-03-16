/**
 * @import { XrManager } from './xr-manager.js'
 */
/**
 * Provides access to list of {@link XrView}s and information about their capabilities, such as
 * support and availability of view's camera color texture, depth texture and other parameters.
 *
 * @category XR
 */
export class XrViews extends EventHandler {
    /**
     * Fired when a view has been added. Views are not available straight away on session start and
     * are added mid-session. They can be added/removed mid session by the underlying system. The
     * handler is passed the {@link XrView} that has been added.
     *
     * @event
     * @example
     * xr.views.on('add', (view) => {
     *     console.log('View added');
     * });
     */
    static EVENT_ADD: string;
    /**
     * Fired when a view has been removed. They can be added/removed mid session by the underlying
     * system. The handler is passed the {@link XrView} that has been removed.
     *
     * @event
     * @example
     * xr.views.on('remove', (view) => {
     *     console.log('View removed');
     * });
     */
    static EVENT_REMOVE: string;
    /**
     * Create a new XrViews instance.
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
     * @type {Map<string,XrView>}
     * @private
     */
    private _index;
    /**
     * @type {Map<string,XrView>}
     * @private
     */
    private _indexTmp;
    /**
     * @type {XrView[]}
     * @private
     */
    private _list;
    /**
     * @type {boolean}
     * @private
     */
    private _supportedColor;
    /**
     * @type {boolean}
     * @private
     */
    private _supportedDepth;
    /**
     * @type {boolean}
     * @private
     */
    private _availableColor;
    /**
     * @type {boolean}
     * @private
     */
    private _availableDepth;
    /**
     * @type {string}
     * @private
     */
    private _depthUsage;
    /**
     * @type {string}
     * @private
     */
    private _depthFormat;
    /**
     * @type {object}
     * @private
     */
    private _depthFormats;
    /**
     * An array of {@link XrView}s of this session. Views are not available straight away on
     * session start, and can be added/removed mid-session. So use of `add`/`remove` events is
     * required for accessing views.
     *
     * @type {XrView[]}
     */
    get list(): XrView[];
    /**
     * Check if Camera Color is supported. It might be still unavailable even if requested,
     * based on hardware capabilities and granted permissions.
     *
     * @type {boolean}
     */
    get supportedColor(): boolean;
    /**
     * Check if Camera Depth is supported. It might be still unavailable even if requested,
     * based on hardware capabilities and granted permissions.
     *
     * @type {boolean}
     */
    get supportedDepth(): boolean;
    /**
     * Check if Camera Color is available. This information becomes available only after
     * session has started.
     *
     * @type {boolean}
     */
    get availableColor(): boolean;
    /**
     * Check if Camera Depth is available. This information becomes available only after
     * session has started.
     *
     * @type {boolean}
     */
    get availableDepth(): boolean;
    /**
     * @type {string}
     * @ignore
     */
    get depthUsage(): string;
    /**
     * Whether the depth sensing is GPU optimized.
     *
     * @type {boolean}
     */
    get depthGpuOptimized(): boolean;
    /**
     * @type {string}
     * @ignore
     */
    get depthFormat(): string;
    /**
     * The depth sensing pixel format. Can be:
     *
     * - {@link PIXELFORMAT_LA8}
     * - {@link PIXELFORMAT_R32F}
     *
     * @type {PIXELFORMAT_LA8|PIXELFORMAT_R32F|null}
     */
    get depthPixelFormat(): 2 | 15 | null;
    /**
     * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
     * @param {XRView} xrView - XRView from WebXR API.
     * @ignore
     */
    update(frame: XRFrame, xrViews: any): void;
    /**
     * Get an {@link XrView} by its associated eye constant.
     *
     * @param {string} eye - An XREYE_* view is associated with. Can be 'none' for monoscope views.
     * @returns {XrView|null} View or null if view of such eye is not available.
     */
    get(eye: string): XrView | null;
    /**
     * @private
     */
    private _onSessionStart;
    /**
     * @private
     */
    private _onSessionEnd;
}
import { EventHandler } from '../../core/event-handler.js';
import { XrView } from './xr-view.js';
import type { XrManager } from './xr-manager.js';
