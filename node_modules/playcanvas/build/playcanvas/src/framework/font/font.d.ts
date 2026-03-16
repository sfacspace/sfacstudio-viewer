/**
 * @import { Texture } from '../../platform/graphics/texture.js'
 */
/**
 * Represents the resource of a font asset.
 *
 * @category User Interface
 */
export class Font {
    /**
     * Create a new Font instance.
     *
     * @param {Texture[]} textures - The font textures.
     * @param {object} data - The font data.
     */
    constructor(textures: Texture[], data: object);
    type: any;
    em: number;
    /**
     * The font textures.
     *
     * @type {Texture[]}
     */
    textures: Texture[];
    /**
     * The font intensity.
     *
     * @type {number}
     */
    intensity: number;
    _data: any;
    set data(value: any);
    get data(): any;
}
import type { Texture } from '../../platform/graphics/texture.js';
