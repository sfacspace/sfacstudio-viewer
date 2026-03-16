/**
 * Internal WebGPU debug system. Note that the functions only execute in the debug build, and are
 * stripped out in other builds.
 */
export class WebgpuDebug {
    static _scopes: any[];
    static _markers: any[];
    /** @type {Map<string,number>} */
    static _loggedMessages: Map<string, number>;
    /**
     * Start a validation error scope.
     *
     * @param {WebgpuGraphicsDevice} device - The graphics device.
     */
    static validate(device: WebgpuGraphicsDevice): void;
    /**
     * Start an out-of-memory error scope.
     *
     * @param {WebgpuGraphicsDevice} device - The graphics device.
     */
    static memory(device: WebgpuGraphicsDevice): void;
    /**
     * Start an internal error scope.
     *
     * @param {WebgpuGraphicsDevice} device - The graphics device.
     */
    static internal(device: WebgpuGraphicsDevice): void;
    /**
     * End the previous error scope, and print errors if any.
     *
     * @param {WebgpuGraphicsDevice} device - The graphics device.
     * @param {string} label - The label for the error scope.
     * @param {...any} args - Additional parameters that form the error message.
     */
    static end(device: WebgpuGraphicsDevice, label: string, ...args: any[]): Promise<void>;
    /**
     * Ends the shader validation scope by retrieving and logging any compilation errors
     * or warnings from the shader module. Also handles WebGPU validation errors, while
     * avoiding duplicate error messages.
     *
     * @param {WebgpuGraphicsDevice} device - The WebGPU graphics device.
     * @param {GPUShaderModule} shaderModule - The compiled WebGPU shader module.
     * @param {string} source - The original shader source code.
     * @param {number} [contextLines] - The number of lines before and after the error to log.
     * @param {...any} args - Additional parameters providing context about the shader.
     */
    static endShader(device: WebgpuGraphicsDevice, shaderModule: GPUShaderModule, source: string, contextLines?: number, ...args: any[]): Promise<void>;
}
import type { WebgpuGraphicsDevice } from './webgpu-graphics-device.js';
