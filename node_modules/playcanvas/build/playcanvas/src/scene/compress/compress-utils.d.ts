/**
 * @import { Entity } from '../../framework/entity.js'
 */
export class CompressUtils {
    /**
     * Set position, rotation and scale of an entity using compressed scene format.
     *
     * @param {Entity} entity - The entity.
     * @param {object} data - Json entity data from a compressed scene.
     * @param {object} compressed - Compression metadata.
     */
    static setCompressedPRS(entity: Entity, data: object, compressed: object): void;
    /**
     * Retrieve the original field name (key) for a single character key from a compressed entity.
     *
     * @param {string} s - The compressed key string.
     * @param {object} data - Compression metadata.
     * @returns {string} The original key.
     */
    static oneCharToKey(s: string, data: object): string;
    /**
     * Retrieve the original field name (key) for a multi-character key from a compressed entity.
     *
     * @param {string} s - The compressed key string.
     * @param {object} data - Compression metadata.
     * @returns {string} The original key.
     */
    static multCharToKey(s: string, data: object): string;
}
import type { Entity } from '../../framework/entity.js';
