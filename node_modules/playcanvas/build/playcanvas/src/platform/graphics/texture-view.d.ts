/**
 * A TextureView specifies a texture and a subset of its mip levels and array layers. It is used
 * when binding textures to compute shaders to specify which portion of the texture should be
 * accessed. Create a TextureView using {@link Texture#getView}.
 *
 * Note: TextureView is only supported on WebGPU. On WebGL, the full texture is always bound and
 * this class has no effect.
 *
 * @category Graphics
 */
export class TextureView {
    /**
     * Create a new TextureView instance. Use {@link Texture#getView} instead of calling this
     * constructor directly.
     *
     * @param {Texture} texture - The texture this view references.
     * @param {number} [baseMipLevel] - The first mip level accessible to the view. Defaults to 0.
     * @param {number} [mipLevelCount] - The number of mip levels accessible to the view. Defaults
     * to 1.
     * @param {number} [baseArrayLayer] - The first array layer accessible to the view. Defaults to
     * 0.
     * @param {number} [arrayLayerCount] - The number of array layers accessible to the view.
     * Defaults to 1.
     * @ignore
     */
    constructor(texture: Texture, baseMipLevel?: number, mipLevelCount?: number, baseArrayLayer?: number, arrayLayerCount?: number);
    /**
     * The texture this view references.
     *
     * @type {Texture}
     * @readonly
     */
    readonly texture: Texture;
    /**
     * The first mip level accessible to the view.
     *
     * @type {number}
     * @readonly
     */
    readonly baseMipLevel: number;
    /**
     * The number of mip levels accessible to the view.
     *
     * @type {number}
     * @readonly
     */
    readonly mipLevelCount: number;
    /**
     * The first array layer accessible to the view.
     *
     * @type {number}
     * @readonly
     */
    readonly baseArrayLayer: number;
    /**
     * The number of array layers accessible to the view.
     *
     * @type {number}
     * @readonly
     */
    readonly arrayLayerCount: number;
    /**
     * A unique numeric key for this view configuration, used for caching.
     *
     * @type {number}
     * @ignore
     */
    key: number;
}
import type { Texture } from './texture.js';
