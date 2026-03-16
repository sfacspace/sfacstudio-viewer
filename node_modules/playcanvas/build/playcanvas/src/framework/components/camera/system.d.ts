/**
 * Used to add and remove {@link CameraComponent}s from Entities. It also holds an array of all
 * active cameras.
 *
 * @category Graphics
 */
export class CameraComponentSystem extends ComponentSystem {
    /**
     * Holds all the active camera components.
     *
     * @type {CameraComponent[]}
     */
    cameras: CameraComponent[];
    id: string;
    ComponentType: typeof CameraComponent;
    DataType: typeof CameraComponentData;
    schema: string[];
    initializeComponentData(component: any, data: any, properties: any): void;
    cloneComponent(entity: any, clone: any): Component;
    onBeforeRemove(entity: any, component: any): void;
    onAppPrerender(): void;
    addCamera(camera: any): void;
    removeCamera(camera: any): void;
}
import { ComponentSystem } from '../system.js';
import { CameraComponent } from './component.js';
import { CameraComponentData } from './data.js';
import { Component } from '../component.js';
