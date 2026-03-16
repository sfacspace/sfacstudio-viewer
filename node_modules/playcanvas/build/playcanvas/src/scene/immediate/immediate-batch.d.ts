export class ImmediateBatch {
    constructor(device: any, material: any, layer: any);
    material: any;
    layer: any;
    positions: any[];
    colors: any[];
    mesh: Mesh;
    meshInstance: MeshInstance;
    addLines(positions: any, color: any): void;
    addLinesArrays(positions: any, color: any): void;
    onPreRender(visibleList: any, transparent: any): void;
    clear(): void;
}
import { Mesh } from '../mesh.js';
import { MeshInstance } from '../mesh-instance.js';
