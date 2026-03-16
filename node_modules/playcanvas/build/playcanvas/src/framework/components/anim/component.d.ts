/**
 * The AnimComponent allows an {@link Entity} to playback animations on models and entity
 * properties.
 *
 * @hideconstructor
 * @category Animation
 */
export class AnimComponent extends Component {
    /** @private */
    private _stateGraphAsset;
    /** @private */
    private _animationAssets;
    /** @private */
    private _speed;
    /** @private */
    private _activate;
    /** @private */
    private _playing;
    /** @private */
    private _rootBone;
    /** @private */
    private _stateGraph;
    /** @private */
    private _layers;
    /** @private */
    private _layerIndices;
    /** @private */
    private _parameters;
    /** @private */
    private _targets;
    /** @private */
    private _consumedTriggers;
    /** @private */
    private _normalizeWeights;
    set stateGraphAsset(value: any);
    get stateGraphAsset(): any;
    /**
     * Sets whether the animation component will normalize the weights of its layers by their sum total.
     *
     * @type {boolean}
     */
    set normalizeWeights(value: boolean);
    /**
     * Gets whether the animation component will normalize the weights of its layers by their sum total.
     *
     * @type {boolean}
     */
    get normalizeWeights(): boolean;
    set animationAssets(value: {});
    get animationAssets(): {};
    /**
     * Sets the speed multiplier for animation play back speed. 1.0 is playback at normal speed, 0.0 pauses
     * the animation.
     *
     * @type {number}
     */
    set speed(value: number);
    /**
     * Gets the speed multiplier for animation play back speed.
     *
     * @type {number}
     */
    get speed(): number;
    /**
     * Sets whether the first animation will begin playing when the scene is loaded.
     *
     * @type {boolean}
     */
    set activate(value: boolean);
    /**
     * Gets whether the first animation will begin playing when the scene is loaded.
     *
     * @type {boolean}
     */
    get activate(): boolean;
    /**
     * Sets whether to play or pause all animations in the component.
     *
     * @type {boolean}
     */
    set playing(value: boolean);
    /**
     * Gets whether to play or pause all animations in the component.
     *
     * @type {boolean}
     */
    get playing(): boolean;
    /**
     * Sets the entity that this anim component should use as the root of the animation hierarchy.
     *
     * @type {Entity}
     */
    set rootBone(value: Entity);
    /**
     * Gets the entity that this anim component should use as the root of the animation hierarchy.
     *
     * @type {Entity}
     */
    get rootBone(): Entity;
    set stateGraph(value: any);
    get stateGraph(): any;
    /**
     * Returns the animation layers available in this anim component.
     *
     * @type {AnimComponentLayer[]}
     */
    get layers(): AnimComponentLayer[];
    set layerIndices(value: {});
    get layerIndices(): {};
    set parameters(value: {});
    get parameters(): {};
    set targets(value: {});
    get targets(): {};
    /**
     * Returns whether all component layers are currently playable.
     *
     * @type {boolean}
     */
    get playable(): boolean;
    /**
     * Returns the base layer of the state graph.
     *
     * @type {AnimComponentLayer|null}
     */
    get baseLayer(): AnimComponentLayer | null;
    _onStateGraphAssetChangeEvent(asset: any): void;
    dirtifyTargets(): void;
    _addLayer({ name, states, transitions, weight, mask, blendType }: {
        name: any;
        states: any;
        transitions: any;
        weight: any;
        mask: any;
        blendType: any;
    }): any;
    /**
     * Adds a new anim component layer to the anim component.
     *
     * @param {string} name - The name of the layer to create.
     * @param {number} [weight] - The blending weight of the layer. Defaults to 1.
     * @param {object[]} [mask] - A list of paths to bones in the model which should be animated in
     * this layer. If omitted the full model is used. Defaults to null.
     * @param {string} [blendType] - Defines how properties animated by this layer blend with
     * animations of those properties in previous layers. Defaults to pc.ANIM_LAYER_OVERWRITE.
     * @returns {AnimComponentLayer} The created anim component layer.
     */
    addLayer(name: string, weight?: number, mask?: object[], blendType?: string): AnimComponentLayer;
    _assignParameters(stateGraph: any): void;
    /**
     * Initializes component animation controllers using the provided state graph.
     *
     * @param {object} stateGraph - The state graph asset to load into the component. Contains the
     * states, transitions and parameters used to define a complete animation controller.
     * @example
     * entity.anim.loadStateGraph({
     *     "layers": [
     *         {
     *             "name": layerName,
     *             "states": [
     *                 {
     *                     "name": "START",
     *                     "speed": 1
     *                 },
     *                 {
     *                     "name": "Initial State",
     *                     "speed": speed,
     *                     "loop": loop,
     *                     "defaultState": true
     *                 }
     *             ],
     *             "transitions": [
     *                 {
     *                     "from": "START",
     *                     "to": "Initial State"
     *                 }
     *             ]
     *         }
     *     ],
     *     "parameters": {}
     * });
     */
    loadStateGraph(stateGraph: object): void;
    setupAnimationAssets(): void;
    loadAnimationAssets(): void;
    onAnimationAssetLoaded(layerName: any, stateName: any, asset: any): void;
    /**
     * Removes all layers from the anim component.
     */
    removeStateGraph(): void;
    /**
     * Reset all of the components layers and parameters to their initial states. If a layer was
     * playing before it will continue playing.
     */
    reset(): void;
    unbind(): void;
    /**
     * Rebind all of the components layers.
     */
    rebind(): void;
    /**
     * Finds an {@link AnimComponentLayer} in this component.
     *
     * @param {string} name - The name of the anim component layer to find.
     * @returns {AnimComponentLayer} Layer.
     */
    findAnimationLayer(name: string): AnimComponentLayer;
    addAnimationState(nodeName: any, animTrack: any, speed?: number, loop?: boolean, layerName?: string): void;
    /**
     * Associates an animation with a state or blend tree node in the loaded state graph. If all
     * states are linked and the {@link activate} value was set to true then the component will
     * begin playing. If no state graph is loaded, a default state graph will be created with a
     * single state based on the provided nodePath parameter.
     *
     * @param {string} nodePath - Either the state name or the path to a blend tree node that this
     * animation should be associated with. Each section of a blend tree path is split using a
     * period (`.`) therefore state names should not include this character (e.g "MyStateName" or
     * "MyStateName.BlendTreeNode").
     * @param {AnimTrack} animTrack - The animation track that will be assigned to this state and
     * played whenever this state is active.
     * @param {string} [layerName] - The name of the anim component layer to update. If omitted the
     * default layer is used. If no state graph has been previously loaded this parameter is
     * ignored.
     * @param {number} [speed] - Update the speed of the state you are assigning an animation to.
     * Defaults to 1.
     * @param {boolean} [loop] - Update the loop property of the state you are assigning an
     * animation to. Defaults to true.
     */
    assignAnimation(nodePath: string, animTrack: AnimTrack, layerName?: string, speed?: number, loop?: boolean): void;
    /**
     * Removes animations from a node in the loaded state graph.
     *
     * @param {string} nodeName - The name of the node that should have its animation tracks removed.
     * @param {string} [layerName] - The name of the anim component layer to update. If omitted the
     * default layer is used.
     */
    removeNodeAnimations(nodeName: string, layerName?: string): void;
    getParameterValue(name: any, type: any): any;
    setParameterValue(name: any, type: any, value: any): void;
    /**
     * Returns the parameter object for the specified parameter name. This function is anonymous so that it can be passed to the AnimController
     * while still being called in the scope of the AnimComponent.
     *
     * @param {string} name - The name of the parameter to return the value of.
     * @returns {object} The parameter object.
     * @private
     */
    private findParameter;
    /**
     * Sets a trigger parameter as having been used by a transition. This function is anonymous so that it can be passed to the AnimController
     * while still being called in the scope of the AnimComponent.
     *
     * @param {string} name - The name of the trigger to set as consumed.
     * @private
     */
    private consumeTrigger;
    /**
     * Returns a float parameter value by name.
     *
     * @param {string} name - The name of the float to return the value of.
     * @returns {number} A float.
     */
    getFloat(name: string): number;
    /**
     * Sets the value of a float parameter that was defined in the animation components state graph.
     *
     * @param {string} name - The name of the parameter to set.
     * @param {number} value - The new float value to set this parameter to.
     */
    setFloat(name: string, value: number): void;
    /**
     * Returns an integer parameter value by name.
     *
     * @param {string} name - The name of the integer to return the value of.
     * @returns {number} An integer.
     */
    getInteger(name: string): number;
    /**
     * Sets the value of an integer parameter that was defined in the animation components state
     * graph.
     *
     * @param {string} name - The name of the parameter to set.
     * @param {number} value - The new integer value to set this parameter to.
     */
    setInteger(name: string, value: number): void;
    /**
     * Returns a boolean parameter value by name.
     *
     * @param {string} name - The name of the boolean to return the value of.
     * @returns {boolean} A boolean.
     */
    getBoolean(name: string): boolean;
    /**
     * Sets the value of a boolean parameter that was defined in the animation components state
     * graph.
     *
     * @param {string} name - The name of the parameter to set.
     * @param {boolean} value - The new boolean value to set this parameter to.
     */
    setBoolean(name: string, value: boolean): void;
    /**
     * Returns a trigger parameter value by name.
     *
     * @param {string} name - The name of the trigger to return the value of.
     * @returns {boolean} A boolean.
     */
    getTrigger(name: string): boolean;
    /**
     * Sets the value of a trigger parameter that was defined in the animation components state
     * graph to true.
     *
     * @param {string} name - The name of the parameter to set.
     * @param {boolean} [singleFrame] - If true, this trigger will be set back to false at the end
     * of the animation update. Defaults to false.
     */
    setTrigger(name: string, singleFrame?: boolean): void;
    /**
     * Resets the value of a trigger parameter that was defined in the animation components state
     * graph to false.
     *
     * @param {string} name - The name of the parameter to set.
     */
    resetTrigger(name: string): void;
    onBeforeRemove(): void;
    update(dt: any): void;
    resolveDuplicatedEntityReferenceProperties(oldAnim: any, duplicatedIdsMap: any): void;
}
import { Component } from '../component.js';
import { Entity } from '../../entity.js';
import { AnimComponentLayer } from './component-layer.js';
import { AnimTrack } from '../../anim/evaluator/anim-track.js';
