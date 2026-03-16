/**
 * A class storing description of an individual uniform, stored inside a uniform buffer.
 *
 * @category Graphics
 */
export class UniformFormat {
    /**
     * Create a new UniformFormat instance.
     *
     * @param {string} name - The name of the uniform.
     * @param {number} type - The type of the uniform. One of the UNIFORMTYPE_*** constants.
     * @param {number} count - The number of elements in the array. Defaults to 0, which represents
     * a single element (not an array).
     */
    constructor(name: string, type: number, count?: number);
    /**
     * @type {string}
     * @ignore
     */
    name: string;
    /**
     * @type {number}
     * @ignore
     */
    type: number;
    /**
     * @type {number}
     * @ignore
     */
    byteSize: number;
    /**
     * Index of the uniform in an array of 32bit values (Float32Array and similar)
     *
     * @type {number}
     * @ignore
     */
    offset: number;
    /**
     * @type {ScopeId}
     * @ignore
     */
    scopeId: ScopeId;
    /**
     * Count of elements for arrays, otherwise 0.
     *
     * @type {number}
     * @ignore
     */
    count: number;
    /**
     * Number of components in each element (e.g. vec2 has 2 components, mat4 has 16 components)
     *
     * @type {number}
     * @ignore
     */
    numComponents: number;
    /**
     * True if this is an array of elements (i.e. count > 0)
     *
     * @type {boolean}
     */
    get isArrayType(): boolean;
    shortName: string;
    updateType: number;
    invalid: boolean;
    calculateOffset(offset: any): void;
}
/**
 * A descriptor that defines the layout of of data inside the uniform buffer.
 *
 * @category Graphics
 */
export class UniformBufferFormat {
    /**
     * Create a new UniformBufferFormat instance.
     *
     * @param {GraphicsDevice} graphicsDevice - The graphics device.
     * @param {UniformFormat[]} uniforms - An array of uniforms to be stored in the buffer
     */
    constructor(graphicsDevice: GraphicsDevice, uniforms: UniformFormat[]);
    /**
     * @type {number}
     * @ignore
     */
    byteSize: number;
    /**
     * @type {Map<string,UniformFormat>}
     * @ignore
     */
    map: Map<string, UniformFormat>;
    scope: import("./scope-space.js").ScopeSpace;
    /** @type {UniformFormat[]} */
    uniforms: UniformFormat[];
    /**
     * Returns format of a uniform with specified name. Returns undefined if the uniform is not found.
     *
     * @param {string} name - The name of the uniform.
     * @returns {UniformFormat|undefined} - The format of the uniform.
     */
    get(name: string): UniformFormat | undefined;
}
import type { ScopeId } from './scope-id.js';
import type { GraphicsDevice } from './graphics-device.js';
