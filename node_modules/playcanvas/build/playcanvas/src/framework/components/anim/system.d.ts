/**
 * The AnimComponentSystem manages creating and deleting AnimComponents.
 *
 * @category Animation
 */
export class AnimComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof AnimComponent;
    DataType: typeof AnimComponentData;
    schema: string[];
    initializeComponentData(component: any, data: any, properties: any): void;
    onAnimationUpdate(dt: any): void;
    cloneComponent(entity: any, clone: any): Component;
    onBeforeRemove(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { AnimComponent } from './component.js';
import { AnimComponentData } from './data.js';
import { Component } from '../component.js';
