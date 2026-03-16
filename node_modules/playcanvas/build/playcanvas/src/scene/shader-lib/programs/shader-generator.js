import { hashCode } from '../../../core/hash.js';

class ShaderGenerator {
		static definesHash(defines) {
				const sortedArray = Array.from(defines).sort((a, b)=>a[0] > b[0] ? 1 : -1);
				return hashCode(JSON.stringify(sortedArray));
		}
}

export { ShaderGenerator };
