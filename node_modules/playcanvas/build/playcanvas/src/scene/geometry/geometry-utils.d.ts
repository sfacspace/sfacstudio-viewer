/**
 * Generates normal information from the specified positions and triangle indices.
 *
 * @param {number[]} positions - An array of 3-dimensional vertex positions.
 * @param {number[]} indices - An array of triangle indices.
 * @returns {number[]} An array of 3-dimensional vertex normals.
 * @example
 * const normals = pc.calculateNormals(positions, indices);
 * @category Graphics
 */
export function calculateNormals(positions: number[], indices: number[]): number[];
/**
 * Generates tangent information from the specified positions, normals, texture coordinates and
 * triangle indices.
 *
 * @param {number[]} positions - An array of 3-dimensional vertex positions.
 * @param {number[]} normals - An array of 3-dimensional vertex normals.
 * @param {number[]} uvs - An array of 2-dimensional vertex texture coordinates.
 * @param {number[]} indices - An array of triangle indices.
 * @returns {number[]} An array of 3-dimensional vertex tangents.
 * @example
 * const tangents = pc.calculateTangents(positions, normals, uvs, indices);
 * @category Graphics
 */
export function calculateTangents(positions: number[], normals: number[], uvs: number[], indices: number[]): number[];
