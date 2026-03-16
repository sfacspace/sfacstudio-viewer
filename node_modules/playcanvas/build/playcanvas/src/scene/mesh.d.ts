/**
 * A graphical primitive. The mesh is defined by a {@link VertexBuffer} and an optional
 * {@link IndexBuffer}. It also contains a primitive definition which controls the type of the
 * primitive and the portion of the vertex or index buffer to use.
 *
 * ## Mesh APIs
 * There are two ways a mesh can be generated or updated.
 *
 * ### Simple Mesh API
 * {@link Mesh} class provides interfaces such as {@link Mesh#setPositions} and {@link Mesh#setUvs}
 * that provide a simple way to provide vertex and index data for the Mesh, and hiding the
 * complexity of creating the {@link VertexFormat}. This is the recommended interface to use.
 *
 * A simple example which creates a Mesh with 3 vertices, containing position coordinates only, to
 * form a single triangle.
 *
 * ```javascript
 * const mesh = new pc.Mesh(device);
 * const positions = [
 *     0, 0, 0, // pos 0
 *     1, 0, 0, // pos 1
 *     1, 1, 0  // pos 2
 * ];
 * mesh.setPositions(positions);
 * mesh.update();
 * ```
 *
 * An example which creates a Mesh with 4 vertices, containing position and uv coordinates in
 * channel 0, and an index buffer to form two triangles. Float32Array is used for positions and uvs.
 *
 * ```javascript
 * const mesh = new pc.Mesh(device);
 * const positions = new Float32Array([
 *     0, 0, 0, // pos 0
 *     1, 0, 0, // pos 1
 *     1, 1, 0, // pos 2
 *     0, 1, 0  // pos 3
 * ]);
 * const uvs = new Float32Array([
 *     0, 1  // uv 3
 *     1, 1, // uv 2
 *     1, 0, // uv 1
 *     0, 0, // uv 0
 * ]);
 * const indices = [
 *     0, 1, 2, // triangle 0
 *     0, 2, 3  // triangle 1
 * ];
 * mesh.setPositions(positions);
 * mesh.setNormals(pc.calculateNormals(positions, indices));
 * mesh.setUvs(0, uvs);
 * mesh.setIndices(indices);
 * mesh.update();
 * ```
 *
 * This example demonstrates that vertex attributes such as position and normals, and also indices
 * can be provided using Arrays ([]) and also Typed Arrays (Float32Array and similar). Note that
 * typed arrays have higher performance, and are generally recommended for per-frame operations or
 * larger meshes, but their construction using new operator is costly operation. If you only need
 * to operate on a small number of vertices or indices, consider using Arrays to avoid the overhead
 * associated with allocating Typed Arrays.
 *
 * Follow these links for more complex examples showing the functionality.
 *
 * - {@link https://playcanvas.github.io/#graphics/mesh-decals}
 * - {@link https://playcanvas.github.io/#graphics/mesh-deformation}
 * - {@link https://playcanvas.github.io/#graphics/mesh-generation}
 * - {@link https://playcanvas.github.io/#graphics/point-cloud-simulation}
 *
 * ### Update Vertex and Index buffers
 * This allows greater flexibility, but is more complex to use. It allows more advanced setups, for
 * example sharing a Vertex or Index Buffer between multiple meshes. See {@link VertexBuffer},
 * {@link IndexBuffer} and {@link VertexFormat} for details.
 *
 * @category Graphics
 */
export class Mesh extends RefCountedObject {
    /**
     * Create a new Mesh instance from {@link Geometry} object.
     *
     * @param {GraphicsDevice} graphicsDevice - The graphics device used to manage this mesh.
     * @param {Geometry} geometry - The geometry object to create the mesh from.
     * @param {object} [options] - An object that specifies optional inputs for the function as follows:
     * @param {boolean} [options.storageVertex] - Defines if the vertex buffer of the mesh can be used as
     * a storage buffer by a compute shader. Defaults to false. Only supported on WebGPU.
     * @param {boolean} [options.storageIndex] - Defines if the index buffer of the mesh can be used as
     * a storage buffer by a compute shader. Defaults to false. Only supported on WebGPU.
     * @returns {Mesh} A new mesh.
     */
    static fromGeometry(graphicsDevice: GraphicsDevice, geometry: Geometry, options?: {
        storageVertex?: boolean;
        storageIndex?: boolean;
    }): Mesh;
    /**
     * Create a new Mesh instance.
     *
     * @param {GraphicsDevice} graphicsDevice - The graphics device used to manage this mesh.
     * @param {object} [options] - Object for passing optional arguments.
     * @param {boolean} [options.storageVertex] - Defines if the vertex buffer can be used as
     * a storage buffer by a compute shader. Defaults to false. Only supported on WebGPU.
     * @param {boolean} [options.storageIndex] - Defines if the index buffer can be used as
     * a storage buffer by a compute shader. Defaults to false. Only supported on WebGPU.
     */
    constructor(graphicsDevice: GraphicsDevice, options?: {
        storageVertex?: boolean;
        storageIndex?: boolean;
    });
    /**
     * An array of index buffers. For unindexed meshes, this array can be empty. The first index
     * buffer in the array is used by {@link MeshInstance}s with a `renderStyle` property set to
     * {@link RENDERSTYLE_SOLID}. The second index buffer in the array is used if `renderStyle` is
     * set to {@link RENDERSTYLE_WIREFRAME}.
     *
     * @type {IndexBuffer[]}
     */
    indexBuffer: IndexBuffer[];
    /**
     * The vertex buffer holding the vertex data of the mesh.
     *
     * @type {VertexBuffer}
     */
    vertexBuffer: VertexBuffer;
    /**
     * Array of primitive objects defining how vertex (and index) data in the mesh should be
     * interpreted by the graphics device.
     *
     * - `type` is the type of primitive to render. Can be:
     *
     *   - {@link PRIMITIVE_POINTS}
     *   - {@link PRIMITIVE_LINES}
     *   - {@link PRIMITIVE_LINELOOP}
     *   - {@link PRIMITIVE_LINESTRIP}
     *   - {@link PRIMITIVE_TRIANGLES}
     *   - {@link PRIMITIVE_TRISTRIP}
     *   - {@link PRIMITIVE_TRIFAN}
     *
     * - `base` is the offset of the first index or vertex to dispatch in the draw call.
     * - `baseVertex` is the number added to each index value before indexing into the vertex buffers. (supported only in WebGPU, ignored in WebGL2)
     * - `count` is the number of indices or vertices to dispatch in the draw call.
     * - `indexed` specifies whether to interpret the primitive as indexed, thereby using the
     * currently set index buffer.
     *
     * @type {{type: number, base: number, baseVertex: number, count: number, indexed?: boolean}[]}
     */
    primitive: {
        type: number;
        base: number;
        baseVertex: number;
        count: number;
        indexed?: boolean;
    }[];
    /**
     * The skin data (if any) that drives skinned mesh animations for this mesh.
     *
     * @type {Skin|null}
     */
    skin: Skin | null;
    /**
     * Array of object space AABBs of vertices affected by each bone.
     *
     * @type {BoundingBox[]|null}
     * @ignore
     */
    boneAabb: BoundingBox[] | null;
    /**
     * Internal version of AABB, incremented when local AABB changes.
     *
     * @ignore
     */
    _aabbVer: number;
    /**
     * AABB representing object space bounds of the mesh.
     *
     * @type {BoundingBox}
     * @private
     */
    private _aabb;
    /**
     * @type {GeometryData|null}
     * @private
     */
    private _geometryData;
    /**
     * @type {Morph|null}
     * @private
     */
    private _morph;
    /**
     * True if the created index buffer should be accessible as a storage buffer in compute shader.
     *
     * @type {boolean}
     * @private
     */
    private _storageIndex;
    /**
     * True if the created vertex buffer should be accessible as a storage buffer in compute shader.
     *
     * @type {boolean}
     * @private
     */
    private _storageVertex;
    id: number;
    device: GraphicsDevice;
    /**
     * Sets the morph data that drives morph target animations for this mesh. Set to null if
     * morphing is not used.
     *
     * @type {Morph|null}
     */
    set morph(morph: Morph | null);
    /**
     * Gets the morph data that drives morph target animations for this mesh.
     *
     * @type {Morph|null}
     */
    get morph(): Morph | null;
    /**
     * Sets the axis-aligned bounding box for the object space vertices of this mesh.
     *
     * @type {BoundingBox}
     */
    set aabb(aabb: BoundingBox);
    /**
     * Gets the axis-aligned bounding box for the object space vertices of this mesh.
     *
     * @type {BoundingBox}
     */
    get aabb(): BoundingBox;
    /**
     * Destroys the {@link VertexBuffer} and {@link IndexBuffer}s associated with the mesh. This is
     * normally called by {@link Model#destroy} and does not need to be called manually.
     */
    destroy(): void;
    _destroyIndexBuffer(index: any): void;
    _initBoneAabbs(morphTargets: any): void;
    boneUsed: any[];
    _initGeometryData(): void;
    /**
     * Clears the mesh of existing vertices and indices and resets the {@link VertexFormat}
     * associated with the mesh. This call is typically followed by calls to methods such as
     * {@link Mesh#setPositions}, {@link Mesh#setVertexStream} or {@link Mesh#setIndices} and
     * finally {@link Mesh#update} to rebuild the mesh, allowing different {@link VertexFormat}.
     *
     * @param {boolean} [verticesDynamic] - Indicates the {@link VertexBuffer} should be created
     * with {@link BUFFER_DYNAMIC} usage. If not specified, {@link BUFFER_STATIC} is used.
     * @param {boolean} [indicesDynamic] - Indicates the {@link IndexBuffer} should be created with
     * {@link BUFFER_DYNAMIC} usage. If not specified, {@link BUFFER_STATIC} is used.
     * @param {number} [maxVertices] - A {@link VertexBuffer} will be allocated with at least
     * maxVertices, allowing additional vertices to be added to it without the allocation. If no
     * value is provided, a size to fit the provided vertices will be allocated.
     * @param {number} [maxIndices] - An {@link IndexBuffer} will be allocated with at least
     * maxIndices, allowing additional indices to be added to it without the allocation. If no
     * value is provided, a size to fit the provided indices will be allocated.
     */
    clear(verticesDynamic?: boolean, indicesDynamic?: boolean, maxVertices?: number, maxIndices?: number): void;
    /**
     * Sets the vertex data for any supported semantic.
     *
     * @param {string} semantic - The meaning of the vertex element. For supported semantics, see
     * SEMANTIC_* in {@link VertexFormat}.
     * @param {number[]|ArrayBufferView} data - Vertex data for the specified semantic.
     * @param {number} componentCount - The number of values that form a single Vertex element. For
     * example when setting a 3D position represented by 3 numbers per vertex, number 3 should be
     * specified.
     * @param {number} [numVertices] - The number of vertices to be used from data array. If not
     * provided, the whole data array is used. This allows to use only part of the data array.
     * @param {number} [dataType] - The format of data when stored in the {@link VertexBuffer}, see
     * TYPE_* in {@link VertexFormat}. When not specified, {@link TYPE_FLOAT32} is used.
     * @param {boolean} [dataTypeNormalize] - If true, vertex attribute data will be mapped from a
     * 0 to 255 range down to 0 to 1 when fed to a shader. If false, vertex attribute data is left
     * unchanged. If this property is unspecified, false is assumed.
     * @param {boolean} [asInt] - If true, vertex attribute data will be accessible as integer
     * numbers in shader code. Defaults to false, which means that vertex attribute data will be
     * accessible as floating point numbers. Can be only used with INT and UINT data types.
     */
    setVertexStream(semantic: string, data: number[] | ArrayBufferView, componentCount: number, numVertices?: number, dataType?: number, dataTypeNormalize?: boolean, asInt?: boolean): void;
    /**
     * Gets the vertex data corresponding to a semantic.
     *
     * @param {string} semantic - The semantic of the vertex element to get. For supported
     * semantics, see SEMANTIC_* in {@link VertexFormat}.
     * @param {number[]|ArrayBufferView} data - An array to populate with the vertex data. When
     * typed array is supplied, enough space needs to be reserved, otherwise only partial data is
     * copied.
     * @returns {number} Returns the number of vertices populated.
     */
    getVertexStream(semantic: string, data: number[] | ArrayBufferView): number;
    /**
     * Sets the vertex positions array. Vertices are stored using {@link TYPE_FLOAT32} format.
     *
     * @param {number[]|ArrayBufferView} positions - Vertex data containing positions.
     * @param {number} [componentCount] - The number of values that form a single position element.
     * Defaults to 3 if not specified, corresponding to x, y and z coordinates.
     * @param {number} [numVertices] - The number of vertices to be used from data array. If not
     * provided, the whole data array is used. This allows to use only part of the data array.
     */
    setPositions(positions: number[] | ArrayBufferView, componentCount?: number, numVertices?: number): void;
    /**
     * Sets the vertex normals array. Normals are stored using {@link TYPE_FLOAT32} format.
     *
     * @param {number[]|ArrayBufferView} normals - Vertex data containing normals.
     * @param {number} [componentCount] - The number of values that form a single normal element.
     * Defaults to 3 if not specified, corresponding to x, y and z direction.
     * @param {number} [numVertices] - The number of vertices to be used from data array. If not
     * provided, the whole data array is used. This allows to use only part of the data array.
     */
    setNormals(normals: number[] | ArrayBufferView, componentCount?: number, numVertices?: number): void;
    /**
     * Sets the vertex uv array. Uvs are stored using {@link TYPE_FLOAT32} format.
     *
     * @param {number} channel - The uv channel in [0..7] range.
     * @param {number[]|ArrayBufferView} uvs - Vertex data containing uv-coordinates.
     * @param {number} [componentCount] - The number of values that form a single uv element.
     * Defaults to 2 if not specified, corresponding to u and v coordinates.
     * @param {number} [numVertices] - The number of vertices to be used from data array. If not
     * provided, the whole data array is used. This allows to use only part of the data array.
     */
    setUvs(channel: number, uvs: number[] | ArrayBufferView, componentCount?: number, numVertices?: number): void;
    /**
     * Sets the vertex color array. Colors are stored using {@link TYPE_FLOAT32} format, which is
     * useful for HDR colors.
     *
     * @param {number[]|ArrayBufferView} colors - Vertex data containing colors.
     * @param {number} [componentCount] - The number of values that form a single color element.
     * Defaults to 4 if not specified, corresponding to r, g, b and a.
     * @param {number} [numVertices] - The number of vertices to be used from data array. If not
     * provided, the whole data array is used. This allows to use only part of the data array.
     */
    setColors(colors: number[] | ArrayBufferView, componentCount?: number, numVertices?: number): void;
    /**
     * Sets the vertex color array. Colors are stored using {@link TYPE_UINT8} format, which is
     * useful for LDR colors. Values in the array are expected in [0..255] range, and are mapped to
     * [0..1] range in the shader.
     *
     * @param {number[]|ArrayBufferView} colors - Vertex data containing colors. The array is
     * expected to contain 4 components per vertex, corresponding to r, g, b and a.
     * @param {number} [numVertices] - The number of vertices to be used from data array. If not
     * provided, the whole data array is used. This allows to use only part of the data array.
     */
    setColors32(colors: number[] | ArrayBufferView, numVertices?: number): void;
    /**
     * Sets the index array. Indices are stored using 16-bit format by default, unless more than
     * 65535 vertices are specified, in which case 32-bit format is used.
     *
     * @param {number[]|Uint8Array|Uint16Array|Uint32Array} indices - The array of indices that
     * define primitives (lines, triangles, etc.).
     * @param {number} [numIndices] - The number of indices to be used from data array. If not
     * provided, the whole data array is used. This allows to use only part of the data array.
     */
    setIndices(indices: number[] | Uint8Array | Uint16Array | Uint32Array, numIndices?: number): void;
    /**
     * Gets the vertex positions data.
     *
     * @param {number[]|ArrayBufferView} positions - An array to populate with the vertex data.
     * When typed array is supplied, enough space needs to be reserved, otherwise only partial data
     * is copied.
     * @returns {number} Returns the number of vertices populated.
     */
    getPositions(positions: number[] | ArrayBufferView): number;
    /**
     * Gets the vertex normals data.
     *
     * @param {number[]|ArrayBufferView} normals - An array to populate with the vertex data. When
     * typed array is supplied, enough space needs to be reserved, otherwise only partial data is
     * copied.
     * @returns {number} Returns the number of vertices populated.
     */
    getNormals(normals: number[] | ArrayBufferView): number;
    /**
     * Gets the vertex uv data.
     *
     * @param {number} channel - The uv channel in [0..7] range.
     * @param {number[]|ArrayBufferView} uvs - An array to populate with the vertex data. When
     * typed array is supplied, enough space needs to be reserved, otherwise only partial data is
     * copied.
     * @returns {number} Returns the number of vertices populated.
     */
    getUvs(channel: number, uvs: number[] | ArrayBufferView): number;
    /**
     * Gets the vertex color data.
     *
     * @param {number[]|ArrayBufferView} colors - An array to populate with the vertex data. When
     * typed array is supplied, enough space needs to be reserved, otherwise only partial data is
     * copied.
     * @returns {number} Returns the number of vertices populated.
     */
    getColors(colors: number[] | ArrayBufferView): number;
    /**
     * Gets the index data.
     *
     * @param {number[]|Uint8Array|Uint16Array|Uint32Array} indices - An array to populate with the
     * index data. When a typed array is supplied, enough space needs to be reserved, otherwise
     * only partial data is copied.
     * @returns {number} Returns the number of indices populated.
     */
    getIndices(indices: number[] | Uint8Array | Uint16Array | Uint32Array): number;
    /**
     * Applies any changes to vertex stream and indices to mesh. This allocates or reallocates
     * {@link vertexBuffer} or {@link indexBuffer} to fit all provided vertices and indices, and
     * fills them with data.
     *
     * @param {number} [primitiveType] - The type of primitive to render.  Can be:
     *
     * - {@link PRIMITIVE_POINTS}
     * - {@link PRIMITIVE_LINES}
     * - {@link PRIMITIVE_LINELOOP}
     * - {@link PRIMITIVE_LINESTRIP}
     * - {@link PRIMITIVE_TRIANGLES}
     * - {@link PRIMITIVE_TRISTRIP}
     * - {@link PRIMITIVE_TRIFAN}
     *
     * Defaults to {@link PRIMITIVE_TRIANGLES} if not specified.
     * @param {boolean} [updateBoundingBox] - True to update bounding box. Bounding box is updated
     * only if positions were set since last time update was called, and `componentCount` for
     * position was 3, otherwise bounding box is not updated. See {@link Mesh#setPositions}.
     * Defaults to true if not specified. Set this to false to avoid update of the bounding box and
     * use aabb property to set it instead.
     */
    update(primitiveType?: number, updateBoundingBox?: boolean): void;
    _buildVertexFormat(vertexCount: any): VertexFormat;
    _updateVertexBuffer(): void;
    _updateIndexBuffer(): void;
    prepareRenderState(renderStyle: any): void;
    updateRenderStates(): void;
    generateWireframe(): void;
}
import { RefCountedObject } from '../core/ref-counted-object.js';
import { IndexBuffer } from '../platform/graphics/index-buffer.js';
import { VertexBuffer } from '../platform/graphics/vertex-buffer.js';
import type { Skin } from './skin.js';
import { BoundingBox } from '../core/shape/bounding-box.js';
import type { GraphicsDevice } from '../platform/graphics/graphics-device.js';
import type { Morph } from './morph.js';
import { VertexFormat } from '../platform/graphics/vertex-format.js';
import type { Geometry } from './geometry/geometry.js';
