/**
 * Creates and manages {@link ZoneComponent} instances.
 *
 * @ignore
 */
export class ZoneComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof ZoneComponent;
    DataType: typeof ZoneComponentData;
    schema: string[];
    initializeComponentData(component: any, data: any, properties: any): void;
    cloneComponent(entity: any, clone: any): Component;
    _onBeforeRemove(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { ZoneComponent } from './component.js';
import { ZoneComponentData } from './data.js';
import { Component } from '../component.js';
