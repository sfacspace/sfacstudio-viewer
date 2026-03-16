/**
 * @import { GraphicsDevice } from '../graphics-device.js'
 */
/**
 * Representation of a shader uniform.
 */
export class WebglShaderInput {
    /**
     * Create a new WebglShaderInput instance.
     *
     * @param {GraphicsDevice} graphicsDevice - The graphics device used to manage this shader input.
     * @param {string} name - The name of the shader input.
     * @param {number} type - The type of the shader input.
     * @param {number | WebGLUniformLocation} locationId - The location id of the shader input.
     */
    constructor(graphicsDevice: GraphicsDevice, name: string, type: number, locationId: number | WebGLUniformLocation);
    locationId: number | WebGLUniformLocation;
    scopeId: import("../scope-id.js").ScopeId;
    version: Version;
    dataType: number;
    value: any[];
    array: any[];
}
import { Version } from '../version.js';
import type { GraphicsDevice } from '../graphics-device.js';
