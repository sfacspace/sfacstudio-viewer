export class WebgpuVertexBufferLayout {
    /**
     * @type {Map<string, GPUVertexBufferLayout[]>}
     * @private
     */
    private cache;
    /**
     * Obtain a vertex layout of one or two vertex formats.
     *
     * @param {VertexFormat} vertexFormat0 - The first vertex format.
     * @param {VertexFormat} [vertexFormat1] - The second vertex format.
     * @returns {any[]} - The vertex layout.
     */
    get(vertexFormat0: VertexFormat, vertexFormat1?: VertexFormat): any[];
    getKey(vertexFormat0: any, vertexFormat1?: any): string;
    /**
     * @param {VertexFormat} vertexFormat0 - The first vertex format.
     * @param {VertexFormat} vertexFormat1 - The second vertex format.
     * @returns {any[]} - The vertex buffer layout.
     */
    create(vertexFormat0: VertexFormat, vertexFormat1: VertexFormat): any[];
}
import type { VertexFormat } from '../vertex-format.js';
