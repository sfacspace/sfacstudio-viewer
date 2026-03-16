export class LitShader {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {LitShaderOptions} options - The lit options.
     * @param {boolean} [allowWGSL] - Whether to allow WGSL shader language.
     */
    constructor(device: GraphicsDevice, options: LitShaderOptions, allowWGSL?: boolean);
    /**
     * Shader code representing varyings.
     *
     * @type {string}
     */
    varyingsCode: string;
    /**
     * The graphics device.
     *
     * @type {GraphicsDevice}
     */
    device: GraphicsDevice;
    /**
     * The lit options.
     *
     * @type {LitShaderOptions}
     */
    options: LitShaderOptions;
    /**
     * The shader language, {@link SHADERLANGUAGE_GLSL} or {@link SHADERLANGUAGE_WGSL}.
     *
     * @type {string}
     */
    shaderLanguage: string;
    /**
     * The vertex shader defines needed for the shader compilation.
     *
     * @type {Map<string, string>}
     */
    vDefines: Map<string, string>;
    /**
     * The fragment shader defines needed for the shader compilation.
     *
     * @type {Map<string, string>}
     */
    fDefines: Map<string, string>;
    /**
     * The vertex and fragment shader includes needed for the shader compilation.
     *
     * @type {Map<string, string>}
     */
    includes: Map<string, string>;
    /**
     * The shader chunks to use for the shader generation.
     *
     * @type {Map<string, string>}
     */
    chunks: Map<string, string>;
    attributes: {
        vertex_position: string;
    };
    shaderPassInfo: import("../../shader-pass.js").ShaderPassInfo;
    shadowPass: any;
    lighting: boolean;
    reflections: boolean;
    needsNormal: boolean;
    needsSceneColor: boolean;
    needsScreenSize: boolean;
    needsTransforms: boolean;
    vshader: string;
    fshader: string;
    /**
     * Helper function to define a value in the fragment shader.
     *
     * @param {boolean} condition - The define is added if the condition is true.
     * @param {string} name - The define name.
     * @param {string} [value] - The define value.
     */
    fDefineSet(condition: boolean, name: string, value?: string): void;
    /**
     * The function generates defines for the lit vertex shader, and handles required attributes and
     * varyings. The source code of the shader is supplied by litMainVS chunk. This vertex shader is
     * used for all render passes.
     *
     * @param {any} useUv - Info about used UVs.
     * @param {any} useUnmodifiedUv - Info about used unmodified UVs.
     * @param {any} mapTransforms - Info about used texture transforms.
     */
    generateVertexShader(useUv: any, useUnmodifiedUv: any, mapTransforms: any): void;
    /**
     * Generate defines for lighting environment as well as individual lights.
     *
     * @param {boolean} hasAreaLights - Whether any of the lights are area lights.
     * @param {boolean} clusteredLightingEnabled - Whether clustered lighting is enabled.
     */
    _setupLightingDefines(hasAreaLights: boolean, clusteredLightingEnabled: boolean): void;
    prepareForwardPass(lightingUv: any): void;
    prepareShadowPass(): void;
    /**
     * Generates a fragment shader.
     *
     * @param {string} frontendDecl - Frontend declarations like `float dAlpha;`
     * @param {string} frontendCode - Frontend code containing `getOpacity()` etc.
     * @param {string} lightingUv - E.g. `vUv0`
     */
    generateFragmentShader(frontendDecl: string, frontendCode: string, lightingUv: string): void;
}
import type { GraphicsDevice } from '../../../platform/graphics/graphics-device.js';
import type { LitShaderOptions } from './lit-shader-options.js';
