/**
 * @import { Entity } from '../../entity.js'
 * @import { ZoneComponentSystem } from './system.js'
 */
/**
 * The ZoneComponent allows you to define an area in world space of certain size. This can be used
 * in various ways, such as affecting audio reverb when {@link AudioListenerComponent} is within
 * zone. Or create culling system with portals between zones to hide whole indoor sections for
 * performance reasons. And many other possible options. Zones are building blocks and meant to be
 * used in many different ways.
 *
 * @ignore
 */
export class ZoneComponent extends Component {
    /**
     * Fired when the zone component is enabled. This event does not take into account the enabled
     * state of the entity or any of its ancestors.
     *
     * @event
     * @example
     * entity.zone.on('enable', () => {
     *     console.log(`Zone component of entity '${entity.name}' has been enabled`);
     * });
     */
    static EVENT_ENABLE: string;
    /**
     * Fired when the zone component is disabled. This event does not take into account the enabled
     * state of the entity or any of its ancestors.
     *
     * @event
     * @example
     * entity.zone.on('disable', () => {
     *     console.log(`Zone component of entity '${entity.name}' has been disabled`);
     * });
     */
    static EVENT_DISABLE: string;
    /**
     * Fired when the enabled state of the zone component changes. This event does not take into
     * account the enabled state of the entity or any of its ancestors.
     *
     * @event
     * @example
     * entity.zone.on('state', (enabled) => {
     *     console.log(`Zone component of entity '${entity.name}' has been ${enabled ? 'enabled' : 'disabled'}`);
     * });
     */
    static EVENT_STATE: string;
    /**
     * Fired when a zone component is removed from an entity.
     *
     * @event
     * @example
     * entity.zone.on('remove', () => {
     *     console.log(`Zone component removed from entity '${entity.name}'`);
     * });
     */
    static EVENT_REMOVE: string;
    /**
     * Create a new ZoneComponent instance.
     *
     * @param {ZoneComponentSystem} system - The ComponentSystem that created this Component.
     * @param {Entity} entity - The Entity that this Component is attached to.
     */
    constructor(system: ZoneComponentSystem, entity: Entity);
    _oldState: boolean;
    _size: Vec3;
    /**
     * The size of the axis-aligned box of this ZoneComponent.
     *
     * @type {Vec3}
     */
    set size(data: Vec3);
    get size(): Vec3;
    _onSetEnabled(prop: any, old: any, value: any): void;
    _checkState(): void;
    _onBeforeRemove(): void;
}
import { Component } from '../component.js';
import { Vec3 } from '../../../core/math/vec3.js';
import type { ZoneComponentSystem } from './system.js';
import type { Entity } from '../../entity.js';
