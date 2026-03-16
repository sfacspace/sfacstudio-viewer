import { Vec2 } from '../core/math/vec2.js';
import { Vec3 } from '../core/math/vec3.js';
import { Vec4 } from '../core/math/vec4.js';
import { math } from '../core/math/math.js';
import { PIXELFORMAT_LA8, PIXELFORMAT_RGB565, PIXELFORMAT_RGBA5551, PIXELFORMAT_RGBA4, PIXELFORMAT_RGB8, PIXELFORMAT_RGBA8, PIXELFORMAT_SRGB8, PIXELFORMAT_SRGBA8, BLENDMODE_CONSTANT, BLENDMODE_ONE_MINUS_CONSTANT, SHADERLANGUAGE_GLSL, TEXTURETYPE_SWIZZLEGGGR, TEXTURETYPE_DEFAULT, TEXTURETYPE_RGBM } from '../platform/graphics/constants.js';
import { drawQuadWithShader } from '../scene/graphics/quad-render-utils.js';
import { GraphicsDevice } from '../platform/graphics/graphics-device.js';
import { LayerComposition } from '../scene/composition/layer-composition.js';
import { RenderTarget } from '../platform/graphics/render-target.js';
import { Texture } from '../platform/graphics/texture.js';
import { VertexFormat } from '../platform/graphics/vertex-format.js';
import { BlendState } from '../platform/graphics/blend-state.js';
import { DepthState } from '../platform/graphics/depth-state.js';
import { AnimationKey, AnimationNode } from '../scene/animation/animation.js';
import { Geometry } from '../scene/geometry/geometry.js';
import { CylinderGeometry } from '../scene/geometry/cylinder-geometry.js';
import { BoxGeometry } from '../scene/geometry/box-geometry.js';
import { CapsuleGeometry } from '../scene/geometry/capsule-geometry.js';
import { ConeGeometry } from '../scene/geometry/cone-geometry.js';
import { PlaneGeometry } from '../scene/geometry/plane-geometry.js';
import { SphereGeometry } from '../scene/geometry/sphere-geometry.js';
import { TorusGeometry } from '../scene/geometry/torus-geometry.js';
import { ForwardRenderer } from '../scene/renderer/forward-renderer.js';
import { GraphNode } from '../scene/graph-node.js';
import { Material } from '../scene/materials/material.js';
import { Mesh } from '../scene/mesh.js';
import { Morph } from '../scene/morph.js';
import { MeshInstance } from '../scene/mesh-instance.js';
import { Scene } from '../scene/scene.js';
import { StandardMaterial } from '../scene/materials/standard-material.js';
import { getDefaultMaterial } from '../scene/materials/default-material.js';
import { StandardMaterialOptions } from '../scene/materials/standard-material-options.js';
import { LitShaderOptions } from '../scene/shader-lib/programs/lit-shader-options.js';
import { Layer } from '../scene/layer.js';
import { AssetRegistry } from '../framework/asset/asset-registry.js';
import { XrInputSource } from '../framework/xr/xr-input-source.js';
import { ElementInput } from '../framework/input/element-input.js';
import { MouseEvent } from '../platform/input/mouse-event.js';
import { AppBase } from '../framework/app-base.js';
import { getApplication } from '../framework/globals.js';
import { ModelComponent } from '../framework/components/model/component.js';
import { BODYTYPE_STATIC, BODYTYPE_DYNAMIC, BODYTYPE_KINEMATIC, BODYFLAG_STATIC_OBJECT, BODYFLAG_KINEMATIC_OBJECT, BODYFLAG_NORESPONSE_OBJECT, BODYSTATE_ACTIVE_TAG, BODYSTATE_ISLAND_SLEEPING, BODYSTATE_WANTS_DEACTIVATION, BODYSTATE_DISABLE_DEACTIVATION, BODYSTATE_DISABLE_SIMULATION } from '../framework/components/rigid-body/constants.js';
import { RigidBodyComponent } from '../framework/components/rigid-body/component.js';
import { RigidBodyComponentSystem } from '../framework/components/rigid-body/system.js';
import { CameraComponent } from '../framework/components/camera/component.js';
import { ShaderChunks } from '../scene/shader-lib/shader-chunks.js';

Vec2.prototype.scale = Vec2.prototype.mulScalar;
Vec3.prototype.scale = Vec3.prototype.mulScalar;
Vec4.prototype.scale = Vec4.prototype.mulScalar;
const PIXELFORMAT_L8_A8 = PIXELFORMAT_LA8;
const PIXELFORMAT_R5_G6_B5 = PIXELFORMAT_RGB565;
const PIXELFORMAT_R5_G5_B5_A1 = PIXELFORMAT_RGBA5551;
const PIXELFORMAT_R4_G4_B4_A4 = PIXELFORMAT_RGBA4;
const PIXELFORMAT_R8_G8_B8 = PIXELFORMAT_RGB8;
const PIXELFORMAT_R8_G8_B8_A8 = PIXELFORMAT_RGBA8;
const PIXELFORMAT_SRGB = PIXELFORMAT_SRGB8;
const PIXELFORMAT_SRGBA = PIXELFORMAT_SRGBA8;
const BLENDMODE_CONSTANT_COLOR = BLENDMODE_CONSTANT;
const BLENDMODE_ONE_MINUS_CONSTANT_COLOR = BLENDMODE_ONE_MINUS_CONSTANT;
const BLENDMODE_CONSTANT_ALPHA = BLENDMODE_CONSTANT;
const BLENDMODE_ONE_MINUS_CONSTANT_ALPHA = BLENDMODE_ONE_MINUS_CONSTANT;
const CHUNKAPI_1_51 = '1.51';
const CHUNKAPI_1_55 = '1.55';
const CHUNKAPI_1_56 = '1.56';
const CHUNKAPI_1_57 = '1.57';
const CHUNKAPI_1_58 = '1.58';
const CHUNKAPI_1_60 = '1.60';
const CHUNKAPI_1_62 = '1.62';
const CHUNKAPI_1_65 = '1.65';
const CHUNKAPI_1_70 = '1.70';
const CHUNKAPI_2_1 = '2.1';
const CHUNKAPI_2_3 = '2.3';
const CHUNKAPI_2_5 = '2.5';
const CHUNKAPI_2_6 = '2.6';
const CHUNKAPI_2_7 = '2.7';
const CHUNKAPI_2_8 = '2.8';
const _viewport = new Vec4();
function createSphere(device, opts) {
		return Mesh.fromGeometry(device, new SphereGeometry(opts));
}
function createPlane(device, opts) {
		return Mesh.fromGeometry(device, new PlaneGeometry(opts));
}
function createBox(device, opts) {
		return Mesh.fromGeometry(device, new BoxGeometry(opts));
}
function createTorus(device, opts) {
		return Mesh.fromGeometry(device, new TorusGeometry(opts));
}
function createCapsule(device, opts) {
		return Mesh.fromGeometry(device, new CapsuleGeometry(opts));
}
function createCone(device, opts) {
		return Mesh.fromGeometry(device, new ConeGeometry(opts));
}
function createCylinder(device, opts) {
		return Mesh.fromGeometry(device, new CylinderGeometry(opts));
}
function createMesh(device, positions, opts = {}) {
		const geom = new Geometry();
		geom.positions = positions;
		geom.normals = opts.normals;
		geom.tangents = opts.tangents;
		geom.colors = opts.colors;
		geom.uvs = opts.uvs;
		geom.uvs1 = opts.uvs1;
		geom.blendIndices = opts.blendIndices;
		geom.blendWeights = opts.blendWeights;
		geom.indices = opts.indices;
		return Mesh.fromGeometry(device, geom, opts);
}
function drawFullscreenQuad(device, target, vertexBuffer, shader, rect) {
		let viewport;
		if (rect) {
				const w = target ? target.width : device.width;
				const h = target ? target.height : device.height;
				viewport = _viewport.set(rect.x * w, rect.y * h, rect.z * w, rect.w * h);
		}
		drawQuadWithShader(device, target, shader, viewport);
}
Object.defineProperties(RenderTarget.prototype, {
		_glFrameBuffer: {
				get: function() {
						return this.impl._glFrameBuffer;
				},
				set: function(rgbm) {}
		}
});
Object.defineProperty(VertexFormat, 'defaultInstancingFormat', {
		get: function() {
				return null;
		}
});
Object.defineProperties(Texture.prototype, {
		rgbm: {
				get: function() {
						return this.type === TEXTURETYPE_RGBM;
				},
				set: function(rgbm) {
						this.type = rgbm ? TEXTURETYPE_RGBM : TEXTURETYPE_DEFAULT;
				}
		},
		swizzleGGGR: {
				get: function() {
						return this.type === TEXTURETYPE_SWIZZLEGGGR;
				},
				set: function(swizzleGGGR) {
						this.type = swizzleGGGR ? TEXTURETYPE_SWIZZLEGGGR : TEXTURETYPE_DEFAULT;
				}
		},
		_glTexture: {
				get: function() {
						return this.impl._glTexture;
				}
		}
});
Object.defineProperty(GraphicsDevice.prototype, 'boneLimit', {
		get: function() {
				return 1024;
		}
});
Object.defineProperty(GraphicsDevice.prototype, 'webgl2', {
		get: function() {
				return this.isWebGL2;
		}
});
Object.defineProperty(GraphicsDevice.prototype, 'textureFloatHighPrecision', {
		get: function() {
				return true;
		}
});
Object.defineProperty(GraphicsDevice.prototype, 'extBlendMinmax', {
		get: function() {
				return true;
		}
});
Object.defineProperty(GraphicsDevice.prototype, 'extTextureHalfFloat', {
		get: function() {
				return true;
		}
});
Object.defineProperty(GraphicsDevice.prototype, 'extTextureLod', {
		get: function() {
				return true;
		}
});
Object.defineProperty(GraphicsDevice.prototype, 'textureHalfFloatFilterable', {
		get: function() {
				return true;
		}
});
Object.defineProperty(GraphicsDevice.prototype, 'supportsMrt', {
		get: function() {
				return true;
		}
});
Object.defineProperty(GraphicsDevice.prototype, 'supportsVolumeTextures', {
		get: function() {
				return true;
		}
});
Object.defineProperty(GraphicsDevice.prototype, 'supportsInstancing', {
		get: function() {
				return true;
		}
});
Object.defineProperty(GraphicsDevice.prototype, 'textureHalfFloatUpdatable', {
		get: function() {
				return true;
		}
});
Object.defineProperty(GraphicsDevice.prototype, 'extTextureFloat', {
		get: function() {
				return true;
		}
});
Object.defineProperty(GraphicsDevice.prototype, 'extStandardDerivatives', {
		get: function() {
				return true;
		}
});
BlendState.DEFAULT = Object.freeze(new BlendState());
const _tempBlendState = new BlendState();
const _tempDepthState = new DepthState();
GraphicsDevice.prototype.setBlendFunction = function(blendSrc, blendDst) {
		const currentBlendState = this.blendState;
		_tempBlendState.copy(currentBlendState);
		_tempBlendState.setColorBlend(currentBlendState.colorOp, blendSrc, blendDst);
		_tempBlendState.setAlphaBlend(currentBlendState.alphaOp, blendSrc, blendDst);
		this.setBlendState(_tempBlendState);
};
GraphicsDevice.prototype.setBlendFunctionSeparate = function(blendSrc, blendDst, blendSrcAlpha, blendDstAlpha) {
		const currentBlendState = this.blendState;
		_tempBlendState.copy(currentBlendState);
		_tempBlendState.setColorBlend(currentBlendState.colorOp, blendSrc, blendDst);
		_tempBlendState.setAlphaBlend(currentBlendState.alphaOp, blendSrcAlpha, blendDstAlpha);
		this.setBlendState(_tempBlendState);
};
GraphicsDevice.prototype.setBlendEquation = function(blendEquation) {
		const currentBlendState = this.blendState;
		_tempBlendState.copy(currentBlendState);
		_tempBlendState.setColorBlend(blendEquation, currentBlendState.colorSrcFactor, currentBlendState.colorDstFactor);
		_tempBlendState.setAlphaBlend(blendEquation, currentBlendState.alphaSrcFactor, currentBlendState.alphaDstFactor);
		this.setBlendState(_tempBlendState);
};
GraphicsDevice.prototype.setBlendEquationSeparate = function(blendEquation, blendAlphaEquation) {
		const currentBlendState = this.blendState;
		_tempBlendState.copy(currentBlendState);
		_tempBlendState.setColorBlend(blendEquation, currentBlendState.colorSrcFactor, currentBlendState.colorDstFactor);
		_tempBlendState.setAlphaBlend(blendAlphaEquation, currentBlendState.alphaSrcFactor, currentBlendState.alphaDstFactor);
		this.setBlendState(_tempBlendState);
};
GraphicsDevice.prototype.setColorWrite = function(redWrite, greenWrite, blueWrite, alphaWrite) {
		const currentBlendState = this.blendState;
		_tempBlendState.copy(currentBlendState);
		_tempBlendState.setColorWrite(redWrite, greenWrite, blueWrite, alphaWrite);
		this.setBlendState(_tempBlendState);
};
GraphicsDevice.prototype.getBlending = function() {
		return this.blendState.blend;
};
GraphicsDevice.prototype.setBlending = function(blending) {
		_tempBlendState.copy(this.blendState);
		_tempBlendState.blend = blending;
		this.setBlendState(_tempBlendState);
};
GraphicsDevice.prototype.setDepthWrite = function(write) {
		_tempDepthState.copy(this.depthState);
		_tempDepthState.write = write;
		this.setDepthState(_tempDepthState);
};
GraphicsDevice.prototype.setDepthFunc = function(func) {
		_tempDepthState.copy(this.depthState);
		_tempDepthState.func = func;
		this.setDepthState(_tempDepthState);
};
GraphicsDevice.prototype.setDepthTest = function(test) {
		_tempDepthState.copy(this.depthState);
		_tempDepthState.test = test;
		this.setDepthState(_tempDepthState);
};
GraphicsDevice.prototype.getCullMode = function() {
		return this.cullMode;
};
const Key = AnimationKey;
const Node = AnimationNode;
const LitOptions = LitShaderOptions;
const shaderChunks = new Proxy({}, {
		get (target, prop) {
				return ShaderChunks.get(getApplication().graphicsDevice, SHADERLANGUAGE_GLSL).get(prop);
		},
		set (target, prop, value) {
				ShaderChunks.get(getApplication().graphicsDevice, SHADERLANGUAGE_GLSL).set(prop, value);
				return true;
		}
});
Object.defineProperty(Scene.prototype, 'defaultMaterial', {
		get: function() {
				return getDefaultMaterial(getApplication().graphicsDevice);
		}
});
Object.defineProperty(Scene.prototype, 'fogColor', {
		set: function(value) {
				this.fog.color = value;
		},
		get: function() {
				return this.fog.color;
		}
});
Object.defineProperty(Scene.prototype, 'fogEnd', {
		set: function(value) {
				this.fog.end = value;
		},
		get: function() {
				return this.fog.end;
		}
});
Object.defineProperty(Scene.prototype, 'fogStart', {
		set: function(value) {
				this.fog.start = value;
		},
		get: function() {
				return this.fog.start;
		}
});
Object.defineProperty(Scene.prototype, 'fogDensity', {
		set: function(value) {
				this.fog.density = value;
		},
		get: function() {
				return this.fog.density;
		}
});
Object.defineProperty(Scene.prototype, 'toneMapping', {
		set: function(value) {},
		get: function() {
				return undefined;
		}
});
Object.defineProperty(Scene.prototype, 'gammaCorrection', {
		set: function(value) {},
		get: function() {
				return undefined;
		}
});
Object.defineProperty(Scene.prototype, 'rendering', {
		set: function(value) {},
		get: function() {
				return undefined;
		}
});
Object.defineProperty(LayerComposition.prototype, '_meshInstances', {
		get: function() {
				return null;
		}
});
Object.defineProperty(Scene.prototype, 'drawCalls', {
		get: function() {
				return null;
		}
});
[
		'128',
		'64',
		'32',
		'16',
		'8',
		'4'
].forEach((size, index)=>{
		Object.defineProperty(Scene.prototype, `skyboxPrefiltered${size}`, {
				get: function() {
						return this._prefilteredCubemaps[index];
				},
				set: function(value) {
						this._prefilteredCubemaps[index] = value;
						this.updateShaders = true;
				}
		});
});
Object.defineProperty(Scene.prototype, 'models', {
		get: function() {
				if (!this._models) {
						this._models = [];
				}
				return this._models;
		}
});
function _removedClassProperty(targetClass, name, comment = '') {
		Object.defineProperty(targetClass.prototype, name, {
				set: function(value) {},
				get: function() {
						return undefined;
				}
		});
}
_removedClassProperty(Layer, 'renderTarget');
_removedClassProperty(Layer, 'onPreCull');
_removedClassProperty(Layer, 'onPreRender');
_removedClassProperty(Layer, 'onPreRenderOpaque');
_removedClassProperty(Layer, 'onPreRenderTransparent');
_removedClassProperty(Layer, 'onPostCull');
_removedClassProperty(Layer, 'onPostRender');
_removedClassProperty(Layer, 'onPostRenderOpaque');
_removedClassProperty(Layer, 'onPostRenderTransparent');
_removedClassProperty(Layer, 'onDrawCall');
_removedClassProperty(Layer, 'layerReference');
_removedClassProperty(CameraComponent, 'onPreCull', 'Use Scene#EVENT_PRECULL event instead.');
_removedClassProperty(CameraComponent, 'onPostCull', 'Use Scene#EVENT_POSTCULL event instead.');
_removedClassProperty(CameraComponent, 'onPreRender', 'Use Scene#EVENT_PRERENDER event instead.');
_removedClassProperty(CameraComponent, 'onPostRender', 'Use Scene#EVENT_POSTRENDER event instead.');
_removedClassProperty(CameraComponent, 'onPreRenderLayer', 'Use Scene#EVENT_PRERENDER_LAYER event instead.');
_removedClassProperty(CameraComponent, 'onPostRenderLayer', 'Use Scene#EVENT_POSTRENDER_LAYER event instead.');
ForwardRenderer.prototype.renderComposition = function(comp) {
		getApplication().renderComposition(comp);
};
MeshInstance.prototype.syncAabb = function() {};
Morph.prototype.getTarget = function(index) {
		return this.targets[index];
};
GraphNode.prototype.getChildren = function() {
		return this.children;
};
GraphNode.prototype.getName = function() {
		return this.name;
};
GraphNode.prototype.getPath = function() {
		return this.path;
};
GraphNode.prototype.getRoot = function() {
		return this.root;
};
GraphNode.prototype.getParent = function() {
		return this.parent;
};
GraphNode.prototype.setName = function(name) {
		this.name = name;
};
Object.defineProperty(Material.prototype, 'shader', {
		set: function(value) {},
		get: function() {
				return null;
		}
});
Object.defineProperty(Material.prototype, 'blend', {
		set: function(value) {
				this.blendState.blend = value;
		},
		get: function() {
				return this.blendState.blend;
		}
});
Object.defineProperty(StandardMaterial.prototype, 'shininess', {
		get: function() {
				return this.gloss * 100;
		},
		set: function(value) {
				this.gloss = value * 0.01;
		}
});
Object.defineProperty(StandardMaterial.prototype, 'useGammaTonemap', {
		get: function() {
				return this.useTonemap;
		},
		set: function(value) {
				this.useTonemap = value;
		}
});
Object.defineProperty(StandardMaterial.prototype, 'anisotropy', {
		get: function() {
				const sign = Math.sign(Math.cos(this.anisotropyRotation * math.DEG_TO_RAD * 2));
				return this.anisotropyIntensity * sign;
		},
		set: function(value) {
				this.anisotropyIntensity = Math.abs(value);
				if (value >= 0) {
						this.anisotropyRotation = 0;
				} else {
						this.anisotropyRotation = 90;
				}
		}
});
function _defineAlias(newName, oldName) {
		Object.defineProperty(StandardMaterial.prototype, oldName, {
				get: function() {
						return this[newName];
				},
				set: function(value) {
						this[newName] = value;
				}
		});
}
function _deprecateTint(name) {
		Object.defineProperty(StandardMaterial.prototype, name, {
				get: function() {
						return true;
				},
				set: function(value) {}
		});
}
_deprecateTint('sheenTint');
_deprecateTint('diffuseTint');
_deprecateTint('emissiveTint');
_deprecateTint('ambientTint');
_defineAlias('specularTint', 'specularMapTint');
_defineAlias('aoVertexColor', 'aoMapVertexColor');
_defineAlias('diffuseVertexColor', 'diffuseMapVertexColor');
_defineAlias('specularVertexColor', 'specularMapVertexColor');
_defineAlias('emissiveVertexColor', 'emissiveMapVertexColor');
_defineAlias('metalnessVertexColor', 'metalnessMapVertexColor');
_defineAlias('glossVertexColor', 'glossMapVertexColor');
_defineAlias('opacityVertexColor', 'opacityMapVertexColor');
_defineAlias('lightVertexColor', 'lightMapVertexColor');
_defineAlias('sheenGloss', 'sheenGlossiess');
_defineAlias('clearCoatGloss', 'clearCostGlossiness');
function _defineOption(name, newName) {
		if (name !== 'pass') {
				Object.defineProperty(StandardMaterialOptions.prototype, name, {
						get: function() {
								return this.litOptions[newName || name];
						},
						set: function(value) {
								this.litOptions[newName || name] = value;
						}
				});
		}
}
_defineOption('refraction', 'useRefraction');
const tempOptions = new LitShaderOptions();
const litOptionProperties = Object.getOwnPropertyNames(tempOptions);
for(const litOption in litOptionProperties){
		_defineOption(litOptionProperties[litOption]);
}
AssetRegistry.prototype.getAssetById = function(id) {
		return this.get(id);
};
Object.defineProperty(XrInputSource.prototype, 'ray', {
		get: function() {
				return this._rayLocal;
		}
});
Object.defineProperty(XrInputSource.prototype, 'position', {
		get: function() {
				return this._localPosition;
		}
});
Object.defineProperty(XrInputSource.prototype, 'rotation', {
		get: function() {
				return this._localRotation;
		}
});
const EVENT_KEYDOWN = 'keydown';
const EVENT_KEYUP = 'keyup';
const EVENT_MOUSEDOWN = 'mousedown';
const EVENT_MOUSEMOVE = 'mousemove';
const EVENT_MOUSEUP = 'mouseup';
const EVENT_MOUSEWHEEL = 'mousewheel';
const EVENT_TOUCHSTART = 'touchstart';
const EVENT_TOUCHEND = 'touchend';
const EVENT_TOUCHMOVE = 'touchmove';
const EVENT_TOUCHCANCEL = 'touchcancel';
const EVENT_GAMEPADCONNECTED = 'gamepadconnected';
const EVENT_GAMEPADDISCONNECTED = 'gamepaddisconnected';
const EVENT_SELECT = 'select';
const EVENT_SELECTSTART = 'selectstart';
const EVENT_SELECTEND = 'selectend';
Object.defineProperty(ElementInput.prototype, 'wheel', {
		get: function() {
				return this.wheelDelta * -2;
		}
});
Object.defineProperty(MouseEvent.prototype, 'wheel', {
		get: function() {
				return this.wheelDelta * -2;
		}
});
const RIGIDBODY_TYPE_STATIC = BODYTYPE_STATIC;
const RIGIDBODY_TYPE_DYNAMIC = BODYTYPE_DYNAMIC;
const RIGIDBODY_TYPE_KINEMATIC = BODYTYPE_KINEMATIC;
const RIGIDBODY_CF_STATIC_OBJECT = BODYFLAG_STATIC_OBJECT;
const RIGIDBODY_CF_KINEMATIC_OBJECT = BODYFLAG_KINEMATIC_OBJECT;
const RIGIDBODY_CF_NORESPONSE_OBJECT = BODYFLAG_NORESPONSE_OBJECT;
const RIGIDBODY_ACTIVE_TAG = BODYSTATE_ACTIVE_TAG;
const RIGIDBODY_ISLAND_SLEEPING = BODYSTATE_ISLAND_SLEEPING;
const RIGIDBODY_WANTS_DEACTIVATION = BODYSTATE_WANTS_DEACTIVATION;
const RIGIDBODY_DISABLE_DEACTIVATION = BODYSTATE_DISABLE_DEACTIVATION;
const RIGIDBODY_DISABLE_SIMULATION = BODYSTATE_DISABLE_SIMULATION;
AppBase.prototype.isFullscreen = function() {
		return !!document.fullscreenElement;
};
AppBase.prototype.enableFullscreen = function(element, success, error) {
		element = element || this.graphicsDevice.canvas;
		const s = function() {
				success();
				document.removeEventListener('fullscreenchange', s);
		};
		const e = function() {
				error();
				document.removeEventListener('fullscreenerror', e);
		};
		if (success) {
				document.addEventListener('fullscreenchange', s, false);
		}
		if (error) {
				document.addEventListener('fullscreenerror', e, false);
		}
		if (element.requestFullscreen) {
				element.requestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		} else {
				error();
		}
};
AppBase.prototype.disableFullscreen = function(success) {
		const s = function() {
				success();
				document.removeEventListener('fullscreenchange', s);
		};
		if (success) {
				document.addEventListener('fullscreenchange', s, false);
		}
		document.exitFullscreen();
};
AppBase.prototype.getSceneUrl = function(name) {
		const entry = this.scenes.find(name);
		if (entry) {
				return entry.url;
		}
		return null;
};
AppBase.prototype.loadScene = function(url, callback) {
		this.scenes.loadScene(url, callback);
};
AppBase.prototype.loadSceneHierarchy = function(url, callback) {
		this.scenes.loadSceneHierarchy(url, callback);
};
AppBase.prototype.loadSceneSettings = function(url, callback) {
		this.scenes.loadSceneSettings(url, callback);
};
ModelComponent.prototype.setVisible = function(visible) {
		this.enabled = visible;
};
Object.defineProperty(RigidBodyComponent.prototype, 'bodyType', {
		get: function() {
				return this.type;
		},
		set: function(type) {
				this.type = type;
		}
});
RigidBodyComponent.prototype.syncBodyToEntity = function() {
		this._updateDynamic();
};
RigidBodyComponentSystem.prototype.setGravity = function() {
		if (arguments.length === 1) {
				this.gravity.copy(arguments[0]);
		} else {
				this.gravity.set(arguments[0], arguments[1], arguments[2]);
		}
};

export { BLENDMODE_CONSTANT_ALPHA, BLENDMODE_CONSTANT_COLOR, BLENDMODE_ONE_MINUS_CONSTANT_ALPHA, BLENDMODE_ONE_MINUS_CONSTANT_COLOR, CHUNKAPI_1_51, CHUNKAPI_1_55, CHUNKAPI_1_56, CHUNKAPI_1_57, CHUNKAPI_1_58, CHUNKAPI_1_60, CHUNKAPI_1_62, CHUNKAPI_1_65, CHUNKAPI_1_70, CHUNKAPI_2_1, CHUNKAPI_2_3, CHUNKAPI_2_5, CHUNKAPI_2_6, CHUNKAPI_2_7, CHUNKAPI_2_8, EVENT_GAMEPADCONNECTED, EVENT_GAMEPADDISCONNECTED, EVENT_KEYDOWN, EVENT_KEYUP, EVENT_MOUSEDOWN, EVENT_MOUSEMOVE, EVENT_MOUSEUP, EVENT_MOUSEWHEEL, EVENT_SELECT, EVENT_SELECTEND, EVENT_SELECTSTART, EVENT_TOUCHCANCEL, EVENT_TOUCHEND, EVENT_TOUCHMOVE, EVENT_TOUCHSTART, Key, LitOptions, Node, PIXELFORMAT_L8_A8, PIXELFORMAT_R4_G4_B4_A4, PIXELFORMAT_R5_G5_B5_A1, PIXELFORMAT_R5_G6_B5, PIXELFORMAT_R8_G8_B8, PIXELFORMAT_R8_G8_B8_A8, PIXELFORMAT_SRGB, PIXELFORMAT_SRGBA, RIGIDBODY_ACTIVE_TAG, RIGIDBODY_CF_KINEMATIC_OBJECT, RIGIDBODY_CF_NORESPONSE_OBJECT, RIGIDBODY_CF_STATIC_OBJECT, RIGIDBODY_DISABLE_DEACTIVATION, RIGIDBODY_DISABLE_SIMULATION, RIGIDBODY_ISLAND_SLEEPING, RIGIDBODY_TYPE_DYNAMIC, RIGIDBODY_TYPE_KINEMATIC, RIGIDBODY_TYPE_STATIC, RIGIDBODY_WANTS_DEACTIVATION, createBox, createCapsule, createCone, createCylinder, createMesh, createPlane, createSphere, createTorus, drawFullscreenQuad, shaderChunks };
