/**
 * @import { AppBase } from '../app-base.js'
 * @import { Component } from './component.js'
 * @import { Entity } from '../entity.js'
 */
/**
 * Component Systems contain the logic and functionality to update all Components of a particular
 * type.
 */
export class ComponentSystem extends EventHandler {
    /**
     * Create a new ComponentSystem instance.
     *
     * @param {AppBase} app - The application managing this system.
     */
    constructor(app: AppBase);
    /**
     * The id type of the ComponentSystem.
     *
     * @type {string}
     * @readonly
     */
    readonly id: string;
    app: AppBase;
    store: {};
    schema: any[];
    /**
     * Create new {@link Component} and component data instances and attach them to the entity.
     *
     * @param {Entity} entity - The Entity to attach this component to.
     * @param {object} [data] - The source data with which to create the component.
     * @returns {Component} Returns a Component of type defined by the component system.
     * @example
     * const entity = new pc.Entity(app);
     * app.systems.model.addComponent(entity, { type: 'box' });
     * // entity.model is now set to a pc.ModelComponent
     * @ignore
     */
    addComponent(entity: Entity, data?: object): Component;
    /**
     * Remove the {@link Component} from the entity and delete the associated component data.
     *
     * @param {Entity} entity - The entity to remove the component from.
     * @example
     * app.systems.model.removeComponent(entity);
     * // entity.model === undefined
     * @ignore
     */
    removeComponent(entity: Entity): void;
    /**
     * Create a clone of component. This creates a copy of all component data variables.
     *
     * @param {Entity} entity - The entity to clone the component from.
     * @param {Entity} clone - The entity to clone the component into.
     * @returns {Component} The newly cloned component.
     * @ignore
     */
    cloneComponent(entity: Entity, clone: Entity): Component;
    /**
     * Called during {@link ComponentSystem#addComponent} to initialize the component data in the
     * store. This can be overridden by derived Component Systems and either called by the derived
     * System or replaced entirely.
     *
     * @param {Component} component - The component being initialized.
     * @param {object} data - The data block used to initialize the component.
     * @param {Array<string | {name: string, type: string}>} properties - The array of property
     * descriptors for the component. A descriptor can be either a plain property name, or an
     * object specifying the name and type.
     * @ignore
     */
    initializeComponentData(component: Component, data: object, properties: Array<string | {
        name: string;
        type: string;
    }>): void;
    /**
     * Searches the component schema for properties that match the specified type.
     *
     * @param {string} type - The type to search for.
     * @returns {string[]|object[]} An array of property descriptors matching the specified type.
     * @ignore
     */
    getPropertiesOfType(type: string): string[] | object[];
    destroy(): void;
}
import { EventHandler } from '../../core/event-handler.js';
import type { AppBase } from '../app-base.js';
import type { Entity } from '../entity.js';
import type { Component } from './component.js';
