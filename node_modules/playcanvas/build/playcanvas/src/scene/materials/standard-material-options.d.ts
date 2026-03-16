/**
 * The standard material options define a set of options used to control the shader frontend shader
 * generation, such as textures, tints and multipliers.
 *
 * @category Graphics
 */
export class StandardMaterialOptions {
    /**
     * The set of defines used to generate the shader.
     *
     * @type {Map<string, string>}
     */
    defines: Map<string, string>;
    /**
     * If UV1 (second set of texture coordinates) is required in the shader. Will be declared as
     * "vUv1" and passed to the fragment shader.
     *
     * @type {boolean}
     */
    forceUv1: boolean;
    /**
     * Defines if {@link StandardMaterial#specular} constant should affect specular color.
     *
     * @type {boolean}
     */
    specularTint: boolean;
    /**
     * Defines if {@link StandardMaterial#metalness} constant should affect metalness value.
     *
     * @type {boolean}
     */
    metalnessTint: boolean;
    /**
     * Defines if {@link StandardMaterial#gloss} constant should affect glossiness value.
     *
     * @type {boolean}
     */
    glossTint: boolean;
    emissiveEncoding: string;
    lightMapEncoding: string;
    vertexColorGamma: boolean;
    /**
     * If normal map contains X in RGB, Y in Alpha, and Z must be reconstructed.
     *
     * @type {boolean}
     */
    packedNormal: boolean;
    /**
     * If normal detail map contains X in RGB, Y in Alpha, and Z must be reconstructed.
     *
     * @type {boolean}
     */
    normalDetailPackedNormal: boolean;
    /**
     * If normal clear coat map contains X in RGB, Y in Alpha, and Z must be reconstructed.
     *
     * @type {boolean}
     */
    clearCoatPackedNormal: boolean;
    /**
     * Invert the gloss channel.
     *
     * @type {boolean}
     */
    glossInvert: boolean;
    /**
     * Invert the sheen gloss channel.
     *
     * @type {boolean}
     */
    sheenGlossInvert: boolean;
    /**
     * Invert the clearcoat gloss channel.
     *
     * @type {boolean}
     */
    clearCoatGlossInvert: boolean;
    /**
     * True to include AO variables even if AO is not used, which allows SSAO to be used in the lit shader.
     *
     * @type {boolean}
     */
    useAO: boolean;
    /**
     * Storage for the options for lit the shader and material.
     *
     * @type {LitShaderOptions}
     */
    litOptions: LitShaderOptions;
    get pass(): number;
}
import { LitShaderOptions } from '../shader-lib/programs/lit-shader-options.js';
