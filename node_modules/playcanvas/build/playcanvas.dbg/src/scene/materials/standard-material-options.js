import { LitShaderOptions } from '../shader-lib/programs/lit-shader-options.js';

/**
 * The standard material options define a set of options used to control the shader frontend shader
 * generation, such as textures, tints and multipliers.
 *
 * @category Graphics
 */ class StandardMaterialOptions {
    // program-library assumes material options has a pass property
    get pass() {
        return this.litOptions.pass;
    }
    constructor(){
        /**
     * The set of defines used to generate the shader.
     *
     * @type {Map<string, string>}
     */ this.defines = new Map();
        /**
     * If UV1 (second set of texture coordinates) is required in the shader. Will be declared as
     * "vUv1" and passed to the fragment shader.
     *
     * @type {boolean}
     */ this.forceUv1 = false;
        /**
     * Defines if {@link StandardMaterial#specular} constant should affect specular color.
     *
     * @type {boolean}
     */ this.specularTint = false;
        /**
     * Defines if {@link StandardMaterial#metalness} constant should affect metalness value.
     *
     * @type {boolean}
     */ this.metalnessTint = false;
        /**
     * Defines if {@link StandardMaterial#gloss} constant should affect glossiness value.
     *
     * @type {boolean}
     */ this.glossTint = false;
        this.emissiveEncoding = 'linear';
        this.lightMapEncoding = 'linear';
        this.vertexColorGamma = false;
        /**
     * If normal map contains X in RGB, Y in Alpha, and Z must be reconstructed.
     *
     * @type {boolean}
     */ this.packedNormal = false;
        /**
     * If normal detail map contains X in RGB, Y in Alpha, and Z must be reconstructed.
     *
     * @type {boolean}
     */ this.normalDetailPackedNormal = false;
        /**
     * If normal clear coat map contains X in RGB, Y in Alpha, and Z must be reconstructed.
     *
     * @type {boolean}
     */ this.clearCoatPackedNormal = false;
        /**
     * Invert the gloss channel.
     *
     * @type {boolean}
     */ this.glossInvert = false;
        /**
     * Invert the sheen gloss channel.
     *
     * @type {boolean}
     */ this.sheenGlossInvert = false;
        /**
     * Invert the clearcoat gloss channel.
     *
     * @type {boolean}
     */ this.clearCoatGlossInvert = false;
        /**
     * True to include AO variables even if AO is not used, which allows SSAO to be used in the lit shader.
     *
     * @type {boolean}
     */ this.useAO = false;
        /**
     * Storage for the options for lit the shader and material.
     *
     * @type {LitShaderOptions}
     */ this.litOptions = new LitShaderOptions();
    }
}

export { StandardMaterialOptions };
