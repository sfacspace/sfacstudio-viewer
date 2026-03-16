/**
 * Manages creation of {@link LayoutChildComponent}s.
 *
 * @category User Interface
 */
export class LayoutChildComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof LayoutChildComponent;
    DataType: typeof LayoutChildComponentData;
    schema: string[];
    initializeComponentData(component: any, data: any, properties: any): void;
    cloneComponent(entity: any, clone: any): Component;
}
import { ComponentSystem } from '../system.js';
import { LayoutChildComponent } from './component.js';
import { LayoutChildComponentData } from './data.js';
import { Component } from '../component.js';
