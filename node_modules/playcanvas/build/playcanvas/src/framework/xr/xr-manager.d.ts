/**
 * Callback used by {@link XrManager#start} and {@link XrManager#end}.
 */
export type XrErrorCallback = (err: Error | null) => void;
/**
 * Callback used by {@link XrManager#initiateRoomCapture}.
 */
export type XrRoomCaptureCallback = (err: Error | null) => void;
/**
 * @import { AppBase } from '../app-base.js'
 * @import { CameraComponent } from '../components/camera/component.js'
 * @import { Entity } from '../entity.js'
 */
/**
 * @callback XrErrorCallback
 * Callback used by {@link XrManager#start} and {@link XrManager#end}.
 * @param {Error|null} err - The Error object or null if operation was successful.
 * @returns {void}
 */
/**
 * @callback XrRoomCaptureCallback
 * Callback used by {@link XrManager#initiateRoomCapture}.
 * @param {Error|null} err - The Error object or null if manual room capture was successful.
 * @returns {void}
 */
/**
 * XrManager provides a comprehensive interface for WebXR integration in PlayCanvas applications.
 * It manages the full lifecycle of XR sessions (VR/AR), handles device capabilities, and provides
 * access to various XR features through specialized subsystems.
 *
 * In order for XR to be available, ensure that your application is served over HTTPS or localhost.
 *
 * The {@link AppBase} class automatically creates an instance of this class and makes it available
 * as {@link AppBase#xr}.
 *
 * @category XR
 */
export class XrManager extends EventHandler {
    /**
     * Fired when availability of the XR type is changed. This event is available in two
     * forms. They are as follows:
     *
     * 1. `available` - Fired when availability of any XR type is changed. The handler is passed
     * the session type that has changed availability and a boolean representing the availability.
     * 2. `available:[type]` - Fired when availability of specific XR type is changed. The handler
     * is passed a boolean representing the availability.
     *
     * @event
     * @example
     * app.xr.on('available', (type, available) => {
     *     console.log(`XR type ${type} is now ${available ? 'available' : 'unavailable'}`);
     * });
     * @example
     * app.xr.on(`available:${pc.XRTYPE_VR}`, (available) => {
     *     console.log(`XR type VR is now ${available ? 'available' : 'unavailable'}`);
     * });
     */
    static EVENT_AVAILABLE: string;
    /**
     * Fired when XR session is started.
     *
     * @event
     * @example
     * app.xr.on('start', () => {
     *     // XR session has started
     * });
     */
    static EVENT_START: string;
    /**
     * Fired when XR session is ended.
     *
     * @event
     * @example
     * app.xr.on('end', () => {
     *     // XR session has ended
     * });
     */
    static EVENT_END: string;
    /**
     * Fired when XR session is updated, providing relevant XRFrame object. The handler is passed
     * [XRFrame](https://developer.mozilla.org/en-US/docs/Web/API/XRFrame) object that can be used
     * for interfacing directly with WebXR APIs.
     *
     * @event
     * @example
     * app.xr.on('update', (frame) => {
     *     console.log('XR frame updated');
     * });
     */
    static EVENT_UPDATE: string;
    /**
     * Fired when XR session is failed to start or failed to check for session type support. The handler
     * is passed the [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
     * object related to failure of session start or check of session type support.
     *
     * @event
     * @example
     * app.xr.on('error', (error) => {
     *     console.error(error.message);
     * });
     */
    static EVENT_ERROR: string;
    /**
     * Create a new XrManager instance.
     *
     * @param {AppBase} app - The main application.
     * @ignore
     */
    constructor(app: AppBase);
    /**
     * @type {AppBase}
     * @ignore
     */
    app: AppBase;
    /**
     * @type {boolean}
     * @private
     */
    private _supported;
    /**
     * @type {Object<string, boolean>}
     * @private
     */
    private _available;
    /**
     * @type {string|null}
     * @private
     */
    private _type;
    /**
     * @type {string|null}
     * @private
     */
    private _spaceType;
    /**
     * @type {XRSession|null}
     * @private
     */
    private _session;
    /**
     * @type {XRWebGLLayer|null}
     * @private
     */
    private _baseLayer;
    /**
     * @type {XRWebGLBinding|null}
     * @ignore
     */
    webglBinding: XRWebGLBinding | null;
    /**
     * @type {XRReferenceSpace|null}
     * @ignore
     */
    _referenceSpace: XRReferenceSpace | null;
    /**
     * Provides access to DOM overlay capabilities.
     *
     * @type {XrDomOverlay}
     */
    domOverlay: XrDomOverlay;
    /**
     * Provides the ability to perform hit tests on the representation of real world geometry
     * of the underlying AR system.
     *
     * @type {XrHitTest}
     */
    hitTest: XrHitTest;
    /**
     * Provides access to image tracking capabilities.
     *
     * @type {XrImageTracking}
     */
    imageTracking: XrImageTracking;
    /**
     * Provides access to plane detection capabilities.
     *
     * @type {XrPlaneDetection}
     */
    planeDetection: XrPlaneDetection;
    /**
     * Provides access to mesh detection capabilities.
     *
     * @type {XrMeshDetection}
     */
    meshDetection: XrMeshDetection;
    /**
     * Provides access to Input Sources.
     *
     * @type {XrInput}
     */
    input: XrInput;
    /**
     * Provides access to light estimation capabilities.
     *
     * @type {XrLightEstimation}
     */
    lightEstimation: XrLightEstimation;
    /**
     * Provides access to views and their capabilities.
     *
     * @type {XrViews}
     */
    views: XrViews;
    /**
     * Provides access to Anchors.
     *
     * @type {XrAnchors}
     */
    anchors: XrAnchors;
    /**
     * @type {CameraComponent|null}
     * @private
     */
    private _camera;
    /**
     * @type {Vec3}
     * @private
     */
    private _localPosition;
    /**
     * @type {Quat}
     * @private
     */
    private _localRotation;
    /**
     * @type {number}
     * @private
     */
    private _depthNear;
    /**
     * @type {number}
     * @private
     */
    private _depthFar;
    /**
     * @type {number[]|null}
     * @private
     */
    private _supportedFrameRates;
    /**
     * @type {number}
     * @private
     */
    private _width;
    /**
     * @type {number}
     * @private
     */
    private _height;
    /**
     * @type {number}
     * @private
     */
    private _framebufferScaleFactor;
    /**
     * Destroys the XrManager instance.
     *
     * @ignore
     */
    destroy(): void;
    /**
     * Attempts to start XR session for provided {@link CameraComponent} and optionally fires
     * callback when session is created or failed to create. Integrated XR APIs need to be enabled
     * by providing relevant options.
     *
     * Note that the start method needs to be called in response to user action, such as a button
     * click. It will not work if called in response to a timer or other event.
     *
     * @param {CameraComponent} camera - It will be used to render XR session and manipulated based
     * on pose tracking.
     * @param {string} type - Session type. Can be one of the following:
     *
     * - {@link XRTYPE_INLINE}: Inline - always available type of session. It has limited features
     * availability and is rendered into HTML element.
     * - {@link XRTYPE_VR}: Immersive VR - session that provides exclusive access to VR device with
     * best available tracking features.
     * - {@link XRTYPE_AR}: Immersive AR - session that provides exclusive access to VR/AR device
     * that is intended to be blended with real-world environment.
     *
     * @param {string} spaceType - Reference space type. Can be one of the following:
     *
     * - {@link XRSPACE_VIEWER}: Viewer - always supported space with some basic tracking
     * capabilities.
     * - {@link XRSPACE_LOCAL}: Local - represents a tracking space with a native origin near the
     * viewer at the time of creation. It is meant for seated or basic local XR sessions.
     * - {@link XRSPACE_LOCALFLOOR}: Local Floor - represents a tracking space with a native origin
     * at the floor in a safe position for the user to stand. The y axis equals 0 at floor level.
     * Floor level value might be estimated by the underlying platform. It is meant for seated or
     * basic local XR sessions.
     * - {@link XRSPACE_BOUNDEDFLOOR}: Bounded Floor - represents a tracking space with its native
     * origin at the floor, where the user is expected to move within a pre-established boundary.
     * - {@link XRSPACE_UNBOUNDED}: Unbounded - represents a tracking space where the user is
     * expected to move freely around their environment, potentially long distances from their
     * starting point.
     *
     * @param {object} [options] - Object with additional options for XR session initialization.
     * @param {number} [options.framebufferScaleFactor] - Framebuffer scale factor should
     * be higher than 0.0, by default 1.0 (no scaling). A value of 0.5 will reduce the resolution
     * of an XR session in half, and a value of 2.0 will double the resolution.
     * @param {string[]} [options.optionalFeatures] - Optional features for XRSession start. It is
     * used for getting access to additional WebXR spec extensions.
     * @param {boolean} [options.anchors] - Set to true to attempt to enable
     * {@link XrAnchors}.
     * @param {boolean} [options.imageTracking] - Set to true to attempt to enable
     * {@link XrImageTracking}.
     * @param {boolean} [options.planeDetection] - Set to true to attempt to enable
     * {@link XrPlaneDetection}.
     * @param {boolean} [options.meshDetection] - Set to true to attempt to enable
     * {@link XrMeshDetection}.
     * @param {XrErrorCallback} [options.callback] - Optional callback function called once session
     * is started. The callback has one argument Error - it is null if successfully started XR
     * session.
     * @param {object} [options.depthSensing] - Optional object with parameters to attempt to enable
     * depth sensing.
     * @param {string} [options.depthSensing.usagePreference] - Optional usage preference for depth
     * sensing, can be 'cpu-optimized' or 'gpu-optimized' (XRDEPTHSENSINGUSAGE_*), defaults to
     * 'cpu-optimized'. Most preferred and supported will be chosen by the underlying depth sensing
     * system.
     * @param {string} [options.depthSensing.dataFormatPreference] - Optional data format
     * preference for depth sensing, can be 'luminance-alpha' or 'float32'
     * (XRDEPTHSENSINGFORMAT_*), defaults to 'luminance-alpha'. Most preferred and supported will
     * be chosen by the underlying depth sensing system.
     * @example
     * button.on('click', () => {
     *     app.xr.start(camera, pc.XRTYPE_VR, pc.XRSPACE_LOCALFLOOR);
     * });
     * @example
     * button.on('click', () => {
     *     app.xr.start(camera, pc.XRTYPE_AR, pc.XRSPACE_LOCALFLOOR, {
     *         anchors: true,
     *         imageTracking: true,
     *         depthSensing: { }
     *     });
     * });
     */
    start(camera: CameraComponent, type: string, spaceType: string, options?: {
        framebufferScaleFactor?: number;
        optionalFeatures?: string[];
        anchors?: boolean;
        imageTracking?: boolean;
        planeDetection?: boolean;
        meshDetection?: boolean;
        callback?: XrErrorCallback;
        depthSensing?: {
            usagePreference?: string;
            dataFormatPreference?: string;
        };
    }): void;
    /**
     * @param {string} type - Session type.
     * @param {string} spaceType - Reference space type.
     * @param {*} options - Session options.
     * @param {XrErrorCallback} callback - Error callback.
     * @private
     */
    private _onStartOptionsReady;
    /**
     * Attempts to end XR session and optionally fires callback when session is ended or failed to
     * end.
     *
     * @param {XrErrorCallback} [callback] - Optional callback function called once session is
     * started. The callback has one argument Error - it is null if successfully started XR
     * session.
     * @example
     * app.keyboard.on('keydown', (evt) => {
     *     if (evt.key === pc.KEY_ESCAPE && app.xr.active) {
     *         app.xr.end();
     *     }
     * });
     */
    end(callback?: XrErrorCallback): void;
    /**
     * Check if the specified type of session is available.
     *
     * @param {string} type - Session type. Can be one of the following:
     *
     * - {@link XRTYPE_INLINE}: Inline - always available type of session. It has limited features
     * availability and is rendered into HTML element.
     * - {@link XRTYPE_VR}: Immersive VR - session that provides exclusive access to VR device with
     * best available tracking features.
     * - {@link XRTYPE_AR}: Immersive AR - session that provides exclusive access to VR/AR device
     * that is intended to be blended with real-world environment.
     *
     * @example
     * if (app.xr.isAvailable(pc.XRTYPE_VR)) {
     *     // VR is available
     * }
     * @returns {boolean} True if the specified session type is available.
     */
    isAvailable(type: string): boolean;
    /** @private */
    private _deviceAvailabilityCheck;
    /**
     * Initiate manual room capture. If the underlying XR system supports manual capture of the
     * room, it will start the capturing process, which can affect plane and mesh detection,
     * and improve hit-test quality against real-world geometry.
     *
     * @param {XrRoomCaptureCallback} callback - Callback that will be fired once capture is complete
     * or failed.
     *
     * @example
     * this.app.xr.initiateRoomCapture((err) => {
     *     if (err) {
     *         // capture failed
     *         return;
     *     }
     *     // capture was successful
     * });
     */
    initiateRoomCapture(callback: XrRoomCaptureCallback): void;
    /**
     * Update target frame rate of an XR session to one of supported value provided by
     * supportedFrameRates list.
     *
     * @param {number} frameRate - Target frame rate. It should be any value from the list
     * of supportedFrameRates.
     * @param {Function} [callback] - Callback that will be called when frameRate has been
     * updated or failed to update with error provided.
     */
    updateTargetFrameRate(frameRate: number, callback?: Function): void;
    /**
     * @param {string} type - Session type.
     * @private
     */
    private _sessionSupportCheck;
    /**
     * @param {XRSession} session - XR session.
     * @param {string} spaceType - Space type to request for the session.
     * @param {Function} callback - Callback to call when session is started.
     * @private
     */
    private _onSessionStart;
    /**
     * @param {number} near - Near plane distance.
     * @param {number} far - Far plane distance.
     * @private
     */
    private _setClipPlanes;
    _createBaseLayer(): void;
    /** @private */
    private _onDeviceLost;
    /** @private */
    private _onDeviceRestored;
    /**
     * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
     * @returns {boolean} True if update was successful, false otherwise.
     * @ignore
     */
    update(frame: XRFrame): boolean;
    /**
     * True if XR is supported.
     *
     * @type {boolean}
     */
    get supported(): boolean;
    /**
     * True if XR session is running.
     *
     * @type {boolean}
     */
    get active(): boolean;
    /**
     * Returns type of currently running XR session or null if no session is running. Can be any of
     * XRTYPE_*.
     *
     * @type {string|null}
     */
    get type(): string | null;
    /**
     * Returns reference space type of currently running XR session or null if no session is
     * running. Can be any of XRSPACE_*.
     *
     * @type {string|null}
     */
    get spaceType(): string | null;
    /**
     * Provides access to XRSession of WebXR.
     *
     * @type {XRSession|null}
     */
    get session(): XRSession | null;
    /**
     * XR session frameRate or null if this information is not available. This value can change
     * during an active XR session.
     *
     * @type {number|null}
     */
    get frameRate(): number | null;
    /**
     * List of supported frame rates, or null if this data is not available.
     *
     * @type {number[]|null}
     */
    get supportedFrameRates(): number[] | null;
    /**
     * Framebuffer scale factor. This value is read-only and can only be set when starting a new
     * XR session.
     *
     * @type {number}
     */
    get framebufferScaleFactor(): number;
    /**
     * Set fixed foveation to the value between 0 and 1. Where 0 is no foveation and 1 is highest
     * foveation. It only can be set during an active XR session. Fixed foveation will reduce the
     * resolution of the back buffer at the edges of the screen, which can improve rendering
     * performance.
     *
     * @type {number}
     */
    set fixedFoveation(value: number | null);
    /**
     * Gets the current fixed foveation level, which is between 0 and 1. 0 is no forveation and 1
     * is highest foveation. If fixed foveation is not supported, this value returns null.
     *
     * @type {number|null}
     */
    get fixedFoveation(): number | null;
    /**
     * Active camera for which XR session is running or null.
     *
     * @type {Entity|null}
     */
    get camera(): Entity | null;
    /**
     * Indicates whether WebXR content is currently visible to the user, and if it is, whether it's
     * the primary focus. Can be 'hidden', 'visible' or 'visible-blurred'.
     *
     * @type {"hidden"|"visible"|"visible-blurred"|null}
     * @ignore
     */
    get visibilityState(): "hidden" | "visible" | "visible-blurred" | null;
}
import { EventHandler } from '../../core/event-handler.js';
import type { AppBase } from '../app-base.js';
import { XrDomOverlay } from './xr-dom-overlay.js';
import { XrHitTest } from './xr-hit-test.js';
import { XrImageTracking } from './xr-image-tracking.js';
import { XrPlaneDetection } from './xr-plane-detection.js';
import { XrMeshDetection } from './xr-mesh-detection.js';
import { XrInput } from './xr-input.js';
import { XrLightEstimation } from './xr-light-estimation.js';
import { XrViews } from './xr-views.js';
import { XrAnchors } from './xr-anchors.js';
import type { CameraComponent } from '../components/camera/component.js';
import type { Entity } from '../entity.js';
