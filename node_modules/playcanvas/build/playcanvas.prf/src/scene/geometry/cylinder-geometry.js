import { ConeBaseGeometry } from './cone-base-geometry.js';
import { calculateTangents } from './geometry-utils.js';

class CylinderGeometry extends ConeBaseGeometry {
		constructor(opts = {}){
				const radius = opts.radius ?? 0.5;
				const height = opts.height ?? 1;
				const heightSegments = opts.heightSegments ?? 5;
				const capSegments = opts.capSegments ?? 20;
				super(radius, radius, height, heightSegments, capSegments, false);
				if (opts.calculateTangents) {
						this.tangents = calculateTangents(this.positions, this.normals, this.uvs, this.indices);
				}
		}
}

export { CylinderGeometry };
