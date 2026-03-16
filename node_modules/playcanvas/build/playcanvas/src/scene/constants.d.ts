/**
 * Subtract the color of the source fragment from the destination fragment and write the result to
 * the frame buffer.
 *
 * @category Graphics
 */
export const BLEND_SUBTRACTIVE: 0;
/**
 * Add the color of the source fragment to the destination fragment and write the result to the
 * frame buffer.
 *
 * @category Graphics
 */
export const BLEND_ADDITIVE: 1;
/**
 * Enable simple translucency for materials such as glass. This is equivalent to enabling a source
 * blend mode of {@link BLENDMODE_SRC_ALPHA} and a destination blend mode of
 * {@link BLENDMODE_ONE_MINUS_SRC_ALPHA}.
 *
 * @category Graphics
 */
export const BLEND_NORMAL: 2;
/**
 * Disable blending.
 *
 * @category Graphics
 */
export const BLEND_NONE: 3;
/**
 * Similar to {@link BLEND_NORMAL} expect the source fragment is assumed to have already been
 * multiplied by the source alpha value.
 *
 * @category Graphics
 */
export const BLEND_PREMULTIPLIED: 4;
/**
 * Multiply the color of the source fragment by the color of the destination fragment and write the
 * result to the frame buffer.
 *
 * @category Graphics
 */
export const BLEND_MULTIPLICATIVE: 5;
/**
 * Same as {@link BLEND_ADDITIVE} except the source RGB is multiplied by the source alpha.
 *
 * @category Graphics
 */
export const BLEND_ADDITIVEALPHA: 6;
/**
 * Multiplies colors and doubles the result.
 *
 * @category Graphics
 */
export const BLEND_MULTIPLICATIVE2X: 7;
/**
 * Softer version of additive.
 *
 * @category Graphics
 */
export const BLEND_SCREEN: 8;
/**
 * Minimum color.
 *
 * @category Graphics
 */
export const BLEND_MIN: 9;
/**
 * Maximum color.
 *
 * @category Graphics
 */
export const BLEND_MAX: 10;
export const blendNames: {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
};
/**
 * No fog is applied to the scene.
 *
 * @category Graphics
 */
export const FOG_NONE: "none";
/**
 * Fog rises linearly from zero to 1 between a start and end depth.
 *
 * @category Graphics
 */
export const FOG_LINEAR: "linear";
/**
 * Fog rises according to an exponential curve controlled by a density value.
 *
 * @category Graphics
 */
export const FOG_EXP: "exp";
/**
 * Fog rises according to an exponential curve controlled by a density value.
 *
 * @category Graphics
 */
export const FOG_EXP2: "exp2";
/**
 * No Fresnel.
 *
 * @category Graphics
 */
export const FRESNEL_NONE: 0;
/**
 * Schlick's approximation of Fresnel.
 *
 * @category Graphics
 */
export const FRESNEL_SCHLICK: 2;
export const fresnelNames: {
    0: string;
    2: string;
};
export const LAYER_HUD: 0;
export const LAYER_GIZMO: 1;
export const LAYER_WORLD: 15;
/**
 * The world layer.
 *
 * @category Graphics
 */
export const LAYERID_WORLD: 0;
/**
 * The depth layer.
 *
 * @category Graphics
 */
export const LAYERID_DEPTH: 1;
/**
 * The skybox layer.
 *
 * @category Graphics
 */
export const LAYERID_SKYBOX: 2;
/**
 * The immediate layer.
 *
 * @category Graphics
 */
export const LAYERID_IMMEDIATE: 3;
/**
 * The UI layer.
 *
 * @category Graphics
 */
export const LAYERID_UI: 4;
/**
 * Directional (global) light source.
 *
 * @category Graphics
 */
export const LIGHTTYPE_DIRECTIONAL: 0;
/**
 * Omni-directional (local) light source.
 *
 * @category Graphics
 */
export const LIGHTTYPE_OMNI: 1;
/**
 * Point (local) light source.
 *
 * @ignore
 * @category Graphics
 */
export const LIGHTTYPE_POINT: 1;
/**
 * Spot (local) light source.
 *
 * @category Graphics
 */
export const LIGHTTYPE_SPOT: 2;
export const LIGHTTYPE_COUNT: 3;
export const lightTypeNames: {
    0: string;
    1: string;
    2: string;
};
export const LIGHT_COLOR_DIVIDER: 100;
/**
 * Infinitesimally small point light source shape.
 *
 * @category Graphics
 */
export const LIGHTSHAPE_PUNCTUAL: 0;
/**
 * Rectangle shape of light source.
 *
 * @category Graphics
 */
export const LIGHTSHAPE_RECT: 1;
/**
 * Disk shape of light source.
 *
 * @category Graphics
 */
export const LIGHTSHAPE_DISK: 2;
/**
 * Sphere shape of light source.
 *
 * @category Graphics
 */
export const LIGHTSHAPE_SPHERE: 3;
export const lightShapeNames: {
    0: string;
    1: string;
    2: string;
    3: string;
};
/**
 * Linear distance falloff model for light attenuation.
 *
 * @category Graphics
 */
export const LIGHTFALLOFF_LINEAR: 0;
/**
 * Inverse squared distance falloff model for light attenuation.
 *
 * @category Graphics
 */
export const LIGHTFALLOFF_INVERSESQUARED: 1;
export const lightFalloffNames: {
    0: string;
    1: string;
};
/**
 * A shadow sampling technique using 32bit shadow map that averages depth comparisons from a 3x3
 * grid of texels for softened shadow edges.
 *
 * @category Graphics
 */
export const SHADOW_PCF3_32F: 0;
/**
 * @deprecated
 * @ignore
 */
export const SHADOW_PCF3: 0;
/**
 * A shadow sampling technique using a 16-bit exponential variance shadow map that leverages
 * variance to approximate shadow boundaries, enabling soft shadows. Only supported when
 * {@link GraphicsDevice#textureHalfFloatRenderable} is true. Falls back to {@link SHADOW_PCF3_32F},
 * if not supported.
 *
 * @category Graphics
 */
export const SHADOW_VSM_16F: 2;
/**
 * @deprecated
 * @ignore
 */
export const SHADOW_VSM16: 2;
/**
 * A shadow sampling technique using a 32-bit exponential variance shadow map that leverages
 * variance to approximate shadow boundaries, enabling soft shadows. Only supported when
 * {@link GraphicsDevice#textureFloatRenderable} is true. Falls back to {@link SHADOW_VSM_16F}, if
 * not supported.
 *
 * @category Graphics
 */
export const SHADOW_VSM_32F: 3;
/**
 * @deprecated
 * @ignore
 */
export const SHADOW_VSM32: 3;
/**
 * A shadow sampling technique using 32bit shadow map that averages depth comparisons from a 5x5
 * grid of texels for softened shadow edges.
 *
 * @category Graphics
 */
export const SHADOW_PCF5_32F: 4;
/**
 * @deprecated
 * @ignore
 */
export const SHADOW_PCF5: 4;
/**
 * A shadow sampling technique using a 32-bit shadow map that performs a single depth comparison for
 * sharp shadow edges.
 *
 * @category Graphics
 */
export const SHADOW_PCF1_32F: 5;
/**
 * @deprecated
 * @ignore
 */
export const SHADOW_PCF1: 5;
/**
 * A shadow sampling technique using a 32-bit shadow map that adjusts filter size based on blocker
 * distance, producing realistic, soft shadow edges that vary with the light's occlusion. Note that
 * this technique requires both {@link GraphicsDevice#textureFloatRenderable} and
 * {@link GraphicsDevice#textureFloatFilterable} to be true, and falls back to
 * {@link SHADOW_PCF3_32F} otherwise.
 *
 * @category Graphics
 */
export const SHADOW_PCSS_32F: 6;
/**
 * A shadow sampling technique using a 16-bit shadow map that performs a single depth comparison for
 * sharp shadow edges.
 *
 * @category Graphics
 */
export const SHADOW_PCF1_16F: 7;
/**
 * A shadow sampling technique using 16-bit shadow map that averages depth comparisons from a 3x3
 * grid of texels for softened shadow edges.
 *
 * @category Graphics
 */
export const SHADOW_PCF3_16F: 8;
/**
 * A shadow sampling technique using 16-bit shadow map that averages depth comparisons from a 3x3
 * grid of texels for softened shadow edges.
 *
 * @category Graphics
 */
export const SHADOW_PCF5_16F: 9;
/**
 * Information about shadow types.
 *
 * @type {Map<number, { name: string, format: number, pcf?: boolean, vsm?: boolean }>}
 * @ignore
 */
export const shadowTypeInfo: Map<number, {
    name: string;
    format: number;
    pcf?: boolean;
    vsm?: boolean;
}>;
/**
 * The flag that controls shadow rendering for the 0 cascade
 *
 * @category Graphics
 */
export const SHADOW_CASCADE_0: 1;
/**
 * The flag that controls shadow rendering for the 1 cascade
 *
 * @category Graphics
 */
export const SHADOW_CASCADE_1: 2;
/**
 * The flag that controls shadow rendering for the 2 cascade
 *
 * @category Graphics
 */
export const SHADOW_CASCADE_2: 4;
/**
 * The flag that controls shadow rendering for the 3 cascade
 *
 * @category Graphics
 */
export const SHADOW_CASCADE_3: 8;
/**
 * The flag that controls shadow rendering for the all cascades
 *
 * @category Graphics
 */
export const SHADOW_CASCADE_ALL: 255;
/**
 * Box filter.
 *
 * @category Graphics
 */
export const BLUR_BOX: 0;
/**
 * Gaussian filter. May look smoother than box, but requires more samples.
 *
 * @category Graphics
 */
export const BLUR_GAUSSIAN: 1;
/**
 * No sorting, particles are drawn in arbitrary order. Can be simulated on GPU.
 *
 * @category Graphics
 */
export const PARTICLESORT_NONE: 0;
/**
 * Sorting based on distance to the camera. CPU only.
 *
 * @category Graphics
 */
export const PARTICLESORT_DISTANCE: 1;
/**
 * Newer particles are drawn first. CPU only.
 *
 * @category Graphics
 */
export const PARTICLESORT_NEWER_FIRST: 2;
/**
 * Older particles are drawn first. CPU only.
 *
 * @category Graphics
 */
export const PARTICLESORT_OLDER_FIRST: 3;
export const PARTICLEMODE_GPU: 0;
export const PARTICLEMODE_CPU: 1;
/**
 * Box shape parameterized by emitterExtents. Initial velocity is directed towards local Z axis.
 *
 * @category Graphics
 */
export const EMITTERSHAPE_BOX: 0;
/**
 * Sphere shape parameterized by emitterRadius. Initial velocity is directed outwards from the
 * center.
 *
 * @category Graphics
 */
export const EMITTERSHAPE_SPHERE: 1;
/**
 * Particles are facing camera.
 *
 * @category Graphics
 */
export const PARTICLEORIENTATION_SCREEN: 0;
/**
 * User defines world space normal (particleNormal) to set planes orientation.
 *
 * @category Graphics
 */
export const PARTICLEORIENTATION_WORLD: 1;
/**
 * Similar to previous, but the normal is affected by emitter(entity) transformation.
 *
 * @category Graphics
 */
export const PARTICLEORIENTATION_EMITTER: 2;
/**
 * A perspective camera projection where the frustum shape is essentially pyramidal.
 *
 * @category Graphics
 */
export const PROJECTION_PERSPECTIVE: 0;
/**
 * An orthographic camera projection where the frustum shape is essentially a cuboid.
 *
 * @category Graphics
 */
export const PROJECTION_ORTHOGRAPHIC: 1;
/**
 * Render mesh instance as solid geometry.
 *
 * @category Graphics
 */
export const RENDERSTYLE_SOLID: 0;
/**
 * Render mesh instance as wireframe.
 *
 * @category Graphics
 */
export const RENDERSTYLE_WIREFRAME: 1;
/**
 * Render mesh instance as points.
 *
 * @category Graphics
 */
export const RENDERSTYLE_POINTS: 2;
/**
 * The cube map is treated as if it is infinitely far away.
 *
 * @category Graphics
 */
export const CUBEPROJ_NONE: 0;
/**
 * The cube map is box-projected based on a world space axis-aligned bounding box.
 *
 * @category Graphics
 */
export const CUBEPROJ_BOX: 1;
export const cubemaProjectionNames: {
    0: string;
    1: string;
};
/**
 * Multiply together the primary and secondary colors.
 *
 * @category Graphics
 */
export const DETAILMODE_MUL: "mul";
/**
 * Add together the primary and secondary colors.
 *
 * @category Graphics
 */
export const DETAILMODE_ADD: "add";
/**
 * Softer version of {@link DETAILMODE_ADD}.
 *
 * @category Graphics
 */
export const DETAILMODE_SCREEN: "screen";
/**
 * Multiplies or screens the colors, depending on the primary color.
 *
 * @category Graphics
 */
export const DETAILMODE_OVERLAY: "overlay";
/**
 * Select whichever of the primary and secondary colors is darker, component-wise.
 *
 * @category Graphics
 */
export const DETAILMODE_MIN: "min";
/**
 * Select whichever of the primary and secondary colors is lighter, component-wise.
 *
 * @category Graphics
 */
export const DETAILMODE_MAX: "max";
/**
 * No gamma correction.
 *
 * @category Graphics
 */
export const GAMMA_NONE: 0;
/**
 * Apply sRGB gamma correction.
 *
 * @category Graphics
 */
export const GAMMA_SRGB: 1;
export const gammaNames: {
    0: string;
    1: string;
};
/**
 * Linear tonemapping. The colors are preserved, but the exposure is applied.
 *
 * @category Graphics
 */
export const TONEMAP_LINEAR: 0;
/**
 * Filmic tonemapping curve.
 *
 * @category Graphics
 */
export const TONEMAP_FILMIC: 1;
/**
 * Hejl filmic tonemapping curve.
 *
 * @category Graphics
 */
export const TONEMAP_HEJL: 2;
/**
 * ACES filmic tonemapping curve.
 *
 * @category Graphics
 */
export const TONEMAP_ACES: 3;
/**
 * ACES v2 filmic tonemapping curve.
 *
 * @category Graphics
 */
export const TONEMAP_ACES2: 4;
/**
 * Khronos PBR Neutral tonemapping curve.
 *
 * @category Graphics
 */
export const TONEMAP_NEUTRAL: 5;
/**
 * No tonemapping or exposure is applied. Used for HDR rendering.
 *
 * @category Graphics
 */
export const TONEMAP_NONE: 6;
export const tonemapNames: string[];
/**
 * No specular occlusion.
 *
 * @category Graphics
 */
export const SPECOCC_NONE: 0;
/**
 * Use AO directly to occlude specular.
 *
 * @category Graphics
 */
export const SPECOCC_AO: 1;
/**
 * Modify AO based on material glossiness/view angle to occlude specular.
 *
 * @category Graphics
 */
export const SPECOCC_GLOSSDEPENDENT: 2;
export const specularOcclusionNames: {
    0: string;
    1: string;
    2: string;
};
export const REFLECTIONSRC_NONE: "none";
export const REFLECTIONSRC_ENVATLAS: "envAtlas";
export const REFLECTIONSRC_ENVATLASHQ: "envAtlasHQ";
export const REFLECTIONSRC_CUBEMAP: "cubeMap";
export const REFLECTIONSRC_SPHEREMAP: "sphereMap";
export namespace reflectionSrcNames {
    let none: string;
    let envAtlas: string;
    let envAtlasHQ: string;
    let cubeMap: string;
    let sphereMap: string;
}
export const AMBIENTSRC_AMBIENTSH: "ambientSH";
export const AMBIENTSRC_ENVALATLAS: "envAtlas";
export const AMBIENTSRC_CONSTANT: "constant";
export namespace ambientSrcNames {
    export let ambientSH: string;
    let envAtlas_1: string;
    export { envAtlas_1 as envAtlas };
    export let constant: string;
}
export const SHADERDEF_NOSHADOW: 1;
export const SHADERDEF_SKIN: 2;
export const SHADERDEF_UV0: 4;
export const SHADERDEF_UV1: 8;
export const SHADERDEF_VCOLOR: 16;
export const SHADERDEF_INSTANCING: 32;
export const SHADERDEF_LM: 64;
export const SHADERDEF_DIRLM: 128;
export const SHADERDEF_SCREENSPACE: 256;
export const SHADERDEF_TANGENTS: 512;
export const SHADERDEF_MORPH_POSITION: 1024;
export const SHADERDEF_MORPH_NORMAL: 2048;
export const SHADERDEF_LMAMBIENT: 4096;
export const SHADERDEF_MORPH_TEXTURE_BASED_INT: 8192;
export const SHADERDEF_BATCH: 16384;
/**
 * The shadow map is not to be updated.
 *
 * @category Graphics
 */
export const SHADOWUPDATE_NONE: 0;
/**
 * The shadow map is regenerated this frame and not on subsequent frames.
 *
 * @category Graphics
 */
export const SHADOWUPDATE_THISFRAME: 1;
/**
 * The shadow map is regenerated every frame.
 *
 * @category Graphics
 */
export const SHADOWUPDATE_REALTIME: 2;
export const MASK_AFFECT_DYNAMIC: 1;
export const MASK_AFFECT_LIGHTMAPPED: 2;
export const MASK_BAKE: 4;
/**
 * Render shaded materials using forward rendering.
 *
 * @category Graphics
 */
export const SHADER_FORWARD: 0;
export const SHADER_PREPASS: 1;
export const SHADER_SHADOW: 2;
export const SHADER_PICK: 3;
export const SHADER_DEPTH_PICK: 4;
/**
 * Shader that performs forward rendering.
 *
 * @category Graphics
 */
export const SHADERPASS_FORWARD: "forward";
/**
 * Shader used for debug rendering of albedo.
 *
 * @category Graphics
 */
export const SHADERPASS_ALBEDO: "debug_albedo";
/**
 * Shader used for debug rendering of world normal.
 *
 * @category Graphics
 */
export const SHADERPASS_WORLDNORMAL: "debug_world_normal";
/**
 * Shader used for debug rendering of opacity.
 *
 * @category Graphics
 */
export const SHADERPASS_OPACITY: "debug_opacity";
/**
 * Shader used for debug rendering of specularity.
 *
 * @category Graphics
 */
export const SHADERPASS_SPECULARITY: "debug_specularity";
/**
 * Shader used for debug rendering of gloss.
 *
 * @category Graphics
 */
export const SHADERPASS_GLOSS: "debug_gloss";
/**
 * Shader used for debug rendering of metalness.
 *
 * @category Graphics
 */
export const SHADERPASS_METALNESS: "debug_metalness";
/**
 * Shader used for debug rendering of ao.
 *
 * @category Graphics
 */
export const SHADERPASS_AO: "debug_ao";
/**
 * Shader used for debug rendering of emission.
 *
 * @category Graphics
 */
export const SHADERPASS_EMISSION: "debug_emission";
/**
 * Shader used for debug rendering of lighting.
 *
 * @category Graphics
 */
export const SHADERPASS_LIGHTING: "debug_lighting";
/**
 * Shader used for debug rendering of UV0 texture coordinates.
 *
 * @category Graphics
 */
export const SHADERPASS_UV0: "debug_uv0";
/**
 * This mode renders a sprite as a simple quad.
 *
 * @category Graphics
 */
export const SPRITE_RENDERMODE_SIMPLE: 0;
/**
 * This mode renders a sprite using 9-slicing in 'sliced' mode. Sliced mode stretches the top and
 * bottom regions of the sprite horizontally, the left and right regions vertically and the middle
 * region both horizontally and vertically.
 *
 * @category Graphics
 */
export const SPRITE_RENDERMODE_SLICED: 1;
/**
 * This mode renders a sprite using 9-slicing in 'tiled' mode. Tiled mode tiles the top and bottom
 * regions of the sprite horizontally, the left and right regions vertically and the middle region
 * both horizontally and vertically.
 *
 * @category Graphics
 */
export const SPRITE_RENDERMODE_TILED: 2;
export const spriteRenderModeNames: {
    0: string;
    1: string;
    2: string;
};
/**
 * Single color lightmap.
 *
 * @category Graphics
 */
export const BAKE_COLOR: 0;
/**
 * Single color lightmap + dominant light direction (used for bump/specular).
 *
 * @category Graphics
 */
export const BAKE_COLORDIR: 1;
/**
 * Center of view.
 *
 * @category Graphics
 */
export const VIEW_CENTER: 0;
/**
 * Left of view. Only used in stereo rendering.
 *
 * @category Graphics
 */
export const VIEW_LEFT: 1;
/**
 * Right of view. Only used in stereo rendering.
 *
 * @category Graphics
 */
export const VIEW_RIGHT: 2;
/**
 * No sorting is applied. Mesh instances are rendered in the same order they were added to a layer.
 *
 * @category Graphics
 */
export const SORTMODE_NONE: 0;
/**
 * Mesh instances are sorted based on {@link MeshInstance#drawOrder}.
 *
 * @category Graphics
 */
export const SORTMODE_MANUAL: 1;
/**
 * Mesh instances are sorted to minimize switching between materials and meshes to improve
 * rendering performance.
 *
 * @category Graphics
 */
export const SORTMODE_MATERIALMESH: 2;
/**
 * Mesh instances are sorted back to front. This is the way to properly render many
 * semi-transparent objects on different depth, one is blended on top of another.
 *
 * @category Graphics
 */
export const SORTMODE_BACK2FRONT: 3;
/**
 * Mesh instances are sorted front to back. Depending on GPU and the scene, this option may give
 * better performance than {@link SORTMODE_MATERIALMESH} due to reduced overdraw.
 *
 * @category Graphics
 */
export const SORTMODE_FRONT2BACK: 4;
/**
 * Provide custom functions for sorting drawcalls and calculating distance.
 *
 * @ignore
 * @category Graphics
 */
export const SORTMODE_CUSTOM: 5;
/**
 * Automatically set aspect ratio to current render target's width divided by height.
 *
 * @category Graphics
 */
export const ASPECT_AUTO: 0;
/**
 * Use the manual aspect ratio value.
 *
 * @category Graphics
 */
export const ASPECT_MANUAL: 1;
/**
 * Horizontal orientation.
 *
 * @category Graphics
 */
export const ORIENTATION_HORIZONTAL: 0;
/**
 * Vertical orientation.
 *
 * @category Graphics
 */
export const ORIENTATION_VERTICAL: 1;
/**
 * A sky texture is rendered using an infinite projection.
 *
 * @category Graphics
 */
export const SKYTYPE_INFINITE: "infinite";
/**
 * A sky texture is rendered using a box projection. This is generally suitable for interior
 * environments.
 *
 * @category Graphics
 */
export const SKYTYPE_BOX: "box";
/**
 *  A sky texture is rendered using a dome projection. This is generally suitable for exterior
 * environments.
 *
 * @category Graphics
 */
export const SKYTYPE_DOME: "dome";
/**
 * Opacity dithering is disabled.
 *
 * @category Graphics
 */
export const DITHER_NONE: "none";
/**
 * Opacity is dithered using a Bayer 8 matrix.
 *
 * @category Graphics
 */
export const DITHER_BAYER8: "bayer8";
/**
 * Opacity is dithered using a blue noise.
 *
 * @category Graphics
 */
export const DITHER_BLUENOISE: "bluenoise";
/**
 * Opacity is dithered using an interleaved gradient noise.
 *
 * @category Graphics
 */
export const DITHER_IGNNOISE: "ignnoise";
export namespace ditherNames {
    let none_1: string;
    export { none_1 as none };
    export let bayer8: string;
    export let bluenoise: string;
    export let ignnoise: string;
}
/**
 * Name of event fired before the camera renders the scene.
 *
 * @ignore
 */
export const EVENT_PRERENDER: "prerender";
/**
 * Name of event fired after the camera renders the scene.
 *
 * @ignore
 */
export const EVENT_POSTRENDER: "postrender";
/**
 * Name of event fired before a layer is rendered by a camera.
 *
 * @ignore
 */
export const EVENT_PRERENDER_LAYER: "prerender:layer";
/**
 * Name of event fired after a layer is rendered by a camera.
 *
 * @ignore
 */
export const EVENT_POSTRENDER_LAYER: "postrender:layer";
/**
 * Name of event fired before visibility culling is performed for the camera.
 *
 * @ignore
 */
export const EVENT_PRECULL: "precull";
/**
 * Name of event after visibility culling is performed for the camera.
 *
 * @ignore
 */
export const EVENT_POSTCULL: "postcull";
/**
 * Name of event after the engine has finished culling all cameras.
 *
 * @ignore
 */
export const EVENT_CULL_END: "cull:end";
/**
 * @ignore
 */
export const GSPLAT_FORWARD: 1;
/**
 * @ignore
 */
export const GSPLAT_SHADOW: 2;
/**
 * @ignore
 */
export const SHADOWCAMERA_NAME: "pcShadowCamera";
