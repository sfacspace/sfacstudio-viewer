/**
 * @import { ShaderGenerator } from './programs/shader-generator.js'
 */
/**
 * A class responsible for creation and caching of required shaders.
 * There is a two level cache. The first level generates the shader based on the provided options.
 * The second level processes this generated shader using processing options - in most cases
 * modifies it to support uniform buffers.
 *
 * @ignore
 */
export class ProgramLibrary {
    constructor(device: any, standardMaterial: any);
    /**
     * A cache of shaders processed using processing options.
     *
     * @type {Map<string, Shader>}
     */
    processedCache: Map<string, Shader>;
    /**
     * A cache of shader definitions before processing.
     *
     * @type {Map<number, object>}
     */
    definitionsCache: Map<number, object>;
    /**
     * Named shader generators.
     *
     * @type {Map<string, ShaderGenerator>}
     */
    _generators: Map<string, ShaderGenerator>;
    _device: any;
    _isClearingCache: boolean;
    _precached: boolean;
    _programsCollection: any[];
    _defaultStdMatOption: StandardMaterialOptions;
    _defaultStdMatOptionMin: StandardMaterialOptions;
    destroy(): void;
    register(name: any, generator: any): void;
    unregister(name: any): void;
    isRegistered(name: any): boolean;
    /**
     * Returns a generated shader definition for the specified options. They key is used to cache the
     * shader definition.
     *
     * @param {ShaderGenerator} generator - The generator to use.
     * @param {string} name - The unique name of the shader generator.
     * @param {number} key - A unique key representing the shader options.
     * @param {object} options - The shader options.
     * @returns {object} - The shader definition.
     */
    generateShaderDefinition(generator: ShaderGenerator, name: string, key: number, options: object): object;
    getCachedShader(key: any): Shader;
    setCachedShader(key: any, shader: any): void;
    getProgram(name: any, options: any, processingOptions: any, userMaterialId: any): Shader;
    storeNewProgram(name: any, options: any): void;
    dumpPrograms(): void;
    clearCache(): void;
    /**
     * Remove shader from the cache. This function does not destroy it, that is the responsibility
     * of the caller.
     *
     * @param {Shader} shader - The shader to be removed.
     */
    removeFromCache(shader: Shader): void;
    _getDefaultStdMatOptions(pass: any): StandardMaterialOptions;
    precompile(cache: any): void;
}
import { Shader } from '../../platform/graphics/shader.js';
import type { ShaderGenerator } from './programs/shader-generator.js';
import { StandardMaterialOptions } from '../materials/standard-material-options.js';
