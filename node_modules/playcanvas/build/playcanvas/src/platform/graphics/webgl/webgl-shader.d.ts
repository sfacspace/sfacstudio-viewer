/**
 * A WebGL implementation of the Shader.
 *
 * @ignore
 */
export class WebglShader {
    constructor(shader: any);
    compileDuration: number;
    /**
     * Free the WebGL resources associated with a shader.
     *
     * @param {Shader} shader - The shader to free.
     */
    destroy(shader: Shader): void;
    glProgram: WebGLProgram;
    init(): void;
    uniforms: any[];
    samplers: any[];
    attributes: any[];
    glVertexShader: WebGLShader;
    glFragmentShader: WebGLShader;
    /**
     * Dispose the shader when the context has been lost.
     */
    loseContext(): void;
    /**
     * Restore shader after the context has been obtained.
     *
     * @param {WebglGraphicsDevice} device - The graphics device.
     * @param {Shader} shader - The shader to restore.
     */
    restoreContext(device: WebglGraphicsDevice, shader: Shader): void;
    /**
     * Compile shader programs.
     *
     * @param {WebglGraphicsDevice} device - The graphics device.
     * @param {Shader} shader - The shader to compile.
     */
    compile(device: WebglGraphicsDevice, shader: Shader): void;
    /**
     * Link shader programs. This is called at a later stage, to allow many shaders to compile in parallel.
     *
     * @param {WebglGraphicsDevice} device - The graphics device.
     * @param {Shader} shader - The shader to compile.
     */
    link(device: WebglGraphicsDevice, shader: Shader): void;
    /**
     * Compiles an individual shader.
     *
     * @param {WebglGraphicsDevice} device - The graphics device.
     * @param {string} src - The shader source code.
     * @param {boolean} isVertexShader - True if the shader is a vertex shader, false if it is a
     * fragment shader.
     * @returns {WebGLShader|null} The compiled shader, or null if the device is lost.
     * @private
     */
    private _compileShaderSource;
    /**
     * Link the shader, and extract its attributes and uniform information.
     *
     * @param {WebglGraphicsDevice} device - The graphics device.
     * @param {Shader} shader - The shader to query.
     * @returns {boolean} True if the shader was successfully queried and false otherwise.
     */
    finalize(device: WebglGraphicsDevice, shader: Shader): boolean;
    /**
     * Check the compilation status of a shader.
     *
     * @param {WebglGraphicsDevice} device - The graphics device.
     * @param {Shader} shader - The shader to query.
     * @param {WebGLShader} glShader - The WebGL shader.
     * @param {string} source - The shader source code.
     * @param {string} shaderType - The shader type. Can be 'vertex' or 'fragment'.
     * @returns {boolean} True if the shader compiled successfully, false otherwise.
     * @private
     */
    private _isCompiled;
    /**
     * Check the linking status of a shader.
     *
     * @param {WebglGraphicsDevice} device - The graphics device.
     * @returns {boolean} True if the shader is already linked, false otherwise. Note that unless the
     * device supports the KHR_parallel_shader_compile extension, this will always return true.
     */
    isLinked(device: WebglGraphicsDevice): boolean;
    /**
     * Truncate the WebGL shader compilation log to just include the error line plus the 5 lines
     * before and after it.
     *
     * @param {string} src - The shader source code.
     * @param {string} infoLog - The info log returned from WebGL on a failed shader compilation.
     * @returns {Array} An array where the first element is the 10 lines of code around the first
     * detected error, and the second element an object storing the error message, line number and
     * complete shader source.
     * @private
     */
    private _processError;
}
import type { Shader } from '../shader.js';
import type { WebglGraphicsDevice } from './webgl-graphics-device.js';
