import { uniformTypeToName, UNUSED_UNIFORM_NAME, UNIFORMTYPE_FLOAT, TEXTUREDIMENSION_2D_ARRAY, TEXTUREDIMENSION_CUBE, TEXTUREDIMENSION_3D, TEXTUREDIMENSION_2D, SHADERSTAGE_VERTEX, SHADERSTAGE_FRAGMENT, SAMPLETYPE_FLOAT, BINDGROUP_MESH_UB, BINDGROUP_MESH, semanticToLocation, TYPE_FLOAT32, TYPE_FLOAT16, bindGroupNames, SAMPLETYPE_UINT, SAMPLETYPE_INT, SAMPLETYPE_UNFILTERABLE_FLOAT, SAMPLETYPE_DEPTH, TYPE_INT8, TYPE_INT16, TYPE_INT32 } from './constants.js';
import { UniformFormat, UniformBufferFormat } from './uniform-buffer-format.js';
import { BindTextureFormat, BindGroupFormat } from './bind-group-format.js';

const KEYWORD = /[ \t]*(\battribute\b|\bvarying\b|\buniform\b)/g;
const KEYWORD_LINE = /(\battribute\b|\bvarying\b|\bout\b|\buniform\b)[ \t]*([^;]+)(;+)/g;
const MARKER = '@@@';
const ARRAY_IDENTIFIER = /([\w-]+)\[(.*?)\]/;
const precisionQualifiers = new Set([
		'highp',
		'mediump',
		'lowp'
]);
const shadowSamplers = new Set([
		'sampler2DShadow',
		'samplerCubeShadow',
		'sampler2DArrayShadow'
]);
const textureDimensions = {
		sampler2D: TEXTUREDIMENSION_2D,
		sampler3D: TEXTUREDIMENSION_3D,
		samplerCube: TEXTUREDIMENSION_CUBE,
		samplerCubeShadow: TEXTUREDIMENSION_CUBE,
		sampler2DShadow: TEXTUREDIMENSION_2D,
		sampler2DArray: TEXTUREDIMENSION_2D_ARRAY,
		sampler2DArrayShadow: TEXTUREDIMENSION_2D_ARRAY,
		isampler2D: TEXTUREDIMENSION_2D,
		usampler2D: TEXTUREDIMENSION_2D,
		isampler3D: TEXTUREDIMENSION_3D,
		usampler3D: TEXTUREDIMENSION_3D,
		isamplerCube: TEXTUREDIMENSION_CUBE,
		usamplerCube: TEXTUREDIMENSION_CUBE,
		isampler2DArray: TEXTUREDIMENSION_2D_ARRAY,
		usampler2DArray: TEXTUREDIMENSION_2D_ARRAY
};
const textureDimensionInfo = {
		[TEXTUREDIMENSION_2D]: 'texture2D',
		[TEXTUREDIMENSION_CUBE]: 'textureCube',
		[TEXTUREDIMENSION_3D]: 'texture3D',
		[TEXTUREDIMENSION_2D_ARRAY]: 'texture2DArray'
};
class UniformLine {
		constructor(line, shader){
				this.line = line;
				const words = line.trim().split(/\s+/);
				if (precisionQualifiers.has(words[0])) {
						this.precision = words.shift();
				}
				this.type = words.shift();
				if (line.includes(',')) ;
				if (line.includes('[')) {
						const rest = words.join(' ');
						const match = ARRAY_IDENTIFIER.exec(rest);
						this.name = match[1];
						this.arraySize = Number(match[2]);
						if (isNaN(this.arraySize)) {
								shader.failed = true;
						}
				} else {
						this.name = words.shift();
						this.arraySize = 0;
				}
				this.isSampler = this.type.indexOf('sampler') !== -1;
				this.isSignedInt = this.type.indexOf('isampler') !== -1;
				this.isUnsignedInt = this.type.indexOf('usampler') !== -1;
		}
}
class ShaderProcessorGLSL {
		static run(device, shaderDefinition, shader) {
				const varyingMap = new Map();
				const vertexExtracted = ShaderProcessorGLSL.extract(shaderDefinition.vshader);
				const fragmentExtracted = ShaderProcessorGLSL.extract(shaderDefinition.fshader);
				const attributesMap = new Map();
				const attributesBlock = ShaderProcessorGLSL.processAttributes(vertexExtracted.attributes, shaderDefinition.attributes, attributesMap, shaderDefinition.processingOptions);
				const vertexVaryingsBlock = ShaderProcessorGLSL.processVaryings(vertexExtracted.varyings, varyingMap, true);
				const fragmentVaryingsBlock = ShaderProcessorGLSL.processVaryings(fragmentExtracted.varyings, varyingMap, false);
				const outBlock = ShaderProcessorGLSL.processOuts(fragmentExtracted.outs);
				const concatUniforms = vertexExtracted.uniforms.concat(fragmentExtracted.uniforms);
				const uniforms = Array.from(new Set(concatUniforms));
				const parsedUniforms = uniforms.map((line)=>new UniformLine(line, shader));
				const uniformsData = ShaderProcessorGLSL.processUniforms(device, parsedUniforms, shaderDefinition.processingOptions, shader);
				const vBlock = `${attributesBlock}\n${vertexVaryingsBlock}\n${uniformsData.code}`;
				const vshader = vertexExtracted.src.replace(MARKER, vBlock);
				const fBlock = `${fragmentVaryingsBlock}\n${outBlock}\n${uniformsData.code}`;
				const fshader = fragmentExtracted.src.replace(MARKER, fBlock);
				return {
						vshader: vshader,
						fshader: fshader,
						attributes: attributesMap,
						meshUniformBufferFormat: uniformsData.meshUniformBufferFormat,
						meshBindGroupFormat: uniformsData.meshBindGroupFormat
				};
		}
		static extract(src) {
				const attributes = [];
				const varyings = [];
				const outs = [];
				const uniforms = [];
				let replacement = `${MARKER}\n`;
				let match;
				while((match = KEYWORD.exec(src)) !== null){
						const keyword = match[1];
						switch(keyword){
								case 'attribute':
								case 'varying':
								case 'uniform':
								case 'out':
										{
												KEYWORD_LINE.lastIndex = match.index;
												const lineMatch = KEYWORD_LINE.exec(src);
												if (keyword === 'attribute') {
														attributes.push(lineMatch[2]);
												} else if (keyword === 'varying') {
														varyings.push(lineMatch[2]);
												} else if (keyword === 'out') {
														outs.push(lineMatch[2]);
												} else if (keyword === 'uniform') {
														uniforms.push(lineMatch[2]);
												}
												src = ShaderProcessorGLSL.cutOut(src, match.index, KEYWORD_LINE.lastIndex, replacement);
												KEYWORD.lastIndex = match.index + replacement.length;
												replacement = '';
												break;
										}
						}
				}
				return {
						src,
						attributes,
						varyings,
						outs,
						uniforms
				};
		}
		static processUniforms(device, uniforms, processingOptions, shader) {
				const uniformLinesSamplers = [];
				const uniformLinesNonSamplers = [];
				uniforms.forEach((uniform)=>{
						if (uniform.isSampler) {
								uniformLinesSamplers.push(uniform);
						} else {
								uniformLinesNonSamplers.push(uniform);
						}
				});
				const meshUniforms = [];
				uniformLinesNonSamplers.forEach((uniform)=>{
						if (!processingOptions.hasUniform(uniform.name)) {
								const uniformType = uniformTypeToName.indexOf(uniform.type);
								const uniformFormat = new UniformFormat(uniform.name, uniformType, uniform.arraySize);
								meshUniforms.push(uniformFormat);
						}
				});
				if (meshUniforms.length === 0) {
						meshUniforms.push(new UniformFormat(UNUSED_UNIFORM_NAME, UNIFORMTYPE_FLOAT));
				}
				const meshUniformBufferFormat = meshUniforms.length ? new UniformBufferFormat(device, meshUniforms) : null;
				const textureFormats = [];
				uniformLinesSamplers.forEach((uniform)=>{
						if (!processingOptions.hasTexture(uniform.name)) {
								let sampleType = SAMPLETYPE_FLOAT;
								if (uniform.isSignedInt) {
										sampleType = SAMPLETYPE_INT;
								} else if (uniform.isUnsignedInt) {
										sampleType = SAMPLETYPE_UINT;
								} else {
										if (uniform.precision === 'highp') {
												sampleType = SAMPLETYPE_UNFILTERABLE_FLOAT;
										}
										if (shadowSamplers.has(uniform.type)) {
												sampleType = SAMPLETYPE_DEPTH;
										}
								}
								const dimension = textureDimensions[uniform.type];
								textureFormats.push(new BindTextureFormat(uniform.name, SHADERSTAGE_VERTEX | SHADERSTAGE_FRAGMENT, dimension, sampleType));
						}
				});
				const meshBindGroupFormat = new BindGroupFormat(device, textureFormats);
				let code = '';
				processingOptions.uniformFormats.forEach((format, bindGroupIndex)=>{
						if (format) {
								code += ShaderProcessorGLSL.getUniformShaderDeclaration(format, bindGroupIndex, 0);
						}
				});
				if (meshUniformBufferFormat) {
						code += ShaderProcessorGLSL.getUniformShaderDeclaration(meshUniformBufferFormat, BINDGROUP_MESH_UB, 0);
				}
				processingOptions.bindGroupFormats.forEach((format, bindGroupIndex)=>{
						if (format) {
								code += ShaderProcessorGLSL.getTexturesShaderDeclaration(format, bindGroupIndex);
						}
				});
				code += ShaderProcessorGLSL.getTexturesShaderDeclaration(meshBindGroupFormat, BINDGROUP_MESH);
				return {
						code,
						meshUniformBufferFormat,
						meshBindGroupFormat
				};
		}
		static processVaryings(varyingLines, varyingMap, isVertex) {
				let block = '';
				const op = isVertex ? 'out' : 'in';
				varyingLines.forEach((line, index)=>{
						const words = ShaderProcessorGLSL.splitToWords(line);
						const type = words.slice(0, -1).join(' ');
						const name = words[words.length - 1];
						if (isVertex) {
								varyingMap.set(name, index);
						} else {
								index = varyingMap.get(name);
						}
						block += `layout(location = ${index}) ${op} ${type} ${name};\n`;
				});
				return block;
		}
		static processOuts(outsLines) {
				let block = '';
				outsLines.forEach((line, index)=>{
						block += `layout(location = ${index}) out ${line};\n`;
				});
				return block;
		}
		static getTypeCount(type) {
				const lastChar = type.substring(type.length - 1);
				const num = parseInt(lastChar, 10);
				return isNaN(num) ? 1 : num;
		}
		static processAttributes(attributeLines, shaderDefinitionAttributes, attributesMap, processingOptions) {
				let block = '';
				attributeLines.forEach((line)=>{
						const words = ShaderProcessorGLSL.splitToWords(line);
						let type = words[0];
						let name = words[1];
						if (shaderDefinitionAttributes.hasOwnProperty(name)) {
								const semantic = shaderDefinitionAttributes[name];
								const location = semanticToLocation[semantic];
								attributesMap.set(location, name);
								let copyCode;
								const element = processingOptions.getVertexElement(semantic);
								if (element) {
										const dataType = element.dataType;
										if (dataType !== TYPE_FLOAT32 && dataType !== TYPE_FLOAT16 && !element.normalize && !element.asInt) {
												const attribNumElements = ShaderProcessorGLSL.getTypeCount(type);
												const newName = `_private_${name}`;
												copyCode = `vec${attribNumElements} ${name} = vec${attribNumElements}(${newName});\n`;
												name = newName;
												const isSignedType = dataType === TYPE_INT8 || dataType === TYPE_INT16 || dataType === TYPE_INT32;
												if (attribNumElements === 1) {
														type = isSignedType ? 'int' : 'uint';
												} else {
														type = isSignedType ? `ivec${attribNumElements}` : `uvec${attribNumElements}`;
												}
										}
								}
								block += `layout(location = ${location}) in ${type} ${name};\n`;
								if (copyCode) {
										block += copyCode;
								}
						}
				});
				return block;
		}
		static splitToWords(line) {
				line = line.replace(/\s+/g, ' ').trim();
				return line.split(' ');
		}
		static cutOut(src, start, end, replacement) {
				return src.substring(0, start) + replacement + src.substring(end);
		}
		static getUniformShaderDeclaration(format, bindGroup, bindIndex) {
				const name = bindGroupNames[bindGroup];
				let code = `layout(set = ${bindGroup}, binding = ${bindIndex}, std140) uniform ub_${name} {\n`;
				format.uniforms.forEach((uniform)=>{
						const typeString = uniformTypeToName[uniform.type];
						code += `    ${typeString} ${uniform.shortName}${uniform.count ? `[${uniform.count}]` : ''};\n`;
				});
				return `${code}};\n`;
		}
		static getTexturesShaderDeclaration(bindGroupFormat, bindGroup) {
				let code = '';
				bindGroupFormat.textureFormats.forEach((format)=>{
						let textureType = textureDimensionInfo[format.textureDimension];
						const isArray = textureType === 'texture2DArray';
						const sampleTypePrefix = format.sampleType === SAMPLETYPE_UINT ? 'u' : format.sampleType === SAMPLETYPE_INT ? 'i' : '';
						textureType = `${sampleTypePrefix}${textureType}`;
						let namePostfix = '';
						let extraCode = '';
						if (isArray) {
								namePostfix = '_texture';
								extraCode = `#define ${format.name} ${sampleTypePrefix}sampler2DArray(${format.name}${namePostfix}, ${format.name}_sampler)\n`;
						}
						code += `layout(set = ${bindGroup}, binding = ${format.slot}) uniform ${textureType} ${format.name}${namePostfix};\n`;
						if (format.hasSampler) {
								code += `layout(set = ${bindGroup}, binding = ${format.slot + 1}) uniform sampler ${format.name}_sampler;\n`;
						}
						code += extraCode;
				});
				return code;
		}
}

export { ShaderProcessorGLSL };
