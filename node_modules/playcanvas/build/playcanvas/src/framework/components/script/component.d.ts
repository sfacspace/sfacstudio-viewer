/**
 * The ScriptComponent allows you add custom behavior to an {@link Entity} by attaching
 * your own scripts written in JavaScript (or TypeScript).
 *
 * You should never need to use the ScriptComponent constructor directly. To add a
 * ScriptComponent to an Entity, use {@link Entity#addComponent}:
 *
 * ```javascript
 * const entity = new pc.Entity();
 * entity.addComponent('script');
 * ```
 *
 * Once the ScriptComponent is added to the entity, you can access it via the {@link Entity#script}
 * property.
 *
 * Add scripts to the entity by calling the `create` method:
 *
 * ```javascript
 * // Option 1: Add a script using the name registered in the ScriptRegistry
 * entity.script.create('cameraControls');
 *
 * // Option 2: Add a script using the script class
 * entity.script.create(CameraControls);
 * ```
 *
 * For more details on scripting see the [Scripting Section](https://developer.playcanvas.com/user-manual/scripting/)
 * of the User Manual.
 *
 * @hideconstructor
 * @category Script
 */
export class ScriptComponent extends Component {
    /**
     * Fired when a {@link ScriptType} instance is created and attached to the script component.
     * This event is available in two forms. They are as follows:
     *
     * 1. `create` - Fired when a script instance is created. The name of the script type and the
     * script type instance are passed as arguments.
     * 2. `create:[name]` - Fired when a script instance is created that has the specified script
     * type name. The script instance is passed as an argument to the handler.
     *
     * @event
     * @example
     * entity.script.on('create', (name, scriptInstance) => {
     *     console.log(`Instance of script '${name}' created`);
     * });
     * @example
     * entity.script.on('create:player', (scriptInstance) => {
     *     console.log(`Instance of script 'player' created`);
     * });
     */
    static EVENT_CREATE: string;
    /**
     * Fired when a {@link ScriptType} instance is destroyed and removed from the script component.
     * This event is available in two forms. They are as follows:
     *
     * 1. `destroy` - Fired when a script instance is destroyed. The name of the script type and
     * the script type instance are passed as arguments.
     * 2. `destroy:[name]` - Fired when a script instance is destroyed that has the specified
     * script type name. The script instance is passed as an argument.
     *
     * @event
     * @example
     * entity.script.on('destroy', (name, scriptInstance) => {
     *     console.log(`Instance of script '${name}' destroyed`);
     * });
     * @example
     * entity.script.on('destroy:player', (scriptInstance) => {
     *     console.log(`Instance of script 'player' destroyed`);
     * });
     */
    static EVENT_DESTROY: string;
    /**
     * Fired when the script component becomes enabled. This event does not take into account the
     * enabled state of the entity or any of its ancestors.
     *
     * @event
     * @example
     * entity.script.on('enable', () => {
     *     console.log(`Script component of entity '${entity.name}' has been enabled`);
     * });
     */
    static EVENT_ENABLE: string;
    /**
     * Fired when the script component becomes disabled. This event does not take into account the
     * enabled state of the entity or any of its ancestors.
     *
     * @event
     * @example
     * entity.script.on('disable', () => {
     *     console.log(`Script component of entity '${entity.name}' has been disabled`);
     * });
     */
    static EVENT_DISABLE: string;
    /**
     * Fired when the script component has been removed from its entity.
     *
     * @event
     * @example
     * entity.script.on('remove', () => {
     *     console.log(`Script component removed from entity '${entity.name}'`);
     * });
     */
    static EVENT_REMOVE: string;
    /**
     * Fired when the script component changes state to enabled or disabled. The handler is passed
     * the new boolean enabled state of the script component. This event does not take into account
     * the enabled state of the entity or any of its ancestors.
     *
     * @event
     * @example
     * entity.script.on('state', (enabled) => {
     *     console.log(`Script component of entity '${entity.name}' changed state to '${enabled}'`);
     * });
     */
    static EVENT_STATE: string;
    /**
     * Fired when the index of a {@link ScriptType} instance is changed in the script component.
     * This event is available in two forms. They are as follows:
     *
     * 1. `move` - Fired when a script instance is moved. The name of the script type, the script
     * type instance, the new index and the old index are passed as arguments.
     * 2. `move:[name]` - Fired when a specifically named script instance is moved. The script
     * instance, the new index and the old index are passed as arguments.
     *
     * @event
     * @example
     * entity.script.on('move', (name, scriptInstance, newIndex, oldIndex) => {
     *     console.log(`Script '${name}' moved from index '${oldIndex}' to '${newIndex}'`);
     * });
     * @example
     * entity.script.on('move:player', (scriptInstance, newIndex, oldIndex) => {
     *     console.log(`Script 'player' moved from index '${oldIndex}' to '${newIndex}'`);
     * });
     */
    static EVENT_MOVE: string;
    /**
     * Fired when a {@link ScriptType} instance had an exception. The handler is passed the script
     * instance, the exception and the method name that the exception originated from.
     *
     * @event
     * @example
     * entity.script.on('error', (scriptInstance, exception, methodName) => {
     *     console.log(`Script error: ${exception} in method '${methodName}'`);
     * });
     */
    static EVENT_ERROR: string;
    /**
     * Create a new ScriptComponent instance.
     *
     * @param {ScriptComponentSystem} system - The ComponentSystem that created this Component.
     * @param {Entity} entity - The Entity that this Component is attached to.
     */
    constructor(system: ScriptComponentSystem, entity: Entity);
    /**
     * A map of script name to initial component data.
     *
     * @type {Map<string, object>}
     * @private
     */
    private _attributeDataMap;
    /**
     * Holds all script instances for this component.
     *
     * @type {ScriptType[]}
     * @private
     */
    private _scripts;
    _updateList: SortedLoopArray;
    _postUpdateList: SortedLoopArray;
    _scriptsIndex: {};
    _destroyedScripts: any[];
    _destroyed: boolean;
    _scriptsData: ScriptType[];
    _oldState: boolean;
    _enabled: boolean;
    _beingEnabled: boolean;
    _isLoopingThroughScripts: boolean;
    _executionOrder: number;
    /**
     * Sets the array of all script instances attached to an entity. This array is read-only and
     * should not be modified by developer.
     *
     * @type {Script[]}
     */
    set scripts(value: ScriptType[]);
    /**
     * Gets the array of all script instances attached to an entity.
     *
     * @type {ScriptType[]}
     */
    get scripts(): ScriptType[];
    _beginLooping(): boolean;
    _endLooping(wasLoopingBefore: any): void;
    _onSetEnabled(prop: any, old: any, value: any): void;
    _checkState(): void;
    _onBeforeRemove(): void;
    _removeDestroyedScripts(): void;
    _onInitializeAttributes(): void;
    initializeAttributes(script: any): void;
    _scriptMethod(script: any, method: any, arg: any): void;
    _onInitialize(): void;
    _onPostInitialize(): void;
    _onUpdate(dt: any): void;
    _onPostUpdate(dt: any): void;
    /**
     * Inserts script instance into the scripts array at the specified index. Also inserts the
     * script into the update list if it has an update method and the post update list if it has a
     * postUpdate method.
     *
     * @param {object} scriptInstance - The script instance.
     * @param {number} index - The index where to insert the script at. If -1, append it at the end.
     * @param {number} scriptsLength - The length of the scripts array.
     * @private
     */
    private _insertScriptInstance;
    _removeScriptInstance(scriptInstance: any): number;
    _resetExecutionOrder(startIndex: any, scriptsLength: any): void;
    _resolveEntityScriptAttribute(attribute: any, attributeName: any, oldValue: any, useGuid: any, newAttributes: any, duplicatedIdsMap: any): void;
    /**
     * Detect if script is attached to an entity.
     *
     * @param {string|typeof ScriptType} nameOrType - The name or type of {@link ScriptType}.
     * @returns {boolean} If script is attached to an entity.
     * @example
     * if (entity.script.has('playerController')) {
     *     // entity has script
     * }
     */
    has(nameOrType: string | typeof ScriptType): boolean;
    /**
     * Get a script instance (if attached).
     *
     * @param {string|typeof ScriptType} nameOrType - The name or type of {@link ScriptType}.
     * @returns {ScriptType|null} If script is attached, the instance is returned. Otherwise null
     * is returned.
     * @example
     * const controller = entity.script.get('playerController');
     */
    get(nameOrType: string | typeof ScriptType): ScriptType | null;
    /**
     * Create a script instance and attach to an entity script component.
     *
     * @param {string|typeof Script} nameOrType - The name or type of {@link Script}.
     * @param {object} [args] - Object with arguments for a script.
     * @param {boolean} [args.enabled] - If script instance is enabled after creation. Defaults to
     * true.
     * @param {object} [args.attributes] - Object with values for attributes (if any), where key is
     * name of an attribute.
     * @param {object} [args.properties] - Object with values that are **assigned** to the script instance.
     * @param {boolean} [args.preloading] - If script instance is created during preload. If true,
     * script and attributes must be initialized manually. Defaults to false.
     * @param {number} [args.ind] - The index where to insert the script instance at. Defaults to
     * -1, which means append it at the end.
     * @returns {ScriptType|null} Returns an instance of a {@link ScriptType} if successfully
     * attached to an entity, or null if it failed because a script with a same name has already
     * been added or if the {@link ScriptType} cannot be found by name in the
     * {@link ScriptRegistry}.
     * @example
     * entity.script.create('playerController', {
     *     attributes: {
     *         speed: 4
     *     }
     * });
     */
    create(nameOrType: string | typeof Script, args?: {
        enabled?: boolean;
        attributes?: object;
        properties?: object;
        preloading?: boolean;
        ind?: number;
    }): ScriptType | null;
    /**
     * Destroy the script instance that is attached to an entity.
     *
     * @param {string|typeof ScriptType} nameOrType - The name or type of {@link ScriptType}.
     * @returns {boolean} If it was successfully destroyed.
     * @example
     * entity.script.destroy('playerController');
     */
    destroy(nameOrType: string | typeof ScriptType): boolean;
    /**
     * Swap the script instance.
     *
     * @param {string|typeof ScriptType} nameOrType - The name or type of {@link ScriptType}.
     * @returns {boolean} If it was successfully swapped.
     * @private
     */
    private swap;
    /**
     * When an entity is cloned and it has entity script attributes that point to other entities in
     * the same subtree that is cloned, then we want the new script attributes to point at the
     * cloned entities. This method remaps the script attributes for this entity and it assumes
     * that this entity is the result of the clone operation.
     *
     * @param {ScriptComponent} oldScriptComponent - The source script component that belongs to
     * the entity that was being cloned.
     * @param {object} duplicatedIdsMap - A dictionary with guid-entity values that contains the
     * entities that were cloned.
     * @private
     */
    private resolveDuplicatedEntityReferenceProperties;
    /**
     * Move script instance to different position to alter update order of scripts within entity.
     *
     * @param {string|typeof ScriptType} nameOrType - The name or type of {@link ScriptType}.
     * @param {number} ind - New position index.
     * @returns {boolean} If it was successfully moved.
     * @example
     * entity.script.move('playerController', 0);
     */
    move(nameOrType: string | typeof ScriptType, ind: number): boolean;
}
import { Component } from '../component.js';
import { SortedLoopArray } from '../../../core/sorted-loop-array.js';
import { ScriptType } from '../../script/script-type.js';
import type { Script } from '../../script/script.js';
import type { ScriptComponentSystem } from './system.js';
import { Entity } from '../../entity.js';
