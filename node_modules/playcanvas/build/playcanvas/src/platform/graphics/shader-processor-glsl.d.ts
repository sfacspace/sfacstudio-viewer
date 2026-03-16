/**
 * Pure static class implementing processing of GLSL shaders. It allocates fixed locations for
 * attributes, and handles conversion of uniforms to uniform buffers.
 */
export class ShaderProcessorGLSL {
    /**
     * Process the shader.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {object} shaderDefinition - The shader definition.
     * @param {Shader} shader - The shader.
     * @returns {object} - The processed shader data.
     */
    static run(device: GraphicsDevice, shaderDefinition: object, shader: Shader): object;
    static extract(src: any): {
        src: any;
        attributes: string[];
        varyings: string[];
        outs: string[];
        uniforms: string[];
    };
    /**
     * Process the lines with uniforms. The function receives the lines containing all uniforms,
     * both numerical as well as textures/samplers. The function also receives the format of uniform
     * buffers (numerical) and bind groups (textures) for view and material level. All uniforms that
     * match any of those are ignored, as those would be supplied by view / material level buffers.
     * All leftover uniforms create uniform buffer and bind group for the mesh itself, containing
     * uniforms that change on the level of the mesh.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {Array<UniformLine>} uniforms - Lines containing uniforms.
     * @param {ShaderProcessorOptions} processingOptions - Uniform formats.
     * @param {Shader} shader - The shader definition.
     * @returns {object} - The uniform data. Returns a shader code block containing uniforms, to be
     * inserted into the shader, as well as generated uniform format structures for the mesh level.
     */
    static processUniforms(device: GraphicsDevice, uniforms: Array<UniformLine>, processingOptions: ShaderProcessorOptions, shader: Shader): object;
    static processVaryings(varyingLines: any, varyingMap: any, isVertex: any): string;
    static processOuts(outsLines: any): string;
    static getTypeCount(type: any): number;
    static processAttributes(attributeLines: any, shaderDefinitionAttributes: any, attributesMap: any, processingOptions: any): string;
    static splitToWords(line: any): any;
    static cutOut(src: any, start: any, end: any, replacement: any): any;
    static getUniformShaderDeclaration(format: any, bindGroup: any, bindIndex: any): string;
    static getTexturesShaderDeclaration(bindGroupFormat: any, bindGroup: any): string;
}
import type { GraphicsDevice } from './graphics-device.js';
import type { Shader } from './shader.js';
declare class UniformLine {
    constructor(line: any, shader: any);
    line: any;
    precision: any;
    type: any;
    name: any;
    arraySize: number;
    isSampler: boolean;
    isSignedInt: boolean;
    isUnsignedInt: boolean;
}
import type { ShaderProcessorOptions } from './shader-processor-options.js';
export {};
