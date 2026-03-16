/**
 * A light.
 *
 * @ignore
 */
export class Light {
    /**
     * Get conversion factor for luminance -> light specific light unit.
     *
     * @param {number} type - The type of light.
     * @param {number} [outerAngle] - The outer angle of a spot light.
     * @param {number} [innerAngle] - The inner angle of a spot light.
     * @returns {number} The scaling factor to multiply with the luminance value.
     */
    static getLightUnitConversion(type: number, outerAngle?: number, innerAngle?: number): number;
    /**
     * @param {GraphicsDevice} graphicsDevice - The graphics device.
     * @param {boolean} clusteredLighting - True if the clustered lighting is enabled.
     */
    constructor(graphicsDevice: GraphicsDevice, clusteredLighting: boolean);
    /**
     * The Layers the light is on.
     *
     * @type {Set<Layer>}
     */
    layers: Set<Layer>;
    /**
     * True if the clustered lighting is enabled.
     *
     * @type {boolean}
     */
    clusteredLighting: boolean;
    /**
     * The depth state used when rendering the shadow map.
     *
     * @type {DepthState}
     */
    shadowDepthState: DepthState;
    /**
     * The flags used for clustered lighting. Stored as a bitfield, updated as properties change to
     * avoid those being updated each frame.
     *
     * @type {number}
     * @ignore
     */
    clusteredFlags: number;
    /**
     * Storage data for light properties encoded as a Uint32Array.
     *
     * @type {Uint32Array}
     * @ignore
     */
    clusteredData: Uint32Array;
    /**
     * Alias for clusteredData using 16bit unsigned integers.
     *
     * @type {Uint16Array}
     * @ignore
     */
    clusteredData16: Uint16Array;
    /**
     * Event handle for device restored event.
     *
     * @type {EventHandle|null}
     * @private
     */
    private _evtDeviceRestored;
    device: GraphicsDevice;
    id: number;
    _type: number;
    _color: Color;
    _intensity: number;
    _affectSpecularity: boolean;
    _luminance: number;
    _castShadows: boolean;
    _enabled: boolean;
    _mask: number;
    isStatic: boolean;
    key: number;
    bakeDir: boolean;
    bakeNumSamples: number;
    bakeArea: number;
    attenuationStart: number;
    attenuationEnd: number;
    _falloffMode: number;
    _shadowType: number;
    _vsmBlurSize: number;
    vsmBlurMode: number;
    vsmBias: number;
    _cookie: any;
    cookieIntensity: number;
    _cookieFalloff: boolean;
    _cookieChannel: string;
    _cookieTransform: any;
    _cookieTransformUniform: Float32Array<ArrayBuffer>;
    _cookieOffset: any;
    _cookieOffsetUniform: Float32Array<ArrayBuffer>;
    _cookieTransformSet: boolean;
    _cookieOffsetSet: boolean;
    _innerConeAngle: number;
    _outerConeAngle: number;
    cascades: any;
    _shadowMatrixPalette: Float32Array<ArrayBuffer>;
    _shadowCascadeDistances: Float32Array<ArrayBuffer>;
    set numCascades(value: any);
    get numCascades(): any;
    _cascadeBlend: number;
    cascadeDistribution: number;
    _shape: number;
    _colorLinear: Float32Array<ArrayBuffer>;
    _position: Vec3;
    _direction: Vec3;
    _innerConeAngleCos: number;
    _usePhysicalUnits: any;
    _shadowMap: any;
    _shadowRenderParams: any[];
    _shadowCameraParams: any[];
    shadowDistance: number;
    _shadowResolution: number;
    _shadowBias: number;
    _shadowIntensity: number;
    _normalOffsetBias: number;
    shadowUpdateMode: number;
    shadowUpdateOverrides: any;
    _isVsm: boolean;
    _isPcf: boolean;
    _softShadowParams: Float32Array<ArrayBuffer>;
    set shadowSamples(value: number);
    get shadowSamples(): number;
    set shadowBlockerSamples(value: number);
    get shadowBlockerSamples(): number;
    set penumbraSize(value: any);
    get penumbraSize(): any;
    set penumbraFalloff(value: number);
    get penumbraFalloff(): number;
    _cookieMatrix: Mat4;
    _atlasViewport: Vec4;
    atlasViewportAllocated: boolean;
    atlasVersion: number;
    atlasSlotIndex: number;
    atlasSlotUpdated: boolean;
    _node: any;
    _renderData: any[];
    visibleThisFrame: boolean;
    maxScreenSize: number;
    destroy(): void;
    onDeviceRestored(): void;
    releaseRenderData(): void;
    addLayer(layer: any): void;
    removeLayer(layer: any): void;
    set shadowBias(value: number);
    get shadowBias(): number;
    set cascadeBlend(value: number);
    get cascadeBlend(): number;
    set shadowMap(shadowMap: any);
    get shadowMap(): any;
    set mask(value: number);
    get mask(): number;
    get numShadowFaces(): any;
    set type(value: number);
    get type(): number;
    set shadowType(value: number);
    get shadowType(): number;
    set shape(value: number);
    get shape(): number;
    set usePhysicalUnits(value: any);
    get usePhysicalUnits(): any;
    set enabled(value: boolean);
    get enabled(): boolean;
    set castShadows(value: boolean);
    get castShadows(): boolean;
    set shadowIntensity(value: number);
    get shadowIntensity(): number;
    get bakeShadows(): boolean;
    set shadowResolution(value: number);
    get shadowResolution(): number;
    set vsmBlurSize(value: number);
    get vsmBlurSize(): number;
    set normalOffsetBias(value: number);
    get normalOffsetBias(): number;
    set falloffMode(value: number);
    get falloffMode(): number;
    set innerConeAngle(value: number);
    get innerConeAngle(): number;
    set outerConeAngle(value: number);
    get outerConeAngle(): number;
    _penumbraSize: any;
    _updateOuterAngle(angle: any): void;
    _outerConeAngleCos: number;
    _outerConeAngleSin: number;
    set intensity(value: number);
    get intensity(): number;
    set affectSpecularity(value: boolean);
    get affectSpecularity(): boolean;
    set luminance(value: number);
    get luminance(): number;
    get cookieMatrix(): Mat4;
    get atlasViewport(): Vec4;
    set cookie(value: any);
    get cookie(): any;
    set cookieFalloff(value: boolean);
    get cookieFalloff(): boolean;
    set cookieChannel(value: string);
    get cookieChannel(): string;
    set cookieTransform(value: any);
    get cookieTransform(): any;
    set cookieOffset(value: any);
    get cookieOffset(): any;
    beginFrame(): void;
    _destroyShadowMap(): void;
    getRenderData(camera: any, face: any): any;
    /**
     * Duplicates a light node but does not 'deep copy' the hierarchy.
     *
     * @returns {Light} A cloned Light.
     */
    clone(): Light;
    _getUniformBiasValues(lightRenderData: any): {
        bias: number;
        normalBias: number;
    };
    getColor(): Color;
    getBoundingSphere(sphere: any): void;
    getBoundingBox(box: any): void;
    _updateShadowBias(): void;
    _updateLinearColor(): void;
    setColor(...args: any[]): void;
    layersDirty(): void;
    /**
     * Updates a integer key for the light. The key is used to identify all shader related features
     * of the light, and so needs to have all properties that modify the generated shader encoded.
     * Properties without an effect on the shader (color, shadow intensity) should not be encoded.
     */
    updateKey(): void;
    /**
     * Updates 32bit flags used by the clustered lighting. This only stores constant data.
     * Note: this needs to match shader code in clusteredLight.js
     */
    updateClusteredFlags(): void;
    /**
     * Adds per-frame dynamic data to the 32bit flags used by the clustered lighting.
     */
    getClusteredFlags(castShadows: any, useCookie: any): number;
    updateClusterData(updateColor: any, updateAngles: any): void;
}
export namespace lightTypes {
    export { LIGHTTYPE_DIRECTIONAL as directional };
    export { LIGHTTYPE_OMNI as omni };
    export { LIGHTTYPE_OMNI as point };
    export { LIGHTTYPE_SPOT as spot };
}
import type { Layer } from './layer.js';
import { DepthState } from '../platform/graphics/depth-state.js';
import type { GraphicsDevice } from '../platform/graphics/graphics-device.js';
import { Color } from '../core/math/color.js';
import { Vec3 } from '../core/math/vec3.js';
import { Mat4 } from '../core/math/mat4.js';
import { Vec4 } from '../core/math/vec4.js';
import { LIGHTTYPE_DIRECTIONAL } from './constants.js';
import { LIGHTTYPE_OMNI } from './constants.js';
import { LIGHTTYPE_SPOT } from './constants.js';
