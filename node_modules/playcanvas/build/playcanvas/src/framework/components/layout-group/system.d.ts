/**
 * Manages creation of {@link LayoutGroupComponent}s.
 *
 * @category User Interface
 */
export class LayoutGroupComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof LayoutGroupComponent;
    DataType: typeof LayoutGroupComponentData;
    schema: string[];
    _reflowQueue: any[];
    initializeComponentData(component: any, data: any, properties: any): void;
    cloneComponent(entity: any, clone: any): Component;
    scheduleReflow(component: any): void;
    _onPostUpdate(): void;
    _processReflowQueue(): void;
    _onRemoveComponent(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { LayoutGroupComponent } from './component.js';
import { LayoutGroupComponentData } from './data.js';
import { Component } from '../component.js';
