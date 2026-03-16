/**
 * The scope for a variable.
 *
 * @category Graphics
 */
export class ScopeId {
    /**
     * Create a new ScopeId instance.
     *
     * @param {string} name - The variable name.
     */
    constructor(name: string);
    /**
     * The variable name.
     *
     * @type {string}
     */
    name: string;
    value: any;
    versionObject: VersionedObject;
    toJSON(key: any): any;
    /**
     * Set variable value.
     *
     * @param {*} value - The value.
     */
    setValue(value: any): void;
    /**
     * Get variable value.
     *
     * @returns {*} The value.
     */
    getValue(): any;
}
import { VersionedObject } from './versioned-object.js';
