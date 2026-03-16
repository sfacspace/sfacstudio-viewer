import { calculateNormals, calculateTangents } from './geometry-utils.js';

class Geometry {
		calculateNormals() {
				this.normals = calculateNormals(this.positions, this.indices);
		}
		calculateTangents() {
				this.tangents = calculateTangents(this.positions, this.normals, this.uvs, this.indices);
		}
}

export { Geometry };
