/**
 * @import { AnimEvaluator } from '../evaluator/anim-evaluator.js'
 * @import { EventHandler } from '../../../core/event-handler.js'
 */
/**
 * The AnimController manages the animations for its entity, based on the provided state graph and
 * parameters. Its update method determines which state the controller should be in based on the
 * current time, parameters and available states / transitions. It also ensures the AnimEvaluator
 * is supplied with the correct animations, based on the currently active state.
 *
 * @ignore
 */
export class AnimController {
    /**
     * Create a new AnimController.
     *
     * @param {AnimEvaluator} animEvaluator - The animation evaluator used to blend all current
     * playing animation keyframes and update the entities properties based on the current
     * animation values.
     * @param {object[]} states - The list of states used to form the controller state graph.
     * @param {object[]} transitions - The list of transitions used to form the controller state
     * graph.
     * @param {boolean} activate - Determines whether the anim controller should automatically play
     * once all {@link AnimNodes} are assigned animations.
     * @param {EventHandler} eventHandler - The event handler which should be notified with anim
     * events.
     * @param {Function} findParameter - Retrieves a parameter which is used to control the
     * transition between states.
     * @param {Function} consumeTrigger - Used to set triggers back to their default state after
     * they have been consumed by a transition.
     */
    constructor(animEvaluator: AnimEvaluator, states: object[], transitions: object[], activate: boolean, eventHandler: EventHandler, findParameter: Function, consumeTrigger: Function);
    /**
     * @type {Object<string, AnimState>}
     * @private
     */
    private _states;
    /**
     * @type {string[]}
     * @private
     */
    private _stateNames;
    /**
     * @type {Object<string, AnimTransition[]>}
     * @private
     */
    private _findTransitionsFromStateCache;
    /**
     * @type {Object<string, AnimTransition[]>}
     * @private
     */
    private _findTransitionsBetweenStatesCache;
    /**
     * @type {string|null}
     * @private
     */
    private _previousStateName;
    /** @private */
    private _activeStateName;
    /** @private */
    private _activeStateDuration;
    /** @private */
    private _activeStateDurationDirty;
    /** @private */
    private _playing;
    /**
     * @type {boolean}
     * @private
     */
    private _activate;
    /**
     * @type {AnimTransition[]}
     * @private
     */
    private _transitions;
    /** @private */
    private _currTransitionTime;
    /** @private */
    private _totalTransitionTime;
    /** @private */
    private _isTransitioning;
    /** @private */
    private _transitionInterruptionSource;
    /** @private */
    private _transitionPreviousStates;
    /** @private */
    private _timeInState;
    /** @private */
    private _timeInStateBefore;
    _animEvaluator: AnimEvaluator;
    _eventHandler: EventHandler;
    _findParameter: Function;
    _consumeTrigger: Function;
    get animEvaluator(): AnimEvaluator;
    set activeState(stateName: AnimState);
    get activeState(): AnimState;
    get activeStateName(): string;
    get activeStateAnimations(): any[];
    set previousState(stateName: AnimState);
    get previousState(): AnimState;
    get previousStateName(): string;
    get playable(): boolean;
    set playing(value: boolean);
    get playing(): boolean;
    get activeStateProgress(): number;
    get activeStateDuration(): number;
    set activeStateCurrentTime(time: number);
    get activeStateCurrentTime(): number;
    get transitioning(): boolean;
    get transitionProgress(): number;
    get states(): string[];
    assignMask(mask: any): any;
    /**
     * @param {string} stateName - The name of the state to find.
     * @returns {AnimState} The state with the given name.
     * @private
     */
    private _findState;
    _getActiveStateProgressForTime(time: any): number;
    /**
     * Return all the transitions that have the given stateName as their source state.
     *
     * @param {string} stateName - The name of the state to find transitions from.
     * @returns {AnimTransition[]} The transitions that have the given stateName as their source
     * state.
     * @private
     */
    private _findTransitionsFromState;
    /**
     * Return all the transitions that contain the given source and destination states.
     *
     * @param {string} sourceStateName - The name of the source state to find transitions from.
     * @param {string} destinationStateName - The name of the destination state to find transitions
     * to.
     * @returns {AnimTransition[]} The transitions that have the given source and destination states.
     * @private
     */
    private _findTransitionsBetweenStates;
    _transitionHasConditionsMet(transition: any): boolean;
    _findTransition(from: any, to: any): any;
    updateStateFromTransition(transition: any): void;
    _transitionToState(newStateName: any): void;
    assignAnimation(pathString: any, animTrack: any, speed: any, loop: any): void;
    removeNodeAnimations(nodeName: any): boolean;
    play(stateName: any): void;
    pause(): void;
    reset(): void;
    rebind(): void;
    update(dt: any): void;
    findParameter: (name: any) => any;
}
import type { AnimEvaluator } from '../evaluator/anim-evaluator.js';
import type { EventHandler } from '../../../core/event-handler.js';
import { AnimState } from './anim-state.js';
