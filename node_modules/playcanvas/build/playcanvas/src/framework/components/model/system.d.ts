/**
 * Allows an Entity to render a model or a primitive shape like a box, capsule, sphere, cylinder,
 * cone etc.
 *
 * @category Graphics
 */
export class ModelComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof ModelComponent;
    DataType: typeof ModelComponentData;
    schema: string[];
    defaultMaterial: import("../../../index.js").StandardMaterial;
    initializeComponentData(component: any, _data: any, properties: any): void;
    cloneComponent(entity: any, clone: any): Component;
    onRemove(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { ModelComponent } from './component.js';
import { ModelComponentData } from './data.js';
import { Component } from '../component.js';
