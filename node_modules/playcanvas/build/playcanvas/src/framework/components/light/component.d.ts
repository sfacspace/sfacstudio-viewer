/**
 * @import { Color } from '../../../core/math/color.js'
 * @import { EventHandle } from '../../../core/event-handle.js'
 * @import { LightComponentData } from './data.js'
 * @import { Light } from '../../../scene/light.js'
 * @import { Texture } from '../../../platform/graphics/texture.js'
 * @import { Vec2 } from '../../../core/math/vec2.js'
 */
/**
 * The LightComponent enables an {@link Entity} to light the scene. There are three types of light:
 *
 * - `directional`: A global light that emits light in the direction of the negative y-axis of the
 * owner entity. Emulates light sources that appear to be infinitely far away such as the sun. The
 * owner entity's position is effectively ignored.
 * - `omni`: A local light that emits light in all directions from the owner entity's position.
 * Emulates candles, lamps, bulbs, etc.
 * - `spot`: A local light that emits light similarly to an omni light but is bounded by a cone
 * centered on the owner entity's negative y-axis. Emulates flashlights, spotlights, etc.
 *
 * You should never need to use the LightComponent constructor directly. To add an LightComponent
 * to an {@link Entity}, use {@link Entity#addComponent}:
 *
 * ```javascript
 * const entity = new pc.Entity();
 * entity.addComponent('light', {
 *     type: 'omni',
 *     color: new pc.Color(1, 0, 0),
 *     intensity: 2
 * });
 * ```
 *
 * Once the LightComponent is added to the entity, you can access it via the {@link Entity#light}
 * property:
 *
 * ```javascript
 * entity.light.intensity = 3; // Set the intensity of the light
 *
 * console.log(entity.light.intensity); // Get the intensity of the light
 * ```
 *
 * Relevant Engine API examples:
 *
 * - [Area Lights](https://playcanvas.github.io/#/graphics/area-lights)
 * - [Clustered Area Lights](https://playcanvas.github.io/#/graphics/clustered-area-lights)
 * - [Clustered Lighting](https://playcanvas.github.io/#/graphics/clustered-lighting)
 * - [Clustered Onmi Shadows](https://playcanvas.github.io/#/graphics/clustered-omni-shadows)
 * - [Clustered Spot Shadows](https://playcanvas.github.io/#/graphics/clustered-spot-shadows)
 * - [Lights](https://playcanvas.github.io/#/graphics/lights)
 *
 * @hideconstructor
 * @category Graphics
 */
export class LightComponent extends Component {
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtLayersChanged;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtLayerAdded;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtLayerRemoved;
    /** @private */
    private _cookieAsset;
    /** @private */
    private _cookieAssetId;
    /** @private */
    private _cookieAssetAdd;
    /** @private */
    private _cookieMatrix;
    /**
     * @type {LightComponentData}
     * @ignore
     */
    get data(): LightComponentData;
    /**
     * @type {Light}
     * @ignore
     */
    set light(arg: Light);
    /**
     * @type {Light}
     * @ignore
     */
    get light(): Light;
    /**
     * Sets the type of the light. Can be:
     *
     * - "directional": A light that is infinitely far away and lights the entire scene from one
     * direction.
     * - "omni": An omni-directional light that illuminates in all directions from the light source.
     * - "spot": An omni-directional light but is bounded by a cone.
     *
     * Defaults to "directional".
     *
     * @type {string}
     */
    set type(arg: string);
    /**
     * Gets the type of the light.
     *
     * @type {string}
     */
    get type(): string;
    /**
     * Sets the color of the light. The alpha component of the color is ignored. Defaults to white
     * (`[1, 1, 1]`).
     *
     * @type {Color};
     */
    set color(arg: Color);
    /**
     * Gets the color of the light.
     *
     * @type {Color};
     */
    get color(): Color;
    /**
     * Sets the brightness of the light. Defaults to 1.
     *
     * @type {number}
     */
    set intensity(arg: number);
    /**
     * Gets the brightness of the light.
     *
     * @type {number}
     */
    get intensity(): number;
    /**
     * Sets the physically-based luminance. Only used if `scene.physicalUnits` is true. Defaults to 0.
     *
     * @type {number}
     */
    set luminance(arg: number);
    /**
     * Gets the physically-based luminance.
     *
     * @type {number}
     */
    get luminance(): number;
    /**
     * Sets the light source shape. Can be:
     *
     * - {@link LIGHTSHAPE_PUNCTUAL}: Infinitesimally small point.
     * - {@link LIGHTSHAPE_RECT}: Rectangle shape.
     * - {@link LIGHTSHAPE_DISK}: Disk shape.
     * - {@link LIGHTSHAPE_SPHERE}: Sphere shape.
     *
     * Defaults to pc.LIGHTSHAPE_PUNCTUAL.
     *
     * @type {number}
     */
    set shape(arg: number);
    /**
     * Gets the light source shape.
     *
     * @type {number}
     */
    get shape(): number;
    /**
     * Sets whether material specularity will be affected by this light. Ignored for lights other
     * than {@link LIGHTTYPE_DIRECTIONAL}. Defaults to true.
     *
     * @type {boolean}
     */
    set affectSpecularity(arg: boolean);
    /**
     * Gets whether material specularity will be affected by this light.
     *
     * @type {boolean}
     */
    get affectSpecularity(): boolean;
    /**
     * Sets whether the light will cast shadows. Defaults to false.
     *
     * @type {boolean}
     */
    set castShadows(arg: boolean);
    /**
     * Gets whether the light will cast shadows.
     *
     * @type {boolean}
     */
    get castShadows(): boolean;
    /**
     * Sets the distance from the viewpoint beyond which shadows are no longer rendered. Affects
     * directional lights only. Defaults to 40.
     *
     * @type {number}
     */
    set shadowDistance(arg: number);
    /**
     * Gets the distance from the viewpoint beyond which shadows are no longer rendered.
     *
     * @type {number}
     */
    get shadowDistance(): number;
    /**
     * Sets the intensity of the shadow darkening. 0 having no effect and 1 meaning shadows are
     * entirely black. Defaults to 1.
     *
     * @type {number}
     */
    set shadowIntensity(arg: number);
    /**
     * Gets the intensity of the shadow darkening.
     *
     * @type {number}
     */
    get shadowIntensity(): number;
    /**
     * Sets the size of the texture used for the shadow map. Valid sizes are 64, 128, 256, 512,
     * 1024, 2048. Defaults to 1024.
     *
     * @type {number}
     */
    set shadowResolution(arg: number);
    /**
     * Gets the size of the texture used for the shadow map.
     *
     * @type {number}
     */
    get shadowResolution(): number;
    /**
     * Set the depth bias for tuning the appearance of the shadow mapping generated by this light. Valid
     * range is 0 to 1. Defaults to 0.05.
     *
     * @type {number}
     */
    set shadowBias(arg: number);
    /**
     * Get the depth bias for tuning the appearance of the shadow mapping generated by this light.
     *
     * @type {number}
     */
    get shadowBias(): number;
    /**
     * Sets the number of shadow cascades. Can be 1, 2, 3 or 4. Defaults to 1, representing no
     * cascades.
     *
     * @type {number}
     */
    set numCascades(arg: number);
    /**
     * Gets the number of shadow cascades.
     *
     * @type {number}
     */
    get numCascades(): number;
    /**
     * Sets the blend factor for cascaded shadow maps, defining the fraction of each cascade level
     * used for blending between adjacent cascades. The value should be between 0 and 1, with
     * a default of 0, which disables blending between cascades.
     *
     * @type {number}
     */
    set cascadeBlend(value: number);
    /**
     * Gets the blend factor for cascaded shadow maps.
     *
     * @type {number}
     */
    get cascadeBlend(): number;
    /**
     * Sets the number of samples used to bake this light into the lightmap. Defaults to 1. Maximum
     * value is 255.
     *
     * @type {number}
     */
    set bakeNumSamples(arg: number);
    /**
     * Gets the number of samples used to bake this light into the lightmap.
     *
     * @type {number}
     */
    get bakeNumSamples(): number;
    /**
     * Sets the penumbra angle in degrees, allowing for a soft shadow boundary. Defaults to 0.
     * Requires `bake` to be set to true and the light type is {@link LIGHTTYPE_DIRECTIONAL}.
     *
     * @type {number}
     */
    set bakeArea(arg: number);
    /**
     * Gets the penumbra angle in degrees.
     *
     * @type {number}
     */
    get bakeArea(): number;
    /**
     * Sets the distribution of subdivision of the camera frustum for individual shadow cascades.
     * Only used if {@link LightComponent#numCascades} is larger than 1. Can be a value in range of
     * 0 and 1. Value of 0 represents a linear distribution, value of 1 represents a logarithmic
     * distribution. Defaults to 0.5. Larger value increases the resolution of the shadows in the
     * near distance.
     *
     * @type {number}
     */
    set cascadeDistribution(arg: number);
    /**
     * Gets the distribution of subdivision of the camera frustum for individual shadow cascades.
     *
     * @type {number}
     */
    get cascadeDistribution(): number;
    /**
     * Sets the normal offset depth bias. Valid range is 0 to 1. Defaults to 0.
     *
     * @type {number}
     */
    set normalOffsetBias(arg: number);
    /**
     * Gets the normal offset depth bias.
     *
     * @type {number}
     */
    get normalOffsetBias(): number;
    /**
     * Sets the range of the light. Affects omni and spot lights only. Defaults to 10.
     *
     * @type {number}
     */
    set range(arg: number);
    /**
     * Gets the range of the light.
     *
     * @type {number}
     */
    get range(): number;
    /**
     * Sets the angle at which the spotlight cone starts to fade off. The angle is specified in
     * degrees. Affects spot lights only. Defaults to 40.
     *
     * @type {number}
     */
    set innerConeAngle(arg: number);
    /**
     * Gets the angle at which the spotlight cone starts to fade off.
     *
     * @type {number}
     */
    get innerConeAngle(): number;
    /**
     * Sets the angle at which the spotlight cone has faded to nothing. The angle is specified in
     * degrees. Affects spot lights only. Defaults to 45.
     *
     * @type {number}
     */
    set outerConeAngle(arg: number);
    /**
     * Gets the angle at which the spotlight cone has faded to nothing.
     *
     * @type {number}
     */
    get outerConeAngle(): number;
    /**
     * Sets the fall off mode for the light. This controls the rate at which a light attenuates
     * from its position. Can be:
     *
     * - {@link LIGHTFALLOFF_LINEAR}: Linear.
     * - {@link LIGHTFALLOFF_INVERSESQUARED}: Inverse squared.
     *
     * Affects omni and spot lights only. Defaults to {@link LIGHTFALLOFF_LINEAR}.
     *
     * @type {number}
     */
    set falloffMode(arg: number);
    /**
     * Gets the fall off mode for the light.
     *
     * @type {number}
     */
    get falloffMode(): number;
    /**
     * Sets the type of shadows being rendered by this light. Can be:
     *
     * - {@link SHADOW_PCF1_32F}
     * - {@link SHADOW_PCF3_32F}
     * - {@link SHADOW_PCF5_32F}
     * - {@link SHADOW_PCF1_16F}
     * - {@link SHADOW_PCF3_16F}
     * - {@link SHADOW_PCF5_16F}
     * - {@link SHADOW_VSM_16F}
     * - {@link SHADOW_VSM_32F}
     * - {@link SHADOW_PCSS_32F}
     *
     * @type {number}
     */
    set shadowType(arg: number);
    /**
     * Gets the type of shadows being rendered by this light.
     *
     * @type {number}
     */
    get shadowType(): number;
    /**
     * Sets the number of samples used for blurring a variance shadow map. Only uneven numbers
     * work, even are incremented. Minimum value is 1, maximum is 25. Defaults to 11.
     *
     * @type {number}
     */
    set vsmBlurSize(arg: number);
    /**
     * Gets the number of samples used for blurring a variance shadow map.
     *
     * @type {number}
     */
    get vsmBlurSize(): number;
    /**
     * Sets the blurring mode for variance shadow maps. Can be:
     *
     * - {@link BLUR_BOX}: Box filter.
     * - {@link BLUR_GAUSSIAN}: Gaussian filter. May look smoother than box, but requires more samples.
     *
     * @type {number}
     */
    set vsmBlurMode(arg: number);
    /**
     * Gets the blurring mode for variance shadow maps.
     *
     * @type {number}
     */
    get vsmBlurMode(): number;
    /**
     * Sets the VSM bias value.
     *
     * @type {number}
     */
    set vsmBias(arg: number);
    /**
     * Gets the VSM bias value.
     *
     * @type {number}
     */
    get vsmBias(): number;
    /**
     * Sets the texture asset to be used as the cookie for this light. Only spot and omni lights can
     * have cookies. Defaults to null.
     *
     * @type {number|null}
     */
    set cookieAsset(arg: number | null);
    /**
     * Gets the texture asset to be used as the cookie for this light.
     *
     * @type {number|null}
     */
    get cookieAsset(): number | null;
    /**
     * Sets the texture to be used as the cookie for this light. Only spot and omni lights can have
     * cookies. Defaults to null.
     *
     * @type {Texture|null}
     */
    set cookie(arg: Texture | null);
    /**
     * Gets the texture to be used as the cookie for this light.
     *
     * @type {Texture|null}
     */
    get cookie(): Texture | null;
    /**
     * Sets the cookie texture intensity. Defaults to 1.
     *
     * @type {number}
     */
    set cookieIntensity(arg: number);
    /**
     * Gets the cookie texture intensity.
     *
     * @type {number}
     */
    get cookieIntensity(): number;
    /**
     * Sets whether normal spotlight falloff is active when a cookie texture is set. When set to
     * false, a spotlight will work like a pure texture projector (only fading with distance).
     * Default is false.
     *
     * @type {boolean}
     */
    set cookieFalloff(arg: boolean);
    /**
     * Gets whether normal spotlight falloff is active when a cookie texture is set.
     *
     * @type {boolean}
     */
    get cookieFalloff(): boolean;
    /**
     * Sets the color channels of the cookie texture to use. Can be "r", "g", "b", "a", "rgb".
     *
     * @type {string}
     */
    set cookieChannel(arg: string);
    /**
     * Gets the color channels of the cookie texture to use.
     *
     * @type {string}
     */
    get cookieChannel(): string;
    /**
     * Sets the angle for spotlight cookie rotation (in degrees).
     *
     * @type {number}
     */
    set cookieAngle(arg: number);
    /**
     * Gets the angle for spotlight cookie rotation (in degrees).
     *
     * @type {number}
     */
    get cookieAngle(): number;
    /**
     * Sets the spotlight cookie scale.
     *
     * @type {Vec2|null}
     */
    set cookieScale(arg: Vec2 | null);
    /**
     * Gets the spotlight cookie scale.
     *
     * @type {Vec2|null}
     */
    get cookieScale(): Vec2 | null;
    /**
     * Sets the spotlight cookie position offset.
     *
     * @type {Vec2|null}
     */
    set cookieOffset(arg: Vec2 | null);
    /**
     * Gets the spotlight cookie position offset.
     *
     * @type {Vec2|null}
     */
    get cookieOffset(): Vec2 | null;
    /**
     * Sets the shadow update model. This tells the renderer how often shadows must be updated for
     * this light. Can be:
     *
     * - {@link SHADOWUPDATE_NONE}: Don't render shadows.
     * - {@link SHADOWUPDATE_THISFRAME}: Render shadows only once (then automatically switches
     * to {@link SHADOWUPDATE_NONE}.
     * - {@link SHADOWUPDATE_REALTIME}: Render shadows every frame (default).
     *
     * @type {number}
     */
    set shadowUpdateMode(arg: number);
    /**
     * Gets the shadow update model.
     *
     * @type {number}
     */
    get shadowUpdateMode(): number;
    /**
     * Sets the mask to determine which {@link MeshInstance}s are lit by this light. Defaults to 1.
     *
     * @type {number}
     */
    set mask(arg: number);
    /**
     * Gets the mask to determine which {@link MeshInstance}s are lit by this light.
     *
     * @type {number}
     */
    get mask(): number;
    /**
     * Sets whether the light will affect non-lightmapped objects.
     *
     * @type {boolean}
     */
    set affectDynamic(arg: boolean);
    /**
     * Gets whether the light will affect non-lightmapped objects.
     *
     * @type {boolean}
     */
    get affectDynamic(): boolean;
    /**
     * Sets whether the light will affect lightmapped objects.
     *
     * @type {boolean}
     */
    set affectLightmapped(arg: boolean);
    /**
     * Gets whether the light will affect lightmapped objects.
     *
     * @type {boolean}
     */
    get affectLightmapped(): boolean;
    /**
     * Sets whether the light will be rendered into lightmaps.
     *
     * @type {boolean}
     */
    set bake(arg: boolean);
    /**
     * Gets whether the light will be rendered into lightmaps.
     *
     * @type {boolean}
     */
    get bake(): boolean;
    /**
     * Sets whether the light's direction will contribute to directional lightmaps. The light must
     * be enabled and `bake` set to true. Be aware, that directional lightmap is an approximation
     * and can only hold single direction per pixel. Intersecting multiple lights with bakeDir=true
     * may lead to incorrect look of specular/bump-mapping in the area of intersection. The error
     * is not always visible though, and highly scene-dependent.
     *
     * @type {boolean}
     */
    set bakeDir(arg: boolean);
    /**
     * Gets whether the light's direction will contribute to directional lightmaps.
     *
     * @type {boolean}
     */
    get bakeDir(): boolean;
    /**
     * Sets whether the light ever moves. This is an optimization hint.
     *
     * @type {boolean}
     */
    set isStatic(arg: boolean);
    /**
     * Gets whether the light ever moves.
     *
     * @type {boolean}
     */
    get isStatic(): boolean;
    /**
     * Sets the array of layer IDs ({@link Layer#id}) to which this light should belong. Don't
     * push/pop/splice or modify this array. If you want to change it, set a new one instead.
     *
     * @type {number[]}
     */
    set layers(arg: number[]);
    /**
     * Gets the array of layer IDs ({@link Layer#id}) to which this light should belong.
     *
     * @type {number[]}
     */
    get layers(): number[];
    /**
     * Sets an array of SHADOWUPDATE_ settings per shadow cascade. Set to undefined if not used.
     *
     * @type {number[] | null}
     */
    set shadowUpdateOverrides(values: number[] | null);
    /**
     * Gets an array of SHADOWUPDATE_ settings per shadow cascade.
     *
     * @type {number[] | null}
     */
    get shadowUpdateOverrides(): number[] | null;
    /**
     * Sets the number of shadow samples used for soft shadows when the shadow type is
     * {@link SHADOW_PCSS_32F}. This value must be a positive whole number starting at 1. Higher
     * values result in smoother shadows but can significantly decrease performance. Defaults to 16.
     *
     * @type {number}
     */
    set shadowSamples(value: number);
    /**
     * Gets the number of shadow samples used for soft shadows.
     *
     * @type {number}
     */
    get shadowSamples(): number;
    /**
     * Sets the number of blocker samples used for soft shadows when the shadow type is
     * {@link SHADOW_PCSS_32F}. These samples are used to estimate the distance between the shadow
     * caster and the shadow receiver, which is then used for the estimation of contact hardening in
     * the shadow. This value must be a positive whole number starting at 0. Higher values improve
     * shadow quality by considering more occlusion points, but can decrease performance. When set
     * to 0, contact hardening is disabled and the shadow has constant softness. Defaults to 16. Note
     * that this values can be lower than shadowSamples to optimize performance, often without large
     * impact on quality.
     *
     * @type {number}
     */
    set shadowBlockerSamples(value: number);
    /**
     * Gets the number of blocker samples used for contact hardening shadows.
     *
     * @type {number}
     */
    get shadowBlockerSamples(): number;
    /**
     * Sets the size of penumbra for contact hardening shadows. For area lights, acts as a
     * multiplier with the dimensions of the area light. For punctual and directional lights it's
     * the area size of the light. Defaults to 1.
     *
     * @type {number}
     */
    set penumbraSize(value: number);
    /**
     * Gets the size of penumbra for contact hardening shadows.
     *
     * @type {number}
     */
    get penumbraSize(): number;
    /**
     * Sets the falloff rate for shadow penumbra for contact hardening shadows. This is a value larger
     * than or equal to 1. This parameter determines how quickly the shadow softens with distance.
     * Higher values result in a faster softening of the shadow, while lower values produce a more
     * gradual transition. Defaults to 1.
     *
     * @type {number}
     */
    set penumbraFalloff(value: number);
    /**
     * Gets the falloff rate for shadow penumbra for contact hardening shadows.
     *
     * @type {number}
     */
    get penumbraFalloff(): number;
    /** @ignore */
    _setValue(name: any, value: any, setFunc: any, skipEqualsCheck: any): void;
    addLightToLayers(): void;
    removeLightFromLayers(): void;
    onLayersChanged(oldComp: any, newComp: any): void;
    onLayerAdded(layer: any): void;
    onLayerRemoved(layer: any): void;
    refreshProperties(): void;
    onCookieAssetSet(): void;
    onCookieAssetAdd(asset: any): void;
    onCookieAssetLoad(): void;
    onCookieAssetRemove(): void;
    onRemove(): void;
}
import { Component } from '../component.js';
import type { LightComponentData } from './data.js';
import type { Light } from '../../../scene/light.js';
import type { Color } from '../../../core/math/color.js';
import type { Texture } from '../../../platform/graphics/texture.js';
import type { Vec2 } from '../../../core/math/vec2.js';
