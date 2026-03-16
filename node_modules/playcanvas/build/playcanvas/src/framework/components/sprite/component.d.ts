/**
 * Enables an Entity to render a simple static sprite or sprite animations.
 *
 * @hideconstructor
 * @category Graphics
 */
export class SpriteComponent extends Component {
    /**
     * Fired when an animation clip starts playing. The handler is passed the
     * {@link SpriteAnimationClip} that started playing.
     *
     * @event
     * @example
     * entity.sprite.on('play', (clip) => {
     *     console.log(`Animation clip ${clip.name} started playing.`);
     * });
     */
    static EVENT_PLAY: string;
    /**
     * Fired when an animation clip is paused. The handler is passed the
     * {@link SpriteAnimationClip} that was paused.
     *
     * @event
     * @example
     * entity.sprite.on('pause', (clip) => {
     *     console.log(`Animation clip ${clip.name} paused.`);
     * });
     */
    static EVENT_PAUSE: string;
    /**
     * Fired when an animation clip is resumed. The handler is passed the
     * {@link SpriteAnimationClip} that was resumed.
     *
     * @event
     * @example
     * entity.sprite.on('resume', (clip) => {
     *     console.log(`Animation clip ${clip.name} resumed.`);
     * });
     */
    static EVENT_RESUME: string;
    /**
     * Fired when an animation clip is stopped. The handler is passed the
     * {@link SpriteAnimationClip} that was stopped.
     *
     * @event
     * @example
     * entity.sprite.on('stop', (clip) => {
     *     console.log(`Animation clip ${clip.name} stopped.`);
     * });
     */
    static EVENT_STOP: string;
    /**
     * Fired when an animation clip stops playing because it reached its end. The handler is passed
     * the {@link SpriteAnimationClip} that ended.
     *
     * @event
     * @example
     * entity.sprite.on('end', (clip) => {
     *     console.log(`Animation clip ${clip.name} ended.`);
     * });
     */
    static EVENT_END: string;
    /**
     * Fired when an animation clip reached the end of its current loop. The handler is passed the
     * {@link SpriteAnimationClip} that looped.
     *
     * @event
     * @example
     * entity.sprite.on('loop', (clip) => {
     *     console.log(`Animation clip ${clip.name} looped.`);
     * });
     */
    static EVENT_LOOP: string;
    /**
     * Create a new SpriteComponent instance.
     *
     * @param {SpriteComponentSystem} system - The ComponentSystem that
     * created this Component.
     * @param {Entity} entity - The Entity that this Component is
     * attached to.
     */
    constructor(system: SpriteComponentSystem, entity: Entity);
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtLayersChanged;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtLayerAdded;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtLayerRemoved;
    _type: string;
    _material: any;
    _color: Color;
    _colorUniform: Float32Array<ArrayBuffer>;
    _speed: number;
    _flipX: boolean;
    _flipY: boolean;
    _width: number;
    _height: number;
    _drawOrder: number;
    _layers: number[];
    _outerScale: Vec2;
    _outerScaleUniform: Float32Array<ArrayBuffer>;
    _innerOffset: Vec4;
    _innerOffsetUniform: Float32Array<ArrayBuffer>;
    _atlasRect: Vec4;
    _atlasRectUniform: Float32Array<ArrayBuffer>;
    _batchGroupId: number;
    _batchGroup: any;
    _node: GraphNode;
    _model: Model;
    _meshInstance: MeshInstance;
    _updateAabbFunc: any;
    _addedModel: boolean;
    _autoPlayClip: string;
    /**
     * Dictionary of sprite animation clips.
     *
     * @type {Object<string, SpriteAnimationClip>}
     * @private
     */
    private _clips;
    _defaultClip: SpriteAnimationClip;
    /**
     * The sprite animation clip currently playing.
     *
     * @type {SpriteAnimationClip}
     * @private
     */
    private _currentClip;
    /**
     * Sets the type of the SpriteComponent. Can be:
     *
     * - {@link SPRITETYPE_SIMPLE}: The component renders a single frame from a sprite asset.
     * - {@link SPRITETYPE_ANIMATED}: The component can play sprite animation clips.
     *
     * Defaults to {@link SPRITETYPE_SIMPLE}.
     *
     * @type {string}
     */
    set type(value: string);
    /**
     * Gets the type of the SpriteComponent.
     *
     * @type {string}
     */
    get type(): string;
    /**
     * Sets which frame from the current sprite asset to render.
     *
     * @type {number}
     */
    set frame(value: number);
    /**
     * Gets which frame from the current sprite asset to render.
     *
     * @type {number}
     */
    get frame(): number;
    /**
     * Sets the asset id or the {@link Asset} of the sprite to render. Only works for
     * {@link SPRITETYPE_SIMPLE} sprites.
     *
     * @type {number|Asset}
     */
    set spriteAsset(value: number | Asset);
    /**
     * Gets the asset id or the {@link Asset} of the sprite to render.
     *
     * @type {number|Asset}
     */
    get spriteAsset(): number | Asset;
    /**
     * Sets the current sprite.
     *
     * @type {Sprite}
     */
    set sprite(value: Sprite);
    /**
     * Gets the current sprite.
     *
     * @type {Sprite}
     */
    get sprite(): Sprite;
    set material(value: any);
    get material(): any;
    /**
     * Sets the color tint of the sprite.
     *
     * @type {Color}
     */
    set color(value: Color);
    /**
     * Gets the color tint of the sprite.
     *
     * @type {Color}
     */
    get color(): Color;
    /**
     * Sets the opacity of the sprite.
     *
     * @type {number}
     */
    set opacity(value: number);
    /**
     * Gets the opacity of the sprite.
     *
     * @type {number}
     */
    get opacity(): number;
    /**
     * Sets the dictionary that contains {@link SpriteAnimationClip}s.
     *
     * @type {Object<string, SpriteAnimationClip>}
     */
    set clips(value: {
        [x: string]: SpriteAnimationClip;
    });
    /**
     * Gets the dictionary that contains {@link SpriteAnimationClip}s.
     *
     * @type {Object<string, SpriteAnimationClip>}
     */
    get clips(): {
        [x: string]: SpriteAnimationClip;
    };
    /**
     * Gets the current clip being played.
     *
     * @type {SpriteAnimationClip}
     */
    get currentClip(): SpriteAnimationClip;
    /**
     * Sets the global speed modifier used when playing sprite animation clips.
     *
     * @type {number}
     */
    set speed(value: number);
    /**
     * Gets the global speed modifier used when playing sprite animation clips.
     *
     * @type {number}
     */
    get speed(): number;
    /**
     * Sets whether to flip the X axis when rendering a sprite.
     *
     * @type {boolean}
     */
    set flipX(value: boolean);
    /**
     * Gets whether to flip the X axis when rendering a sprite.
     *
     * @type {boolean}
     */
    get flipX(): boolean;
    /**
     * Sets whether to flip the Y axis when rendering a sprite.
     *
     * @type {boolean}
     */
    set flipY(value: boolean);
    /**
     * Gets whether to flip the Y axis when rendering a sprite.
     *
     * @type {boolean}
     */
    get flipY(): boolean;
    /**
     * Sets the width of the sprite when rendering using 9-Slicing. The width and height are only
     * used when the render mode of the sprite asset is Sliced or Tiled.
     *
     * @type {number}
     */
    set width(value: number);
    /**
     * Gets the width of the sprite when rendering using 9-Slicing.
     *
     * @type {number}
     */
    get width(): number;
    /**
     * Sets the height of the sprite when rendering using 9-Slicing. The width and height are only
     * used when the render mode of the sprite asset is Sliced or Tiled.
     *
     * @type {number}
     */
    set height(value: number);
    /**
     * Gets the height of the sprite when rendering using 9-Slicing.
     *
     * @type {number}
     */
    get height(): number;
    /**
     * Sets the batch group for the sprite (see {@link BatchGroup}). Default is -1 (no group).
     *
     * @type {number}
     */
    set batchGroupId(value: number);
    /**
     * Gets the batch group for the sprite.
     *
     * @type {number}
     */
    get batchGroupId(): number;
    /**
     * Sets the name of the clip to play automatically when the component is enabled.
     *
     * @type {string}
     */
    set autoPlayClip(value: string);
    /**
     * Gets the name of the clip to play automatically when the component is enabled.
     *
     * @type {string}
     */
    get autoPlayClip(): string;
    /**
     * Sets the draw order of the component. A higher value means that the component will be
     * rendered on top of other components in the same layer. This is not used unless the layer's
     * sort order is set to {@link SORTMODE_MANUAL}.
     *
     * @type {number}
     */
    set drawOrder(value: number);
    /**
     * Gets the draw order of the component.
     *
     * @type {number}
     */
    get drawOrder(): number;
    /**
     * Sets the array of layer IDs ({@link Layer#id}) to which this sprite should belong.
     *
     * @type {number[]}
     */
    set layers(value: number[]);
    /**
     * Gets the array of layer IDs ({@link Layer#id}) to which this sprite belongs.
     *
     * @type {number[]}
     */
    get layers(): number[];
    get aabb(): import("../../../index.js").BoundingBox;
    onDestroy(): void;
    _showModel(): void;
    _hideModel(): void;
    _showFrame(frame: any): void;
    _updateTransform(): void;
    _updateAabb(aabb: any): any;
    _tryAutoPlay(): void;
    _onLayersChanged(oldComp: any, newComp: any): void;
    _onLayerAdded(layer: any): void;
    _onLayerRemoved(layer: any): void;
    removeModelFromLayers(): void;
    /**
     * Creates and adds a new {@link SpriteAnimationClip} to the component's clips.
     *
     * @param {object} data - Data for the new animation clip.
     * @param {string} [data.name] - The name of the new animation clip.
     * @param {number} [data.fps] - Frames per second for the animation clip.
     * @param {boolean} [data.loop] - Whether to loop the animation clip.
     * @param {number|Asset} [data.spriteAsset] - The asset id or
     * the {@link Asset} of the sprite that this clip will play.
     * @returns {SpriteAnimationClip} The new clip that was added.
     */
    addClip(data: {
        name?: string;
        fps?: number;
        loop?: boolean;
        spriteAsset?: number | Asset;
    }): SpriteAnimationClip;
    /**
     * Removes a clip by name.
     *
     * @param {string} name - The name of the animation clip to remove.
     */
    removeClip(name: string): void;
    /**
     * Get an animation clip by name.
     *
     * @param {string} name - The name of the clip.
     * @returns {SpriteAnimationClip} The clip.
     */
    clip(name: string): SpriteAnimationClip;
    /**
     * Plays a sprite animation clip by name. If the animation clip is already playing then this
     * will do nothing.
     *
     * @param {string} name - The name of the clip to play.
     * @returns {SpriteAnimationClip} The clip that started playing.
     */
    play(name: string): SpriteAnimationClip;
    /**
     * Pauses the current animation clip.
     */
    pause(): void;
    /**
     * Resumes the current paused animation clip.
     */
    resume(): void;
    /**
     * Stops the current animation clip and resets it to the first frame.
     */
    stop(): void;
}
import { Component } from '../component.js';
import { Color } from '../../../core/math/color.js';
import { Vec2 } from '../../../core/math/vec2.js';
import { Vec4 } from '../../../core/math/vec4.js';
import { GraphNode } from '../../../scene/graph-node.js';
import { Model } from '../../../scene/model.js';
import { MeshInstance } from '../../../scene/mesh-instance.js';
import { SpriteAnimationClip } from './sprite-animation-clip.js';
import type { Asset } from '../../asset/asset.js';
import type { Sprite } from '../../../scene/sprite.js';
import type { SpriteComponentSystem } from './system.js';
import type { Entity } from '../../entity.js';
