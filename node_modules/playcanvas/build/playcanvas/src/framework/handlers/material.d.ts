/**
 * Resource handler used for loading {@link Material} resources.
 *
 * @category Graphics
 */
export class MaterialHandler extends ResourceHandler {
    /**
     * Create a new MaterialHandler instance.
     *
     * @param {AppBase} app - The running {@link AppBase}.
     * @ignore
     */
    constructor(app: AppBase);
    _assets: import("../asset/asset-registry.js").AssetRegistry;
    _device: import("../../index.js").GraphicsDevice;
    _parser: JsonStandardMaterialParser;
    load(url: any, callback: any): void;
    open(url: any, data: any): import("../../index.js").StandardMaterial;
    patch(asset: any, assets: any): void;
    _onAssetUnload(asset: any): void;
    _assignTexture(parameterName: any, materialAsset: any, texture: any): void;
    _getPlaceholderTexture(parameterName: any): any;
    _assignPlaceholderTexture(parameterName: any, materialAsset: any): void;
    _onTextureLoad(parameterName: any, materialAsset: any, textureAsset: any): void;
    _onTextureAdd(parameterName: any, materialAsset: any, textureAsset: any): void;
    _onTextureRemoveOrUnload(parameterName: any, materialAsset: any, textureAsset: any): void;
    _assignCubemap(parameterName: any, materialAsset: any, textures: any): void;
    _onCubemapLoad(parameterName: any, materialAsset: any, cubemapAsset: any): void;
    _onCubemapAdd(parameterName: any, materialAsset: any, cubemapAsset: any): void;
    _onCubemapRemoveOrUnload(parameterName: any, materialAsset: any, cubemapAsset: any): void;
    _bindAndAssignAssets(materialAsset: any, assets: any): void;
}
import { ResourceHandler } from './handler.js';
import { JsonStandardMaterialParser } from '../parsers/material/json-standard-material.js';
import type { AppBase } from '../app-base.js';
