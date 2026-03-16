import { PIXELFORMAT_DEPTH, PIXELFORMAT_DEPTH16, PIXELFORMAT_RGBA16F, PIXELFORMAT_RGBA32F, PIXELFORMAT_R32F } from '../platform/graphics/constants.js';

/**
 * Subtract the color of the source fragment from the destination fragment and write the result to
 * the frame buffer.
 *
 * @category Graphics
 */ const BLEND_SUBTRACTIVE = 0;
/**
 * Add the color of the source fragment to the destination fragment and write the result to the
 * frame buffer.
 *
 * @category Graphics
 */ const BLEND_ADDITIVE = 1;
/**
 * Enable simple translucency for materials such as glass. This is equivalent to enabling a source
 * blend mode of {@link BLENDMODE_SRC_ALPHA} and a destination blend mode of
 * {@link BLENDMODE_ONE_MINUS_SRC_ALPHA}.
 *
 * @category Graphics
 */ const BLEND_NORMAL = 2;
/**
 * Disable blending.
 *
 * @category Graphics
 */ const BLEND_NONE = 3;
/**
 * Similar to {@link BLEND_NORMAL} expect the source fragment is assumed to have already been
 * multiplied by the source alpha value.
 *
 * @category Graphics
 */ const BLEND_PREMULTIPLIED = 4;
/**
 * Multiply the color of the source fragment by the color of the destination fragment and write the
 * result to the frame buffer.
 *
 * @category Graphics
 */ const BLEND_MULTIPLICATIVE = 5;
/**
 * Same as {@link BLEND_ADDITIVE} except the source RGB is multiplied by the source alpha.
 *
 * @category Graphics
 */ const BLEND_ADDITIVEALPHA = 6;
/**
 * Multiplies colors and doubles the result.
 *
 * @category Graphics
 */ const BLEND_MULTIPLICATIVE2X = 7;
/**
 * Softer version of additive.
 *
 * @category Graphics
 */ const BLEND_SCREEN = 8;
/**
 * Minimum color.
 *
 * @category Graphics
 */ const BLEND_MIN = 9;
/**
 * Maximum color.
 *
 * @category Graphics
 */ const BLEND_MAX = 10;
const blendNames = {
    [BLEND_SUBTRACTIVE]: 'SUBTRACTIVE',
    [BLEND_ADDITIVE]: 'ADDITIVE',
    [BLEND_NORMAL]: 'NORMAL',
    [BLEND_NONE]: 'NONE',
    [BLEND_PREMULTIPLIED]: 'PREMULTIPLIED',
    [BLEND_MULTIPLICATIVE]: 'MULTIPLICATIVE',
    [BLEND_ADDITIVEALPHA]: 'ADDITIVEALPHA',
    [BLEND_MULTIPLICATIVE2X]: 'MULTIPLICATIVE2X',
    [BLEND_SCREEN]: 'SCREEN',
    [BLEND_MIN]: 'MIN',
    [BLEND_MAX]: 'MAX'
};
/**
 * No fog is applied to the scene.
 *
 * @category Graphics
 */ const FOG_NONE = 'none';
/**
 * Fog rises linearly from zero to 1 between a start and end depth.
 *
 * @category Graphics
 */ const FOG_LINEAR = 'linear';
/**
 * Fog rises according to an exponential curve controlled by a density value.
 *
 * @category Graphics
 */ const FOG_EXP = 'exp';
/**
 * Fog rises according to an exponential curve controlled by a density value.
 *
 * @category Graphics
 */ const FOG_EXP2 = 'exp2';
/**
 * No Fresnel.
 *
 * @category Graphics
 */ const FRESNEL_NONE = 0;
/**
 * Schlick's approximation of Fresnel.
 *
 * @category Graphics
 */ const FRESNEL_SCHLICK = 2;
const fresnelNames = {
    [FRESNEL_NONE]: 'NONE',
    [FRESNEL_SCHLICK]: 'SCHLICK'
};
// Legacy
const LAYER_HUD = 0;
const LAYER_GIZMO = 1;
// 3 - 14 are custom user layers
const LAYER_WORLD = 15;
// New layers
/**
 * The world layer.
 *
 * @category Graphics
 */ const LAYERID_WORLD = 0;
/**
 * The depth layer.
 *
 * @category Graphics
 */ const LAYERID_DEPTH = 1;
/**
 * The skybox layer.
 *
 * @category Graphics
 */ const LAYERID_SKYBOX = 2;
/**
 * The immediate layer.
 *
 * @category Graphics
 */ const LAYERID_IMMEDIATE = 3;
/**
 * The UI layer.
 *
 * @category Graphics
 */ const LAYERID_UI = 4;
/**
 * Directional (global) light source.
 *
 * @category Graphics
 */ const LIGHTTYPE_DIRECTIONAL = 0;
/**
 * Omni-directional (local) light source.
 *
 * @category Graphics
 */ const LIGHTTYPE_OMNI = 1;
/**
 * Point (local) light source.
 *
 * @ignore
 * @category Graphics
 */ const LIGHTTYPE_POINT = LIGHTTYPE_OMNI;
/**
 * Spot (local) light source.
 *
 * @category Graphics
 */ const LIGHTTYPE_SPOT = 2;
// private - the number of light types
const LIGHTTYPE_COUNT = 3;
const lightTypeNames = {
    [LIGHTTYPE_DIRECTIONAL]: 'DIRECTIONAL',
    [LIGHTTYPE_OMNI]: 'OMNI',
    [LIGHTTYPE_SPOT]: 'SPOT'
};
// a divider clustered lights use to bring physical light intensity to half-float range
const LIGHT_COLOR_DIVIDER = 100;
/**
 * Infinitesimally small point light source shape.
 *
 * @category Graphics
 */ const LIGHTSHAPE_PUNCTUAL = 0;
/**
 * Rectangle shape of light source.
 *
 * @category Graphics
 */ const LIGHTSHAPE_RECT = 1;
/**
 * Disk shape of light source.
 *
 * @category Graphics
 */ const LIGHTSHAPE_DISK = 2;
/**
 * Sphere shape of light source.
 *
 * @category Graphics
 */ const LIGHTSHAPE_SPHERE = 3;
const lightShapeNames = {
    [LIGHTSHAPE_PUNCTUAL]: 'PUNCTUAL',
    [LIGHTSHAPE_RECT]: 'RECT',
    [LIGHTSHAPE_DISK]: 'DISK',
    [LIGHTSHAPE_SPHERE]: 'SPHERE'
};
/**
 * Linear distance falloff model for light attenuation.
 *
 * @category Graphics
 */ const LIGHTFALLOFF_LINEAR = 0;
/**
 * Inverse squared distance falloff model for light attenuation.
 *
 * @category Graphics
 */ const LIGHTFALLOFF_INVERSESQUARED = 1;
const lightFalloffNames = {
    [LIGHTFALLOFF_LINEAR]: 'LINEAR',
    [LIGHTFALLOFF_INVERSESQUARED]: 'INVERSESQUARED'
};
/**
 * A shadow sampling technique using 32bit shadow map that averages depth comparisons from a 3x3
 * grid of texels for softened shadow edges.
 *
 * @category Graphics
 */ const SHADOW_PCF3_32F = 0;
/**
 * @deprecated
 * @ignore
 */ const SHADOW_PCF3 = 0; // alias for SHADOW_PCF3_32F for backwards compatibility
/**
 * A shadow sampling technique using a 16-bit exponential variance shadow map that leverages
 * variance to approximate shadow boundaries, enabling soft shadows. Only supported when
 * {@link GraphicsDevice#textureHalfFloatRenderable} is true. Falls back to {@link SHADOW_PCF3_32F},
 * if not supported.
 *
 * @category Graphics
 */ const SHADOW_VSM_16F = 2;
/**
 * @deprecated
 * @ignore
 */ const SHADOW_VSM16 = 2; // alias for SHADOW_VSM_16F for backwards compatibility
/**
 * A shadow sampling technique using a 32-bit exponential variance shadow map that leverages
 * variance to approximate shadow boundaries, enabling soft shadows. Only supported when
 * {@link GraphicsDevice#textureFloatRenderable} is true. Falls back to {@link SHADOW_VSM_16F}, if
 * not supported.
 *
 * @category Graphics
 */ const SHADOW_VSM_32F = 3;
/**
 * @deprecated
 * @ignore
 */ const SHADOW_VSM32 = 3; // alias for SHADOW_VSM_32F for backwards compatibility
/**
 * A shadow sampling technique using 32bit shadow map that averages depth comparisons from a 5x5
 * grid of texels for softened shadow edges.
 *
 * @category Graphics
 */ const SHADOW_PCF5_32F = 4;
/**
 * @deprecated
 * @ignore
 */ const SHADOW_PCF5 = 4; // alias for SHADOW_PCF5_32F for backwards compatibility
/**
 * A shadow sampling technique using a 32-bit shadow map that performs a single depth comparison for
 * sharp shadow edges.
 *
 * @category Graphics
 */ const SHADOW_PCF1_32F = 5;
/**
 * @deprecated
 * @ignore
 */ const SHADOW_PCF1 = 5; // alias for SHADOW_PCF1_32F for backwards compatibility
/**
 * A shadow sampling technique using a 32-bit shadow map that adjusts filter size based on blocker
 * distance, producing realistic, soft shadow edges that vary with the light's occlusion. Note that
 * this technique requires both {@link GraphicsDevice#textureFloatRenderable} and
 * {@link GraphicsDevice#textureFloatFilterable} to be true, and falls back to
 * {@link SHADOW_PCF3_32F} otherwise.
 *
 * @category Graphics
 */ const SHADOW_PCSS_32F = 6;
/**
 * A shadow sampling technique using a 16-bit shadow map that performs a single depth comparison for
 * sharp shadow edges.
 *
 * @category Graphics
 */ const SHADOW_PCF1_16F = 7;
/**
 * A shadow sampling technique using 16-bit shadow map that averages depth comparisons from a 3x3
 * grid of texels for softened shadow edges.
 *
 * @category Graphics
 */ const SHADOW_PCF3_16F = 8;
/**
 * A shadow sampling technique using 16-bit shadow map that averages depth comparisons from a 3x3
 * grid of texels for softened shadow edges.
 *
 * @category Graphics
 */ const SHADOW_PCF5_16F = 9;
/**
 * Information about shadow types.
 *
 * @type {Map<number, { name: string, format: number, pcf?: boolean, vsm?: boolean }>}
 * @ignore
 */ const shadowTypeInfo = new Map([
    [
        SHADOW_PCF1_32F,
        {
            name: 'PCF1_32F',
            kind: 'PCF1',
            format: PIXELFORMAT_DEPTH,
            pcf: true
        }
    ],
    [
        SHADOW_PCF3_32F,
        {
            name: 'PCF3_32F',
            kind: 'PCF3',
            format: PIXELFORMAT_DEPTH,
            pcf: true
        }
    ],
    [
        SHADOW_PCF5_32F,
        {
            name: 'PCF5_32F',
            kind: 'PCF5',
            format: PIXELFORMAT_DEPTH,
            pcf: true
        }
    ],
    [
        SHADOW_PCF1_16F,
        {
            name: 'PCF1_16F',
            kind: 'PCF1',
            format: PIXELFORMAT_DEPTH16,
            pcf: true
        }
    ],
    [
        SHADOW_PCF3_16F,
        {
            name: 'PCF3_16F',
            kind: 'PCF3',
            format: PIXELFORMAT_DEPTH16,
            pcf: true
        }
    ],
    [
        SHADOW_PCF5_16F,
        {
            name: 'PCF5_16F',
            kind: 'PCF5',
            format: PIXELFORMAT_DEPTH16,
            pcf: true
        }
    ],
    [
        SHADOW_VSM_16F,
        {
            name: 'VSM_16F',
            kind: 'VSM',
            format: PIXELFORMAT_RGBA16F,
            vsm: true
        }
    ],
    [
        SHADOW_VSM_32F,
        {
            name: 'VSM_32F',
            kind: 'VSM',
            format: PIXELFORMAT_RGBA32F,
            vsm: true
        }
    ],
    [
        SHADOW_PCSS_32F,
        {
            name: 'PCSS_32F',
            kind: 'PCSS',
            format: PIXELFORMAT_R32F,
            pcss: true
        }
    ]
]);
/**
 * The flag that controls shadow rendering for the 0 cascade
 *
 * @category Graphics
 */ const SHADOW_CASCADE_0 = 1;
/**
 * The flag that controls shadow rendering for the 1 cascade
 *
 * @category Graphics
 */ const SHADOW_CASCADE_1 = 2;
/**
 * The flag that controls shadow rendering for the 2 cascade
 *
 * @category Graphics
 */ const SHADOW_CASCADE_2 = 4;
/**
 * The flag that controls shadow rendering for the 3 cascade
 *
 * @category Graphics
 */ const SHADOW_CASCADE_3 = 8;
/**
 * The flag that controls shadow rendering for the all cascades
 *
 * @category Graphics
 */ const SHADOW_CASCADE_ALL = 255;
/**
 * Box filter.
 *
 * @category Graphics
 */ const BLUR_BOX = 0;
/**
 * Gaussian filter. May look smoother than box, but requires more samples.
 *
 * @category Graphics
 */ const BLUR_GAUSSIAN = 1;
/**
 * No sorting, particles are drawn in arbitrary order. Can be simulated on GPU.
 *
 * @category Graphics
 */ const PARTICLESORT_NONE = 0;
/**
 * Sorting based on distance to the camera. CPU only.
 *
 * @category Graphics
 */ const PARTICLESORT_DISTANCE = 1;
/**
 * Newer particles are drawn first. CPU only.
 *
 * @category Graphics
 */ const PARTICLESORT_NEWER_FIRST = 2;
/**
 * Older particles are drawn first. CPU only.
 *
 * @category Graphics
 */ const PARTICLESORT_OLDER_FIRST = 3;
const PARTICLEMODE_GPU = 0;
const PARTICLEMODE_CPU = 1;
/**
 * Box shape parameterized by emitterExtents. Initial velocity is directed towards local Z axis.
 *
 * @category Graphics
 */ const EMITTERSHAPE_BOX = 0;
/**
 * Sphere shape parameterized by emitterRadius. Initial velocity is directed outwards from the
 * center.
 *
 * @category Graphics
 */ const EMITTERSHAPE_SPHERE = 1;
/**
 * Particles are facing camera.
 *
 * @category Graphics
 */ const PARTICLEORIENTATION_SCREEN = 0;
/**
 * User defines world space normal (particleNormal) to set planes orientation.
 *
 * @category Graphics
 */ const PARTICLEORIENTATION_WORLD = 1;
/**
 * Similar to previous, but the normal is affected by emitter(entity) transformation.
 *
 * @category Graphics
 */ const PARTICLEORIENTATION_EMITTER = 2;
/**
 * A perspective camera projection where the frustum shape is essentially pyramidal.
 *
 * @category Graphics
 */ const PROJECTION_PERSPECTIVE = 0;
/**
 * An orthographic camera projection where the frustum shape is essentially a cuboid.
 *
 * @category Graphics
 */ const PROJECTION_ORTHOGRAPHIC = 1;
/**
 * Render mesh instance as solid geometry.
 *
 * @category Graphics
 */ const RENDERSTYLE_SOLID = 0;
/**
 * Render mesh instance as wireframe.
 *
 * @category Graphics
 */ const RENDERSTYLE_WIREFRAME = 1;
/**
 * Render mesh instance as points.
 *
 * @category Graphics
 */ const RENDERSTYLE_POINTS = 2;
/**
 * The cube map is treated as if it is infinitely far away.
 *
 * @category Graphics
 */ const CUBEPROJ_NONE = 0;
/**
 * The cube map is box-projected based on a world space axis-aligned bounding box.
 *
 * @category Graphics
 */ const CUBEPROJ_BOX = 1;
// names of the cubemap projection
const cubemaProjectionNames = {
    [CUBEPROJ_NONE]: 'NONE',
    [CUBEPROJ_BOX]: 'BOX'
};
/**
 * Multiply together the primary and secondary colors.
 *
 * @category Graphics
 */ const DETAILMODE_MUL = 'mul';
/**
 * Add together the primary and secondary colors.
 *
 * @category Graphics
 */ const DETAILMODE_ADD = 'add';
/**
 * Softer version of {@link DETAILMODE_ADD}.
 *
 * @category Graphics
 */ const DETAILMODE_SCREEN = 'screen';
/**
 * Multiplies or screens the colors, depending on the primary color.
 *
 * @category Graphics
 */ const DETAILMODE_OVERLAY = 'overlay';
/**
 * Select whichever of the primary and secondary colors is darker, component-wise.
 *
 * @category Graphics
 */ const DETAILMODE_MIN = 'min';
/**
 * Select whichever of the primary and secondary colors is lighter, component-wise.
 *
 * @category Graphics
 */ const DETAILMODE_MAX = 'max';
/**
 * No gamma correction.
 *
 * @category Graphics
 */ const GAMMA_NONE = 0;
/**
 * Apply sRGB gamma correction.
 *
 * @category Graphics
 */ const GAMMA_SRGB = 1;
// names of the gamma correction modes
const gammaNames = {
    [GAMMA_NONE]: 'NONE',
    [GAMMA_SRGB]: 'SRGB'
};
/**
 * Linear tonemapping. The colors are preserved, but the exposure is applied.
 *
 * @category Graphics
 */ const TONEMAP_LINEAR = 0;
/**
 * Filmic tonemapping curve.
 *
 * @category Graphics
 */ const TONEMAP_FILMIC = 1;
/**
 * Hejl filmic tonemapping curve.
 *
 * @category Graphics
 */ const TONEMAP_HEJL = 2;
/**
 * ACES filmic tonemapping curve.
 *
 * @category Graphics
 */ const TONEMAP_ACES = 3;
/**
 * ACES v2 filmic tonemapping curve.
 *
 * @category Graphics
 */ const TONEMAP_ACES2 = 4;
/**
 * Khronos PBR Neutral tonemapping curve.
 *
 * @category Graphics
 */ const TONEMAP_NEUTRAL = 5;
/**
 * No tonemapping or exposure is applied. Used for HDR rendering.
 *
 * @category Graphics
 */ const TONEMAP_NONE = 6;
// names of the tonemaps
const tonemapNames = [
    'LINEAR',
    'FILMIC',
    'HEJL',
    'ACES',
    'ACES2',
    'NEUTRAL',
    'NONE'
];
/**
 * No specular occlusion.
 *
 * @category Graphics
 */ const SPECOCC_NONE = 0;
/**
 * Use AO directly to occlude specular.
 *
 * @category Graphics
 */ const SPECOCC_AO = 1;
/**
 * Modify AO based on material glossiness/view angle to occlude specular.
 *
 * @category Graphics
 */ const SPECOCC_GLOSSDEPENDENT = 2;
const specularOcclusionNames = {
    [SPECOCC_NONE]: 'NONE',
    [SPECOCC_AO]: 'AO',
    [SPECOCC_GLOSSDEPENDENT]: 'GLOSSDEPENDENT'
};
// reflection source used by the shader generation
const REFLECTIONSRC_NONE = 'none';
const REFLECTIONSRC_ENVATLAS = 'envAtlas';
const REFLECTIONSRC_ENVATLASHQ = 'envAtlasHQ';
const REFLECTIONSRC_CUBEMAP = 'cubeMap';
const REFLECTIONSRC_SPHEREMAP = 'sphereMap';
const reflectionSrcNames = {
    [REFLECTIONSRC_NONE]: 'NONE',
    [REFLECTIONSRC_ENVATLAS]: 'ENVATLAS',
    [REFLECTIONSRC_ENVATLASHQ]: 'ENVATLASHQ',
    [REFLECTIONSRC_CUBEMAP]: 'CUBEMAP',
    [REFLECTIONSRC_SPHEREMAP]: 'SPHEREMAP'
};
// ambient source used by the shader generation
const AMBIENTSRC_AMBIENTSH = 'ambientSH';
const AMBIENTSRC_ENVALATLAS = 'envAtlas';
const AMBIENTSRC_CONSTANT = 'constant';
const ambientSrcNames = {
    [AMBIENTSRC_AMBIENTSH]: 'AMBIENTSH',
    [AMBIENTSRC_ENVALATLAS]: 'ENVALATLAS',
    [AMBIENTSRC_CONSTANT]: 'CONSTANT'
};
// 16 bits for shader defs
const SHADERDEF_NOSHADOW = 1;
const SHADERDEF_SKIN = 2;
const SHADERDEF_UV0 = 4;
const SHADERDEF_UV1 = 8;
const SHADERDEF_VCOLOR = 16;
const SHADERDEF_INSTANCING = 32;
const SHADERDEF_LM = 64;
const SHADERDEF_DIRLM = 128;
const SHADERDEF_SCREENSPACE = 256;
const SHADERDEF_TANGENTS = 512;
const SHADERDEF_MORPH_POSITION = 1024;
const SHADERDEF_MORPH_NORMAL = 2048;
const SHADERDEF_LMAMBIENT = 4096; // lightmaps contain ambient
const SHADERDEF_MORPH_TEXTURE_BASED_INT = 8192;
const SHADERDEF_BATCH = 16384;
/**
 * The shadow map is not to be updated.
 *
 * @category Graphics
 */ const SHADOWUPDATE_NONE = 0;
/**
 * The shadow map is regenerated this frame and not on subsequent frames.
 *
 * @category Graphics
 */ const SHADOWUPDATE_THISFRAME = 1;
/**
 * The shadow map is regenerated every frame.
 *
 * @category Graphics
 */ const SHADOWUPDATE_REALTIME = 2;
// flags used on the mask property of the Light, and also on mask property of the MeshInstance
const MASK_AFFECT_DYNAMIC = 1;
const MASK_AFFECT_LIGHTMAPPED = 2;
const MASK_BAKE = 4;
/**
 * Render shaded materials using forward rendering.
 *
 * @category Graphics
 */ const SHADER_FORWARD = 0;
const SHADER_PREPASS = 1;
// shadow pass used by the shadow rendering code
const SHADER_SHADOW = 2;
// shader pass used by the Picker class to render mesh ID
const SHADER_PICK = 3;
// shader pass used by the Picker class to render mesh ID and depth
const SHADER_DEPTH_PICK = 4;
/**
 * Shader that performs forward rendering.
 *
 * @category Graphics
 */ const SHADERPASS_FORWARD = 'forward';
/**
 * Shader used for debug rendering of albedo.
 *
 * @category Graphics
 */ const SHADERPASS_ALBEDO = 'debug_albedo';
/**
 * Shader used for debug rendering of world normal.
 *
 * @category Graphics
 */ const SHADERPASS_WORLDNORMAL = 'debug_world_normal';
/**
 * Shader used for debug rendering of opacity.
 *
 * @category Graphics
 */ const SHADERPASS_OPACITY = 'debug_opacity';
/**
 * Shader used for debug rendering of specularity.
 *
 * @category Graphics
 */ const SHADERPASS_SPECULARITY = 'debug_specularity';
/**
 * Shader used for debug rendering of gloss.
 *
 * @category Graphics
 */ const SHADERPASS_GLOSS = 'debug_gloss';
/**
 * Shader used for debug rendering of metalness.
 *
 * @category Graphics
 */ const SHADERPASS_METALNESS = 'debug_metalness';
/**
 * Shader used for debug rendering of ao.
 *
 * @category Graphics
 */ const SHADERPASS_AO = 'debug_ao';
/**
 * Shader used for debug rendering of emission.
 *
 * @category Graphics
 */ const SHADERPASS_EMISSION = 'debug_emission';
/**
 * Shader used for debug rendering of lighting.
 *
 * @category Graphics
 */ const SHADERPASS_LIGHTING = 'debug_lighting';
/**
 * Shader used for debug rendering of UV0 texture coordinates.
 *
 * @category Graphics
 */ const SHADERPASS_UV0 = 'debug_uv0';
/**
 * This mode renders a sprite as a simple quad.
 *
 * @category Graphics
 */ const SPRITE_RENDERMODE_SIMPLE = 0;
/**
 * This mode renders a sprite using 9-slicing in 'sliced' mode. Sliced mode stretches the top and
 * bottom regions of the sprite horizontally, the left and right regions vertically and the middle
 * region both horizontally and vertically.
 *
 * @category Graphics
 */ const SPRITE_RENDERMODE_SLICED = 1;
/**
 * This mode renders a sprite using 9-slicing in 'tiled' mode. Tiled mode tiles the top and bottom
 * regions of the sprite horizontally, the left and right regions vertically and the middle region
 * both horizontally and vertically.
 *
 * @category Graphics
 */ const SPRITE_RENDERMODE_TILED = 2;
const spriteRenderModeNames = {
    [SPRITE_RENDERMODE_SIMPLE]: 'SIMPLE',
    [SPRITE_RENDERMODE_SLICED]: 'SLICED',
    [SPRITE_RENDERMODE_TILED]: 'TILED'
};
/**
 * Single color lightmap.
 *
 * @category Graphics
 */ const BAKE_COLOR = 0;
/**
 * Single color lightmap + dominant light direction (used for bump/specular).
 *
 * @category Graphics
 */ const BAKE_COLORDIR = 1;
/**
 * Center of view.
 *
 * @category Graphics
 */ const VIEW_CENTER = 0;
/**
 * Left of view. Only used in stereo rendering.
 *
 * @category Graphics
 */ const VIEW_LEFT = 1;
/**
 * Right of view. Only used in stereo rendering.
 *
 * @category Graphics
 */ const VIEW_RIGHT = 2;
/**
 * No sorting is applied. Mesh instances are rendered in the same order they were added to a layer.
 *
 * @category Graphics
 */ const SORTMODE_NONE = 0;
/**
 * Mesh instances are sorted based on {@link MeshInstance#drawOrder}.
 *
 * @category Graphics
 */ const SORTMODE_MANUAL = 1;
/**
 * Mesh instances are sorted to minimize switching between materials and meshes to improve
 * rendering performance.
 *
 * @category Graphics
 */ const SORTMODE_MATERIALMESH = 2;
/**
 * Mesh instances are sorted back to front. This is the way to properly render many
 * semi-transparent objects on different depth, one is blended on top of another.
 *
 * @category Graphics
 */ const SORTMODE_BACK2FRONT = 3;
/**
 * Mesh instances are sorted front to back. Depending on GPU and the scene, this option may give
 * better performance than {@link SORTMODE_MATERIALMESH} due to reduced overdraw.
 *
 * @category Graphics
 */ const SORTMODE_FRONT2BACK = 4;
/**
 * Provide custom functions for sorting drawcalls and calculating distance.
 *
 * @ignore
 * @category Graphics
 */ const SORTMODE_CUSTOM = 5;
/**
 * Automatically set aspect ratio to current render target's width divided by height.
 *
 * @category Graphics
 */ const ASPECT_AUTO = 0;
/**
 * Use the manual aspect ratio value.
 *
 * @category Graphics
 */ const ASPECT_MANUAL = 1;
/**
 * Horizontal orientation.
 *
 * @category Graphics
 */ const ORIENTATION_HORIZONTAL = 0;
/**
 * Vertical orientation.
 *
 * @category Graphics
 */ const ORIENTATION_VERTICAL = 1;
/**
 * A sky texture is rendered using an infinite projection.
 *
 * @category Graphics
 */ const SKYTYPE_INFINITE = 'infinite';
/**
 * A sky texture is rendered using a box projection. This is generally suitable for interior
 * environments.
 *
 * @category Graphics
 */ const SKYTYPE_BOX = 'box';
/**
 *  A sky texture is rendered using a dome projection. This is generally suitable for exterior
 * environments.
 *
 * @category Graphics
 */ const SKYTYPE_DOME = 'dome';
/**
 * Opacity dithering is disabled.
 *
 * @category Graphics
 */ const DITHER_NONE = 'none';
/**
 * Opacity is dithered using a Bayer 8 matrix.
 *
 * @category Graphics
 */ const DITHER_BAYER8 = 'bayer8';
/**
 * Opacity is dithered using a blue noise.
 *
 * @category Graphics
 */ const DITHER_BLUENOISE = 'bluenoise';
/**
 * Opacity is dithered using an interleaved gradient noise.
 *
 * @category Graphics
 */ const DITHER_IGNNOISE = 'ignnoise';
const ditherNames = {
    [DITHER_NONE]: 'NONE',
    [DITHER_BAYER8]: 'BAYER8',
    [DITHER_BLUENOISE]: 'BLUENOISE',
    [DITHER_IGNNOISE]: 'IGNNOISE'
};
/**
 * Name of event fired before the camera renders the scene.
 *
 * @ignore
 */ const EVENT_PRERENDER = 'prerender';
/**
 * Name of event fired after the camera renders the scene.
 *
 * @ignore
 */ const EVENT_POSTRENDER = 'postrender';
/**
 * Name of event fired before a layer is rendered by a camera.
 *
 * @ignore
 */ const EVENT_PRERENDER_LAYER = 'prerender:layer';
/**
 * Name of event fired after a layer is rendered by a camera.
 *
 * @ignore
 */ const EVENT_POSTRENDER_LAYER = 'postrender:layer';
/**
 * Name of event fired before visibility culling is performed for the camera.
 *
 * @ignore
 */ const EVENT_PRECULL = 'precull';
/**
 * Name of event after visibility culling is performed for the camera.
 *
 * @ignore
 */ const EVENT_POSTCULL = 'postcull';
/**
 * Name of event after the engine has finished culling all cameras.
 *
 * @ignore
 */ const EVENT_CULL_END = 'cull:end';
/**
 * @ignore
 */ const GSPLAT_FORWARD = 1;
/**
 * @ignore
 */ const GSPLAT_SHADOW = 2;
/**
 * @ignore
 */ const SHADOWCAMERA_NAME = 'pcShadowCamera';

export { AMBIENTSRC_AMBIENTSH, AMBIENTSRC_CONSTANT, AMBIENTSRC_ENVALATLAS, ASPECT_AUTO, ASPECT_MANUAL, BAKE_COLOR, BAKE_COLORDIR, BLEND_ADDITIVE, BLEND_ADDITIVEALPHA, BLEND_MAX, BLEND_MIN, BLEND_MULTIPLICATIVE, BLEND_MULTIPLICATIVE2X, BLEND_NONE, BLEND_NORMAL, BLEND_PREMULTIPLIED, BLEND_SCREEN, BLEND_SUBTRACTIVE, BLUR_BOX, BLUR_GAUSSIAN, CUBEPROJ_BOX, CUBEPROJ_NONE, DETAILMODE_ADD, DETAILMODE_MAX, DETAILMODE_MIN, DETAILMODE_MUL, DETAILMODE_OVERLAY, DETAILMODE_SCREEN, DITHER_BAYER8, DITHER_BLUENOISE, DITHER_IGNNOISE, DITHER_NONE, EMITTERSHAPE_BOX, EMITTERSHAPE_SPHERE, EVENT_CULL_END, EVENT_POSTCULL, EVENT_POSTRENDER, EVENT_POSTRENDER_LAYER, EVENT_PRECULL, EVENT_PRERENDER, EVENT_PRERENDER_LAYER, FOG_EXP, FOG_EXP2, FOG_LINEAR, FOG_NONE, FRESNEL_NONE, FRESNEL_SCHLICK, GAMMA_NONE, GAMMA_SRGB, GSPLAT_FORWARD, GSPLAT_SHADOW, LAYERID_DEPTH, LAYERID_IMMEDIATE, LAYERID_SKYBOX, LAYERID_UI, LAYERID_WORLD, LAYER_GIZMO, LAYER_HUD, LAYER_WORLD, LIGHTFALLOFF_INVERSESQUARED, LIGHTFALLOFF_LINEAR, LIGHTSHAPE_DISK, LIGHTSHAPE_PUNCTUAL, LIGHTSHAPE_RECT, LIGHTSHAPE_SPHERE, LIGHTTYPE_COUNT, LIGHTTYPE_DIRECTIONAL, LIGHTTYPE_OMNI, LIGHTTYPE_POINT, LIGHTTYPE_SPOT, LIGHT_COLOR_DIVIDER, MASK_AFFECT_DYNAMIC, MASK_AFFECT_LIGHTMAPPED, MASK_BAKE, ORIENTATION_HORIZONTAL, ORIENTATION_VERTICAL, PARTICLEMODE_CPU, PARTICLEMODE_GPU, PARTICLEORIENTATION_EMITTER, PARTICLEORIENTATION_SCREEN, PARTICLEORIENTATION_WORLD, PARTICLESORT_DISTANCE, PARTICLESORT_NEWER_FIRST, PARTICLESORT_NONE, PARTICLESORT_OLDER_FIRST, PROJECTION_ORTHOGRAPHIC, PROJECTION_PERSPECTIVE, REFLECTIONSRC_CUBEMAP, REFLECTIONSRC_ENVATLAS, REFLECTIONSRC_ENVATLASHQ, REFLECTIONSRC_NONE, REFLECTIONSRC_SPHEREMAP, RENDERSTYLE_POINTS, RENDERSTYLE_SOLID, RENDERSTYLE_WIREFRAME, SHADERDEF_BATCH, SHADERDEF_DIRLM, SHADERDEF_INSTANCING, SHADERDEF_LM, SHADERDEF_LMAMBIENT, SHADERDEF_MORPH_NORMAL, SHADERDEF_MORPH_POSITION, SHADERDEF_MORPH_TEXTURE_BASED_INT, SHADERDEF_NOSHADOW, SHADERDEF_SCREENSPACE, SHADERDEF_SKIN, SHADERDEF_TANGENTS, SHADERDEF_UV0, SHADERDEF_UV1, SHADERDEF_VCOLOR, SHADERPASS_ALBEDO, SHADERPASS_AO, SHADERPASS_EMISSION, SHADERPASS_FORWARD, SHADERPASS_GLOSS, SHADERPASS_LIGHTING, SHADERPASS_METALNESS, SHADERPASS_OPACITY, SHADERPASS_SPECULARITY, SHADERPASS_UV0, SHADERPASS_WORLDNORMAL, SHADER_DEPTH_PICK, SHADER_FORWARD, SHADER_PICK, SHADER_PREPASS, SHADER_SHADOW, SHADOWCAMERA_NAME, SHADOWUPDATE_NONE, SHADOWUPDATE_REALTIME, SHADOWUPDATE_THISFRAME, SHADOW_CASCADE_0, SHADOW_CASCADE_1, SHADOW_CASCADE_2, SHADOW_CASCADE_3, SHADOW_CASCADE_ALL, SHADOW_PCF1, SHADOW_PCF1_16F, SHADOW_PCF1_32F, SHADOW_PCF3, SHADOW_PCF3_16F, SHADOW_PCF3_32F, SHADOW_PCF5, SHADOW_PCF5_16F, SHADOW_PCF5_32F, SHADOW_PCSS_32F, SHADOW_VSM16, SHADOW_VSM32, SHADOW_VSM_16F, SHADOW_VSM_32F, SKYTYPE_BOX, SKYTYPE_DOME, SKYTYPE_INFINITE, SORTMODE_BACK2FRONT, SORTMODE_CUSTOM, SORTMODE_FRONT2BACK, SORTMODE_MANUAL, SORTMODE_MATERIALMESH, SORTMODE_NONE, SPECOCC_AO, SPECOCC_GLOSSDEPENDENT, SPECOCC_NONE, SPRITE_RENDERMODE_SIMPLE, SPRITE_RENDERMODE_SLICED, SPRITE_RENDERMODE_TILED, TONEMAP_ACES, TONEMAP_ACES2, TONEMAP_FILMIC, TONEMAP_HEJL, TONEMAP_LINEAR, TONEMAP_NEUTRAL, TONEMAP_NONE, VIEW_CENTER, VIEW_LEFT, VIEW_RIGHT, ambientSrcNames, blendNames, cubemaProjectionNames, ditherNames, fresnelNames, gammaNames, lightFalloffNames, lightShapeNames, lightTypeNames, reflectionSrcNames, shadowTypeInfo, specularOcclusionNames, spriteRenderModeNames, tonemapNames };
