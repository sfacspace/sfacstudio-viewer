/**
 * Class responsible for management of shader passes, associated with a device.
 *
 * @ignore
 */
export class ShaderPass {
    /**
     * Get access to the shader pass instance for the specified device.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @returns { ShaderPass } The shader pass instance for the specified device.
     */
    static get(device: GraphicsDevice): ShaderPass;
    /**
     * Allocated shader passes, map of a shader pass name to info.
     *
     * @type {Map<string, ShaderPassInfo>}
     */
    passesNamed: Map<string, ShaderPassInfo>;
    /**
     * Allocated shader passes, indexed by their index.
     *
     * @type {Array<ShaderPassInfo>}
     */
    passesIndexed: Array<ShaderPassInfo>;
    /** Next available index */
    nextIndex: number;
    /**
     * Allocates a shader pass with the specified name and options.
     *
     * @param {string} name - A name of the shader pass.
     * @param {object} [options] - Options for the shader pass, which are added as properties to the
     * shader pass info.
     * @returns {ShaderPassInfo} The allocated shader pass info.
     */
    allocate(name: string, options?: object): ShaderPassInfo;
    /**
     * Return the shader pass info for the specified index.
     *
     * @param {number} index - The shader pass index.
     * @returns {ShaderPassInfo} - The shader pass info.
     */
    getByIndex(index: number): ShaderPassInfo;
    getByName(name: any): ShaderPassInfo;
}
/**
 * Info about a shader pass. Shader pass is represented by a unique index and a name, and the
 * index is used to access the shader required for the pass, from an array stored in the
 * material or mesh instance.
 *
 * @ignore
 */
export class ShaderPassInfo {
    /**
     * @param {string} name - The name, for example 'depth'. Must contain only letters, numbers,
     * and underscores, and start with a letter.
     * @param {number} index - Index from ShaderPass#nextIndex.
     * @param {object} [options] - Options for additional configuration of the shader pass.
     * @param {boolean} [options.isForward] - Whether the pass is forward.
     * @param {boolean} [options.isShadow] - Whether the pass is shadow.
     * @param {boolean} [options.lightType] - Type of light, for example `pc.LIGHTTYPE_DIRECTIONAL`.
     * @param {boolean} [options.shadowType] - Type of shadow, for example `pc.SHADOW_PCF3_32F`.
     */
    constructor(name: string, index: number, options?: {
        isForward?: boolean;
        isShadow?: boolean;
        lightType?: boolean;
        shadowType?: boolean;
    });
    /** @type {number} */
    index: number;
    /** @type {string} */
    name: string;
    /** @type {Map<string, string>} */
    defines: Map<string, string>;
    buildShaderDefines(): void;
}
import type { GraphicsDevice } from '../platform/graphics/graphics-device.js';
