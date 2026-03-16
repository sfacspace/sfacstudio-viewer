/**
 * @import { XrManager } from './xr-manager.js'
 */
/**
 * Provides access to input sources for WebXR.
 *
 * Input sources represent:
 *
 * - hand held controllers - and their optional capabilities: gamepad and vibration
 * - hands - with their individual joints
 * - transient sources - such as touch screen taps and voice commands
 *
 * @category XR
 */
export class XrInput extends EventHandler {
    /**
     * Fired when a new {@link XrInputSource} is added to the list. The handler is passed the
     * {@link XrInputSource} that has been added.
     *
     * @event
     * @example
     * app.xr.input.on('add', (inputSource) => {
     *     // new input source is added
     * });
     */
    static EVENT_ADD: string;
    /**
     * Fired when an {@link XrInputSource} is removed from the list. The handler is passed the
     * {@link XrInputSource} that has been removed.
     *
     * @event
     * @example
     * app.xr.input.on('remove', (inputSource) => {
     *     // input source is removed
     * });
     */
    static EVENT_REMOVE: string;
    /**
     * Fired when {@link XrInputSource} has triggered primary action. This could be pressing a
     * trigger button, or touching a screen. The handler is passed the {@link XrInputSource} that
     * triggered the `select` event and the XRInputSourceEvent event from the WebXR API.
     *
     * @event
     * @example
     * const ray = new pc.Ray();
     * app.xr.input.on('select', (inputSource, evt) => {
     *     ray.set(inputSource.getOrigin(), inputSource.getDirection());
     *     if (obj.intersectsRay(ray)) {
     *         // selected an object with input source
     *     }
     * });
     */
    static EVENT_SELECT: string;
    /**
     * Fired when {@link XrInputSource} has started to trigger primary action. The handler is
     * passed the {@link XrInputSource} that triggered the `selectstart` event and the
     * XRInputSourceEvent event from the WebXR API.
     *
     * @event
     * @example
     * app.xr.input.on('selectstart', (inputSource, evt) => {
     *     console.log('Select started');
     * });
     */
    static EVENT_SELECTSTART: string;
    /**
     * Fired when {@link XrInputSource} has ended triggering primary action. The handler is passed
     * the {@link XrInputSource} that triggered the `selectend` event and the XRInputSourceEvent
     * event from the WebXR API.
     *
     * @event
     * @example
     * app.xr.input.on('selectend', (inputSource, evt) => {
     *     console.log('Select ended');
     * });
     */
    static EVENT_SELECTEND: string;
    /**
     * Fired when {@link XrInputSource} has triggered squeeze action. This is associated with
     * "grabbing" action on the controllers. The handler is passed the {@link XrInputSource} that
     * triggered the `squeeze` event and the XRInputSourceEvent event from the WebXR API.
     *
     * @event
     * @example
     * app.xr.input.on('squeeze', (inputSource, evt) => {
     *     console.log('Squeeze');
     * });
     */
    static EVENT_SQUEEZE: string;
    /**
     * Fired when {@link XrInputSource} has started to trigger squeeze action. The handler is
     * passed the {@link XrInputSource} that triggered the `squeezestart` event and the
     * XRInputSourceEvent event from the WebXR API.
     *
     * @event
     * @example
     * app.xr.input.on('squeezestart', (inputSource, evt) => {
     *     if (obj.containsPoint(inputSource.getPosition())) {
     *         // grabbed an object
     *     }
     * });
     */
    static EVENT_SQUEEZESTART: string;
    /**
     * Fired when {@link XrInputSource} has ended triggering squeeze action. The handler is passed
     * the {@link XrInputSource} that triggered the `squeezeend` event and the XRInputSourceEvent
     * event from the WebXR API.
     *
     * @event
     * @example
     * app.xr.input.on('squeezeend', (inputSource, evt) => {
     *     console.log('Squeeze ended');
     * });
     */
    static EVENT_SQUEEZEEND: string;
    /**
     * Create a new XrInput instance.
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
     * @type {XrInputSource[]}
     * @private
     */
    private _inputSources;
    /**
     * @type {Function}
     * @private
     */
    private _onInputSourcesChangeEvt;
    /**
     * @type {boolean}
     * @ignore
     */
    velocitiesSupported: boolean;
    /** @private */
    private _onSessionStart;
    /** @private */
    private _onSessionEnd;
    /**
     * @param {XRInputSourcesChangeEvent} evt - WebXR input sources change event.
     * @private
     */
    private _onInputSourcesChange;
    /**
     * @param {XRInputSource} xrInputSource - Input source to search for.
     * @returns {XrInputSource|null} The input source that matches the given WebXR input source or
     * null if no match is found.
     * @private
     */
    private _getByInputSource;
    /**
     * @param {XRInputSource} xrInputSource - Input source to add.
     * @private
     */
    private _addInputSource;
    /**
     * @param {XRInputSource} xrInputSource - Input source to remove.
     * @private
     */
    private _removeInputSource;
    /**
     * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
     * @ignore
     */
    update(frame: XRFrame): void;
    /**
     * List of active {@link XrInputSource} instances.
     *
     * @type {XrInputSource[]}
     */
    get inputSources(): XrInputSource[];
}
import { EventHandler } from '../../core/event-handler.js';
import { XrInputSource } from './xr-input-source.js';
import type { XrManager } from './xr-manager.js';
