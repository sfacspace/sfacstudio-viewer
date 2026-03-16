import { BoundingBox } from '../../core/shape/bounding-box.js';
import { Vec3 } from '../../core/math/vec3.js';

const tmpMin = new Vec3();
const tmpMax = new Vec3();
class GSplatOctreeNode {
		constructor(lods, boundData){
				this.bounds = new BoundingBox();
				this.lods = lods;
				tmpMin.set(boundData.min[0], boundData.min[1], boundData.min[2]);
				tmpMax.set(boundData.max[0], boundData.max[1], boundData.max[2]);
				this.bounds.setMinMax(tmpMin, tmpMax);
		}
}

export { GSplatOctreeNode };
