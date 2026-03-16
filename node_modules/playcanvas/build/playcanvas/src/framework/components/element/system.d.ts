/**
 * Manages creation of {@link ElementComponent}s.
 *
 * @category User Interface
 */
export class ElementComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof ElementComponent;
    DataType: typeof ElementComponentData;
    schema: string[];
    _unicodeConverter: any;
    _rtlReorder: any;
    _defaultTexture: Texture;
    defaultImageMaterial: StandardMaterial;
    defaultImage9SlicedMaterial: StandardMaterial;
    defaultImage9TiledMaterial: StandardMaterial;
    defaultImageMaskMaterial: StandardMaterial;
    defaultImage9SlicedMaskMaterial: StandardMaterial;
    defaultImage9TiledMaskMaterial: StandardMaterial;
    defaultScreenSpaceImageMaterial: StandardMaterial;
    defaultScreenSpaceImage9SlicedMaterial: StandardMaterial;
    defaultScreenSpaceImage9TiledMaterial: StandardMaterial;
    defaultScreenSpaceImageMask9SlicedMaterial: StandardMaterial;
    defaultScreenSpaceImageMask9TiledMaterial: StandardMaterial;
    defaultScreenSpaceImageMaskMaterial: StandardMaterial;
    _defaultTextMaterials: {};
    defaultImageMaterials: any[];
    initializeComponentData(component: any, data: any, properties: any): void;
    onAddComponent(entity: any, component: any): void;
    onRemoveComponent(entity: any, component: any): void;
    cloneComponent(entity: any, clone: any): import("../component.js").Component;
    getTextElementMaterial(screenSpace: any, msdf: any, textAttibutes: any): any;
    _createBaseImageMaterial(): StandardMaterial;
    getImageElementMaterial(screenSpace: any, mask: any, nineSliced: any, nineSliceTiled: any): StandardMaterial;
    registerUnicodeConverter(func: any): void;
    registerRtlReorder(func: any): void;
    getUnicodeConverter(): any;
    getRtlReorder(): any;
}
import { ComponentSystem } from '../system.js';
import { ElementComponent } from './component.js';
import { ElementComponentData } from './data.js';
import { Texture } from '../../../platform/graphics/texture.js';
import { StandardMaterial } from '../../../scene/materials/standard-material.js';
