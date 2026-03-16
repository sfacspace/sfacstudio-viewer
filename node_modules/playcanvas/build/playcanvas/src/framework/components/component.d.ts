/**
 * @import { ComponentSystem } from './system.js'
 * @import { Entity } from '../entity.js'
 */
/**
 * Components are used to attach functionality on a {@link Entity}. Components can receive update
 * events each frame, and expose properties to the PlayCanvas Editor.
 *
 * @hideconstructor
 */
export class Component extends EventHandler {
    /**
     * Component order. When an entity with multiple components gets enabled, this order specifies
     * in which order the components get enabled. The lowest number gets enabled first.
     *
     * @type {number} - Component order number.
     * @private
     */
    private static order;
    /** @ignore */
    static _buildAccessors(obj: any, schema: any): void;
    /**
     * Base constructor for a Component.
     *
     * @param {ComponentSystem} system - The ComponentSystem used to create this component.
     * @param {Entity} entity - The Entity that this Component is attached to.
     */
    constructor(system: ComponentSystem, entity: Entity);
    /**
     * The ComponentSystem used to create this Component.
     *
     * @type {ComponentSystem}
     */
    system: ComponentSystem;
    /**
     * The Entity that this Component is attached to.
     *
     * @type {Entity}
     */
    entity: Entity;
    /** @ignore */
    buildAccessors(schema: any): void;
    /** @ignore */
    onSetEnabled(name: any, oldValue: any, newValue: any): void;
    /** @ignore */
    onEnable(): void;
    /** @ignore */
    onDisable(): void;
    /** @ignore */
    onPostStateChange(): void;
    /**
     * Access the component data directly. Usually you should access the data properties via the
     * individual properties as modifying this data directly will not fire 'set' events.
     *
     * @type {*}
     * @ignore
     */
    get data(): any;
    /**
     * Sets the enabled state of the component.
     *
     * @type {boolean}
     */
    set enabled(arg: boolean);
    /**
     * Gets the enabled state of the component.
     *
     * @type {boolean}
     */
    get enabled(): boolean;
}
import { EventHandler } from '../../core/event-handler.js';
import type { ComponentSystem } from './system.js';
import type { Entity } from '../entity.js';
