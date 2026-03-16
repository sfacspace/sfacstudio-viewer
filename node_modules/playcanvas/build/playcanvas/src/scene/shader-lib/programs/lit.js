import { LitShader } from './lit-shader.js';
import { LitOptionsUtils } from './lit-options-utils.js';
import { ShaderGenerator } from './shader-generator.js';
import { SHADERTAG_MATERIAL, SHADERLANGUAGE_WGSL } from '../../../platform/graphics/constants.js';
import { ShaderDefinitionUtils } from '../../../platform/graphics/shader-definition-utils.js';
import { hashCode } from '../../../core/hash.js';
import { MapUtils } from '../../../core/map-utils.js';

const dummyUvs = [
		0,
		1,
		2,
		3,
		4,
		5,
		6,
		7
];
class ShaderGeneratorLit extends ShaderGenerator {
		generateKey(options) {
				const definesHash = ShaderGenerator.definesHash(options.defines);
				const glslHash = hashCode(options.shaderChunkGLSL ?? '');
				const wgslHash = hashCode(options.shaderChunkWGSL ?? '');
				const loHash = LitOptionsUtils.generateKey(options.litOptions);
				const uvOptions = `${dummyUvs.map((dummy, index)=>{
						return options.usedUvs[index] ? '1' : '0';
				}).join('')}`;
				return `lit_${definesHash}_${uvOptions}_${glslHash}_${wgslHash}_${loHash}`;
		}
		createShaderDefinition(device, options) {
				const allowWGSL = !!options.shaderChunkWGSL;
				const litShader = new LitShader(device, options.litOptions, allowWGSL);
				const definitionOptions = {
						name: 'LitShader',
						shaderLanguage: litShader.shaderLanguage,
						tag: litShader.shaderPassInfo.isForward ? SHADERTAG_MATERIAL : undefined
				};
				const usedUvSets = options.usedUvs || [
						true
				];
				const mapTransforms = [];
				litShader.generateVertexShader(usedUvSets, usedUvSets, mapTransforms);
				litShader.generateFragmentShader('', litShader.shaderLanguage === SHADERLANGUAGE_WGSL ? options.shaderChunkWGSL : options.shaderChunkGLSL, 'vUv0');
				const includes = MapUtils.merge(litShader.chunks, litShader.includes);
				const vDefines = litShader.vDefines;
				options.defines.forEach((value, key)=>vDefines.set(key, value));
				const fDefines = litShader.fDefines;
				options.defines.forEach((value, key)=>fDefines.set(key, value));
				definitionOptions.attributes = litShader.attributes;
				definitionOptions.vertexCode = litShader.vshader;
				definitionOptions.vertexIncludes = includes;
				definitionOptions.vertexDefines = vDefines;
				definitionOptions.fragmentCode = litShader.fshader;
				definitionOptions.fragmentIncludes = includes;
				definitionOptions.fragmentDefines = fDefines;
				return ShaderDefinitionUtils.createDefinition(device, definitionOptions);
		}
}
const lit = new ShaderGeneratorLit();

export { lit };
