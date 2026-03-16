/**
 * Represents a hand with fingers and joints.
 *
 * @category XR
 */
export class XrHand extends EventHandler {
    /**
     * Fired when tracking becomes available.
     *
     * @event
     * @example
     * hand.on('tracking', () => {
     *     console.log('Hand tracking is available');
     * });
     */
    static EVENT_TRACKING: string;
    /**
     * Fired when tracking is lost.
     *
     * @event
     * @example
     * hand.on('trackinglost', () => {
     *     console.log('Hand tracking is lost');
     * });
     */
    static EVENT_TRACKINGLOST: string;
    /**
     * Represents a hand with fingers and joints.
     *
     * @param {XrInputSource} inputSource - Input Source that hand is related to.
     * @ignore
     */
    constructor(inputSource: XrInputSource);
    /**
     * @type {XrManager}
     * @private
     */
    private _manager;
    /**
     * @type {XrInputSource}
     * @private
     */
    private _inputSource;
    /**
     * @type {boolean}
     * @private
     */
    private _tracking;
    /**
     * @type {XrFinger[]}
     * @private
     */
    private _fingers;
    /**
     * @type {XrJoint[]}
     * @private
     */
    private _joints;
    /**
     * @type {Object<string, XrJoint>}
     * @private
     */
    private _jointsById;
    /**
     * @type {XrJoint[]}
     * @private
     */
    private _tips;
    /**
     * @type {XrJoint|null}
     * @private
     */
    private _wrist;
    /**
     * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
     * @ignore
     */
    update(frame: XRFrame): void;
    /**
     * @param {number} index - Finger index.
     * @returns {boolean} True if finger is closed and false otherwise.
     * @private
     */
    private _fingerIsClosed;
    /**
     * Returns joint by its XRHand id.
     *
     * @param {string} id - Id of a joint based on specs ID's in XRHand: https://immersive-web.github.io/webxr-hand-input/#skeleton-joints-section.
     * @returns {XrJoint|null} Joint or null if not available.
     */
    getJointById(id: string): XrJoint | null;
    /**
     * Array of fingers of the hand.
     *
     * @type {XrFinger[]}
     */
    get fingers(): XrFinger[];
    /**
     * Array of joints in the hand.
     *
     * @type {XrJoint[]}
     */
    get joints(): XrJoint[];
    /**
     * Array of joints that are fingertips.
     *
     * @type {XrJoint[]}
     */
    get tips(): XrJoint[];
    /**
     * Wrist of a hand, or null if it is not available by WebXR underlying system.
     *
     * @type {XrJoint|null}
     */
    get wrist(): XrJoint | null;
    /**
     * True if tracking is available, otherwise tracking might be lost.
     *
     * @type {boolean}
     */
    get tracking(): boolean;
}
import { EventHandler } from '../../core/event-handler.js';
import { XrJoint } from './xr-joint.js';
import { XrFinger } from './xr-finger.js';
import type { XrInputSource } from './xr-input-source.js';
