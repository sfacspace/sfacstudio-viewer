/**
 * Implementation of the USDZ format exporter. Note that ASCII version of the format (USDA) is used.
 *
 * @category Exporter
 */
export class UsdzExporter extends CoreExporter {
    /**
     * Maps a mesh to a reference (path) inside the usdz container
     *
     * @type {Map<Mesh, string>}
     * @ignore
     */
    meshMap: Map<Mesh, string>;
    /**
     * Maps a material to a reference (path) inside the usdz container
     *
     * @type {Map<Material, string>}
     * @ignore
     */
    materialMap: Map<Material, string>;
    /**
     * A list of generated material usda contents, which are processed at the end
     *
     * @ignore
     */
    materials: any;
    /**
     * A map of texture requests
     *
     * @type {Map<Texture, string>}
     * @ignore
     */
    textureMap: Map<Texture, string>;
    /**
     * A set of used node names. Used in order to keep them unique.
     *
     * @type {Set<string>}
     * @ignore
     */
    nodeNames: Set<string>;
    /**
     * An object, storing a mapping between the file name and its content. Used as input to fflate to
     * zip up the data.
     *
     * @type {object}
     * @ignore
     */
    files: object;
    init(): void;
    done(): void;
    /**
     * Converts a hierarchy of entities to USDZ format.
     *
     * @param {Entity} entity - The root of the entity hierarchy to convert.
     * @param {object} options - Object for passing optional arguments.
     * @param {number} [options.maxTextureSize] - Maximum texture size. Texture is resized if over
     * the size.
     * @returns {Promise<ArrayBuffer>} - The USDZ file content.
     */
    build(entity: Entity, options?: {
        maxTextureSize?: number;
    }): Promise<ArrayBuffer>;
    alignFiles(): void;
    getFileIds(category: any, name: any, ref: any, extension?: string): {
        name: any;
        fileName: string;
        refName: string;
    };
    getTextureFileIds(texture: any): {
        name: any;
        fileName: string;
        refName: string;
    };
    addFile(category: any, uniqueId: any, refName?: string, content?: string): string;
    getMaterialRef(material: any): string;
    getMeshRef(mesh: any): string;
    buildArray2(array: any): string;
    buildArray3(array: any): string;
    buildMat4(mat: any): string;
    buildMaterial(material: any): string;
    buildMesh(mesh: any): string;
    buildMeshInstance(meshInstance: any): string;
}
import { CoreExporter } from './core-exporter.js';
import type { Mesh } from '../../scene/mesh.js';
import type { Material } from '../../scene/materials/material.js';
import type { Texture } from '../../platform/graphics/texture.js';
import type { Entity } from '../../framework/entity.js';
