/**
 * Represents XR hit test source, which provides access to hit results of real world geometry from
 * AR session.
 *
 * ```javascript
 * // start a hit test from a viewer origin forward
 * app.xr.hitTest.start({
 *     spaceType: pc.XRSPACE_VIEWER,
 *     callback: (err, hitTestSource) => {
 *         if (err) return;
 *         // subscribe to hit test results
 *         hitTestSource.on('result', (position, rotation, inputSource, hitTestResult) => {
 *             // position and rotation of hit test result
 *         });
 *     }
 * });
 * ```
 *
 * @category XR
 */
export class XrHitTestSource extends EventHandler {
    /**
     * Fired when {@link XrHitTestSource} is removed.
     *
     * @event
     * @example
     * hitTestSource.once('remove', () => {
     *     // hit test source has been removed
     * });
     */
    static EVENT_REMOVE: string;
    /**
     * Fired when the hit test source receives new results. It provides transform information that
     * tries to match real world geometry. Callback provides the {@link Vec3} position, the
     * {@link Quat} rotation, the {@link XrInputSource} (if it is a transient hit test source)
     * and the [XRHitTestResult](https://developer.mozilla.org/en-US/docs/Web/API/XRHitTestResult)
     * object that is created by WebXR API.
     *
     * @event
     * @example
     * hitTestSource.on('result', (position, rotation, inputSource, hitTestResult) => {
     *     target.setPosition(position);
     *     target.setRotation(rotation);
     * });
     */
    static EVENT_RESULT: string;
    /**
     * Create a new XrHitTestSource instance.
     *
     * @param {XrManager} manager - WebXR Manager.
     * @param {XRHitTestSource} xrHitTestSource - XRHitTestSource object that is created by WebXR API.
     * @param {boolean} transient - True if XRHitTestSource created for input source profile.
     * @param {null|XrInputSource} inputSource - Input Source for which hit test is created for, or null.
     * @ignore
     */
    constructor(manager: XrManager, xrHitTestSource: XRHitTestSource, transient: boolean, inputSource?: null | XrInputSource);
    /**
     * @type {XrManager}
     * @private
     */
    private manager;
    /**
     * @type {XRHitTestSource}
     * @private
     */
    private _xrHitTestSource;
    /**
     * @type {boolean}
     * @private
     */
    private _transient;
    /**
     * @type {null|XrInputSource}
     * @private
     */
    private _inputSource;
    /**
     * Stop and remove hit test source.
     */
    remove(): void;
    /** @ignore */
    onStop(): void;
    /**
     * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
     * @ignore
     */
    update(frame: XRFrame): void;
    /**
     * @param {XRTransientInputHitTestResult[]} results - Hit test results.
     * @param {null|XrInputSource} inputSource - Input source.
     * @private
     */
    private updateHitResults;
}
import { EventHandler } from '../../core/event-handler.js';
import type { XrManager } from './xr-manager.js';
import type { XrInputSource } from './xr-input-source.js';
