import { ShaderProcessorOptions } from '../../platform/graphics/shader-processor-options.js';
import { SPECOCC_AO, DITHER_NONE, FRESNEL_SCHLICK } from '../constants.js';
import { Material } from './material.js';
import { LitMaterialOptions } from './lit-material-options.js';
import { LitMaterialOptionsBuilder } from './lit-material-options-builder.js';
import { getProgramLibrary } from '../shader-lib/get-program-library.js';
import { lit } from '../shader-lib/programs/lit.js';
import { ShaderUtils } from '../shader-lib/shader-utils.js';

const options = new LitMaterialOptions();
/**
 * LitMaterial comprises a shader chunk implementing the material "front end" (the shader program
 * providing the material surface properties like diffuse, opacity, normals etc) and a set of
 * flags which control the material "back end" (the shader program calculating the lighting,
 * shadows, reflections, fogging etc).
 *
 * The front end and back end together form a complete PBR shader.
 *
 * @ignore
 */ class LitMaterial extends Material {
    getShaderVariant(params) {
        options.usedUvs = this.usedUvs.slice();
        options.shaderChunkGLSL = this.shaderChunkGLSL;
        options.shaderChunkWGSL = this.shaderChunkWGSL;
        options.defines = ShaderUtils.getCoreDefines(this, params);
        LitMaterialOptionsBuilder.update(options.litOptions, this, params.scene, params.cameraShaderParams, params.objDefs, params.pass, params.sortedLights);
        const processingOptions = new ShaderProcessorOptions(params.viewUniformFormat, params.viewBindGroupFormat, params.vertexFormat);
        const library = getProgramLibrary(params.device);
        library.register('lit', lit);
        const shader = library.getProgram('lit', options, processingOptions, this.userId);
        return shader;
    }
    constructor(...args){
        super(...args), this.usedUvs = [
            true
        ], this.shaderChunkGLSL = null, this.shaderChunkWGSL = null, this.useLighting = true, this.useFog = true, this.useTonemap = true, this.useSkybox = true, this.ambientSH = null, this.pixelSnap = false, this.nineSlicedMode = null, this.twoSidedLighting = false, this.occludeDirect = false, this.occludeSpecular = SPECOCC_AO, this.occludeSpecularIntensity = 1, this.opacityFadesSpecular = true, this.opacityDither = DITHER_NONE, this.opacityShadowDither = DITHER_NONE, this.shadowCatcher = false, this.ggxSpecular = false, this.fresnelModel = FRESNEL_SCHLICK, this.dynamicRefraction = false, // has members
        this.hasAo = false, this.hasSpecular = false, this.hasSpecularityFactor = false, this.hasLighting = false, this.hasHeights = false, this.hasNormals = false, this.hasSheen = false, this.hasRefraction = false, this.hasIrridescence = false, this.hasMetalness = false, this.hasClearCoat = false, this.hasClearCoatNormals = false;
    }
}

export { LitMaterial };
