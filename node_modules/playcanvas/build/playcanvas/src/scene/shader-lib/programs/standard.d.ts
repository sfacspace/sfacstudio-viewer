/**
 * @import { GraphicsDevice } from '../../../platform/graphics/graphics-device.js'
 */
export const _matTex2D: any[];
export const standard: ShaderGeneratorStandard;
declare class ShaderGeneratorStandard extends ShaderGenerator {
    optionsContext: StandardMaterialOptions;
    optionsContextMin: StandardMaterialOptions;
    generateKey(options: any): string;
    propsMin: string[];
    props: string[];
    /**
     * Get the code with which to to replace '*_TEXTURE_UV' in the map shader functions.
     *
     * @param {string} transformPropName - Name of the transform id in the options block. Usually "basenameTransform".
     * @param {string} uVPropName - Name of the UV channel in the options block. Usually "basenameUv".
     * @param {object} options - The options passed into createShaderDefinition.
     * @returns {string} The code used to replace '*_TEXTURE_UV' in the shader code.
     * @private
     */
    private _getUvSourceExpression;
    _validateMapChunk(code: any, propName: any, chunkName: any, chunks: any): void;
    /**
     * Add shader defines for a texture map.
     *
     * @param {Map<string, string>} fDefines - The fragment defines.
     * @param {string} propName - The base name of the map: diffuse | emissive | opacity | light | height | metalness | specular | gloss | ao.
     * @param {string} chunkName - The name of the chunk to use. Usually "basenamePS".
     * @param {object} options - The options passed into to createShaderDefinition.
     * @param {Map<string, string>} chunks - The set of shader chunks to choose from.
     * @param {object} mapping - The mapping between chunk and sampler
     * @param {string|null} encoding - The texture's encoding
     * @private
     */
    private _addMapDefines;
    _correctChannel(p: any, chan: any, _matTex2D: any): any;
    createVertexShader(litShader: any, options: any): void;
    /**
     * @param {StandardMaterialOptions} options - The create options.
     * @param {Map<string, string>} fDefines - The fragment defines.
     * @param {ShaderPass} shaderPassInfo - The shader pass info.
     */
    prepareFragmentDefines(options: StandardMaterialOptions, fDefines: Map<string, string>, shaderPassInfo: ShaderPass): void;
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {StandardMaterialOptions} options - The create options.
     * @returns {object} Returns the created shader definition.
     */
    createShaderDefinition(device: GraphicsDevice, options: StandardMaterialOptions): object;
}
import { ShaderGenerator } from './shader-generator.js';
import { StandardMaterialOptions } from '../../materials/standard-material-options.js';
import { ShaderPass } from '../../shader-pass.js';
import type { GraphicsDevice } from '../../../platform/graphics/graphics-device.js';
export {};
