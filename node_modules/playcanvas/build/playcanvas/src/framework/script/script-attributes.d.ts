/**
 * Assigns values to a script instance based on a map of attributes schemas
 * and a corresponding map of data.
 *
 * @param {Application} app - The application instance
 * @param {Object<string, AttributeSchema>} attributeSchemaMap - A map of names to Schemas
 * @param {Object<string, *>} data - A Map of data to assign to the Script instance
 * @param {Script} script - A Script instance to assign values on
 */
export function assignAttributesToScript(app: Application, attributeSchemaMap: {
    [x: string]: AttributeSchema;
}, data: {
    [x: string]: any;
}, script: Script): void;
export type AttributeSchema = {
    /**
     * - The Attribute type
     */
    type: "boolean" | "number" | "string" | "json" | "asset" | "entity" | "rgb" | "rgba" | "vec2" | "vec3" | "vec4" | "curve";
    /**
     * - True if this attribute is an array of `type`
     */
    array?: boolean;
};
import type { Application } from '../../framework/application.js';
import type { Script } from '../../framework/script/script.js';
/**
 * Container of Script Attribute definitions. Implements an interface to add/remove attributes and
 * store their definition for a {@link ScriptType}. Note: An instance of ScriptAttributes is
 * created automatically by each {@link ScriptType}.
 *
 * @category Script
 */
export class ScriptAttributes {
    static assignAttributesToScript: typeof assignAttributesToScript;
    static attributeToValue: typeof attributeToValue;
    static reservedNames: Set<string>;
    /**
     * Create a new ScriptAttributes instance.
     *
     * @param {typeof ScriptType} scriptType - Script Type that attributes relate to.
     */
    constructor(scriptType: typeof ScriptType);
    scriptType: typeof ScriptType;
    index: {};
    /**
     * Add Attribute.
     *
     * @param {string} name - Name of an attribute.
     * @param {object} args - Object with Arguments for an attribute.
     * @param {("boolean"|"number"|"string"|"json"|"asset"|"entity"|"rgb"|"rgba"|"vec2"|"vec3"|"vec4"|"curve")} args.type - Type
     * of an attribute value.  Can be:
     *
     * - "asset"
     * - "boolean"
     * - "curve"
     * - "entity"
     * - "json"
     * - "number"
     * - "rgb"
     * - "rgba"
     * - "string"
     * - "vec2"
     * - "vec3"
     * - "vec4"
     *
     * @param {*} [args.default] - Default attribute value.
     * @param {string} [args.title] - Title for Editor's for field UI.
     * @param {string} [args.description] - Description for Editor's for field UI.
     * @param {string|string[]} [args.placeholder] - Placeholder for Editor's for field UI.
     * For multi-field types, such as vec2, vec3, and others use array of strings.
     * @param {boolean} [args.array] - If attribute can hold single or multiple values.
     * @param {number} [args.size] - If attribute is array, maximum number of values can be set.
     * @param {number} [args.min] - Minimum value for type 'number', if max and min defined, slider
     * will be rendered in Editor's UI.
     * @param {number} [args.max] - Maximum value for type 'number', if max and min defined, slider
     * will be rendered in Editor's UI.
     * @param {number} [args.precision] - Level of precision for field type 'number' with floating
     * values.
     * @param {number} [args.step] - Step value for type 'number'. The amount used to increment the
     * value when using the arrow keys in the Editor's UI.
     * @param {string} [args.assetType] - Name of asset type to be used in 'asset' type attribute
     * picker in Editor's UI, defaults to '*' (all).
     * @param {string[]} [args.curves] - List of names for Curves for field type 'curve'.
     * @param {string} [args.color] - String of color channels for Curves for field type 'curve',
     * can be any combination of `rgba` characters. Defining this property will render Gradient in
     * Editor's field UI.
     * @param {object[]} [args.enum] - List of fixed choices for field, defined as array of objects,
     * where key in object is a title of an option.
     * @param {object[]} [args.schema] - List of attributes for type 'json'. Each attribute
     * description is an object with the same properties as regular script attributes but with an
     * added 'name' field to specify the name of each attribute in the JSON.
     * @example
     * PlayerController.attributes.add('fullName', {
     *     type: 'string'
     * });
     * @example
     * PlayerController.attributes.add('speed', {
     *     type: 'number',
     *     title: 'Speed',
     *     placeholder: 'km/h',
     *     default: 22.2
     * });
     * @example
     * PlayerController.attributes.add('resolution', {
     *     type: 'number',
     *     default: 32,
     *     enum: [
     *         { '32x32': 32 },
     *         { '64x64': 64 },
     *         { '128x128': 128 }
     *     ]
     * });
     * @example
     * PlayerController.attributes.add('config', {
     *     type: 'json',
     *     schema: [{
     *         name: 'speed',
     *         type: 'number',
     *         title: 'Speed',
     *         placeholder: 'km/h',
     *         default: 22.2
     *     }, {
     *         name: 'resolution',
     *         type: 'number',
     *         default: 32,
     *         enum: [
     *             { '32x32': 32 },
     *             { '64x64': 64 },
     *             { '128x128': 128 }
     *         ]
     *     }]
     * });
     */
    add(name: string, args: {
        type: ("boolean" | "number" | "string" | "json" | "asset" | "entity" | "rgb" | "rgba" | "vec2" | "vec3" | "vec4" | "curve");
        default?: any;
        title?: string;
        description?: string;
        placeholder?: string | string[];
        array?: boolean;
        size?: number;
        min?: number;
        max?: number;
        precision?: number;
        step?: number;
        assetType?: string;
        curves?: string[];
        color?: string;
        enum?: object[];
        schema?: object[];
    }): void;
    /**
     * Remove Attribute.
     *
     * @param {string} name - Name of an attribute.
     * @returns {boolean} True if removed or false if not defined.
     * @example
     * PlayerController.attributes.remove('fullName');
     */
    remove(name: string): boolean;
    /**
     * Detect if Attribute is added.
     *
     * @param {string} name - Name of an attribute.
     * @returns {boolean} True if Attribute is defined.
     * @example
     * if (PlayerController.attributes.has('fullName')) {
     *     // attribute fullName is defined
     * }
     */
    has(name: string): boolean;
    /**
     * Get object with attribute arguments. Note: Changing argument properties will not affect
     * existing Script Instances.
     *
     * @param {string} name - Name of an attribute.
     * @returns {?object} Arguments with attribute properties.
     * @example
     * // changing default value for an attribute 'fullName'
     * var attr = PlayerController.attributes.get('fullName');
     * if (attr) attr.default = 'Unknown';
     */
    get(name: string): object | null;
}
import type { ScriptType } from './script-type.js';
/**
 * @typedef {Object} AttributeSchema
 * @property {"boolean"|"number"|"string"|"json"|"asset"|"entity"|"rgb"|"rgba"|"vec2"|"vec3"|"vec4"|"curve"} type - The Attribute type
 * @property {boolean} [array] - True if this attribute is an array of `type`
 */
/**
 * Takes an attribute schema, a value and current value, and return a new value.
 *
 * @param {Application} app - The working application
 * @param {AttributeSchema} schema - The attribute schema used to resolve properties
 * @param {*} value - The raw value to create
 * @param {*} current - The existing value
 * @returns {*} The return value
 */
declare function attributeToValue(app: Application, schema: AttributeSchema, value: any, current: any): any;
export {};
