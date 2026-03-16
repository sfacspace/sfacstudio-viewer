/**
 * @import { AppBase } from '../app-base.js'
 * @import { AttributeSchema } from './script-attributes.js'
 * @import { ScriptType } from './script-type.js'
 */
/**
 * Container for all {@link ScriptType}s that are available to this application. Note that
 * PlayCanvas scripts can access the Script Registry from inside the application with
 * {@link AppBase#scripts}.
 *
 * @category Script
 */
export class ScriptRegistry extends EventHandler {
    /**
     * Create a new ScriptRegistry instance.
     *
     * @param {AppBase} app - Application to attach registry to.
     */
    constructor(app: AppBase);
    /**
     * @type {Object<string, typeof ScriptType>}
     * @private
     */
    private _scripts;
    /**
     * @type {typeof ScriptType[]}
     * @private
     */
    private _list;
    /**
     * A Map of script names to attribute schemas.
     *
     * @type {Map<string, AttributeSchema>}
     * @private
     */
    private _scriptSchemas;
    app: AppBase;
    destroy(): void;
    /**
     * Registers a schema against a script instance.
     *
     * @param {string} id - The key to use to store the schema
     * @param {AttributeSchema} schema - An schema definition for the script
     */
    addSchema(id: string, schema: AttributeSchema): void;
    /**
     * Returns a schema for a given script name.
     *
     * @param {string} id - The key to store the schema under
     * @returns {AttributeSchema | undefined} - The schema stored under the key
     */
    getSchema(id: string): AttributeSchema | undefined;
    /**
     * Add {@link ScriptType} to registry. Note: when {@link createScript} is called, it will add
     * the {@link ScriptType} to the registry automatically. If a script already exists in
     * registry, and the new script has a `swap` method defined, it will perform code hot swapping
     * automatically in async manner.
     *
     * @param {typeof ScriptType} script - Script Type that is created
     * using {@link createScript}.
     * @returns {boolean} True if added for the first time or false if script already exists.
     * @example
     * var PlayerController = pc.createScript('playerController');
     * // playerController Script Type will be added to pc.ScriptRegistry automatically
     * console.log(app.scripts.has('playerController')); // outputs true
     */
    add(script: typeof ScriptType): boolean;
    /**
     * Remove {@link ScriptType}.
     *
     * @param {string|typeof ScriptType} nameOrType - The name or type
     * of {@link ScriptType}.
     * @returns {boolean} True if removed or False if already not in registry.
     * @example
     * app.scripts.remove('playerController');
     */
    remove(nameOrType: string | typeof ScriptType): boolean;
    /**
     * Get {@link ScriptType} by name.
     *
     * @param {string} name - Name of a {@link ScriptType}.
     * @returns {typeof ScriptType} The Script Type if it exists in the
     * registry or null otherwise.
     * @example
     * var PlayerController = app.scripts.get('playerController');
     */
    get(name: string): typeof ScriptType;
    /**
     * Check if a {@link ScriptType} with the specified name is in the registry.
     *
     * @param {string|typeof ScriptType} nameOrType - The name or type
     * of {@link ScriptType}.
     * @returns {boolean} True if {@link ScriptType} is in registry.
     * @example
     * if (app.scripts.has('playerController')) {
     *     // playerController is in pc.ScriptRegistry
     * }
     */
    has(nameOrType: string | typeof ScriptType): boolean;
    /**
     * Get list of all {@link ScriptType}s from registry.
     *
     * @returns {Array<typeof ScriptType>} list of all {@link ScriptType}s
     * in registry.
     * @example
     * // logs array of all Script Type names available in registry
     * console.log(app.scripts.list().map(function (o) {
     *     return o.name;
     * }));
     */
    list(): Array<typeof ScriptType>;
}
import { EventHandler } from '../../core/event-handler.js';
import type { AppBase } from '../app-base.js';
import type { AttributeSchema } from './script-attributes.js';
import type { ScriptType } from './script-type.js';
