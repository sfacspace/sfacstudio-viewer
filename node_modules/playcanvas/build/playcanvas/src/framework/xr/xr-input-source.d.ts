/**
 * Represents XR input source, which is any input mechanism which allows the user to perform
 * targeted actions in the same virtual space as the viewer. Example XR input sources include, but
 * are not limited to: handheld controllers, optically tracked hands, touch screen taps, and
 * gaze-based input methods that operate on the viewer's pose.
 *
 * @category XR
 */
export class XrInputSource extends EventHandler {
    /**
     * Fired when {@link XrInputSource} is removed.
     *
     * @event
     * @example
     * inputSource.once('remove', () => {
     *     // input source is not available anymore
     * });
     */
    static EVENT_REMOVE: string;
    /**
     * Fired when input source has triggered primary action. This could be pressing a trigger
     * button, or touching a screen. The handler is passed an
     * [XRInputSourceEvent](https://developer.mozilla.org/en-US/docs/Web/API/XRInputSourceEvent)
     * object from the WebXR API.
     *
     * @event
     * @example
     * const ray = new pc.Ray();
     * inputSource.on('select', (evt) => {
     *     ray.set(inputSource.getOrigin(), inputSource.getDirection());
     *     if (obj.intersectsRay(ray)) {
     *         // selected an object with input source
     *     }
     * });
     */
    static EVENT_SELECT: string;
    /**
     * Fired when input source has started to trigger primary action. The handler is passed an
     * [XRInputSourceEvent](https://developer.mozilla.org/en-US/docs/Web/API/XRInputSourceEvent)
     * object from the WebXR API.
     *
     * @event
     * @example
     * inputSource.on('selectstart', (evt) => {
     *     console.log('Select started');
     * });
     */
    static EVENT_SELECTSTART: string;
    /**
     * Fired when input source has ended triggering primary action. The handler is passed an
     * [XRInputSourceEvent](https://developer.mozilla.org/en-US/docs/Web/API/XRInputSourceEvent)
     * object from the WebXR API.
     *
     * @event
     * @example
     * inputSource.on('selectend', (evt) => {
     *     console.log('Select ended');
     * });
     */
    static EVENT_SELECTEND: string;
    /**
     * Fired when input source has triggered squeeze action. This is associated with "grabbing"
     * action on the controllers. The handler is passed an
     * [XRInputSourceEvent](https://developer.mozilla.org/en-US/docs/Web/API/XRInputSourceEvent)
     * object from the WebXR API.
     *
     * @event
     * @example
     * inputSource.on('squeeze', (evt) => {
     *     console.log('Squeeze');
     * });
     */
    static EVENT_SQUEEZE: string;
    /**
     * Fired when input source has started to trigger squeeze action. The handler is passed an
     * [XRInputSourceEvent](https://developer.mozilla.org/en-US/docs/Web/API/XRInputSourceEvent)
     * object from the WebXR API.
     *
     * @event
     * @example
     * inputSource.on('squeezestart', (evt) => {
     *     if (obj.containsPoint(inputSource.getPosition())) {
     *         // grabbed an object
     *     }
     * });
     */
    static EVENT_SQUEEZESTART: string;
    /**
     * Fired when input source has ended triggering squeeze action. The handler is passed an
     * [XRInputSourceEvent](https://developer.mozilla.org/en-US/docs/Web/API/XRInputSourceEvent)
     * object from the WebXR API.
     *
     * @event
     * @example
     * inputSource.on('squeezeend', (evt) => {
     *     console.log('Squeeze ended');
     * });
     */
    static EVENT_SQUEEZEEND: string;
    /**
     * Fired when new {@link XrHitTestSource} is added to the input source. The handler is passed
     * the {@link XrHitTestSource} object that has been added.
     *
     * @event
     * @example
     * inputSource.on('hittest:add', (hitTestSource) => {
     *     // new hit test source is added
     * });
     */
    static EVENT_HITTESTADD: string;
    /**
     * Fired when {@link XrHitTestSource} is removed to the the input source. The handler is passed
     * the {@link XrHitTestSource} object that has been removed.
     *
     * @event
     * @example
     * inputSource.on('remove', (hitTestSource) => {
     *     // hit test source is removed
     * });
     */
    static EVENT_HITTESTREMOVE: string;
    /**
     * Fired when hit test source receives new results. It provides transform information that
     * tries to match real world picked geometry. The handler is passed the {@link XrHitTestSource}
     * object that produced the hit result, the {@link Vec3} position, the {@link Quat}
     * rotation and the [XRHitTestResult](https://developer.mozilla.org/en-US/docs/Web/API/XRHitTestResult)
     * object that is created by the WebXR API.
     *
     * @event
     * @example
     * inputSource.on('hittest:result', (hitTestSource, position, rotation, hitTestResult) => {
     *     target.setPosition(position);
     *     target.setRotation(rotation);
     * });
     */
    static EVENT_HITTESTRESULT: string;
    /**
     * Create a new XrInputSource instance.
     *
     * @param {XrManager} manager - WebXR Manager.
     * @param {XRInputSource} xrInputSource - A WebXR input source.
     * @ignore
     */
    constructor(manager: XrManager, xrInputSource: XRInputSource);
    /**
     * @type {number}
     * @private
     */
    private _id;
    /**
     * @type {XrManager}
     * @private
     */
    private _manager;
    /**
     * @type {XRInputSource}
     * @private
     */
    private _xrInputSource;
    /**
     * @type {Ray}
     * @private
     */
    private _ray;
    /**
     * @type {Ray}
     * @private
     */
    private _rayLocal;
    /**
     * @type {boolean}
     * @private
     */
    private _grip;
    /**
     * @type {XrHand|null}
     * @private
     */
    private _hand;
    /**
     * @type {boolean}
     * @private
     */
    private _velocitiesAvailable;
    /**
     * @type {number}
     * @private
     */
    private _velocitiesTimestamp;
    /**
     * @type {Mat4|null}
     * @private
     */
    private _localTransform;
    /**
     * @type {Mat4|null}
     * @private
     */
    private _worldTransform;
    /**
     * @type {Vec3}
     * @private
     */
    private _position;
    /**
     * @type {Quat}
     * @private
     */
    private _rotation;
    /**
     * @type {Vec3|null}
     * @private
     */
    private _localPosition;
    /**
     * @type {Vec3|null}
     * @private
     */
    private _localPositionLast;
    /**
     * @type {Quat|null}
     * @private
     */
    private _localRotation;
    /**
     * @type {Vec3|null}
     * @private
     */
    private _linearVelocity;
    /**
     * @type {boolean}
     * @private
     */
    private _dirtyLocal;
    /**
     * @type {boolean}
     * @private
     */
    private _dirtyRay;
    /**
     * @type {boolean}
     * @private
     */
    private _selecting;
    /**
     * @type {boolean}
     * @private
     */
    private _squeezing;
    /**
     * @type {boolean}
     * @private
     */
    private _elementInput;
    /**
     * @type {Entity|null}
     * @private
     */
    private _elementEntity;
    /**
     * @type {XrHitTestSource[]}
     * @private
     */
    private _hitTestSources;
    /**
     * Unique number associated with instance of input source. Same physical devices when
     * reconnected will not share this ID.
     *
     * @type {number}
     */
    get id(): number;
    /**
     * XRInputSource object that is associated with this input source.
     *
     * @type {XRInputSource}
     */
    get inputSource(): XRInputSource;
    /**
     * Type of ray Input Device is based on. Can be one of the following:
     *
     * - {@link XRTARGETRAY_GAZE}: Gaze - indicates the target ray will originate at the viewer and
     * follow the direction it is facing. This is commonly referred to as a "gaze input" device in
     * the context of head-mounted displays.
     * - {@link XRTARGETRAY_SCREEN}: Screen - indicates that the input source was an interaction
     * with the canvas element associated with an inline session's output context, such as a mouse
     * click or touch event.
     * - {@link XRTARGETRAY_POINTER}: Tracked Pointer - indicates that the target ray originates
     * from either a handheld device or other hand-tracking mechanism and represents that the user
     * is using their hands or the held device for pointing.
     *
     * @type {string}
     */
    get targetRayMode(): string;
    /**
     * Describes which hand input source is associated with. Can be one of the following:
     *
     * - {@link XRHAND_NONE}: None - input source is not meant to be held in hands.
     * - {@link XRHAND_LEFT}: Left - indicates that input source is meant to be held in left hand.
     * - {@link XRHAND_RIGHT}: Right - indicates that input source is meant to be held in right
     * hand.
     *
     * @type {string}
     */
    get handedness(): string;
    /**
     * List of input profile names indicating both the preferred visual representation and behavior
     * of the input source.
     *
     * @type {string[]}
     */
    get profiles(): string[];
    /**
     * If input source can be held, then it will have node with its world transformation, that can
     * be used to position and rotate visual object based on it.
     *
     * @type {boolean}
     */
    get grip(): boolean;
    /**
     * If input source is a tracked hand, then it will point to {@link XrHand} otherwise it is
     * null.
     *
     * @type {XrHand|null}
     */
    get hand(): XrHand | null;
    /**
     * If input source has buttons, triggers, thumbstick or touchpad, then this object provides
     * access to its states.
     *
     * @type {Gamepad|null}
     */
    get gamepad(): Gamepad | null;
    /**
     * True if input source is in active primary action between selectstart and selectend events.
     *
     * @type {boolean}
     */
    get selecting(): boolean;
    /**
     * True if input source is in active squeeze action between squeezestart and squeezeend events.
     *
     * @type {boolean}
     */
    get squeezing(): boolean;
    /**
     * Sets whether the input source can interact with {@link ElementComponent}s. Defaults to true.
     *
     * @type {boolean}
     */
    set elementInput(value: boolean);
    /**
     * Gets whether the input source can interact with {@link ElementComponent}s.
     *
     * @type {boolean}
     */
    get elementInput(): boolean;
    /**
     * If {@link XrInputSource#elementInput} is true, this property will hold entity with Element
     * component at which this input source is hovering, or null if not hovering over any element.
     *
     * @type {Entity|null}
     */
    get elementEntity(): Entity | null;
    /**
     * List of active {@link XrHitTestSource} instances associated with this input source.
     *
     * @type {XrHitTestSource[]}
     */
    get hitTestSources(): XrHitTestSource[];
    /**
     * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
     * @ignore
     */
    update(frame: XRFrame): void;
    /** @private */
    private _updateTransforms;
    /** @private */
    private _updateRayTransforms;
    /**
     * Get the world space position of input source if it is handheld ({@link XrInputSource#grip}
     * is true). Otherwise it will return null.
     *
     * @returns {Vec3|null} The world space position of handheld input source.
     */
    getPosition(): Vec3 | null;
    /**
     * Get the local space position of input source if it is handheld ({@link XrInputSource#grip}
     * is true). Local space is relative to parent of the XR camera. Otherwise it will return null.
     *
     * @returns {Vec3|null} The world space position of handheld input source.
     */
    getLocalPosition(): Vec3 | null;
    /**
     * Get the world space rotation of input source if it is handheld ({@link XrInputSource#grip}
     * is true). Otherwise it will return null.
     *
     * @returns {Quat|null} The world space rotation of handheld input source.
     */
    getRotation(): Quat | null;
    /**
     * Get the local space rotation of input source if it is handheld ({@link XrInputSource#grip}
     * is true). Local space is relative to parent of the XR camera. Otherwise it will return null.
     *
     * @returns {Quat|null} The world space rotation of handheld input source.
     */
    getLocalRotation(): Quat | null;
    /**
     * Get the linear velocity (units per second) of the input source if it is handheld
     * ({@link XrInputSource#grip} is true). Otherwise it will return null.
     *
     * @returns {Vec3|null} The world space linear velocity of the handheld input source.
     */
    getLinearVelocity(): Vec3 | null;
    /**
     * Get the world space origin of input source ray.
     *
     * @returns {Vec3} The world space origin of input source ray.
     */
    getOrigin(): Vec3;
    /**
     * Get the world space direction of input source ray.
     *
     * @returns {Vec3} The world space direction of input source ray.
     */
    getDirection(): Vec3;
    /**
     * Attempts to start hit test source based on this input source.
     *
     * @param {object} [options] - Object for passing optional arguments.
     * @param {string[]} [options.entityTypes] - Optional list of underlying entity types against
     * which hit tests will be performed. Defaults to [{@link XRTRACKABLE_PLANE}]. Can be any
     * combination of the following:
     *
     * - {@link XRTRACKABLE_POINT}: Point - indicates that the hit test results will be computed
     * based on the feature points detected by the underlying Augmented Reality system.
     * - {@link XRTRACKABLE_PLANE}: Plane - indicates that the hit test results will be computed
     * based on the planes detected by the underlying Augmented Reality system.
     * - {@link XRTRACKABLE_MESH}: Mesh - indicates that the hit test results will be computed
     * based on the meshes detected by the underlying Augmented Reality system.
     *
     * @param {Ray} [options.offsetRay] - Optional ray by which hit test ray can be offset.
     * @param {XrHitTestStartCallback} [options.callback] - Optional callback function called once
     * hit test source is created or failed.
     * @example
     * app.xr.input.on('add', (inputSource) => {
     *     inputSource.hitTestStart({
     *         callback: (err, hitTestSource) => {
     *             if (err) return;
     *             hitTestSource.on('result', (position, rotation, inputSource, hitTestResult) => {
     *                 // position and rotation of hit test result
     *                 // that will be created from touch on mobile devices
     *             });
     *         }
     *     });
     * });
     */
    hitTestStart(options?: {
        entityTypes?: string[];
        offsetRay?: Ray;
        callback?: XrHitTestStartCallback;
    }): void;
    /**
     * @param {XrHitTestSource} hitTestSource - Hit test source to be added.
     * @private
     */
    private onHitTestSourceAdd;
    /**
     * @param {XrHitTestSource} hitTestSource - Hit test source to be removed.
     * @private
     */
    private onHitTestSourceRemove;
}
import { EventHandler } from '../../core/event-handler.js';
import { XrHand } from './xr-hand.js';
import type { Entity } from '../entity.js';
import type { XrHitTestSource } from './xr-hit-test-source.js';
import { Vec3 } from '../../core/math/vec3.js';
import { Quat } from '../../core/math/quat.js';
import { Ray } from '../../core/shape/ray.js';
import type { XrHitTestStartCallback } from './xr-hit-test.js';
import type { XrManager } from './xr-manager.js';
