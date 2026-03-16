/**
 * A class providing utility functions for textures.
 *
 * @ignore
 */
export class TextureUtils {
    /**
     * Calculate the dimension of a texture at a specific mip level.
     *
     * @param {number} dimension - Texture dimension at level 0.
     * @param {number} mipLevel - Mip level.
     * @returns {number} The dimension of the texture at the specified mip level.
     */
    static calcLevelDimension(dimension: number, mipLevel: number): number;
    /**
     * Calculate the number of mip levels for a texture with the specified dimensions.
     *
     * @param {number} width - Texture's width.
     * @param {number} height - Texture's height.
     * @param {number} [depth] - Texture's depth. Defaults to 1.
     * @returns {number} The number of mip levels required for the texture.
     */
    static calcMipLevelsCount(width: number, height: number, depth?: number): number;
    /**
     * Calculate the size in bytes of the texture level given its format and dimensions.
     *
     * @param {number} width - Texture's width.
     * @param {number} height - Texture's height.
     * @param {number} depth - Texture's depth.
     * @param {number} format - Texture's pixel format PIXELFORMAT_***.
     * @returns {number} The number of bytes of GPU memory required for the texture.
     */
    static calcLevelGpuSize(width: number, height: number, depth: number, format: number): number;
    /**
     * Calculate the GPU memory required for a texture.
     *
     * @param {number} width - Texture's width.
     * @param {number} height - Texture's height.
     * @param {number} depth - Texture's depth.
     * @param {number} format - Texture's pixel format PIXELFORMAT_***.
     * @param {boolean} mipmaps - True if the texture includes mipmaps, false otherwise.
     * @param {boolean} cubemap - True is the texture is a cubemap, false otherwise.
     * @returns {number} The number of bytes of GPU memory required for the texture.
     */
    static calcGpuSize(width: number, height: number, depth: number, format: number, mipmaps: boolean, cubemap: boolean): number;
}
