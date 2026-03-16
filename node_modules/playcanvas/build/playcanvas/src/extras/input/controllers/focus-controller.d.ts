/**
 * The focus controller.
 *
 * @category Input Controller
 * @alpha
 */
export class FocusController extends InputController {
    /**
     * @type {Pose}
     * @private
     */
    private _targetRootPose;
    /**
     * @type {Pose}
     * @private
     */
    private _rootPose;
    /**
     * @type {Pose}
     * @private
     */
    private _targetChildPose;
    /**
     * @type {Pose}
     * @private
     */
    private _childPose;
    /**
     * The focus damping. In the range 0 to 1, where a value of 0 means no damping and 1 means
     * full damping. Default is 0.98.
     *
     * @type {number}
     */
    focusDamping: number;
    complete(): boolean;
    /**
     * @param {InputFrame<{ move: number[], rotate: number[] }>} frame - The input frame.
     * @param {number} dt - The delta time.
     * @returns {Pose} - The controller pose.
     */
    update(frame: InputFrame<{
        move: number[];
        rotate: number[];
    }>, dt: number): Pose;
}
import { InputController } from '../input.js';
import type { InputFrame } from '../input.js';
import { Pose } from '../pose.js';
