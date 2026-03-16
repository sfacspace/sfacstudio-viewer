/**
 * Light Estimation provides illumination data from the real world, which is estimated by the
 * underlying AR system. It provides a reflection Cube Map, that represents the reflection
 * estimation from the viewer position. A more simplified approximation of light is provided by L2
 * Spherical Harmonics data. And the most simple level of light estimation is the most prominent
 * directional light, its rotation, intensity and color.
 *
 * @category XR
 */
export class XrLightEstimation extends EventHandler {
    /**
     * Fired when light estimation data becomes available.
     *
     * @event
     * @example
     * app.xr.lightEstimation.on('available', () => {
     *     console.log('Light estimation is available');
     * });
     */
    static EVENT_AVAILABLE: string;
    /**
     * Fired when light estimation has failed to start. The handler is passed the Error object
     * related to failure of light estimation start.
     *
     * @event
     * @example
     * app.xr.lightEstimation.on('error', (error) => {
     *     console.error(error.message);
     * });
     */
    static EVENT_ERROR: string;
    /**
     * Create a new XrLightEstimation instance.
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
     * @type {boolean}
     * @private
     */
    private _lightProbeRequested;
    /**
     * @type {XRLightProbe|null}
     * @private
     */
    private _lightProbe;
    /**
     * @type {number}
     * @private
     */
    private _intensity;
    /**
     * @type {Quat}
     * @private
     */
    private _rotation;
    /**
     * @type {Color}
     * @private
     */
    private _color;
    /**
     * @type {Float32Array}
     * @private
     */
    private _sphericalHarmonics;
    /** @private */
    private _onSessionStart;
    /** @private */
    private _onSessionEnd;
    /**
     * Start estimation of illumination data. Availability of such data will come later and an
     * `available` event will be fired. If it failed to start estimation, an `error` event will be
     * fired.
     *
     * @example
     * app.xr.on('start', () => {
     *     if (app.xr.lightEstimation.supported) {
     *         app.xr.lightEstimation.start();
     *     }
     * });
     */
    start(): void;
    /**
     * End estimation of illumination data.
     */
    end(): void;
    /**
     * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
     * @ignore
     */
    update(frame: XRFrame): void;
    /**
     * True if Light Estimation is supported. This information is available only during an active AR
     * session.
     *
     * @type {boolean}
     */
    get supported(): boolean;
    /**
     * True if estimated light information is available.
     *
     * @type {boolean}
     * @example
     * if (app.xr.lightEstimation.available) {
     *     entity.light.intensity = app.xr.lightEstimation.intensity;
     * }
     */
    get available(): boolean;
    /**
     * Intensity of what is estimated to be the most prominent directional light. Or null if data
     * is not available.
     *
     * @type {number|null}
     */
    get intensity(): number | null;
    /**
     * Color of what is estimated to be the most prominent directional light. Or null if data is
     * not available.
     *
     * @type {Color|null}
     */
    get color(): Color | null;
    /**
     * Rotation of what is estimated to be the most prominent directional light. Or null if data is
     * not available.
     *
     * @type {Quat|null}
     */
    get rotation(): Quat | null;
    /**
     * Spherical harmonic coefficients of estimated ambient light. Or null if data is not available.
     *
     * @type {Float32Array|null}
     */
    get sphericalHarmonics(): Float32Array | null;
}
import { EventHandler } from '../../core/event-handler.js';
import { Color } from '../../core/math/color.js';
import { Quat } from '../../core/math/quat.js';
import type { XrManager } from './xr-manager.js';
