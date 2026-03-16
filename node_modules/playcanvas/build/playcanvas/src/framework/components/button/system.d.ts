/**
 * Manages creation of {@link ButtonComponent}s.
 *
 * @category User Interface
 */
export class ButtonComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof ButtonComponent;
    DataType: typeof ButtonComponentData;
    schema: (string | {
        name: string;
        type: string;
    })[];
    initializeComponentData(component: any, data: any, properties: any): void;
    onUpdate(dt: any): void;
    _onRemoveComponent(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { ButtonComponent } from './component.js';
import { ButtonComponentData } from './data.js';
