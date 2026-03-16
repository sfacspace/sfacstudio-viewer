/**
 * Manages creation of {@link SpriteComponent}s.
 *
 * @category Graphics
 */
export class SpriteComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof SpriteComponent;
    DataType: typeof SpriteComponentData;
    schema: string[];
    _defaultTexture: Texture;
    _defaultMaterial: any;
    _default9SlicedMaterialSlicedMode: any;
    _default9SlicedMaterialTiledMode: any;
    set defaultMaterial(material: any);
    get defaultMaterial(): any;
    set default9SlicedMaterialSlicedMode(material: any);
    get default9SlicedMaterialSlicedMode(): any;
    set default9SlicedMaterialTiledMode(material: any);
    get default9SlicedMaterialTiledMode(): any;
    initializeComponentData(component: any, data: any, properties: any): void;
    cloneComponent(entity: any, clone: any): Component;
    onUpdate(dt: any): void;
    onBeforeRemove(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { SpriteComponent } from './component.js';
import { SpriteComponentData } from './data.js';
import { Texture } from '../../../platform/graphics/texture.js';
import { Component } from '../component.js';
