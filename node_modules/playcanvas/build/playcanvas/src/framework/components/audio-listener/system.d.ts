/**
 * Component System for adding and removing {@link AudioListenerComponent} objects to Entities.
 *
 * @category Sound
 */
export class AudioListenerComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof AudioListenerComponent;
    DataType: typeof AudioListenerComponentData;
    schema: string[];
    manager: import("../../../index.js").SoundManager;
    current: any;
    initializeComponentData(component: any, data: any, properties: any): void;
    onUpdate(dt: any): void;
}
import { ComponentSystem } from '../system.js';
import { AudioListenerComponent } from './component.js';
import { AudioListenerComponentData } from './data.js';
