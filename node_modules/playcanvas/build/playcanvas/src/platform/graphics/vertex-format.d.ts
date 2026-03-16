/**
 * A vertex format is a descriptor that defines the layout of vertex data inside a
 * {@link VertexBuffer}.
 *
 * @property {object[]} elements The vertex attribute elements.
 * @property {string} elements[].name The meaning of the vertex element. This is used to link the
 * vertex data to a shader input. Can be:
 *
 * - {@link SEMANTIC_POSITION}
 * - {@link SEMANTIC_NORMAL}
 * - {@link SEMANTIC_TANGENT}
 * - {@link SEMANTIC_BLENDWEIGHT}
 * - {@link SEMANTIC_BLENDINDICES}
 * - {@link SEMANTIC_COLOR}
 * - {@link SEMANTIC_TEXCOORD0}
 * - {@link SEMANTIC_TEXCOORD1}
 * - {@link SEMANTIC_TEXCOORD2}
 * - {@link SEMANTIC_TEXCOORD3}
 * - {@link SEMANTIC_TEXCOORD4}
 * - {@link SEMANTIC_TEXCOORD5}
 * - {@link SEMANTIC_TEXCOORD6}
 * - {@link SEMANTIC_TEXCOORD7}
 *
 * If vertex data has a meaning other that one of those listed above, use the user-defined
 * semantics: {@link SEMANTIC_ATTR0} to {@link SEMANTIC_ATTR15}.
 * @property {number} elements[].numComponents The number of components of the vertex attribute.
 * Can be 1, 2, 3 or 4.
 * @property {number} elements[].dataType The data type of the attribute. Can be:
 *
 * - {@link TYPE_INT8}
 * - {@link TYPE_UINT8}
 * - {@link TYPE_INT16}
 * - {@link TYPE_UINT16}
 * - {@link TYPE_INT32}
 * - {@link TYPE_UINT32}
 * - {@link TYPE_FLOAT32}
 * - {@link TYPE_FLOAT16}
 * @property {boolean} elements[].normalize If true, vertex attribute data will be mapped from a 0
 * to 255 range down to 0 to 1 when fed to a shader. If false, vertex attribute data is left
 * unchanged. If this property is unspecified, false is assumed.
 * @property {number} elements[].offset The number of initial bytes at the start of a vertex that
 * are not relevant to this attribute.
 * @property {number} elements[].stride The number of total bytes that are between the start of one
 * vertex, and the start of the next.
 * @property {number} elements[].size The size of the attribute in bytes.
 * @category Graphics
 */
export class VertexFormat {
    /**
     * The {@link VertexFormat} used to store matrices of type {@link Mat4} for hardware instancing.
     *
     * @param {GraphicsDevice} graphicsDevice - The graphics device used to create this vertex
     * format.
     * @returns {VertexFormat} The default instancing vertex format.
     */
    static getDefaultInstancingFormat(graphicsDevice: GraphicsDevice): VertexFormat;
    static isElementValid(graphicsDevice: any, elementDesc: any): boolean;
    /**
     * @typedef {object} AttributeDescription
     * @property {string} semantic - The meaning of the vertex element. This is used to
     * link the vertex data to a shader input. Can be:
     *
     * - {@link SEMANTIC_POSITION}
     * - {@link SEMANTIC_NORMAL}
     * - {@link SEMANTIC_TANGENT}
     * - {@link SEMANTIC_BLENDWEIGHT}
     * - {@link SEMANTIC_BLENDINDICES}
     * - {@link SEMANTIC_COLOR}
     * - {@link SEMANTIC_TEXCOORD0}
     * - {@link SEMANTIC_TEXCOORD1}
     * - {@link SEMANTIC_TEXCOORD2}
     * - {@link SEMANTIC_TEXCOORD3}
     * - {@link SEMANTIC_TEXCOORD4}
     * - {@link SEMANTIC_TEXCOORD5}
     * - {@link SEMANTIC_TEXCOORD6}
     * - {@link SEMANTIC_TEXCOORD7}
     *
     * If vertex data has a meaning other that one of those listed above, use the user-defined
     * semantics: {@link SEMANTIC_ATTR0} to {@link SEMANTIC_ATTR15}.
     * @property {number} components - The number of components of the vertex attribute.
     * Can be 1, 2, 3 or 4.
     * @property {number} type - The data type of the attribute. Can be:
     *
     * - {@link TYPE_INT8}
     * - {@link TYPE_UINT8}
     * - {@link TYPE_INT16}
     * - {@link TYPE_UINT16}
     * - {@link TYPE_INT32}
     * - {@link TYPE_UINT32}
     * - {@link TYPE_FLOAT16}
     * - {@link TYPE_FLOAT32}
     *
     * @property {boolean} [normalize] - If true, vertex attribute data will be mapped
     * from a 0 to 255 range down to 0 to 1 when fed to a shader. If false, vertex attribute data
     * is left unchanged. If this property is unspecified, false is assumed. This property is
     * ignored when asInt is true.
     * @property {boolean} [asInt] - If true, vertex attribute data will be accessible
     * as integer numbers in shader code. Defaults to false, which means that vertex attribute data
     * will be accessible as floating point numbers. Can be only used with INT and UINT data types.
     */
    /**
     * Create a new VertexFormat instance.
     *
     * @param {GraphicsDevice} graphicsDevice - The graphics device used to manage this vertex
     * format.
     * @param {AttributeDescription[]} description - An array of vertex attribute descriptions.
     * @param {number} [vertexCount] - When specified, vertex format will be set up for
     * non-interleaved format with a specified number of vertices. (example: PPPPNNNNCCCC), where
     * arrays of individual attributes will be stored one right after the other (subject to
     * alignment requirements). Note that in this case, the format depends on the number of
     * vertices, and needs to change when the number of vertices changes. When not specified,
     * vertex format will be interleaved. (example: PNCPNCPNCPNC).
     * @example
     * // Specify 3-component positions (x, y, z)
     * const vertexFormat = new pc.VertexFormat(graphicsDevice, [
     *     { semantic: pc.SEMANTIC_POSITION, components: 3, type: pc.TYPE_FLOAT32 }
     * ]);
     * @example
     * // Specify 2-component positions (x, y), a texture coordinate (u, v) and a vertex color (r, g, b, a)
     * const vertexFormat = new pc.VertexFormat(graphicsDevice, [
     *     { semantic: pc.SEMANTIC_POSITION, components: 2, type: pc.TYPE_FLOAT32 },
     *     { semantic: pc.SEMANTIC_TEXCOORD0, components: 2, type: pc.TYPE_FLOAT32 },
     *     { semantic: pc.SEMANTIC_COLOR, components: 4, type: pc.TYPE_UINT8, normalize: true }
     * ]);
     */
    constructor(graphicsDevice: GraphicsDevice, description: {
        /**
         * - The meaning of the vertex element. This is used to
         * link the vertex data to a shader input. Can be:
         *
         * - {@link SEMANTIC_POSITION}
         * - {@link SEMANTIC_NORMAL}
         * - {@link SEMANTIC_TANGENT}
         * - {@link SEMANTIC_BLENDWEIGHT}
         * - {@link SEMANTIC_BLENDINDICES}
         * - {@link SEMANTIC_COLOR}
         * - {@link SEMANTIC_TEXCOORD0}
         * - {@link SEMANTIC_TEXCOORD1}
         * - {@link SEMANTIC_TEXCOORD2}
         * - {@link SEMANTIC_TEXCOORD3}
         * - {@link SEMANTIC_TEXCOORD4}
         * - {@link SEMANTIC_TEXCOORD5}
         * - {@link SEMANTIC_TEXCOORD6}
         * - {@link SEMANTIC_TEXCOORD7}
         *
         * If vertex data has a meaning other that one of those listed above, use the user-defined
         * semantics: {@link SEMANTIC_ATTR0} to {@link SEMANTIC_ATTR15}.
         */
        semantic: string;
        /**
         * - The number of components of the vertex attribute.
         * Can be 1, 2, 3 or 4.
         */
        components: number;
        /**
         * - The data type of the attribute. Can be:
         *
         * - {@link TYPE_INT8}
         * - {@link TYPE_UINT8}
         * - {@link TYPE_INT16}
         * - {@link TYPE_UINT16}
         * - {@link TYPE_INT32}
         * - {@link TYPE_UINT32}
         * - {@link TYPE_FLOAT16}
         * - {@link TYPE_FLOAT32}
         */
        type: number;
        /**
         * - If true, vertex attribute data will be mapped
         * from a 0 to 255 range down to 0 to 1 when fed to a shader. If false, vertex attribute data
         * is left unchanged. If this property is unspecified, false is assumed. This property is
         * ignored when asInt is true.
         */
        normalize?: boolean;
        /**
         * - If true, vertex attribute data will be accessible
         * as integer numbers in shader code. Defaults to false, which means that vertex attribute data
         * will be accessible as floating point numbers. Can be only used with INT and UINT data types.
         */
        asInt?: boolean;
    }[], vertexCount?: number);
    device: GraphicsDevice;
    _elements: {
        name: string;
        offset: any;
        stride: any;
        dataType: number;
        numComponents: number;
        normalize: boolean;
        size: number;
        asInt: boolean;
    }[];
    hasUv0: boolean;
    hasUv1: boolean;
    hasColor: boolean;
    hasTangents: boolean;
    verticesByteSize: number;
    vertexCount: number;
    interleaved: boolean;
    instancing: boolean;
    size: number;
    get elements(): {
        name: string;
        offset: any;
        stride: any;
        dataType: number;
        numComponents: number;
        normalize: boolean;
        size: number;
        asInt: boolean;
    }[];
    /**
     * Applies any changes made to the VertexFormat's properties.
     *
     * @private
     */
    private update;
    /**
     * Evaluates hash values for the format allowing fast compare of batching / rendering compatibility.
     *
     * @private
     */
    private _evaluateHash;
    batchingHash: number;
    shaderProcessingHashString: string;
    renderingHashString: string;
    renderingHash: number;
}
import type { GraphicsDevice } from './graphics-device.js';
