import { Quat } from '../../../core/math/quat.js';
import { Vec3 } from '../../../core/math/vec3.js';
import { InputController } from '../input.js';
import { damp } from '../math.js';
import { Pose } from '../pose.js';

const EPSILON = 0.001;
const dir = new Vec3();
const position = new Vec3();
const rotation = new Quat();
class FocusController extends InputController {
		attach(pose, smooth = true) {
				this._targetRootPose.set(pose.getFocus(dir), pose.angles, 0);
				this._targetChildPose.position.set(0, 0, pose.distance);
				if (!smooth) {
						this._rootPose.copy(this._targetRootPose);
						this._childPose.copy(this._targetChildPose);
				}
		}
		detach() {
				this._targetRootPose.copy(this._rootPose);
				this._targetChildPose.copy(this._childPose);
		}
		complete() {
				return this._targetRootPose.equalsApprox(this._rootPose, EPSILON) && this._targetChildPose.equalsApprox(this._childPose, EPSILON);
		}
		update(frame, dt) {
				frame.read();
				this._rootPose.lerp(this._rootPose, this._targetRootPose, damp(this.focusDamping, dt), damp(this.focusDamping, dt), 1);
				this._childPose.lerp(this._childPose, this._targetChildPose, damp(this.focusDamping, dt), 1, 1);
				rotation.setFromEulerAngles(this._rootPose.angles).transformVector(this._childPose.position, position).add(this._rootPose.position);
				return this._pose.set(position, this._rootPose.angles, this._childPose.position.length());
		}
		destroy() {
				this.detach();
		}
		constructor(...args){
				super(...args), this._targetRootPose = new Pose(), this._rootPose = new Pose(), this._targetChildPose = new Pose(), this._childPose = new Pose(), this.focusDamping = 0.98;
		}
}

export { FocusController };
