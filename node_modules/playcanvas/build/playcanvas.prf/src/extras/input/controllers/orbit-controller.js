import { Quat } from '../../../core/math/quat.js';
import { Vec3 } from '../../../core/math/vec3.js';
import { InputController } from '../input.js';
import { damp } from '../math.js';
import { Pose } from '../pose.js';

const dir = new Vec3();
const offset = new Vec3();
const angles = new Vec3();
const rotation = new Quat();
class OrbitController extends InputController {
		set pitchRange(range) {
				this._targetRootPose.pitchRange.copy(range);
				this._rootPose.copy(this._targetRootPose.rotate(Vec3.ZERO));
		}
		get pitchRange() {
				return this._targetRootPose.pitchRange;
		}
		set yawRange(range) {
				this._targetRootPose.yawRange.copy(range);
				this._rootPose.copy(this._targetRootPose.rotate(Vec3.ZERO));
		}
		get yawRange() {
				return this._targetRootPose.yawRange;
		}
		set zoomRange(range) {
				this._targetChildPose.zRange.copy(range);
				this._childPose.copy(this._targetChildPose.move(Vec3.ZERO));
		}
		get zoomRange() {
				return this._targetRootPose.zRange;
		}
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
		update(frame, dt) {
				const { move, rotate } = frame.read();
				offset.set(move[0], move[1], 0);
				rotation.setFromEulerAngles(this._rootPose.angles).transformVector(offset, offset);
				this._targetRootPose.move(offset);
				const { z: dist } = this._targetChildPose.position;
				this._targetChildPose.move(offset.set(0, 0, dist * (1 + move[2]) - dist));
				this._targetRootPose.rotate(angles.set(-rotate[1], -rotate[0], 0));
				this._rootPose.lerp(this._rootPose, this._targetRootPose, damp(this.moveDamping, dt), damp(this.rotateDamping, dt), 1);
				this._childPose.lerp(this._childPose, this._targetChildPose, damp(this.zoomDamping, dt), 1, 1);
				rotation.setFromEulerAngles(this._rootPose.angles).transformVector(this._childPose.position, offset).add(this._rootPose.position);
				return this._pose.set(offset, this._rootPose.angles, this._childPose.position.z);
		}
		destroy() {
				this.detach();
		}
		constructor(...args){
				super(...args), this._targetRootPose = new Pose(), this._rootPose = new Pose(), this._targetChildPose = new Pose(), this._childPose = new Pose(), this.rotateDamping = 0.98, this.moveDamping = 0.98, this.zoomDamping = 0.98;
		}
}

export { OrbitController };
