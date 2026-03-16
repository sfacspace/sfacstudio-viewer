import { LitShaderOptions } from '../shader-lib/programs/lit-shader-options.js';

class StandardMaterialOptions {
		get pass() {
				return this.litOptions.pass;
		}
		constructor(){
				this.defines = new Map();
				this.forceUv1 = false;
				this.specularTint = false;
				this.metalnessTint = false;
				this.glossTint = false;
				this.emissiveEncoding = 'linear';
				this.lightMapEncoding = 'linear';
				this.vertexColorGamma = false;
				this.packedNormal = false;
				this.normalDetailPackedNormal = false;
				this.clearCoatPackedNormal = false;
				this.glossInvert = false;
				this.sheenGlossInvert = false;
				this.clearCoatGlossInvert = false;
				this.useAO = false;
				this.litOptions = new LitShaderOptions();
		}
}

export { StandardMaterialOptions };
