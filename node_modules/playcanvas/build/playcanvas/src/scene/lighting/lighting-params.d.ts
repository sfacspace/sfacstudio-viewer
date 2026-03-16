/**
 * Lighting parameters, allow configuration of the global lighting parameters. For details see
 * [Clustered Lighting](https://developer.playcanvas.com/user-manual/graphics/lighting/clustered-lighting/).
 *
 * @category Graphics
 */
export class LightingParams {
    /**
     * Creates a new LightingParams object.
     *
     * @ignore
     */
    constructor(supportsAreaLights: any, maxTextureSize: any, dirtyLightsFnc: any);
    /** @private */
    private _areaLightsEnabled;
    /** @private */
    private _cells;
    /** @private */
    private _maxLightsPerCell;
    /** @private */
    private _shadowsEnabled;
    /** @private */
    private _shadowType;
    /** @private */
    private _shadowAtlasResolution;
    /** @private */
    private _cookiesEnabled;
    /** @private */
    private _cookieAtlasResolution;
    /**
     * Layer ID of a layer to contain the debug rendering of clustered lighting. Defaults to
     * undefined, which disables the debug rendering. Debug rendering is only included in the debug
     * version of the engine.
     *
     * @type {number}
     */
    debugLayer: number;
    /**
     * Atlas textures split description, which applies to both the shadow and cookie texture atlas.
     * Defaults to null, which enables to automatic split mode. For details see [Configuring Atlas
     * Split](https://developer.playcanvas.com/user-manual/graphics/lighting/clustered-lighting/#configuring-atlas).
     *
     * @type {number[]|null}
     */
    atlasSplit: number[] | null;
    _supportsAreaLights: any;
    _maxTextureSize: any;
    _dirtyLightsFnc: any;
    applySettings(render: any): void;
    /**
     * Sets whether clustered lighting supports shadow casting. Defaults to true.
     *
     * @type {boolean}
     */
    set shadowsEnabled(value: boolean);
    /**
     * Gets whether clustered lighting supports shadow casting.
     *
     * @type {boolean}
     */
    get shadowsEnabled(): boolean;
    /**
     * Sets whether clustered lighting supports cookie textures. Defaults to false.
     *
     * @type {boolean}
     */
    set cookiesEnabled(value: boolean);
    /**
     * Gets whether clustered lighting supports cookie textures.
     *
     * @type {boolean}
     */
    get cookiesEnabled(): boolean;
    /**
     * Sets whether clustered lighting supports area lights. Defaults to false.
     *
     * @type {boolean}
     */
    set areaLightsEnabled(value: boolean);
    /**
     * Gets whether clustered lighting supports area lights.
     *
     * @type {boolean}
     */
    get areaLightsEnabled(): boolean;
    /**
     * Sets the resolution of the atlas texture storing all non-directional shadow textures.
     * Defaults to 2048.
     *
     * @type {number}
     */
    set shadowAtlasResolution(value: number);
    /**
     * Gets the resolution of the atlas texture storing all non-directional shadow textures.
     *
     * @type {number}
     */
    get shadowAtlasResolution(): number;
    /**
     * Sets the resolution of the atlas texture storing all non-directional cookie textures.
     * Defaults to 2048.
     *
     * @type {number}
     */
    set cookieAtlasResolution(value: number);
    /**
     * Gets the resolution of the atlas texture storing all non-directional cookie textures.
     *
     * @type {number}
     */
    get cookieAtlasResolution(): number;
    /**
     * Sets the maximum number of lights a cell can store. Defaults to 255.
     *
     * @type {number}
     */
    set maxLightsPerCell(value: number);
    /**
     * Gets the maximum number of lights a cell can store.
     *
     * @type {number}
     */
    get maxLightsPerCell(): number;
    /**
     * Sets the type of shadow filtering used by all shadows. Can be:
     *
     * - {@link SHADOW_PCF1_32F}
     * - {@link SHADOW_PCF3_32F}
     * - {@link SHADOW_PCF5_32F}
     * - {@link SHADOW_PCF1_16F}
     * - {@link SHADOW_PCF3_16F}
     * - {@link SHADOW_PCF5_16F}
     *
     * Defaults to {@link SHADOW_PCF3_32F}
     *
     * @type {number}
     */
    set shadowType(value: number);
    /**
     * Gets the type of shadow filtering used by all shadows.
     *
     * @type {number}
     */
    get shadowType(): number;
    /**
     * Sets the number of cells along each world space axis the space containing lights is
     * subdivided into. Defaults to `[10, 3, 10]`.
     *
     * @type {Vec3}
     */
    set cells(value: Vec3);
    /**
     * Gets the number of cells along each world space axis the space containing lights is
     * subdivided into.
     *
     * @type {Vec3}
     */
    get cells(): Vec3;
}
import { Vec3 } from '../../core/math/vec3.js';
