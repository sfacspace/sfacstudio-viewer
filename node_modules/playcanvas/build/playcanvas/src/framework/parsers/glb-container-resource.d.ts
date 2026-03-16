export class GlbContainerResource {
    static createAsset(assetName: any, type: any, resource: any, index: any): Asset;
    static createSceneHierarchy(sceneNodes: any, nodeType: any): any;
    static createModel(glb: any, defaultMaterial: any): Model;
    constructor(data: any, asset: any, assets: any, defaultMaterial: any);
    data: any;
    _model: Asset;
    _assetName: any;
    _assets: any;
    _defaultMaterial: any;
    renders: Asset[];
    materials: Asset[];
    textures: any;
    animations: Asset[];
    get model(): Asset;
    instantiateModelEntity(options: any): Entity;
    instantiateRenderEntity(options: any): any;
    getMaterialVariants(): string[];
    applyMaterialVariant(entity: any, name: any): void;
    applyMaterialVariantInstances(instances: any, name: any): void;
    _applyMaterialVariant(variant: any, instances: any): void;
    destroy(): void;
    assets: any;
}
import { Asset } from '../asset/asset.js';
import { Entity } from '../entity.js';
import { Model } from '../../scene/model.js';
