/**
 * @import { Texture } from '../platform/graphics/texture.js'
 * @import { Vec2 } from '../core/math/vec2.js'
 * @import { Vec4 } from '../core/math/vec4.js'
 */
/**
 * A TextureAtlas contains a number of frames from a texture. Each frame defines a region in a
 * texture. The TextureAtlas is referenced by {@link Sprite}s.
 *
 * @category Graphics
 */
export class TextureAtlas extends EventHandler {
    /**
     * @type {Texture}
     * @private
     */
    private _texture;
    /**
     * @type {object}
     * @private
     */
    private _frames;
    /**
     * Sets the texture used by the atlas.
     *
     * @type {Texture}
     */
    set texture(value: Texture);
    /**
     * Gets the texture used by the atlas.
     *
     * @type {Texture}
     */
    get texture(): Texture;
    /**
     * Sets the frames which define portions of the texture atlas.
     *
     * @type {object}
     */
    set frames(value: object);
    /**
     * Gets the frames which define portions of the texture atlas.
     *
     * @type {object}
     */
    get frames(): object;
    /**
     * Set a new frame in the texture atlas.
     *
     * @param {string} key - The key of the frame.
     * @param {object} data - The properties of the frame.
     * @param {Vec4} data.rect - The u, v, width, height properties of the frame in pixels.
     * @param {Vec2} data.pivot - The pivot of the frame - values are between 0-1.
     * @param {Vec4} data.border - The border of the frame for 9-slicing. Values are ordered as
     * follows: left, bottom, right, top border in pixels.
     * @example
     * atlas.setFrame('1', {
     *     rect: new pc.Vec4(0, 0, 128, 128),
     *     pivot: new pc.Vec2(0.5, 0.5),
     *     border: new pc.Vec4(5, 5, 5, 5)
     * });
     */
    setFrame(key: string, data: {
        rect: Vec4;
        pivot: Vec2;
        border: Vec4;
    }): void;
    /**
     * Removes a frame from the texture atlas.
     *
     * @param {string} key - The key of the frame.
     * @example
     * atlas.removeFrame('1');
     */
    removeFrame(key: string): void;
    /**
     * Free up the underlying texture owned by the atlas.
     */
    destroy(): void;
}
import { EventHandler } from '../core/event-handler.js';
import type { Texture } from '../platform/graphics/texture.js';
import type { Vec4 } from '../core/math/vec4.js';
import type { Vec2 } from '../core/math/vec2.js';
