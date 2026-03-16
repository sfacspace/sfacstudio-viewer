export class Render2d {
    constructor(device: any, maxQuads?: number);
    device: any;
    maxQuads: number;
    buffer: VertexBuffer;
    data: Float32Array<ArrayBuffer>;
    indexBuffer: IndexBuffer;
    prim: {
        type: number;
        indexed: boolean;
        base: number;
        baseVertex: number;
        count: number;
    };
    quads: number;
    mesh: Mesh;
    material: ShaderMaterial;
    meshInstance: MeshInstance;
    uniforms: {
        clr: Float32Array<ArrayBuffer>;
    };
    targetSize: {
        width: any;
        height: any;
    };
    quad(x: any, y: any, w: any, h: any, u: any, v: any, uw: any, uh: any, texture: any, wordFlag?: number): void;
    startFrame(): void;
    render(app: any, layer: any, graphTexture: any, wordsTexture: any, clr: any, height: any): void;
}
import { VertexBuffer } from '../../platform/graphics/vertex-buffer.js';
import { IndexBuffer } from '../../platform/graphics/index-buffer.js';
import { Mesh } from '../../scene/mesh.js';
import { ShaderMaterial } from '../../scene/materials/shader-material.js';
import { MeshInstance } from '../../scene/mesh-instance.js';
