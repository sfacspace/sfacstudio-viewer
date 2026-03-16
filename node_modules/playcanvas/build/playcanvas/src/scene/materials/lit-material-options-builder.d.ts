export class LitMaterialOptionsBuilder {
    static update(litOptions: any, material: any, scene: any, renderParams: any, objDefs: any, pass: any, sortedLights: any): void;
    static updateSharedOptions(litOptions: any, material: any, scene: any, objDefs: any, pass: any): void;
    static updateMaterialOptions(litOptions: any, material: any): void;
    static updateEnvOptions(litOptions: any, material: any, scene: any, renderParams: any): void;
    static updateLightingOptions(litOptions: any, material: any, scene: any, objDefs: any, sortedLights: any): void;
    static collectLights(lType: any, lights: any, lightsFiltered: any, mask: any): void;
}
