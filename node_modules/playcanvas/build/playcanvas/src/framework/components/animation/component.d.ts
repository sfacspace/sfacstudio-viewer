/**
 * @import { Animation } from '../../../scene/animation/animation.js'
 * @import { Model } from '../../../scene/model.js'
 */
/**
 * The Animation Component allows an Entity to playback animations on models.
 *
 * @hideconstructor
 * @category Animation
 */
export class AnimationComponent extends Component {
    /**
     * @type {Object<string, Animation>}
     * @private
     */
    private _animations;
    /**
     * @type {Array.<number|Asset>}
     * @private
     */
    private _assets;
    /** @private */
    private _loop;
    /**
     * @type {AnimEvaluator|null}
     * @ignore
     */
    animEvaluator: AnimEvaluator | null;
    /**
     * @type {Model|null}
     * @ignore
     */
    model: Model | null;
    /**
     * Get the skeleton for the current model. If the model is loaded from glTF/glb, then the
     * skeleton is null.
     *
     * @type {Skeleton|null}
     */
    skeleton: Skeleton | null;
    /**
     * @type {Skeleton|null}
     * @ignore
     */
    fromSkel: Skeleton | null;
    /**
     * @type {Skeleton|null}
     * @ignore
     */
    toSkel: Skeleton | null;
    /**
     * @type {Object<string, string>}
     * @ignore
     */
    animationsIndex: {
        [x: string]: string;
    };
    /**
     * @type {string|null}
     * @private
     */
    private prevAnim;
    /**
     * @type {string|null}
     * @private
     */
    private currAnim;
    /** @private */
    private blend;
    /** @private */
    private blending;
    /** @private */
    private blendSpeed;
    /**
     * If true, the first animation asset will begin playing when the scene is loaded.
     *
     * @type {boolean}
     */
    activate: boolean;
    /**
     * Speed multiplier for animation play back. 1 is playback at normal speed and 0 pauses the
     * animation.
     *
     * @type {number}
     */
    speed: number;
    /**
     * Sets the dictionary of animations by name.
     *
     * @type {Object<string, Animation>}
     */
    set animations(value: {
        [x: string]: Animation;
    });
    /**
     * Gets the dictionary of animations by name.
     *
     * @type {Object<string, Animation>}
     */
    get animations(): {
        [x: string]: Animation;
    };
    /**
     * Sets the array of animation assets or asset ids.
     *
     * @type {Array.<number|Asset>}
     */
    set assets(value: Array<number | Asset>);
    /**
     * Gets the array of animation assets or asset ids.
     *
     * @type {Array.<number|Asset>}
     */
    get assets(): Array<number | Asset>;
    /**
     * Sets the current time position (in seconds) of the animation.
     *
     * @type {number}
     */
    set currentTime(currentTime: number);
    /**
     * Gets the current time position (in seconds) of the animation.
     *
     * @type {number}
     */
    get currentTime(): number;
    /**
     * Gets the duration in seconds of the current animation. Returns 0 if no animation is playing.
     *
     * @type {number}
     */
    get duration(): number;
    /**
     * Sets whether the animation will restart from the beginning when it reaches the end.
     *
     * @type {boolean}
     */
    set loop(value: boolean);
    /**
     * Gets whether the animation will restart from the beginning when it reaches the end.
     *
     * @type {boolean}
     */
    get loop(): boolean;
    /**
     * Start playing an animation.
     *
     * @param {string} name - The name of the animation asset to begin playing.
     * @param {number} [blendTime] - The time in seconds to blend from the current
     * animation state to the start of the animation being set. Defaults to 0.
     */
    play(name: string, blendTime?: number): void;
    playing: boolean;
    /**
     * Return an animation.
     *
     * @param {string} name - The name of the animation asset.
     * @returns {Animation} An Animation.
     */
    getAnimation(name: string): Animation;
    /**
     * Set the model driven by this animation component.
     *
     * @param {Model} model - The model to set.
     * @ignore
     */
    setModel(model: Model): void;
    onSetAnimations(): void;
    /** @private */
    private _resetAnimationController;
    /** @private */
    private _createAnimationController;
    /**
     * @param {number[]} ids - Array of animation asset ids.
     * @private
     */
    private loadAnimationAssets;
    /**
     * Handle asset change events.
     *
     * @param {Asset} asset - The asset that changed.
     * @param {string} attribute - The name of the asset attribute that changed. Can be 'data',
     * 'file', 'resource' or 'resources'.
     * @param {*} newValue - The new value of the specified asset property.
     * @param {*} oldValue - The old value of the specified asset property.
     * @private
     */
    private onAssetChanged;
    /**
     * @param {Asset} asset - The asset that was removed.
     * @private
     */
    private onAssetRemoved;
    /** @private */
    private _stopCurrentAnimation;
    onBeforeRemove(): void;
    /**
     * Update the state of the component.
     *
     * @param {number} dt - The time delta.
     * @ignore
     */
    update(dt: number): void;
}
import { Component } from '../component.js';
import { AnimEvaluator } from '../../anim/evaluator/anim-evaluator.js';
import type { Model } from '../../../scene/model.js';
import { Skeleton } from '../../../scene/animation/skeleton.js';
import type { Animation } from '../../../scene/animation/animation.js';
import { Asset } from '../../asset/asset.js';
