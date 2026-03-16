/**
 * A Sprite contains references to one or more frames of a {@link TextureAtlas}. It can be used by
 * the {@link SpriteComponent} or the {@link ElementComponent} to render a single frame or a sprite
 * animation.
 *
 * @category Graphics
 */
export class Sprite extends EventHandler {
    /**
     * Create a new Sprite instance.
     *
     * @param {GraphicsDevice} device - The graphics device of the application.
     * @param {object} [options] - Options for creating the Sprite.
     * @param {number} [options.pixelsPerUnit] - The number of pixels that map to one PlayCanvas
     * unit. Defaults to 1.
     * @param {number} [options.renderMode] - The rendering mode of the sprite. Can be:
     *
     * - {@link SPRITE_RENDERMODE_SIMPLE}
     * - {@link SPRITE_RENDERMODE_SLICED}
     * - {@link SPRITE_RENDERMODE_TILED}
     *
     * Defaults to {@link SPRITE_RENDERMODE_SIMPLE}.
     * @param {TextureAtlas} [options.atlas] - The texture atlas. Defaults to null.
     * @param {string[]} [options.frameKeys] - The keys of the frames in the sprite atlas that this
     * sprite is using. Defaults to null.
     */
    constructor(device: GraphicsDevice, options?: {
        pixelsPerUnit?: number;
        renderMode?: number;
        atlas?: TextureAtlas;
        frameKeys?: string[];
    });
    _device: GraphicsDevice;
    _pixelsPerUnit: number;
    _renderMode: number;
    _atlas: TextureAtlas;
    _frameKeys: string[];
    _meshes: any[];
    _updatingProperties: boolean;
    _meshesDirty: boolean;
    /**
     * Sets the keys of the frames in the sprite atlas that this sprite is using.
     *
     * @type {string[]}
     */
    set frameKeys(value: string[]);
    /**
     * Gets the keys of the frames in the sprite atlas that this sprite is using.
     *
     * @type {string[]}
     */
    get frameKeys(): string[];
    /**
     * Sets the texture atlas.
     *
     * @type {TextureAtlas}
     */
    set atlas(value: TextureAtlas);
    /**
     * Gets the texture atlas.
     *
     * @type {TextureAtlas}
     */
    get atlas(): TextureAtlas;
    /**
     * Sets the number of pixels that map to one PlayCanvas unit.
     *
     * @type {number}
     */
    set pixelsPerUnit(value: number);
    /**
     * Gets the number of pixels that map to one PlayCanvas unit.
     *
     * @type {number}
     */
    get pixelsPerUnit(): number;
    /**
     * Sets the rendering mode of the sprite. Can be:
     *
     * - {@link SPRITE_RENDERMODE_SIMPLE}
     * - {@link SPRITE_RENDERMODE_SLICED}
     * - {@link SPRITE_RENDERMODE_TILED}
     *
     * @type {number}
     */
    set renderMode(value: number);
    /**
     * Sets the rendering mode of the sprite.
     *
     * @type {number}
     */
    get renderMode(): number;
    /**
     * An array that contains a mesh for each frame.
     *
     * @type {Mesh[]}
     */
    get meshes(): Mesh[];
    _createMeshes(): void;
    _createSimpleMesh(frame: any): Mesh;
    _create9SliceMesh(): Mesh;
    _onSetFrames(frames: any): void;
    _onFrameChanged(frameKey: any, frame: any): void;
    _onFrameRemoved(frameKey: any): void;
    startUpdate(): void;
    endUpdate(): void;
    /**
     * Free up the meshes created by the sprite.
     */
    destroy(): void;
}
import { EventHandler } from '../core/event-handler.js';
import type { GraphicsDevice } from '../platform/graphics/graphics-device.js';
import type { TextureAtlas } from './texture-atlas.js';
import { Mesh } from './mesh.js';
