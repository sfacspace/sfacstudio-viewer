/**
 * @import { AppBase } from '../../app-base.js'
 */
/**
 * A Light Component is used to dynamically light the scene.
 *
 * @category Graphics
 */
export class LightComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof LightComponent;
    DataType: typeof LightComponentData;
    initializeComponentData(component: any, _data: any): void;
    _onRemoveComponent(entity: any, component: any): void;
    cloneComponent(entity: any, clone: any): import("../component.js").Component;
    changeType(component: any, oldValue: any, newValue: any): void;
}
import { ComponentSystem } from '../system.js';
import { LightComponent } from './component.js';
import { LightComponentData } from './data.js';
