/**
 * The Geometry class serves as a container for storing geometric information. It encapsulates data
 * such as positions, normals, colors, and indices.
 *
 * @category Graphics
 */
export class Geometry {
    /**
     * Positions.
     *
     * @type {number[]|undefined}
     */
    positions: number[] | undefined;
    /**
     * Normals.
     *
     * @type {number[]|undefined}
     */
    normals: number[] | undefined;
    /**
     * Colors.
     *
     * @type {number[]|undefined}
     */
    colors: number[] | undefined;
    /**
     * UVs.
     *
     * @type {number[]|undefined}
     */
    uvs: number[] | undefined;
    /**
     * Additional Uvs.
     *
     * @type {number[]|undefined}
     */
    uvs1: number[] | undefined;
    /**
     * Blend indices.
     *
     * @type {number[]|undefined}
     */
    blendIndices: number[] | undefined;
    /**
     * Blend weights.
     *
     * @type {number[]|undefined}
     */
    blendWeights: number[] | undefined;
    /**
     * Tangents.
     *
     * @type {number[]|undefined}
     */
    tangents: number[] | undefined;
    /**
     * Indices.
     *
     * @type {number[]|undefined}
     */
    indices: number[] | undefined;
    /**
     * Generates normal information from the positions and triangle indices.
     */
    calculateNormals(): void;
    /**
     * Generates tangent information from the positions, normals, texture coordinates and triangle
     * indices.
     */
    calculateTangents(): void;
}
