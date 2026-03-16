export class BakeLightSimple extends BakeLight {
    constructor(lightmapper: any, light: any);
    get numVirtualLights(): any;
    prepareVirtualLight(index: any, numVirtualLights: any): void;
}
import { BakeLight } from './bake-light.js';
