import { BLEND_NONE, DITHER_NONE, FOG_NONE, GAMMA_NONE, REFLECTIONSRC_NONE } from '../../constants.js';

/**
 * @import { ShaderChunks } from '../shader-chunks.js';
 */ /**
 * The lit shader options determines how the lit-shader gets generated. It specifies a set of
 * parameters which triggers different fragment and vertex shader generation in the backend.
 *
 * @category Graphics
 */ class LitShaderOptions {
    constructor(){
        this.hasTangents = false;
        /**
     * Custom shader chunks that will replace default ones.
     *
     * @type {ShaderChunks|null}
     */ this.shaderChunks = null;
        // one of the SHADER_ constants
        this.pass = 0;
        /**
     * Enable alpha testing. See {@link Material#alphaTest}.
     *
     * @type {boolean}
     */ this.alphaTest = false;
        /**
     * The value of {@link Material#blendType}.
     *
     * @type {number}
     */ this.blendType = BLEND_NONE;
        this.separateAmbient = false;
        this.screenSpace = false;
        this.skin = false;
        this.batch = false;
        /**
     * If hardware instancing compatible shader should be generated. Transform is read from
     * per-instance {@link VertexBuffer} instead of shader's uniforms.
     *
     * @type {boolean}
     */ this.useInstancing = false;
        /**
     * If morphing code should be generated to morph positions.
     *
     * @type {boolean}
     */ this.useMorphPosition = false;
        /**
     * If morphing code should be generated to morph normals.
     *
     * @type {boolean}
     */ this.useMorphNormal = false;
        this.useMorphTextureBasedInt = false;
        this.nineSlicedMode = 0;
        this.clusteredLightingEnabled = true;
        this.clusteredLightingCookiesEnabled = false;
        this.clusteredLightingShadowsEnabled = false;
        this.clusteredLightingShadowType = 0;
        this.clusteredLightingAreaLightsEnabled = false;
        this.vertexColors = false;
        this.useVertexColorGamma = false;
        this.lightMapEnabled = false;
        this.dirLightMapEnabled = false;
        this.useHeights = false;
        this.useNormals = false;
        this.useClearCoatNormals = false;
        this.useAo = false;
        this.diffuseMapEnabled = false;
        this.pixelSnap = false;
        /**
     * If ambient spherical harmonics are used. Ambient SH replace prefiltered cubemap ambient on
     * certain platforms (mostly Android) for performance reasons.
     *
     * @type {boolean}
     */ this.ambientSH = false;
        /**
     * Apply SSAO during the lighting.
     *
     * @type {boolean}
     */ this.ssao = false;
        /**
     * The value of {@link StandardMaterial#twoSidedLighting}.
     *
     * @type {boolean}
     */ this.twoSidedLighting = false;
        /**
     * The value of {@link StandardMaterial#occludeDirect}.
     *
     * @type {boolean}
     */ this.occludeDirect = false;
        /**
     * The value of {@link StandardMaterial#occludeSpecular}.
     *
     * @type {number}
     */ this.occludeSpecular = 0;
        /**
     * Defines if {@link StandardMaterial#occludeSpecularIntensity} constant should affect specular
     * occlusion.
     *
     * @type {boolean}
     */ this.occludeSpecularFloat = false;
        this.useMsdf = false;
        this.msdfTextAttribute = false;
        /**
     * Enable alpha to coverage. See {@link Material#alphaToCoverage}.
     *
     * @type {boolean}
     */ this.alphaToCoverage = false;
        /**
     * Enable specular fade. See {@link StandardMaterial#opacityFadesSpecular}.
     *
     * @type {boolean}
     */ this.opacityFadesSpecular = false;
        /**
     * Enable opacity dithering. See {@link StandardMaterial#opacityDither}.
     *
     * @type {string}
     */ this.opacityDither = DITHER_NONE;
        /**
     * Enable opacity shadow dithering. See {@link StandardMaterial#opacityShadowDither}.
     *
     * @type {string}
     */ this.opacityShadowDither = DITHER_NONE;
        /**
     * The value of {@link StandardMaterial#cubeMapProjection}.
     *
     * @type {number}
     */ this.cubeMapProjection = 0;
        /**
     * If any specular or reflections are needed at all.
     *
     * @type {boolean}
     */ this.useSpecular = false;
        this.useSpecularityFactor = false;
        this.enableGGXSpecular = false;
        /**
     * The value of {@link StandardMaterial#fresnelModel}.
     *
     * @type {number}
     */ this.fresnelModel = 0;
        /**
     * If refraction is used.
     *
     * @type {boolean}
     */ this.useRefraction = false;
        this.useClearCoat = false;
        this.useSheen = false;
        this.useIridescence = false;
        /**
     * The value of {@link StandardMaterial#useMetalness}.
     *
     * @type {boolean}
     */ this.useMetalness = false;
        this.useDynamicRefraction = false;
        this.dispersion = false;
        /**
     * The type of fog being applied in the shader. See {@link Scene#fog} for the list of possible
     * values.
     *
     * @type {string}
     */ this.fog = FOG_NONE;
        /**
     * The type of gamma correction being applied in the shader. See
     * {@link CameraComponent#gammaCorrection} for the list of possible values.
     *
     * @type {number}
     */ this.gamma = GAMMA_NONE;
        /**
     * The type of tone mapping being applied in the shader. See {@link CameraComponent#toneMapping}
     * for the list of possible values.
     *
     * @type {number}
     */ this.toneMap = -1;
        /**
     * One of REFLECTIONSRC_*** constants.
     *
     * @type {string}
     */ this.reflectionSource = REFLECTIONSRC_NONE;
        this.reflectionEncoding = null;
        this.reflectionCubemapEncoding = null;
        /**
     * One of "ambientSH", "envAtlas", "constant".
     *
     * @type {string}
     */ this.ambientSource = 'constant';
        this.ambientEncoding = null;
        // TODO: add a test for if non skybox cubemaps have rotation (when this is supported) - for now
        // assume no non-skybox cubemap rotation
        /**
     * Skybox intensity factor.
     *
     * @type {number}
     */ this.skyboxIntensity = 1.0;
        /**
     * If cube map rotation is enabled.
     *
     * @type {boolean}
     */ this.useCubeMapRotation = false;
        this.lightMapWithoutAmbient = false;
        this.lights = [];
        this.noShadow = false;
        this.lightMaskDynamic = 0x0;
        /**
     * Object containing a map of user defined vertex attributes to attached shader semantics.
     *
     * @type {Object<string, string>}
     */ this.userAttributes = {};
        /**
     * Make vLinearDepth available in the shader.
     *
     * @type {boolean}
     */ this.linearDepth = false;
        /**
     * Shader outputs the accumulated shadow value, used for shadow catcher materials.
     */ this.shadowCatcher = false;
    }
}

export { LitShaderOptions };
