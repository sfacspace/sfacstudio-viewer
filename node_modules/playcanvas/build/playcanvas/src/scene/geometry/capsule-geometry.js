import { ConeBaseGeometry } from './cone-base-geometry.js';
import { calculateTangents } from './geometry-utils.js';

class CapsuleGeometry extends ConeBaseGeometry {
		constructor(opts = {}){
				const radius = opts.radius ?? 0.3;
				const height = opts.height ?? 1;
				const heightSegments = opts.heightSegments ?? 1;
				const sides = opts.sides ?? 20;
				super(radius, radius, height - 2 * radius, heightSegments, sides, true);
				if (opts.calculateTangents) {
						this.tangents = calculateTangents(this.positions, this.normals, this.uvs, this.indices);
				}
		}
}

export { CapsuleGeometry };
