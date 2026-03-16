export class BakeLight {
    constructor(scene: any, light: any, lightingParams: any);
    scene: any;
    light: any;
    lightBounds: BoundingBox;
    store(): void;
    mask: any;
    shadowUpdateMode: any;
    enabled: any;
    intensity: any;
    rotation: any;
    numCascades: any;
    castShadows: any;
    restore(): void;
    startBake(): void;
    endBake(shadowMapCache: any): void;
}
import { BoundingBox } from '../../core/shape/bounding-box.js';
