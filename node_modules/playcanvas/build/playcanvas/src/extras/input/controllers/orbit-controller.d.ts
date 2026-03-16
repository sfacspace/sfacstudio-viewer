/**
 * The orbit controller.
 *
 * @category Input Controller
 * @alpha
 */
export class OrbitController extends InputController {
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
    /**
     * The zoom damping. A higher value means more damping. A value of 0 means no damping.
     *
     * @type {number}
     */
    zoomDamping: number;
    set pitchRange(range: import("../../../index.js").Vec2);
    get pitchRange(): import("../../../index.js").Vec2;
    set yawRange(range: import("../../../index.js").Vec2);
    get yawRange(): import("../../../index.js").Vec2;
    set zoomRange(range: import("../../../index.js").Vec2);
    get zoomRange(): import("../../../index.js").Vec2;
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
