export const properties: string[];
/**
 * @import { Light } from '../../../scene/light.js'
 */
export class LightComponentData {
    enabled: boolean;
    /** @type {Light} */
    light: Light;
    type: string;
    color: Color;
    intensity: number;
    luminance: number;
    shape: number;
    affectSpecularity: boolean;
    castShadows: boolean;
    shadowDistance: number;
    shadowIntensity: number;
    shadowResolution: number;
    shadowBias: number;
    numCascades: number;
    cascadeBlend: number;
    bakeNumSamples: number;
    bakeArea: number;
    cascadeDistribution: number;
    normalOffsetBias: number;
    range: number;
    innerConeAngle: number;
    outerConeAngle: number;
    falloffMode: number;
    shadowType: number;
    vsmBlurSize: number;
    vsmBlurMode: number;
    vsmBias: number;
    cookieAsset: any;
    cookie: any;
    cookieIntensity: number;
    cookieFalloff: boolean;
    cookieChannel: string;
    cookieAngle: number;
    cookieScale: any;
    cookieOffset: any;
    shadowUpdateMode: number;
    mask: number;
    affectDynamic: boolean;
    affectLightmapped: boolean;
    bake: boolean;
    bakeDir: boolean;
    isStatic: boolean;
    layers: number[];
    penumbraSize: number;
    penumbraFalloff: number;
    shadowSamples: number;
    shadowBlockerSamples: number;
}
import type { Light } from '../../../scene/light.js';
import { Color } from '../../../core/math/color.js';
