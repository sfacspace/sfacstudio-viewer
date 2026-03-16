/**
 * Creates and manages physics joint components.
 *
 * @ignore
 */
export class JointComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof JointComponent;
    DataType: typeof JointComponentData;
    schema: string[];
    initializeComponentData(component: any, data: any, properties: any): void;
}
import { ComponentSystem } from '../system.js';
import { JointComponent } from './component.js';
import { JointComponentData } from './data.js';
