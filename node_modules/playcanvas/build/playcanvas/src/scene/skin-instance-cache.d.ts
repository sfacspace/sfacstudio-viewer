export class SkinInstanceCache {
    static _skinInstanceCache: Map<any, any>;
    static logCachedSkinInstances(): void;
    static createCachedSkinInstance(skin: any, rootBone: any, entity: any): any;
    static getCachedSkinInstance(skin: any, rootBone: any): any;
    static addCachedSkinInstance(skin: any, rootBone: any, skinInstance: any): void;
    static removeCachedSkinInstance(skinInstance: any): void;
}
