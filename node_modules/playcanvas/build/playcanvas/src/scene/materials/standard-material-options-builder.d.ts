export class StandardMaterialOptionsBuilder {
    _mapXForms: any[];
    updateMinRef(options: any, scene: any, stdMat: any, objDefs: any, pass: any, sortedLights: any): void;
    updateRef(options: any, scene: any, cameraShaderParams: any, stdMat: any, objDefs: any, pass: any, sortedLights: any): void;
    _updateSharedOptions(options: any, scene: any, stdMat: any, objDefs: any, pass: any): void;
    _updateUVOptions(options: any, stdMat: any, objDefs: any, minimalOptions: any, cameraShaderParams: any): void;
    _updateTexOptions(options: any, stdMat: any, p: any, hasUv0: any, hasUv1: any, hasVcolor: any, minimalOptions: any, uniqueTextureMap: any): void;
    _updateMinOptions(options: any, stdMat: any, pass: any): void;
    _updateMaterialOptions(options: any, stdMat: any, scene: any): void;
    _updateEnvOptions(options: any, stdMat: any, scene: any, cameraShaderParams: any): void;
    _updateLightOptions(options: any, scene: any, stdMat: any, objDefs: any, sortedLights: any): void;
    _getMapTransformID(xform: any, uv: any): any;
}
