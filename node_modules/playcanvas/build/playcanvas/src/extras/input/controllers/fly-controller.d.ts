/**
 * The fly controller.
 *
 * @category Input Controller
 * @alpha
 */
export class FlyController extends InputController {
    /**
     * @type {Pose}
     * @private
     */
    private _targetPose;
    /**
     * The rotation damping. In the range 0 to 1, where a value of 0 means no damping and 1 means
     * full damping. Default is 0.98.
     *
     * @type {number}
     */
    rotateDamping: number;
    /**
     * The movement damping. In the range 0 to 1, where a value of 0 means no damping and 1 means
     * full damping. Default is 0.98.
     *
     * @type {number}
     */
    moveDamping: number;
    set pitchRange(value: import("../../../index.js").Vec2);
    get pitchRange(): import("../../../index.js").Vec2;
    set yawRange(value: import("../../../index.js").Vec2);
    get yawRange(): import("../../../index.js").Vec2;
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
