export class JsonModelParser {
    constructor(modelHandler: any);
    _device: any;
    _defaultMaterial: any;
    parse(data: any, callback: any): void;
    _parseNodes(data: any): GraphNode[];
    _parseSkins(data: any, nodes: any): {
        skins: Skin[];
        instances: SkinInstance[];
    };
    _getMorphVertexCount(modelData: any, morphIndex: any, vertexBuffers: any): any;
    _parseMorphs(data: any, nodes: any, vertexBuffers: any): {
        morphs: Morph[];
        instances: MorphInstance[];
    };
    _parseVertexBuffers(data: any): VertexBuffer[];
    _parseIndexBuffers(data: any, vertexBuffers: any): {
        buffer: IndexBuffer;
        data: Uint16Array<ArrayBuffer> | Uint32Array<ArrayBuffer>;
    };
    _parseMeshes(data: any, skins: any, morphs: any, vertexBuffers: any, indexBuffer: any, indexData: any): Mesh[];
    _parseMeshInstances(data: any, nodes: any, meshes: any, skins: any, skinInstances: any, morphs: any, morphInstances: any): MeshInstance[];
}
import { GraphNode } from '../../scene/graph-node.js';
import { Skin } from '../../scene/skin.js';
import { SkinInstance } from '../../scene/skin-instance.js';
import { Morph } from '../../scene/morph.js';
import { MorphInstance } from '../../scene/morph-instance.js';
import { VertexBuffer } from '../../platform/graphics/vertex-buffer.js';
import { IndexBuffer } from '../../platform/graphics/index-buffer.js';
import { Mesh } from '../../scene/mesh.js';
import { MeshInstance } from '../../scene/mesh-instance.js';
