/**
 * Manages creation of {@link ScrollViewComponent}s.
 *
 * @category User Interface
 */
export class ScrollViewComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof ScrollViewComponent;
    DataType: typeof ScrollViewComponentData;
    schema: {
        name: string;
        type: string;
    }[];
    initializeComponentData(component: any, data: any, properties: any): void;
    onUpdate(dt: any): void;
    _onRemoveComponent(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { ScrollViewComponent } from './component.js';
import { ScrollViewComponentData } from './data.js';
