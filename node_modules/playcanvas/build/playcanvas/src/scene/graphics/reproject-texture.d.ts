/**
 * This function reprojects textures between cubemap, equirectangular and octahedral formats. The
 * function can read and write textures with pixel data in RGBE, RGBM, linear and sRGB formats.
 * When specularPower is specified it will perform a phong-weighted convolution of the source (for
 * generating a gloss maps).
 *
 * @param {Texture} source - The source texture.
 * @param {Texture} target - The target texture.
 * @param {object} [options] - The options object.
 * @param {number} [options.specularPower] - Optional specular power. When specular power is
 * specified, the source is convolved by a phong-weighted kernel raised to the specified power.
 * Otherwise the function performs a standard resample.
 * @param {number} [options.numSamples] - Optional number of samples (default is 1024).
 * @param {number} [options.face] - Optional cubemap face to update (default is update all faces).
 * @param {string} [options.distribution] - Specify convolution distribution - 'none', 'lambert',
 * 'phong', 'ggx'. Default depends on specularPower.
 * @param {Vec4} [options.rect] - Optional viewport rectangle.
 * @param {number} [options.seamPixels] - Optional number of seam pixels to render
 * @returns {boolean} True if the reprojection was applied and false otherwise (e.g. if rect is empty)
 * @category Graphics
 */
export function reprojectTexture(source: Texture, target: Texture, options?: {
    specularPower?: number;
    numSamples?: number;
    face?: number;
    distribution?: string;
    rect?: Vec4;
    seamPixels?: number;
}): boolean;
import { Texture } from '../../platform/graphics/texture.js';
import type { Vec4 } from '../../core/math/vec4.js';
