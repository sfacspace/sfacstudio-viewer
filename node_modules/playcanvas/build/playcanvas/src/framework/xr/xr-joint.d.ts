/**
 * Represents the joint of a finger.
 *
 * @category XR
 */
export class XrJoint {
    /**
     * Create an XrJoint instance.
     *
     * @param {number} index - Index of a joint within a finger.
     * @param {XRHandJoint} id - Id of a joint based on WebXR Hand Input Specs.
     * @param {XrHand} hand - Hand that joint relates to.
     * @param {XrFinger|null} finger - Finger that joint is related to. Can be null in the case of
     * the wrist joint.
     * @ignore
     */
    constructor(index: number, id: XRHandJoint, hand: XrHand, finger?: XrFinger | null);
    /**
     * @type {number}
     * @private
     */
    private _index;
    /**
     * @type {XRHandJoint}
     * @private
     */
    private _id;
    /**
     * @type {XrHand}
     * @private
     */
    private _hand;
    /**
     * @type {XrFinger|null}
     * @private
     */
    private _finger;
    /**
     * @type {boolean}
     * @private
     */
    private _wrist;
    /**
     * @type {boolean}
     * @private
     */
    private _tip;
    /**
     * @type {number|null}
     * @private
     */
    private _radius;
    /**
     * @type {Mat4}
     * @private
     */
    private _localTransform;
    /**
     * @type {Mat4}
     * @private
     */
    private _worldTransform;
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
     * @type {boolean}
     * @private
     */
    private _dirtyLocal;
    /**
     * @param {XRJointPose} pose - XRJointPose of this joint.
     * @ignore
     */
    update(pose: XRJointPose): void;
    /** @private */
    private _updateTransforms;
    /**
     * Get the world space position of a joint.
     *
     * @returns {Vec3} The world space position of a joint.
     */
    getPosition(): Vec3;
    /**
     * Get the world space rotation of a joint.
     *
     * @returns {Quat} The world space rotation of a joint.
     */
    getRotation(): Quat;
    /**
     * Id of a joint based on WebXR Hand Input Specs.
     *
     * @type {XRHandJoint}
     */
    get id(): XRHandJoint;
    /**
     * Index of a joint within a finger, starting from 0 (root of a finger) all the way to tip of
     * the finger.
     *
     * @type {number}
     */
    get index(): number;
    /**
     * Hand that joint relates to.
     *
     * @type {XrHand}
     */
    get hand(): XrHand;
    /**
     * Finger that joint relates to.
     *
     * @type {XrFinger|null}
     */
    get finger(): XrFinger | null;
    /**
     * True if joint is a wrist.
     *
     * @type {boolean}
     */
    get wrist(): boolean;
    /**
     * True if joint is a tip of a finger.
     *
     * @type {boolean}
     */
    get tip(): boolean;
    /**
     * The radius of a joint, which is a distance from joint to the edge of a skin.
     *
     * @type {number}
     */
    get radius(): number;
}
import { Vec3 } from '../../core/math/vec3.js';
import { Quat } from '../../core/math/quat.js';
import type { XrHand } from './xr-hand.js';
import type { XrFinger } from './xr-finger.js';
