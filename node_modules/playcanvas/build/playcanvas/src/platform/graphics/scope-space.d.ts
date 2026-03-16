/**
 * The scope for variables.
 *
 * @category Graphics
 */
export class ScopeSpace {
    /**
     * Create a new ScopeSpace instance.
     *
     * @param {string} name - The scope name.
     */
    constructor(name: string);
    /**
     * The scope name.
     *
     * @type {string}
     */
    name: string;
    variables: Map<any, any>;
    /**
     * Get (or create, if it doesn't already exist) a variable in the scope.
     *
     * @param {string} name - The variable name.
     * @returns {ScopeId} The variable instance.
     */
    resolve(name: string): ScopeId;
    /**
     * Clears value for any uniform with matching value (used to remove deleted textures).
     *
     * @param {*} value - The value to clear.
     * @ignore
     */
    removeValue(value: any): void;
}
import { ScopeId } from './scope-id.js';
