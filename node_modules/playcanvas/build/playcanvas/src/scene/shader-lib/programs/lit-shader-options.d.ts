/**
 * @import { ShaderChunks } from '../shader-chunks.js';
 */
/**
 * The lit shader options determines how the lit-shader gets generated. It specifies a set of
 * parameters which triggers different fragment and vertex shader generation in the backend.
 *
 * @category Graphics
 */
export class LitShaderOptions {
    hasTangents: boolean;
    /**
     * Custom shader chunks that will replace default ones.
     *
     * @type {ShaderChunks|null}
     */
    shaderChunks: ShaderChunks | null;
    pass: number;
    /**
     * Enable alpha testing. See {@link Material#alphaTest}.
     *
     * @type {boolean}
     */
    alphaTest: boolean;
    /**
     * The value of {@link Material#blendType}.
     *
     * @type {number}
     */
    blendType: number;
    separateAmbient: boolean;
    screenSpace: boolean;
    skin: boolean;
    batch: boolean;
    /**
     * If hardware instancing compatible shader should be generated. Transform is read from
     * per-instance {@link VertexBuffer} instead of shader's uniforms.
     *
     * @type {boolean}
     */
    useInstancing: boolean;
    /**
     * If morphing code should be generated to morph positions.
     *
     * @type {boolean}
     */
    useMorphPosition: boolean;
    /**
     * If morphing code should be generated to morph normals.
     *
     * @type {boolean}
     */
    useMorphNormal: boolean;
    useMorphTextureBasedInt: boolean;
    nineSlicedMode: number;
    clusteredLightingEnabled: boolean;
    clusteredLightingCookiesEnabled: boolean;
    clusteredLightingShadowsEnabled: boolean;
    clusteredLightingShadowType: number;
    clusteredLightingAreaLightsEnabled: boolean;
    vertexColors: boolean;
    useVertexColorGamma: boolean;
    lightMapEnabled: boolean;
    dirLightMapEnabled: boolean;
    useHeights: boolean;
    useNormals: boolean;
    useClearCoatNormals: boolean;
    useAo: boolean;
    diffuseMapEnabled: boolean;
    pixelSnap: boolean;
    /**
     * If ambient spherical harmonics are used. Ambient SH replace prefiltered cubemap ambient on
     * certain platforms (mostly Android) for performance reasons.
     *
     * @type {boolean}
     */
    ambientSH: boolean;
    /**
     * Apply SSAO during the lighting.
     *
     * @type {boolean}
     */
    ssao: boolean;
    /**
     * The value of {@link StandardMaterial#twoSidedLighting}.
     *
     * @type {boolean}
     */
    twoSidedLighting: boolean;
    /**
     * The value of {@link StandardMaterial#occludeDirect}.
     *
     * @type {boolean}
     */
    occludeDirect: boolean;
    /**
     * The value of {@link StandardMaterial#occludeSpecular}.
     *
     * @type {number}
     */
    occludeSpecular: number;
    /**
     * Defines if {@link StandardMaterial#occludeSpecularIntensity} constant should affect specular
     * occlusion.
     *
     * @type {boolean}
     */
    occludeSpecularFloat: boolean;
    useMsdf: boolean;
    msdfTextAttribute: boolean;
    /**
     * Enable alpha to coverage. See {@link Material#alphaToCoverage}.
     *
     * @type {boolean}
     */
    alphaToCoverage: boolean;
    /**
     * Enable specular fade. See {@link StandardMaterial#opacityFadesSpecular}.
     *
     * @type {boolean}
     */
    opacityFadesSpecular: boolean;
    /**
     * Enable opacity dithering. See {@link StandardMaterial#opacityDither}.
     *
     * @type {string}
     */
    opacityDither: string;
    /**
     * Enable opacity shadow dithering. See {@link StandardMaterial#opacityShadowDither}.
     *
     * @type {string}
     */
    opacityShadowDither: string;
    /**
     * The value of {@link StandardMaterial#cubeMapProjection}.
     *
     * @type {number}
     */
    cubeMapProjection: number;
    /**
     * If any specular or reflections are needed at all.
     *
     * @type {boolean}
     */
    useSpecular: boolean;
    useSpecularityFactor: boolean;
    enableGGXSpecular: boolean;
    /**
     * The value of {@link StandardMaterial#fresnelModel}.
     *
     * @type {number}
     */
    fresnelModel: number;
    /**
     * If refraction is used.
     *
     * @type {boolean}
     */
    useRefraction: boolean;
    useClearCoat: boolean;
    useSheen: boolean;
    useIridescence: boolean;
    /**
     * The value of {@link StandardMaterial#useMetalness}.
     *
     * @type {boolean}
     */
    useMetalness: boolean;
    useDynamicRefraction: boolean;
    dispersion: boolean;
    /**
     * The type of fog being applied in the shader. See {@link Scene#fog} for the list of possible
     * values.
     *
     * @type {string}
     */
    fog: string;
    /**
     * The type of gamma correction being applied in the shader. See
     * {@link CameraComponent#gammaCorrection} for the list of possible values.
     *
     * @type {number}
     */
    gamma: number;
    /**
     * The type of tone mapping being applied in the shader. See {@link CameraComponent#toneMapping}
     * for the list of possible values.
     *
     * @type {number}
     */
    toneMap: number;
    /**
     * One of REFLECTIONSRC_*** constants.
     *
     * @type {string}
     */
    reflectionSource: string;
    reflectionEncoding: any;
    reflectionCubemapEncoding: any;
    /**
     * One of "ambientSH", "envAtlas", "constant".
     *
     * @type {string}
     */
    ambientSource: string;
    ambientEncoding: any;
    /**
     * Skybox intensity factor.
     *
     * @type {number}
     */
    skyboxIntensity: number;
    /**
     * If cube map rotation is enabled.
     *
     * @type {boolean}
     */
    useCubeMapRotation: boolean;
    lightMapWithoutAmbient: boolean;
    lights: any[];
    noShadow: boolean;
    lightMaskDynamic: number;
    /**
     * Object containing a map of user defined vertex attributes to attached shader semantics.
     *
     * @type {Object<string, string>}
     */
    userAttributes: {
        [x: string]: string;
    };
    /**
     * Make vLinearDepth available in the shader.
     *
     * @type {boolean}
     */
    linearDepth: boolean;
    /**
     * Shader outputs the accumulated shadow value, used for shadow catcher materials.
     */
    shadowCatcher: boolean;
}
import type { ShaderChunks } from '../shader-chunks.js';
