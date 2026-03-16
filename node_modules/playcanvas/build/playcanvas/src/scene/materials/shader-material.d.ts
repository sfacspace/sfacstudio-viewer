/**
 * - Defines the vertex and fragment shader source for
 * {@link ShaderMaterial}, supporting both GLSL and WGSL formats. WebGL always uses the GLSL code.
 * WebGPU prefers the WGSL code if available, otherwise it automatically transpiles the provided
 * GLSL code at runtime.
 */
export type ShaderDesc = {
    /**
     * - Unique name for the shader. If a shader with this name already
     * exists, it will be returned instead of a new shader instance.
     */
    uniqueName: string;
    /**
     * - The vertex shader code in GLSL.
     */
    vertexGLSL?: string;
    /**
     * - The fragment shader code in GLSL.
     */
    fragmentGLSL?: string;
    /**
     * - The vertex shader code in WGSL.
     */
    vertexWGSL?: string;
    /**
     * - The fragment shader code in WGSL.
     */
    fragmentWGSL?: string;
    /**
     * - Object detailing the mapping of vertex shader
     * attribute names to semantics SEMANTIC_*. This enables the engine to match vertex buffer data as
     * inputs to the shader. Defaults to undefined, which generates the default attributes.
     */
    attributes?: {
        [x: string]: string;
    };
    /**
     * - Fragment shader output types, which default to
     * vec4. Passing a string will set the output type for all color attachments. Passing an array will
     * set the output type for each color attachment.
     */
    fragmentOutputTypes?: string | string[];
};
/**
 * @typedef {object} ShaderDesc - Defines the vertex and fragment shader source for
 * {@link ShaderMaterial}, supporting both GLSL and WGSL formats. WebGL always uses the GLSL code.
 * WebGPU prefers the WGSL code if available, otherwise it automatically transpiles the provided
 * GLSL code at runtime.
 * @property {string} uniqueName - Unique name for the shader. If a shader with this name already
 * exists, it will be returned instead of a new shader instance.
 * @property {string} [vertexGLSL] - The vertex shader code in GLSL.
 * @property {string} [fragmentGLSL] - The fragment shader code in GLSL.
 * @property {string} [vertexWGSL] - The vertex shader code in WGSL.
 * @property {string} [fragmentWGSL] - The fragment shader code in WGSL.
 * @property {Object<string, string>} [attributes] - Object detailing the mapping of vertex shader
 * attribute names to semantics SEMANTIC_*. This enables the engine to match vertex buffer data as
 * inputs to the shader. Defaults to undefined, which generates the default attributes.
 * @property {string | string[]} [fragmentOutputTypes] - Fragment shader output types, which default to
 * vec4. Passing a string will set the output type for all color attachments. Passing an array will
 * set the output type for each color attachment. @see ShaderDefinitionUtils.createDefinition
 */
/**
 * A ShaderMaterial is a type of material that utilizes a specified shader for rendering purposes.
 *
 * A simple example which creates a material with custom vertex and fragment shaders specified in
 * GLSL format:
 *
 * ```javascript
 * const material = new pc.ShaderMaterial({
 *     uniqueName: 'MyShader',
 *     attributes: { aPosition: pc.SEMANTIC_POSITION },
 *     vertexGLSL: `
 *         attribute vec3 aPosition;
 *         uniform mat4 matrix_viewProjection;
 *         void main(void)
 *         {
 *             gl_Position = matrix_viewProjection * pos;
 *         }`,
 *     fragmentGLSL: `
 *         void main(void) {
 *             gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
 *         }`
 * });
 * ```
 *
 * @category Graphics
 */
export class ShaderMaterial extends Material {
    /**
     * Create a new ShaderMaterial instance.
     *
     * @param {ShaderDesc} [shaderDesc] - The description of the shader to be used by the material.
     */
    constructor(shaderDesc?: ShaderDesc);
    /**
     * @type {ShaderDesc|undefined}
     * @private
     */
    private _shaderDesc;
    /**
     * Sets the shader description.
     *
     * @type {ShaderDesc|undefined}
     */
    set shaderDesc(value: ShaderDesc | undefined);
    /**
     * Gets the shader description.
     *
     * @type {ShaderDesc|undefined}
     */
    get shaderDesc(): ShaderDesc | undefined;
    /**
     * Copy a `ShaderMaterial`.
     *
     * @param {ShaderMaterial} source - The material to copy from.
     * @returns {ShaderMaterial} The destination material.
     */
    copy(source: ShaderMaterial): ShaderMaterial;
    getShaderVariant(params: any): import("../../index.js").Shader;
}
import { Material } from './material.js';
