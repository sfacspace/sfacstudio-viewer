/**
 * @import { Entity } from '../framework/entity.js'
 * @import { GraphicsDevice } from '../platform/graphics/graphics-device.js'
 * @import { LayerComposition } from './composition/layer-composition.js'
 * @import { Layer } from './layer.js'
 * @import { Texture } from '../platform/graphics/texture.js'
 */
/**
 * A scene is graphical representation of an environment. It manages the scene hierarchy, all
 * graphical objects, lights, and scene-wide properties.
 *
 * @category Graphics
 */
export class Scene extends EventHandler {
    /**
     * Fired when the layer composition is set. Use this event to add callbacks or advanced
     * properties to your layers. The handler is passed the old and the new
     * {@link LayerComposition}.
     *
     * @event
     * @example
     * app.scene.on('set:layers', (oldComp, newComp) => {
     *     const list = newComp.layerList;
     *     for (let i = 0; i < list.length; i++) {
     *         const layer = list[i];
     *         switch (layer.name) {
     *             case 'MyLayer':
     *                 layer.onEnable = myOnEnableFunction;
     *                 layer.onDisable = myOnDisableFunction;
     *                 break;
     *             case 'MyOtherLayer':
     *                 layer.clearColorBuffer = true;
     *                 break;
     *         }
     *     }
     * });
     */
    static EVENT_SETLAYERS: string;
    /**
     * Fired when the skybox is set. The handler is passed the {@link Texture} that is the
     * previously used skybox cubemap texture. The new skybox cubemap texture is in the
     * {@link Scene#skybox} property.
     *
     * @event
     * @example
     * app.scene.on('set:skybox', (oldSkybox) => {
     *     console.log(`Skybox changed from ${oldSkybox.name} to ${app.scene.skybox.name}`);
     * });
     */
    static EVENT_SETSKYBOX: string;
    /**
     * Fired before the camera renders the scene. The handler is passed the {@link CameraComponent}
     * that will render the scene.
     *
     * @event
     * @example
     * app.scene.on('prerender', (camera) => {
     *    console.log(`Camera ${camera.entity.name} will render the scene`);
     * });
     */
    static EVENT_PRERENDER: string;
    /**
     * Fired when the camera renders the scene. The handler is passed the {@link CameraComponent}
     * that rendered the scene.
     *
     * @event
     * @example
     * app.scene.on('postrender', (camera) => {
     *    console.log(`Camera ${camera.entity.name} rendered the scene`);
     * });
     */
    static EVENT_POSTRENDER: string;
    /**
     * Fired before the camera renders a layer. The handler is passed the {@link CameraComponent},
     * the {@link Layer} that will be rendered, and a boolean parameter set to true if the layer is
     * transparent. This is called during rendering to a render target or a default framebuffer, and
     * additional rendering can be performed here, for example using {@link QuadRender#render}.
     *
     * @event
     * @example
     * app.scene.on('prerender:layer', (camera, layer, transparent) => {
     *    console.log(`Camera ${camera.entity.name} will render the layer ${layer.name} (transparent: ${transparent})`);
     * });
     */
    static EVENT_PRERENDER_LAYER: string;
    /**
     * Fired when the camera renders a layer. The handler is passed the {@link CameraComponent},
     * the {@link Layer} that will be rendered, and a boolean parameter set to true if the layer is
     * transparent. This is called during rendering to a render target or a default framebuffer, and
     * additional rendering can be performed here, for example using {@link QuadRender#render}.
     *
     * @event
     * @example
     * app.scene.on('postrender:layer', (camera, layer, transparent) => {
     *    console.log(`Camera ${camera.entity.name} rendered the layer ${layer.name} (transparent: ${transparent})`);
     * });
     */
    static EVENT_POSTRENDER_LAYER: string;
    /**
     * Fired before visibility culling is performed for the camera.
     *
     * @event
     * @example
     * app.scene.on('precull', (camera) => {
     *    console.log(`Visibility culling will be performed for camera ${camera.entity.name}`);
     * });
     */
    static EVENT_PRECULL: string;
    /**
     * Fired after visibility culling is performed for the camera.
     *
     * @event
     * @example
     * app.scene.on('postcull', (camera) => {
     *    console.log(`Visibility culling was performed for camera ${camera.entity.name}`);
     * });
     */
    static EVENT_POSTCULL: string;
    /**
     * Create a new Scene instance.
     *
     * @param {GraphicsDevice} graphicsDevice - The graphics device used to manage this scene.
     * @ignore
     */
    constructor(graphicsDevice: GraphicsDevice);
    /**
     * If enabled, the ambient lighting will be baked into lightmaps. This will be either the
     * {@link Scene#skybox} if set up, otherwise {@link Scene#ambientLight}. Defaults to false.
     *
     * @type {boolean}
     */
    ambientBake: boolean;
    /**
     * If {@link Scene#ambientBake} is true, this specifies the brightness of ambient occlusion.
     * Typical range is -1 to 1. Defaults to 0, representing no change to brightness.
     *
     * @type {number}
     */
    ambientBakeOcclusionBrightness: number;
    /**
     * If {@link Scene#ambientBake} is true, this specifies the contrast of ambient occlusion.
     * Typical range is -1 to 1. Defaults to 0, representing no change to contrast.
     *
     * @type {number}
     */
    ambientBakeOcclusionContrast: number;
    /**
     * The color of the scene's ambient light, specified in sRGB color space. Defaults to black
     * (0, 0, 0).
     *
     * @type {Color}
     */
    ambientLight: Color;
    /**
     * The luminosity of the scene's ambient light in lux (lm/m^2). Used if physicalUnits is true. Defaults to 0.
     *
     * @type {number}
     */
    ambientLuminance: number;
    /**
     * The exposure value tweaks the overall brightness of the scene. Ignored if physicalUnits is true. Defaults to 1.
     *
     * @type {number}
     */
    exposure: number;
    /**
     * The lightmap resolution multiplier. Defaults to 1.
     *
     * @type {number}
     */
    lightmapSizeMultiplier: number;
    /**
     * The maximum lightmap resolution. Defaults to 2048.
     *
     * @type {number}
     */
    lightmapMaxResolution: number;
    /**
     * The lightmap baking mode. Can be:
     *
     * - {@link BAKE_COLOR}: single color lightmap
     * - {@link BAKE_COLORDIR}: single color lightmap + dominant light direction (used for bump or
     * specular). Only lights with bakeDir=true will be used for generating the dominant light
     * direction.
     *
     * Defaults to {@link BAKE_COLORDIR}.
     *
     * @type {number}
     */
    lightmapMode: number;
    /**
     * Enables bilateral filter on runtime baked color lightmaps, which removes the noise and
     * banding while preserving the edges. Defaults to false. Note that the filtering takes place
     * in the image space of the lightmap, and it does not filter across lightmap UV space seams,
     * often making the seams more visible. It's important to balance the strength of the filter
     * with number of samples used for lightmap baking to limit the visible artifacts.
     *
     * @type {boolean}
     */
    lightmapFilterEnabled: boolean;
    /**
     * Enables HDR lightmaps. This can result in smoother lightmaps especially when many samples
     * are used. Defaults to false.
     *
     * @type {boolean}
     */
    lightmapHDR: boolean;
    /**
     * The root entity of the scene, which is usually the only child to the {@link Application}
     * root entity.
     *
     * @type {Entity}
     */
    root: Entity;
    /**
     * Use physically based units for cameras and lights. When used, the exposure value is ignored.
     *
     * @type {boolean}
     */
    physicalUnits: boolean;
    /**
     * Environment lighting atlas
     *
     * @type {Texture|null}
     * @private
     */
    private _envAtlas;
    /**
     * The skybox cubemap as set by user (gets used when skyboxMip === 0)
     *
     * @type {Texture|null}
     * @private
     */
    private _skyboxCubeMap;
    /**
     * The fog parameters.
     *
     * @private
     */
    private _fogParams;
    /**
     * Internal flag to indicate that the specular (and sheen) maps of standard materials should be
     * assumed to be in a linear space, instead of sRGB. This is used by the editor using engine v2
     * internally to render in a style of engine v1, where spec those textures were specified as
     * linear, while engine 2 assumes they are in sRGB space. This should be removed when the editor
     * no longer supports engine v1 projects.
     *
     * @ignore
     */
    forcePassThroughSpecular: boolean;
    device: GraphicsDevice;
    _gravity: Vec3;
    /**
     * @type {LayerComposition}
     * @private
     */
    private _layers;
    /**
     * Array of 6 prefiltered lighting data cubemaps.
     *
     * @type {Texture[]}
     * @private
     */
    private _prefilteredCubemaps;
    _internalEnvAtlas: any;
    _skyboxIntensity: number;
    _skyboxLuminance: number;
    _skyboxMip: number;
    _skyboxHighlightMultiplier: number;
    _skyboxRotationShaderInclude: boolean;
    _skyboxRotation: Quat;
    _skyboxRotationMat3: Mat3;
    _skyboxRotationMat4: Mat4;
    _ambientBakeNumSamples: number;
    _ambientBakeSpherePart: number;
    _lightmapFilterRange: number;
    _lightmapFilterSmoothness: number;
    _clusteredLightingEnabled: boolean;
    _lightingParams: LightingParams;
    updateShaders: boolean;
    _gsplatParams: GSplatParams;
    _sky: Sky;
    _stats: {
        meshInstances: number;
        lights: number;
        dynamicLights: number;
        bakedLights: number;
        updateShadersTime: number;
    };
    _shaderVersion: number;
    immediate: Immediate;
    /**
     * Gets the default layer used by the immediate drawing functions.
     *
     * @type {Layer}
     * @ignore
     */
    get defaultDrawLayer(): Layer;
    /**
     * Sets the number of samples used to bake the ambient light into the lightmap. Note that
     * {@link Scene#ambientBake} must be true for this to have an effect. Defaults to 1. Maximum
     * value is 255.
     *
     * @type {number}
     */
    set ambientBakeNumSamples(value: number);
    /**
     * Gets the number of samples used to bake the ambient light into the lightmap.
     *
     * @type {number}
     */
    get ambientBakeNumSamples(): number;
    /**
     * Sets the part of the sphere which represents the source of ambient light. Note that
     * {@link Scene#ambientBake} must be true for this to have an effect. The valid range is 0..1,
     * representing a part of the sphere from top to the bottom. A value of 0.5 represents the
     * upper hemisphere. A value of 1 represents a full sphere. Defaults to 0.4, which is a smaller
     * upper hemisphere as this requires fewer samples to bake.
     *
     * @type {number}
     */
    set ambientBakeSpherePart(value: number);
    /**
     * Gets the part of the sphere which represents the source of ambient light.
     *
     * @type {number}
     */
    get ambientBakeSpherePart(): number;
    /**
     * Sets whether clustered lighting is enabled. Set to false before the first frame is rendered
     * to use non-clustered lighting. Defaults to true.
     *
     * @type {boolean}
     */
    set clusteredLightingEnabled(value: boolean);
    /**
     * Gets whether clustered lighting is enabled.
     *
     * @type {boolean}
     */
    get clusteredLightingEnabled(): boolean;
    /**
     * Sets the environment lighting atlas.
     *
     * @type {Texture|null}
     */
    set envAtlas(value: Texture | null);
    /**
     * Gets the environment lighting atlas.
     *
     * @type {Texture|null}
     */
    get envAtlas(): Texture | null;
    /**
     * Sets the {@link LayerComposition} that defines rendering order of this scene.
     *
     * @type {LayerComposition}
     */
    set layers(layers: LayerComposition);
    /**
     * Gets the {@link LayerComposition} that defines rendering order of this scene.
     *
     * @type {LayerComposition}
     */
    get layers(): LayerComposition;
    /**
     * Gets the {@link Sky} that defines sky properties.
     *
     * @type {Sky}
     */
    get sky(): Sky;
    /**
     * Gets the {@link LightingParams} that define lighting parameters.
     *
     * @type {LightingParams}
     */
    get lighting(): LightingParams;
    /**
     * Gets the GSplat parameters.
     *
     * @type {GSplatParams}
     */
    get gsplat(): GSplatParams;
    /**
     * Gets the {@link FogParams} that define fog parameters.
     *
     * @type {FogParams}
     */
    get fog(): FogParams;
    /**
     * Sets the range parameter of the bilateral filter. It's used when {@link Scene#lightmapFilterEnabled}
     * is enabled. Larger value applies more widespread blur. This needs to be a positive non-zero
     * value. Defaults to 10.
     *
     * @type {number}
     */
    set lightmapFilterRange(value: number);
    /**
     * Gets the range parameter of the bilateral filter.
     *
     * @type {number}
     */
    get lightmapFilterRange(): number;
    /**
     * Sets the spatial parameter of the bilateral filter. It's used when {@link Scene#lightmapFilterEnabled}
     * is enabled. Larger value blurs less similar colors. This needs to be a positive non-zero
     * value. Defaults to 0.2.
     *
     * @type {number}
     */
    set lightmapFilterSmoothness(value: number);
    /**
     * Gets the spatial parameter of the bilateral filter.
     *
     * @type {number}
     */
    get lightmapFilterSmoothness(): number;
    /**
     * Sets the 6 prefiltered cubemaps acting as the source of image-based lighting.
     *
     * @type {Texture[]}
     */
    set prefilteredCubemaps(value: Texture[]);
    /**
     * Gets the 6 prefiltered cubemaps acting as the source of image-based lighting.
     *
     * @type {Texture[]}
     */
    get prefilteredCubemaps(): Texture[];
    /**
     * Sets the base cubemap texture used as the scene's skybox when skyboxMip is 0. Defaults to null.
     *
     * @type {Texture|null}
     */
    set skybox(value: Texture | null);
    /**
     * Gets the base cubemap texture used as the scene's skybox when skyboxMip is 0.
     *
     * @type {Texture|null}
     */
    get skybox(): Texture | null;
    /**
     * Sets the multiplier for skybox intensity. Defaults to 1. Unused if physical units are used.
     *
     * @type {number}
     */
    set skyboxIntensity(value: number);
    /**
     * Gets the multiplier for skybox intensity.
     *
     * @type {number}
     */
    get skyboxIntensity(): number;
    /**
     * Sets the luminance (in lm/m^2) of the skybox. Defaults to 0. Only used if physical units are used.
     *
     * @type {number}
     */
    set skyboxLuminance(value: number);
    /**
     * Gets the luminance (in lm/m^2) of the skybox.
     *
     * @type {number}
     */
    get skyboxLuminance(): number;
    /**
     * Sets the mip level of the skybox to be displayed. Only valid for prefiltered cubemap skyboxes.
     * Defaults to 0 (base level).
     *
     * @type {number}
     */
    set skyboxMip(value: number);
    /**
     * Gets the mip level of the skybox to be displayed.
     *
     * @type {number}
     */
    get skyboxMip(): number;
    /**
     * Sets the highlight multiplier for the skybox. The HDR skybox can represent brightness levels
     * up to a maximum of 64, with any values beyond this being clipped. This limitation prevents
     * the accurate representation of extremely bright sources, such as the Sun, which can affect
     * HDR bloom rendering by not producing enough bloom. The multiplier adjusts the brightness
     * after clipping, enhancing the bloom effect for bright sources. Defaults to 1.
     *
     * @type {number}
     */
    set skyboxHighlightMultiplier(value: number);
    /**
     * Gets the highlight multiplied for the skybox.
     *
     * @type {number}
     */
    get skyboxHighlightMultiplier(): number;
    /**
     * Sets the rotation of the skybox to be displayed. Defaults to {@link Quat.IDENTITY}.
     *
     * @type {Quat}
     */
    set skyboxRotation(value: Quat);
    /**
     * Gets the rotation of the skybox to be displayed.
     *
     * @type {Quat}
     */
    get skyboxRotation(): Quat;
    destroy(): void;
    drawLine(start: any, end: any, color?: Color, depthTest?: boolean, layer?: Layer): void;
    drawLines(positions: any, colors: any, depthTest?: boolean, layer?: Layer): void;
    drawLineArrays(positions: any, colors: any, depthTest?: boolean, layer?: Layer): void;
    applySettings(settings: any): void;
    _getSkyboxTex(): Texture;
    _updateSkyMesh(): void;
    _resetSkyMesh(): void;
    /**
     * Sets the cubemap for the scene skybox.
     *
     * @param {Texture[]} [cubemaps] - An array of cubemaps corresponding to the skybox at
     * different mip levels. If undefined, scene will remove skybox. Cubemap array should be of
     * size 7, with the first element (index 0) corresponding to the base cubemap (mip level 0)
     * with original resolution. Each remaining element (index 1-6) corresponds to a fixed
     * prefiltered resolution (128x128, 64x64, 32x32, 16x16, 8x8, 4x4).
     */
    setSkybox(cubemaps?: Texture[]): void;
    /**
     * Gets the lightmap pixel format.
     *
     * @type {number}
     */
    get lightmapPixelFormat(): number;
}
import { EventHandler } from '../core/event-handler.js';
import { Color } from '../core/math/color.js';
import type { Entity } from '../framework/entity.js';
import type { GraphicsDevice } from '../platform/graphics/graphics-device.js';
import { Vec3 } from '../core/math/vec3.js';
import { Quat } from '../core/math/quat.js';
import { Mat3 } from '../core/math/mat3.js';
import { Mat4 } from '../core/math/mat4.js';
import { LightingParams } from './lighting/lighting-params.js';
import { GSplatParams } from './gsplat-unified/gsplat-params.js';
import { Sky } from './skybox/sky.js';
import { Immediate } from './immediate/immediate.js';
import type { Layer } from './layer.js';
import type { Texture } from '../platform/graphics/texture.js';
import type { LayerComposition } from './composition/layer-composition.js';
import { FogParams } from './fog-params.js';
