/**
 * A vertex iterator simplifies the process of writing vertex data to a vertex buffer.
 *
 * @category Graphics
 */
export class VertexIterator {
    /**
     * Create a new VertexIterator instance.
     *
     * @param {VertexBuffer} vertexBuffer - The vertex buffer to be iterated.
     */
    constructor(vertexBuffer: VertexBuffer);
    vertexBuffer: VertexBuffer;
    vertexFormatSize: number;
    buffer: ArrayBuffer;
    accessors: VertexIteratorAccessor[];
    /**
     * The vertex buffer elements.
     *
     * @type {Object<string, VertexIteratorAccessor>}
     */
    element: {
        [x: string]: VertexIteratorAccessor;
    };
    /**
     * Moves the vertex iterator on to the next vertex.
     *
     * @param {number} [count] - Number of steps to move on when calling next. Defaults to 1.
     * @example
     * const iterator = new pc.VertexIterator(vertexBuffer);
     * iterator.element[pc.SEMANTIC_POSITION].set(-0.9, -0.9, 0.0);
     * iterator.element[pc.SEMANTIC_COLOR].set(255, 0, 0, 255);
     * iterator.next();
     * iterator.element[pc.SEMANTIC_POSITION].set(0.9, -0.9, 0.0);
     * iterator.element[pc.SEMANTIC_COLOR].set(0, 255, 0, 255);
     * iterator.next();
     * iterator.element[pc.SEMANTIC_POSITION].set(0.0, 0.9, 0.0);
     * iterator.element[pc.SEMANTIC_COLOR].set(0, 0, 255, 255);
     * iterator.end();
     */
    next(count?: number): void;
    /**
     * Notifies the vertex buffer being iterated that writes are complete. Internally the vertex
     * buffer is unlocked and vertex data is uploaded to video memory.
     *
     * @example
     * const iterator = new pc.VertexIterator(vertexBuffer);
     * iterator.element[pc.SEMANTIC_POSITION].set(-0.9, -0.9, 0.0);
     * iterator.element[pc.SEMANTIC_COLOR].set(255, 0, 0, 255);
     * iterator.next();
     * iterator.element[pc.SEMANTIC_POSITION].set(0.9, -0.9, 0.0);
     * iterator.element[pc.SEMANTIC_COLOR].set(0, 255, 0, 255);
     * iterator.next();
     * iterator.element[pc.SEMANTIC_POSITION].set(0.0, 0.9, 0.0);
     * iterator.element[pc.SEMANTIC_COLOR].set(0, 0, 255, 255);
     * iterator.end();
     */
    end(): void;
    /**
     * Copies data for specified semantic into vertex buffer. Works with both interleaved (slower)
     * and non-interleaved (fast) vertex buffers.
     *
     * @param {string} semantic - The semantic of the vertex element to set.
     * @param {number[]|ArrayBufferView} data - The data to set.
     * @param {number} numVertices - The number of vertices to write.
     * @ignore
     */
    writeData(semantic: string, data: number[] | ArrayBufferView, numVertices: number): void;
    /**
     * Function to extract elements of a specified semantic from vertex buffer into flat array
     * (data). Works with both interleaved (slower) and non-interleaved (fast) vertex buffers.
     * Returns number of vertices. Note: when data is a typed array and is smaller than needed,
     * only part of the data gets copied out (typed arrays ignore read/write out of range).
     *
     * @param {string} semantic - The semantic of the vertex element to read.
     * @param {number[]|ArrayBufferView} data - The array to receive the data.
     * @returns {number} The number of vertices read.
     * @ignore
     */
    readData(semantic: string, data: number[] | ArrayBufferView): number;
}
import type { VertexBuffer } from './vertex-buffer.js';
/**
 * Helps with accessing a specific vertex attribute.
 *
 * @category Graphics
 * @ignore
 */
declare class VertexIteratorAccessor {
    /**
     * Create a new VertexIteratorAccessor instance.
     *
     * @param {ArrayBuffer} buffer - The vertex buffer containing the attribute to be accessed.
     * @param {object} vertexElement - The vertex attribute to be accessed.
     * @param {string} vertexElement.name - The meaning of the vertex element. This is used to link
     * the vertex data to a shader input. Can be:
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
     * @param {number} vertexElement.numComponents - The number of components of the vertex
     * attribute. Can be 1, 2, 3 or 4.
     * @param {number} vertexElement.dataType - The data type of the attribute. Can be:
     *
     * - {@link TYPE_INT8}
     * - {@link TYPE_UINT8}
     * - {@link TYPE_INT16}
     * - {@link TYPE_UINT16}
     * - {@link TYPE_INT32}
     * - {@link TYPE_UINT32}
     * - {@link TYPE_FLOAT32}
     * @param {boolean} vertexElement.normalize - If true, vertex attribute data will be mapped
     * from a 0 to 255 range down to 0 to 1 when fed to a shader. If false, vertex attribute data
     * is left unchanged. If this property is unspecified, false is assumed.
     * @param {number} vertexElement.offset - The number of initial bytes at the start of a vertex
     * that are not relevant to this attribute.
     * @param {number} vertexElement.stride - The number of total bytes that are between the start
     * of one vertex, and the start of the next.
     * @param {ScopeId} vertexElement.scopeId - The shader input variable corresponding to the
     * attribute.
     * @param {number} vertexElement.size - The size of the attribute in bytes.
     * @param {VertexFormat} vertexFormat - A vertex format that defines the layout of vertex data
     * inside the buffer.
     */
    constructor(buffer: ArrayBuffer, vertexElement: {
        name: string;
        numComponents: number;
        dataType: number;
        normalize: boolean;
        offset: number;
        stride: number;
        scopeId: ScopeId;
        size: number;
    }, vertexFormat: VertexFormat);
    index: number;
    numComponents: number;
    array: Int8Array<ArrayBuffer> | Uint8Array<ArrayBuffer> | Int16Array<ArrayBuffer> | Uint16Array<ArrayBuffer> | Int32Array<ArrayBuffer> | Uint32Array<ArrayBuffer> | Float32Array<ArrayBuffer>;
    stride: number;
    /**
     * Set all the attribute components at the iterator's current index.
     *
     * @param {number} a - The first component value.
     * @param {number} [b] - The second component value (if applicable).
     * @param {number} [c] - The third component value (if applicable).
     * @param {number} [d] - The fourth component value (if applicable).
     */
    set(a: number, b?: number, c?: number, d?: number): void;
    /**
     * Read attribute components to an output array.
     *
     * @param {number} offset - The component offset at which to read data from the buffer. Will be
     * used instead of the iterator's current index.
     * @param {number[]|ArrayBufferView} outputArray - The output array to write data into.
     * @param {number} outputIndex - The output index at which to write into the output array.
     */
    getToArray(offset: number, outputArray: number[] | ArrayBufferView, outputIndex: number): void;
    /**
     * Write attribute components from an input array.
     *
     * @param {number} index - The starting index at which to write data into the buffer. Will be
     * used instead of the iterator's current index.
     * @param {number[]|ArrayBufferView} inputArray - The input array to read data from.
     * @param {number} inputIndex - The input index at which to read from the input array.
     */
    setFromArray(index: number, inputArray: number[] | ArrayBufferView, inputIndex: number): void;
    /**
     * Get a attribute component at the iterator's current index.
     *
     * @param {number} offset - The component offset. Should be either 0, 1, 2, or 3.
     * @returns {number} The value of a attribute component.
     */
    get(offset: number): number;
}
import type { ScopeId } from './scope-id.js';
import type { VertexFormat } from './vertex-format.js';
export {};
