/**
 * A class to describe the format of the uniform buffer for {@link BindGroupFormat}.
 *
 * @category Graphics
 */
export class BindUniformBufferFormat extends BindBaseFormat {
}
/**
 * A class to describe the format of the texture for {@link BindGroupFormat}.
 *
 * @category Graphics
 */
export class BindTextureFormat extends BindBaseFormat {
    /**
     * Create a new instance.
     *
     * @param {string} name - The name of the storage buffer.
     * @param {number} visibility - A bit-flag that specifies the shader stages in which the storage
     * buffer is visible. Can be:
     *
     * - {@link SHADERSTAGE_VERTEX}
     * - {@link SHADERSTAGE_FRAGMENT}
     * - {@link SHADERSTAGE_COMPUTE}
     *
     * @param {string} [textureDimension] - The dimension of the texture. Defaults to
     * {@link TEXTUREDIMENSION_2D}. Can be:
     *
     * - {@link TEXTUREDIMENSION_1D}
     * - {@link TEXTUREDIMENSION_2D}
     * - {@link TEXTUREDIMENSION_2D_ARRAY}
     * - {@link TEXTUREDIMENSION_CUBE}
     * - {@link TEXTUREDIMENSION_CUBE_ARRAY}
     * - {@link TEXTUREDIMENSION_3D}
     *
     * @param {number} [sampleType] - The type of the texture samples. Defaults to
     * {@link SAMPLETYPE_FLOAT}. Can be:
     *
     * - {@link SAMPLETYPE_FLOAT}
     * - {@link SAMPLETYPE_UNFILTERABLE_FLOAT}
     * - {@link SAMPLETYPE_DEPTH}
     * - {@link SAMPLETYPE_INT}
     * - {@link SAMPLETYPE_UINT}
     *
     * @param {boolean} [hasSampler] - True if the sampler for the texture is needed. Note that if the
     * sampler is used, it will take up an additional slot, directly following the texture slot.
     * Defaults to true.
     * @param {string|null} [samplerName] - Optional name of the sampler. Defaults to null.
     */
    constructor(name: string, visibility: number, textureDimension?: string, sampleType?: number, hasSampler?: boolean, samplerName?: string | null);
    textureDimension: string;
    sampleType: number;
    hasSampler: boolean;
    samplerName: string;
}
/**
 * BindGroupFormat is a data structure that defines the layout of resources (buffers, textures,
 * samplers) used by rendering or compute shaders. It describes the binding points for each
 * resource type, and the visibility of these resources in the shader stages.
 * Currently this class is only used on WebGPU platform to specify the input and output resources
 * for vertex, fragment and compute shaders written in {@link SHADERLANGUAGE_WGSL} language.
 *
 * @category Graphics
 */
export class BindGroupFormat {
    /**
     * Create a new instance.
     *
     * @param {GraphicsDevice} graphicsDevice - The graphics device used to manage this vertex format.
     * @param {(BindTextureFormat|BindStorageTextureFormat|BindUniformBufferFormat|BindStorageBufferFormat)[]} formats -
     * An array of bind formats. Note that each entry in the array uses up one slot. The exception
     * is a texture format that has a sampler, which uses up two slots. The slots are allocated
     * sequentially, starting from 0.
     */
    constructor(graphicsDevice: GraphicsDevice, formats: (BindTextureFormat | BindStorageTextureFormat | BindUniformBufferFormat | BindStorageBufferFormat)[]);
    /**
     * @type {BindUniformBufferFormat[]}
     * @private
     */
    private uniformBufferFormats;
    /**
     * @type {BindTextureFormat[]}
     * @private
     */
    private textureFormats;
    /**
     * @type {BindStorageTextureFormat[]}
     * @private
     */
    private storageTextureFormats;
    /**
     * @type {BindStorageBufferFormat[]}
     * @private
     */
    private storageBufferFormats;
    id: number;
    /** @type {GraphicsDevice} */
    device: GraphicsDevice;
    /** @type {Map<string, number>} */
    bufferFormatsMap: Map<string, number>;
    /** @type {Map<string, number>} */
    textureFormatsMap: Map<string, number>;
    /** @type {Map<string, number>} */
    storageTextureFormatsMap: Map<string, number>;
    /** @type {Map<string, number>} */
    storageBufferFormatsMap: Map<string, number>;
    impl: any;
    /**
     * Frees resources associated with this bind group.
     */
    destroy(): void;
    /**
     * Returns format of texture with specified name.
     *
     * @param {string} name - The name of the texture slot.
     * @returns {BindTextureFormat|null} - The format.
     * @ignore
     */
    getTexture(name: string): BindTextureFormat | null;
    /**
     * Returns format of storage texture with specified name.
     *
     * @param {string} name - The name of the texture slot.
     * @returns {BindStorageTextureFormat|null} - The format.
     * @ignore
     */
    getStorageTexture(name: string): BindStorageTextureFormat | null;
    loseContext(): void;
}
/**
 * A class to describe the format of the storage texture for {@link BindGroupFormat}. Storage
 * texture is a texture created with the storage flag set to true, which allows it to be used as an
 * output of a compute shader.
 *
 * Note: At the current time, storage textures are only supported in compute shaders in a
 * write-only mode.
 *
 * @category Graphics
 */
export class BindStorageTextureFormat extends BindBaseFormat {
    /**
     * Create a new instance.
     *
     * @param {string} name - The name of the storage buffer.
     * @param {number} [format] - The pixel format of the texture. Note that not all formats can be
     * used. Defaults to {@link PIXELFORMAT_RGBA8}.
     * @param {string} [textureDimension] - The dimension of the texture. Defaults to
     * {@link TEXTUREDIMENSION_2D}. Can be:
     *
     * - {@link TEXTUREDIMENSION_1D}
     * - {@link TEXTUREDIMENSION_2D}
     * - {@link TEXTUREDIMENSION_2D_ARRAY}
     * - {@link TEXTUREDIMENSION_3D}
     *
     * @param {boolean} [write] - Whether the storage texture is writeable. Defaults to true.
     * @param {boolean} [read] - Whether the storage texture is readable. Defaults to false. Note
     * that storage texture reads are only supported if
     * {@link GraphicsDevice#supportsStorageTextureRead} is true. Also note that only a subset of
     * pixel formats can be used for storage texture reads - as an example, PIXELFORMAT_RGBA8 is not
     * compatible, but PIXELFORMAT_R32U is.
     */
    constructor(name: string, format?: number, textureDimension?: string, write?: boolean, read?: boolean);
    format: number;
    textureDimension: string;
    write: boolean;
    read: boolean;
}
/**
 * A class to describe the format of the storage buffer for {@link BindGroupFormat}.
 *
 * @category Graphics
 */
export class BindStorageBufferFormat extends BindBaseFormat {
    /**
     * Create a new instance.
     *
     * @param {string} name - The name of the storage buffer.
     * @param {number} visibility - A bit-flag that specifies the shader stages in which the storage
     * buffer is visible. Can be:
     *
     * - {@link SHADERSTAGE_VERTEX}
     * - {@link SHADERSTAGE_FRAGMENT}
     * - {@link SHADERSTAGE_COMPUTE}
     *
     * @param {boolean} [readOnly] - Whether the storage buffer is read-only, or read-write. Defaults
     * to false. This has to be true for the storage buffer used in the vertex shader.
     */
    constructor(name: string, visibility: number, readOnly?: boolean);
    /**
     * Format, extracted from vertex and fragment shader.
     *
     * @type {string}
     * @ignore
     */
    format: string;
    readOnly: boolean;
}
/**
 * A base class to describe the format of the resource for {@link BindGroupFormat}.
 *
 * @category Graphics
 */
declare class BindBaseFormat {
    /**
     * Create a new instance.
     *
     * @param {string} name - The name of the resource.
     * @param {number} visibility - A bit-flag that specifies the shader stages in which the resource
     * is visible. Can be:
     *
     * - {@link SHADERSTAGE_VERTEX}
     * - {@link SHADERSTAGE_FRAGMENT}
     * - {@link SHADERSTAGE_COMPUTE}
     */
    constructor(name: string, visibility: number);
    /**
     * @type {number}
     * @ignore
     */
    slot: number;
    /**
     * @type {ScopeId|null}
     * @ignore
     */
    scopeId: ScopeId | null;
    /** @type {string} */
    name: string;
    visibility: number;
}
import type { GraphicsDevice } from './graphics-device.js';
import type { ScopeId } from './scope-id.js';
export {};
