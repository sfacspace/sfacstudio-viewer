/**
 * LitMaterial comprises a shader chunk implementing the material "front end" (the shader program
 * providing the material surface properties like diffuse, opacity, normals etc) and a set of
 * flags which control the material "back end" (the shader program calculating the lighting,
 * shadows, reflections, fogging etc).
 *
 * The front end and back end together form a complete PBR shader.
 *
 * @ignore
 */
export class LitMaterial extends Material {
    usedUvs: boolean[];
    shaderChunkGLSL: any;
    shaderChunkWGSL: any;
    useLighting: boolean;
    useFog: boolean;
    useTonemap: boolean;
    useSkybox: boolean;
    ambientSH: any;
    pixelSnap: boolean;
    nineSlicedMode: any;
    twoSidedLighting: boolean;
    occludeDirect: boolean;
    occludeSpecular: number;
    occludeSpecularIntensity: number;
    opacityFadesSpecular: boolean;
    opacityDither: string;
    opacityShadowDither: string;
    shadowCatcher: boolean;
    ggxSpecular: boolean;
    fresnelModel: number;
    dynamicRefraction: boolean;
    hasAo: boolean;
    hasSpecular: boolean;
    hasSpecularityFactor: boolean;
    hasLighting: boolean;
    hasHeights: boolean;
    hasNormals: boolean;
    hasSheen: boolean;
    hasRefraction: boolean;
    hasIrridescence: boolean;
    hasMetalness: boolean;
    hasClearCoat: boolean;
    hasClearCoatNormals: boolean;
    getShaderVariant(params: any): import("../../index.js").Shader;
}
import { Material } from './material.js';
