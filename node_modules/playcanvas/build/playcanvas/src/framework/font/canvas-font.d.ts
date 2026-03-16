/**
 * Represents the resource of a canvas font asset.
 *
 * @ignore
 */
export class CanvasFont extends EventHandler {
    /**
     * Create a new CanvasFont instance.
     *
     * @param {AppBase} app - The application.
     * @param {object} options - The font options.
     * @param {string} [options.fontName] - The name of the font. CSS font names are supported.
     * Defaults to 'Arial'.
     * @param {string} [options.fontWeight] - The weight of the font, e.g. 'normal', 'bold'.
     * Defaults to 'normal'.
     * @param {number} [options.fontSize] - The font size in pixels. Defaults to 32.
     * @param {Color} [options.color] - The font color.Defaults to white.
     * @param {number} [options.width] - The width of each texture atlas. Defaults to 512.
     * @param {number} [options.height] - The height of each texture atlas. Defaults to 512.
     * @param {number} [options.padding] - Amount of glyph padding in pixels that is added to each
     * glyph in the atlas. Defaults to 0.
     */
    constructor(app: AppBase, options?: {
        fontName?: string;
        fontWeight?: string;
        fontSize?: number;
        color?: Color;
        width?: number;
        height?: number;
        padding?: number;
    });
    type: string;
    app: AppBase;
    intensity: number;
    fontWeight: string;
    fontSize: number;
    glyphSize: number;
    fontName: string;
    color: Color;
    padding: number;
    width: number;
    height: number;
    atlases: any[];
    chars: string;
    data: {};
    /**
     * Render the necessary textures for all characters in a string to be used for the canvas font.
     *
     * @param {string} text - The list of characters to render into the texture atlas.
     */
    createTextures(text: string): void;
    /**
     * Update the list of characters to include in the atlas to include those provided and
     * re-render the texture atlas to include all the characters that have been supplied so far.
     *
     * @param {string} text - The list of characters to add to the texture atlas.
     */
    updateTextures(text: string): void;
    /**
     * Destroys the font. This also destroys the textures owned by the font.
     */
    destroy(): void;
    /**
     * @param {Color} color - The color to covert.
     * @param {boolean} alpha - Whether to include the alpha channel.
     * @returns {string} The hex string for the color.
     * @private
     */
    private _colorToRgbString;
    /**
     * @param {CanvasRenderingContext2D} context - The canvas 2D context.
     * @param {string} char - The character to render.
     * @param {number} x - The x position to render the character at.
     * @param {number} y - The y position to render the character at.
     * @param {string} color - The color to render the character in.
     * @ignore
     */
    renderCharacter(context: CanvasRenderingContext2D, char: string, x: number, y: number, color: string): void;
    /**
     * Return the atlas at the specified index.
     *
     * @param {number} index - The atlas index
     * @private
     */
    private _getAtlas;
    /**
     * Renders an array of characters into one or more textures atlases.
     *
     * @param {string[]} charsArray - The list of characters to render.
     * @private
     */
    private _renderAtlas;
    /**
     * @param {string[]} chars - A list of characters.
     * @param {string} fontName - The font name.
     * @param {number} width - The width of the texture atlas.
     * @param {number} height - The height of the texture atlas.
     * @returns {object} The font JSON object.
     * @private
     */
    private _createJson;
    /**
     * @param {object} json - Font data.
     * @param {string} char - The character to add.
     * @param {number} charCode - The code point number of the character to add.
     * @param {number} x - The x position of the character.
     * @param {number} y - The y position of the character.
     * @param {number} w - The width of the character.
     * @param {number} h - The height of the character.
     * @param {number} xoffset - The x offset of the character.
     * @param {number} yoffset - The y offset of the character.
     * @param {number} xadvance - The x advance of the character.
     * @param {number} mapNum - The map number of the character.
     * @param {number} mapW - The width of the map.
     * @param {number} mapH - The height of the map.
     * @private
     */
    private _addChar;
    /**
     * Take a unicode string and produce the set of characters used to create that string.
     * e.g. "abcabcabc" -> ['a', 'b', 'c']
     *
     * @param {string} text - The unicode string to process.
     * @returns {string[]} The set of characters used to create the string.
     * @private
     */
    private _normalizeCharsSet;
    /**
     * Calculate some metrics that aren't available via the browser API, notably character height
     * and descent size.
     *
     * @param {string} text - The text to measure.
     * @returns {{ascent: number, descent: number, height: number}} The metrics of the text.
     * @private
     */
    private _getTextMetrics;
    get textures(): any[];
}
import { EventHandler } from '../../core/event-handler.js';
import type { AppBase } from '../app-base.js';
import { Color } from '../../core/math/color.js';
