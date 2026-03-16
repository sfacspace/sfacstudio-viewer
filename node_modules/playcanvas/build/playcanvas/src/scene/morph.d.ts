/**
 * @import { GraphicsDevice } from '../platform/graphics/graphics-device.js'
 * @import { MorphTarget } from './morph-target.js'
 */
/**
 * Contains a list of {@link MorphTarget}s, a combined delta AABB and some associated data.
 *
 * @category Graphics
 */
export class Morph extends RefCountedObject {
    /**
     * Create a new Morph instance.
     *
     * @param {MorphTarget[]} targets - A list of morph targets.
     * @param {GraphicsDevice} graphicsDevice - The graphics device used to manage this morph target.
     * @param {object} [options] - Object for passing optional arguments.
     * @param {boolean} [options.preferHighPrecision] - True if high precision storage should be
     * preferred. This is faster to create and allows higher precision, but takes more memory and
     * might be slower to render. Defaults to false.
     */
    constructor(targets: MorphTarget[], graphicsDevice: GraphicsDevice, { preferHighPrecision }?: {
        preferHighPrecision?: boolean;
    });
    /**
     * @type {BoundingBox}
     * @private
     */
    private _aabb;
    /** @type {boolean} */
    preferHighPrecision: boolean;
    device: GraphicsDevice;
    _targets: MorphTarget[];
    _renderTextureFormat: number;
    intRenderFormat: boolean;
    _textureFormat: number;
    /**
     * Frees video memory allocated by this object.
     */
    destroy(): void;
    vertexBufferIds: VertexBuffer;
    targetsTexturePositions: Texture;
    targetsTextureNormals: Texture;
    get aabb(): BoundingBox;
    get morphPositions(): boolean;
    get morphNormals(): boolean;
    _init(): void;
    _findSparseSet(deltaArrays: any, ids: any, usedDataIndices: any): number;
    _initTextureBased(): boolean;
    morphTextureWidth: number;
    morphTextureHeight: number;
    /**
     * Gets the array of morph targets.
     *
     * @type {MorphTarget[]}
     */
    get targets(): MorphTarget[];
    _updateMorphFlags(): void;
    _morphPositions: boolean;
    _morphNormals: boolean;
    /**
     * Creates a texture / texture array. Used to create both source morph target data, as well as
     * render target used to morph these into, positions and normals.
     *
     * @param {string} name - The name of the texture.
     * @param {number} format - The format of the texture.
     * @param {Array} [levels] - The levels of the texture.
     * @param {number} [arrayLength] - The length of the texture array.
     * @returns {Texture} The created texture.
     * @private
     */
    private _createTexture;
}
import { RefCountedObject } from '../core/ref-counted-object.js';
import type { GraphicsDevice } from '../platform/graphics/graphics-device.js';
import type { MorphTarget } from './morph-target.js';
import { VertexBuffer } from '../platform/graphics/vertex-buffer.js';
import { Texture } from '../platform/graphics/texture.js';
import { BoundingBox } from '../core/shape/bounding-box.js';
