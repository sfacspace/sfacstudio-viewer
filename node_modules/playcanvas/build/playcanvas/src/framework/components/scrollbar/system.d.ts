/**
 * Manages creation of {@link ScrollbarComponent}s.
 *
 * @category User Interface
 */
export class ScrollbarComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof ScrollbarComponent;
    DataType: typeof ScrollbarComponentData;
    schema: {
        name: string;
        type: string;
    }[];
    initializeComponentData(component: any, data: any, properties: any): void;
    _onAddComponent(entity: any): void;
    _onRemoveComponent(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { ScrollbarComponent } from './component.js';
import { ScrollbarComponentData } from './data.js';
