import { SHADER_FORWARD, SPRITE_RENDERMODE_SLICED, SPRITE_RENDERMODE_TILED, ditherNames, FRESNEL_SCHLICK, BLEND_NONE, DITHER_NONE } from '../../constants.js';
import { ShaderPass } from '../../shader-pass.js';
import { LitShader } from './lit-shader.js';
import { ChunkUtils } from '../chunk-utils.js';
import { StandardMaterialOptions } from '../../materials/standard-material-options.js';
import { LitOptionsUtils } from './lit-options-utils.js';
import { ShaderGenerator } from './shader-generator.js';
import { ShaderDefinitionUtils } from '../../../platform/graphics/shader-definition-utils.js';
import { SHADERTAG_MATERIAL } from '../../../platform/graphics/constants.js';
import { MapUtils } from '../../../core/map-utils.js';

const _matTex2D = [];
const buildPropertiesList = (options)=>{
		return Object.keys(options).filter((key)=>key !== 'litOptions').sort();
};
class ShaderGeneratorStandard extends ShaderGenerator {
		generateKey(options) {
				let props;
				if (options === this.optionsContextMin) {
						if (!this.propsMin) this.propsMin = buildPropertiesList(options);
						props = this.propsMin;
				} else if (options === this.optionsContext) {
						if (!this.props) this.props = buildPropertiesList(options);
						props = this.props;
				} else {
						props = buildPropertiesList(options);
				}
				const definesHash = ShaderGenerator.definesHash(options.defines);
				const key = `standard:\n${definesHash}\n${props.map((prop)=>prop + options[prop]).join('\n')}${LitOptionsUtils.generateKey(options.litOptions)}`;
				return key;
		}
		_getUvSourceExpression(transformPropName, uVPropName, options) {
				const transformId = options[transformPropName];
				const uvChannel = options[uVPropName];
				const isMainPass = options.litOptions.pass === SHADER_FORWARD;
				let expression;
				if (isMainPass && options.litOptions.nineSlicedMode === SPRITE_RENDERMODE_SLICED) {
						expression = 'nineSlicedUv';
				} else if (isMainPass && options.litOptions.nineSlicedMode === SPRITE_RENDERMODE_TILED) {
						expression = 'nineSlicedUv';
				} else {
						if (transformId === 0) {
								expression = `vUv${uvChannel}`;
						} else {
								expression = `vUV${uvChannel}_${transformId}`;
						}
						if (options.heightMap && transformPropName !== 'heightMapTransform') {
								expression += ' + dUvOffset';
						}
				}
				return expression;
		}
		_validateMapChunk(code, propName, chunkName, chunks) {}
		_addMapDefines(fDefines, propName, chunkName, options, chunks, mapping, encoding = null) {
				const mapPropName = `${propName}Map`;
				const propNameCaps = propName.toUpperCase();
				const uVPropName = `${mapPropName}Uv`;
				const identifierPropName = `${mapPropName}Identifier`;
				const transformPropName = `${mapPropName}Transform`;
				const channelPropName = `${mapPropName}Channel`;
				const vertexColorChannelPropName = `${propName}VertexColorChannel`;
				const tintPropName = `${propName}Tint`;
				const vertexColorPropName = `${propName}VertexColor`;
				const detailModePropName = `${propName}Mode`;
				const invertName = `${propName}Invert`;
				const tintOption = options[tintPropName];
				const vertexColorOption = options[vertexColorPropName];
				const textureOption = options[mapPropName];
				const textureIdentifier = options[identifierPropName];
				const detailModeOption = options[detailModePropName];
				const chunkCode = chunks.get(chunkName);
				if (textureOption) {
						fDefines.set(`STD_${propNameCaps}_TEXTURE`, '');
						const uv = this._getUvSourceExpression(transformPropName, uVPropName, options);
						fDefines.set(`{STD_${propNameCaps}_TEXTURE_UV}`, uv);
						fDefines.set(`{STD_${propNameCaps}_TEXTURE_CHANNEL}`, options[channelPropName]);
						const textureId = `{STD_${propNameCaps}_TEXTURE_NAME}`;
						if (chunkCode.includes(textureId)) {
								let samplerName = `texture_${mapPropName}`;
								const alias = mapping[textureIdentifier];
								if (alias) {
										samplerName = alias;
								} else {
										mapping[textureIdentifier] = samplerName;
										fDefines.set(`STD_${propNameCaps}_TEXTURE_ALLOCATE`, '');
								}
								fDefines.set(textureId, samplerName);
						}
						if (encoding) {
								const textureDecode = options[channelPropName] === 'aaa' ? 'passThrough' : ChunkUtils.decodeFunc(encoding);
								fDefines.set(`{STD_${propNameCaps}_TEXTURE_DECODE}`, textureDecode);
						}
				}
				if (vertexColorOption) {
						fDefines.set(`STD_${propNameCaps}_VERTEX`, '');
						fDefines.set(`{STD_${propNameCaps}_VERTEX_CHANNEL}`, options[vertexColorChannelPropName]);
				}
				if (detailModeOption) {
						fDefines.set(`{STD_${propNameCaps}_DETAILMODE}`, detailModeOption);
				}
				if (tintOption) {
						fDefines.set(`STD_${propNameCaps}_CONSTANT`, '');
				}
				if (!!options[invertName]) {
						fDefines.set(`STD_${propNameCaps}_INVERT`, '');
				}
		}
		_correctChannel(p, chan, _matTex2D) {
				if (_matTex2D[p] > 0) {
						if (_matTex2D[p] < chan.length) {
								return chan.substring(0, _matTex2D[p]);
						} else if (_matTex2D[p] > chan.length) {
								let str = chan;
								const chr = str.charAt(str.length - 1);
								const addLen = _matTex2D[p] - str.length;
								for(let i = 0; i < addLen; i++)str += chr;
								return str;
						}
						return chan;
				}
		}
		createVertexShader(litShader, options) {
				const useUv = [];
				const useUnmodifiedUv = [];
				const mapTransforms = [];
				const maxUvSets = 2;
				for(const p in _matTex2D){
						const mapName = `${p}Map`;
						if (options[`${p}VertexColor`]) {
								const colorChannelName = `${p}VertexColorChannel`;
								options[colorChannelName] = this._correctChannel(p, options[colorChannelName], _matTex2D);
						}
						if (options[mapName]) {
								const channelName = `${mapName}Channel`;
								const transformName = `${mapName}Transform`;
								const uvName = `${mapName}Uv`;
								options[uvName] = Math.min(options[uvName], maxUvSets - 1);
								options[channelName] = this._correctChannel(p, options[channelName], _matTex2D);
								const uvSet = options[uvName];
								useUv[uvSet] = true;
								useUnmodifiedUv[uvSet] = useUnmodifiedUv[uvSet] || options[mapName] && !options[transformName];
								if (options[transformName]) {
										mapTransforms.push({
												name: p,
												id: options[transformName],
												uv: options[uvName]
										});
								}
						}
				}
				if (options.forceUv1) {
						useUv[1] = true;
						useUnmodifiedUv[1] = useUnmodifiedUv[1] !== undefined ? useUnmodifiedUv[1] : true;
				}
				litShader.generateVertexShader(useUv, useUnmodifiedUv, mapTransforms);
		}
		prepareFragmentDefines(options, fDefines, shaderPassInfo) {
				const fDefineSet = (condition, name, value = '')=>{
						if (condition) {
								fDefines.set(name, value);
						}
				};
				fDefineSet(options.lightMap, 'STD_LIGHTMAP', '');
				fDefineSet(options.lightVertexColor, 'STD_LIGHT_VERTEX_COLOR', '');
				fDefineSet(options.dirLightMap && options.litOptions.useSpecular, 'STD_LIGHTMAP_DIR', '');
				fDefineSet(options.heightMap, 'STD_HEIGHT_MAP', '');
				fDefineSet(options.useSpecularColor, 'STD_SPECULAR_COLOR', '');
				fDefineSet(options.aoMap || options.aoVertexColor || options.useAO, 'STD_AO', '');
				fDefineSet(true, 'STD_OPACITY_DITHER', ditherNames[shaderPassInfo.isForward ? options.litOptions.opacityDither : options.litOptions.opacityShadowDither]);
		}
		createShaderDefinition(device, options) {
				const shaderPassInfo = ShaderPass.get(device).getByIndex(options.litOptions.pass);
				const isForwardPass = shaderPassInfo.isForward;
				const litShader = new LitShader(device, options.litOptions);
				this.createVertexShader(litShader, options);
				const textureMapping = {};
				options.litOptions.fresnelModel = options.litOptions.fresnelModel === 0 ? FRESNEL_SCHLICK : options.litOptions.fresnelModel;
				const fDefines = litShader.fDefines;
				this.prepareFragmentDefines(options, fDefines, shaderPassInfo);
				let lightingUv = '';
				if (isForwardPass) {
						if (options.heightMap) {
								this._addMapDefines(fDefines, 'height', 'parallaxPS', options, litShader.chunks, textureMapping);
						}
						if (options.litOptions.blendType !== BLEND_NONE || options.litOptions.alphaTest || options.litOptions.alphaToCoverage || options.litOptions.opacityDither !== DITHER_NONE) {
								this._addMapDefines(fDefines, 'opacity', 'opacityPS', options, litShader.chunks, textureMapping);
						}
						if (litShader.needsNormal) {
								if (options.normalMap || options.clearCoatNormalMap) {
										if (!options.litOptions.hasTangents) {
												const baseName = options.normalMap ? 'normalMap' : 'clearCoatNormalMap';
												lightingUv = this._getUvSourceExpression(`${baseName}Transform`, `${baseName}Uv`, options);
										}
								}
								this._addMapDefines(fDefines, 'normalDetail', 'normalMapPS', options, litShader.chunks, textureMapping, options.normalDetailPackedNormal ? 'xy' : 'xyz');
								this._addMapDefines(fDefines, 'normal', 'normalMapPS', options, litShader.chunks, textureMapping, options.packedNormal ? 'xy' : 'xyz');
						}
						if (options.diffuseDetail) {
								this._addMapDefines(fDefines, 'diffuseDetail', 'diffusePS', options, litShader.chunks, textureMapping, options.diffuseDetailEncoding);
						}
						this._addMapDefines(fDefines, 'diffuse', 'diffusePS', options, litShader.chunks, textureMapping, options.diffuseEncoding);
						if (options.litOptions.useRefraction) {
								this._addMapDefines(fDefines, 'refraction', 'transmissionPS', options, litShader.chunks, textureMapping);
								this._addMapDefines(fDefines, 'thickness', 'thicknessPS', options, litShader.chunks, textureMapping);
						}
						if (options.litOptions.useIridescence) {
								this._addMapDefines(fDefines, 'iridescence', 'iridescencePS', options, litShader.chunks, textureMapping);
								this._addMapDefines(fDefines, 'iridescenceThickness', 'iridescenceThicknessPS', options, litShader.chunks, textureMapping);
						}
						if (litShader.lighting && options.litOptions.useSpecular || litShader.reflections) {
								if (options.litOptions.useSheen) {
										this._addMapDefines(fDefines, 'sheen', 'sheenPS', options, litShader.chunks, textureMapping, options.sheenEncoding);
										this._addMapDefines(fDefines, 'sheenGloss', 'sheenGlossPS', options, litShader.chunks, textureMapping);
								}
								if (options.litOptions.useMetalness) {
										this._addMapDefines(fDefines, 'metalness', 'metalnessPS', options, litShader.chunks, textureMapping);
										this._addMapDefines(fDefines, 'ior', 'iorPS', options, litShader.chunks, textureMapping);
								}
								if (options.litOptions.useSpecularityFactor) {
										this._addMapDefines(fDefines, 'specularityFactor', 'specularityFactorPS', options, litShader.chunks, textureMapping);
								}
								if (options.useSpecularColor) {
										this._addMapDefines(fDefines, 'specular', 'specularPS', options, litShader.chunks, textureMapping, options.specularEncoding);
								}
								this._addMapDefines(fDefines, 'gloss', 'glossPS', options, litShader.chunks, textureMapping);
						}
						if (options.aoDetail) {
								this._addMapDefines(fDefines, 'aoDetail', 'aoPS', options, litShader.chunks, textureMapping);
						}
						if (options.aoMap || options.aoVertexColor || options.useAO) {
								this._addMapDefines(fDefines, 'ao', 'aoPS', options, litShader.chunks, textureMapping);
						}
						this._addMapDefines(fDefines, 'emissive', 'emissivePS', options, litShader.chunks, textureMapping, options.emissiveEncoding);
						if (options.litOptions.useClearCoat) {
								this._addMapDefines(fDefines, 'clearCoat', 'clearCoatPS', options, litShader.chunks, textureMapping);
								this._addMapDefines(fDefines, 'clearCoatGloss', 'clearCoatGlossPS', options, litShader.chunks, textureMapping);
								this._addMapDefines(fDefines, 'clearCoatNormal', 'clearCoatNormalPS', options, litShader.chunks, textureMapping, options.clearCoatPackedNormal ? 'xy' : 'xyz');
						}
						if (options.litOptions.enableGGXSpecular) {
								this._addMapDefines(fDefines, 'anisotropy', 'anisotropyPS', options, litShader.chunks, textureMapping);
						}
						if (options.lightMap || options.lightVertexColor) {
								this._addMapDefines(fDefines, 'light', 'lightmapPS', options, litShader.chunks, textureMapping, options.lightMapEncoding);
						}
				} else {
						const opacityShadowDither = options.litOptions.opacityShadowDither;
						if (options.litOptions.alphaTest || opacityShadowDither) {
								this._addMapDefines(fDefines, 'opacity', 'opacityPS', options, litShader.chunks, textureMapping);
						}
				}
				litShader.generateFragmentShader(litShader.chunks.get('stdDeclarationPS'), litShader.chunks.get('stdFrontEndPS'), lightingUv);
				const includes = MapUtils.merge(litShader.chunks, litShader.includes);
				const vDefines = litShader.vDefines;
				options.defines.forEach((value, key)=>vDefines.set(key, value));
				options.defines.forEach((value, key)=>fDefines.set(key, value));
				const definition = ShaderDefinitionUtils.createDefinition(device, {
						name: 'StandardShader',
						attributes: litShader.attributes,
						shaderLanguage: litShader.shaderLanguage,
						vertexCode: litShader.vshader,
						fragmentCode: litShader.fshader,
						vertexIncludes: includes,
						fragmentIncludes: includes,
						fragmentDefines: fDefines,
						vertexDefines: vDefines
				});
				if (litShader.shaderPassInfo.isForward) {
						definition.tag = SHADERTAG_MATERIAL;
				}
				return definition;
		}
		constructor(...args){
				super(...args), this.optionsContext = new StandardMaterialOptions(), this.optionsContextMin = new StandardMaterialOptions();
		}
}
const standard = new ShaderGeneratorStandard();

export { _matTex2D, standard };
