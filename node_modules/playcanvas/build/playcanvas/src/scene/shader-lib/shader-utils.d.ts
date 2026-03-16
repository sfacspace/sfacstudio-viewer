export class ShaderUtils {
    /**
     * Creates a shader. When the active graphics device is WebGL, the provided GLSL vertex and
     * fragment source code is used. For WebGPU, if WGSL vertex and fragment source code is
     * supplied, it is used directly; otherwise, the system automatically translates the provided
     * GLSL code into WGSL. In the case of GLSL shaders, additional blocks are appended to both the
     * vertex and fragment source code to support extended features and maintain compatibility.
     * These additions include the shader version declaration, precision qualifiers, and commonly
     * used extensions, and therefore should be excluded from the user-supplied GLSL source.
     * Note: The shader has access to all registered shader chunks via the `#include` directive.
     * Any provided includes will be applied as overrides on top of those.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {object} options - Object for passing optional arguments.
     * @param {string} options.uniqueName - Unique name for the shader. If a shader with this name
     * already exists, it will be returned instead of a new shader instance.
     * @param {Object<string, string>} options.attributes - Object detailing the mapping of vertex
     * shader attribute names to semantics SEMANTIC_*. This enables the engine to match vertex
     * buffer data to the shader attributes.
     * @param {boolean} [options.useTransformFeedback] - Whether to use transform feedback. Defaults
     * to false. Only supported by WebGL.
     * @param {string} [options.vertexChunk] - The name of the vertex shader chunk to use.
     * @param {string} [options.vertexGLSL] - The vertex shader code in GLSL. Ignored if vertexChunk
     * is provided.
     * @param {string} [options.vertexWGSL] - The vertex shader code in WGSL. Ignored if vertexChunk
     * is provided.
     * @param {string} [options.fragmentChunk] - The name of the fragment shader chunk to use.
     * @param {string} [options.fragmentGLSL] - The fragment shader code in GLSL. Ignored if
     * fragmentChunk is provided.
     * @param {string} [options.fragmentWGSL] - The fragment shader code in WGSL. Ignored if
     * fragmentChunk is provided.
     * @param {Map<string, string>} [options.vertexIncludes] - A map containing key-value pairs of
     * include names and their content. These are used for resolving #include directives in the
     * vertex shader source.
     * @param {Map<string, string>} [options.vertexDefines] - A map containing key-value pairs of
     * define names and their values. These are used for resolving #ifdef style of directives in the
     * vertex code.
     * @param {Map<string, string>} [options.fragmentIncludes] - A map containing key-value pairs
     * of include names and their content. These are used for resolving #include directives in the
     * fragment shader source.
     * @param {Map<string, string>} [options.fragmentDefines] - A map containing key-value pairs of
     * define names and their values. These are used for resolving #ifdef style of directives in the
     * fragment code.
     * @param {string | string[]} [options.fragmentOutputTypes] - Fragment shader output types,
     * which default to vec4. Passing a string will set the output type for all color attachments.
     * Passing an array will set the output type for each color attachment.
     * @returns {Shader} The newly created shader.
     */
    static createShader(device: GraphicsDevice, options: {
        uniqueName: string;
        attributes: {
            [x: string]: string;
        };
        useTransformFeedback?: boolean;
        vertexChunk?: string;
        vertexGLSL?: string;
        vertexWGSL?: string;
        fragmentChunk?: string;
        fragmentGLSL?: string;
        fragmentWGSL?: string;
        vertexIncludes?: Map<string, string>;
        vertexDefines?: Map<string, string>;
        fragmentIncludes?: Map<string, string>;
        fragmentDefines?: Map<string, string>;
        fragmentOutputTypes?: string | string[];
    }): Shader;
    /**
     * Create a map of defines used for shader generation for a material.
     *
     * @param {Material} material - The material to create the shader defines for.
     * @param {ShaderVariantParams} params - The shader variant parameters.
     * @returns {Map<string, string>} The map of shader defines.
     * @ignore
     */
    static getCoreDefines(material: Material, params: ShaderVariantParams): Map<string, string>;
    /**
     * Process shader using shader processing options, utilizing the cache of the ProgramLibrary.
     *
     * @param {Shader} shader - The shader to be processed.
     * @param {ShaderProcessorOptions} processingOptions - The shader processing options.
     * @returns {Shader} The processed shader.
     * @ignore
     */
    static processShader(shader: Shader, processingOptions: ShaderProcessorOptions): Shader;
    /**
     * Add defines required for correct screenDepthPS chunk functionality for the given camera
     * shader parameters.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {CameraShaderParams} cameraShaderParams - The camera shader parameters.
     * @ignore
     */
    static addScreenDepthChunkDefines(device: GraphicsDevice, cameraShaderParams: CameraShaderParams, defines: any): void;
}
export function createShader(device: any, vsName: any, fsName: any, useTransformFeedback?: boolean, shaderDefinitionOptions?: {}): void;
export function createShaderFromCode(device: any, vsCode: any, fsCode: any, uniqueName: any, attributes: any, useTransformFeedback?: boolean, shaderDefinitionOptions?: {}): Shader;
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import { Shader } from '../../platform/graphics/shader.js';
import type { Material } from '../materials/material.js';
import type { ShaderVariantParams } from '../materials/material.js';
import type { ShaderProcessorOptions } from '../../platform/graphics/shader-processor-options.js';
import type { CameraShaderParams } from '../camera-shader-params.js';
