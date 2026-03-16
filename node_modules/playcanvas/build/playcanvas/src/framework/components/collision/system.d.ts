/**
 * Manages creation of {@link CollisionComponent}s.
 *
 * @category Physics
 */
export class CollisionComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof CollisionComponent;
    DataType: typeof CollisionComponentData;
    schema: string[];
    implementations: {};
    _triMeshCache: {};
    initializeComponentData(component: any, _data: any, properties: any): void;
    _createImplementation(type: any): any;
    _getImplementation(entity: any): any;
    cloneComponent(entity: any, clone: any): any;
    onBeforeRemove(entity: any, component: any): void;
    onRemove(entity: any, data: any): void;
    updateCompoundChildTransform(entity: any, forceUpdate: any): void;
    _removeCompoundChild(collision: any, shape: any): void;
    onTransformChanged(component: any, position: any, rotation: any, scale: any): void;
    changeType(component: any, previousType: any, newType: any): void;
    recreatePhysicalShapes(component: any): void;
    _calculateNodeRelativeTransform(node: any, relative: any): void;
    _getNodeScaling(node: any): any;
    _getNodeTransform(node: any, relative: any): any;
}
import { ComponentSystem } from '../system.js';
import { CollisionComponent } from './component.js';
import { CollisionComponentData } from './data.js';
