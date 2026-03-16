/**
 * @import { XrHand } from './xr-hand.js'
 * @import { XrJoint } from './xr-joint.js'
 */
/**
 * Represents a finger of a tracked {@link XrHand} with related joints and index.
 *
 * @category XR
 */
export class XrFinger {
    /**
     * Create a new XrFinger instance.
     *
     * @param {number} index - Index of the finger.
     * @param {XrHand} hand - Hand that the finger belongs to.
     * @ignore
     */
    constructor(index: number, hand: XrHand);
    /**
     * @type {number}
     * @private
     */
    private _index;
    /**
     * @type {XrHand}
     * @private
     */
    private _hand;
    /**
     * @type {XrJoint[]}
     * @private
     */
    private _joints;
    /**
     * @type {XrJoint|null}
     * @private
     */
    private _tip;
    /**
     * Gets the index of the finger. Enumeration is: thumb, index, middle, ring, little.
     *
     * @type {number}
     */
    get index(): number;
    /**
     * Gets the hand that the finger belongs to.
     *
     * @type {XrHand}
     */
    get hand(): XrHand;
    /**
     * Array of joints that belong to this finger, starting from joint closest to wrist all the way
     * to the tip of a finger.
     *
     * @type {XrJoint[]}
     */
    get joints(): XrJoint[];
    /**
     * Tip joint of the finger, or null if not available.
     *
     * @type {XrJoint|null}
     */
    get tip(): XrJoint | null;
}
import type { XrHand } from './xr-hand.js';
import type { XrJoint } from './xr-joint.js';
