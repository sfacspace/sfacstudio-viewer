/**
 * @import { AnimComponent } from './component.js'
 * @import { AnimController } from '../../anim/controller/anim-controller.js'
 */
/**
 * The Anim Component Layer allows managers a single layer of the animation state graph.
 *
 * @category Animation
 */
export class AnimComponentLayer {
    /**
     * Create a new AnimComponentLayer instance.
     *
     * @param {string} name - The name of the layer.
     * @param {AnimController} controller - The controller to manage this layers animations.
     * @param {AnimComponent} component - The component that this layer is a member of.
     * @param {number} [weight] - The weight of this layer. Defaults to 1.
     * @param {string} [blendType] - The blend type of this layer. Defaults to {@link ANIM_LAYER_OVERWRITE}.
     * @ignore
     */
    constructor(name: string, controller: AnimController, component: AnimComponent, weight?: number, blendType?: string);
    /**
     * @type {string}
     * @private
     */
    private _name;
    /**
     * @type {AnimController}
     * @private
     */
    private _controller;
    /**
     * @type {AnimComponent}
     * @private
     */
    private _component;
    /**
     * @type {number}
     * @private
     */
    private _weight;
    /**
     * @type {string}
     * @private
     */
    private _blendType;
    /** @private */
    private _mask;
    /** @private */
    private _blendTime;
    /** @private */
    private _blendTimeElapsed;
    /** @private */
    private _startingWeight;
    /** @private */
    private _targetWeight;
    /**
     * Returns the name of the layer.
     *
     * @type {string}
     */
    get name(): string;
    /**
     * Sets whether this layer is currently playing.
     *
     * @type {boolean}
     */
    set playing(value: boolean);
    /**
     * Gets whether this layer is currently playing.
     *
     * @type {boolean}
     */
    get playing(): boolean;
    /**
     * Returns true if a state graph has been loaded and all states in the graph have been assigned
     * animation tracks.
     *
     * @type {boolean}
     */
    get playable(): boolean;
    /**
     * Gets the currently active state name.
     *
     * @type {string}
     */
    get activeState(): string;
    /**
     * Gets the previously active state name.
     *
     * @type {string|null}
     */
    get previousState(): string | null;
    /**
     * Gets the currently active state's progress as a value normalized by the state's animation
     * duration. Looped animations will return values greater than 1.
     *
     * @type {number}
     */
    get activeStateProgress(): number;
    /**
     * Gets the currently active states duration.
     *
     * @type {number}
     */
    get activeStateDuration(): number;
    /**
     * Sets the active state's time in seconds.
     *
     * @type {number}
     */
    set activeStateCurrentTime(time: number);
    /**
     * Gets the active state's time in seconds.
     *
     * @type {number}
     */
    get activeStateCurrentTime(): number;
    /**
     * Gets whether the anim component layer is currently transitioning between states.
     *
     * @type {boolean}
     */
    get transitioning(): boolean;
    /**
     * Gets the progress, if the anim component layer is currently transitioning between states.
     * Otherwise returns null.
     *
     * @type {number|null}
     */
    get transitionProgress(): number | null;
    /**
     * Gets all available states in this layers state graph.
     *
     * @type {string[]}
     */
    get states(): string[];
    /**
     * Sets the blending weight of this layer. Used when calculating the value of properties that
     * are animated by more than one layer.
     *
     * @type {number}
     */
    set weight(value: number);
    /**
     * Sets the blending weight of this layer.
     *
     * @type {number}
     */
    get weight(): number;
    set blendType(value: string);
    get blendType(): string;
    /**
     * Sets the mask of bones which should be animated or ignored by this layer.
     *
     * @type {object}
     * @example
     * entity.anim.baseLayer.mask = {
     *     // include the spine of the current model and all of its children
     *     "path/to/spine": {
     *         children: true
     *     },
     *     // include the hip of the current model but not all of its children
     *     "path/to/hip": true
     * };
     */
    set mask(value: object);
    /**
     * Gets the mask of bones which should be animated or ignored by this layer.
     *
     * @type {object}
     */
    get mask(): object;
    /**
     * Start playing the animation in the current state.
     *
     * @param {string} [name] - If provided, will begin playing from the start of the state with
     * this name.
     */
    play(name?: string): void;
    /**
     * Pause the animation in the current state.
     */
    pause(): void;
    /**
     * Reset the animation component to its initial state, including all parameters. The system
     * will be paused.
     */
    reset(): void;
    /**
     * Rebind any animations in the layer to the currently present components and model of the anim
     * components entity.
     */
    rebind(): void;
    update(dt: any): void;
    /**
     * Blend from the current weight value to the provided weight value over a given amount of time.
     *
     * @param {number} weight - The new weight value to blend to.
     * @param {number} time - The duration of the blend in seconds.
     */
    blendToWeight(weight: number, time: number): void;
    /**
     * Assigns an animation track to a state or blend tree node in the current graph. If a state
     * for the given nodePath doesn't exist, it will be created. If all states nodes are linked and
     * the {@link AnimComponent#activate} value was set to true then the component will begin
     * playing.
     *
     * @param {string} nodePath - Either the state name or the path to a blend tree node that this
     * animation should be associated with. Each section of a blend tree path is split using a
     * period (`.`) therefore state names should not include this character (e.g "MyStateName" or
     * "MyStateName.BlendTreeNode").
     * @param {AnimTrack} animTrack - The animation track that will be assigned to this state and
     * played whenever this state is active.
     * @param {number} [speed] - Update the speed of the state you are assigning an animation to.
     * Defaults to 1.
     * @param {boolean} [loop] - Update the loop property of the state you are assigning an
     * animation to. Defaults to true.
     */
    assignAnimation(nodePath: string, animTrack: AnimTrack, speed?: number, loop?: boolean): void;
    /**
     * Removes animations from a node in the loaded state graph.
     *
     * @param {string} nodeName - The name of the node that should have its animation tracks removed.
     */
    removeNodeAnimations(nodeName: string): void;
    /**
     * Returns an object holding the animation asset id that is associated with the given state.
     *
     * @param {string} stateName - The name of the state to get the asset for.
     * @returns {{ asset: number }} An object containing the animation asset id associated with the given state.
     */
    getAnimationAsset(stateName: string): {
        asset: number;
    };
    /**
     * Transition to any state in the current layers graph. Transitions can be instant or take an
     * optional blend time.
     *
     * @param {string} to - The state that this transition will transition to.
     * @param {number} [time] - The duration of the transition in seconds. Defaults to 0.
     * @param {number} [transitionOffset] - If provided, the destination state will begin playing
     * its animation at this time. Given in normalized time, based on the states duration & must be
     * between 0 and 1. Defaults to null.
     */
    transition(to: string, time?: number, transitionOffset?: number): void;
}
import { AnimTrack } from '../../anim/evaluator/anim-track.js';
import type { AnimController } from '../../anim/controller/anim-controller.js';
import type { AnimComponent } from './component.js';
