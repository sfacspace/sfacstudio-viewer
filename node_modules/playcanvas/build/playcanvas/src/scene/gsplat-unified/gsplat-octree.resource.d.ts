export class GSplatOctreeResource {
    /**
     * @param {string} assetFileUrl - The file URL of the container asset.
     * @param {object} data - Parsed JSON data.
     * @param {object} assetLoader - Asset loader instance (framework-level object).
     */
    constructor(assetFileUrl: string, data: object, assetLoader: object);
    /** @type {BoundingBox} */
    aabb: BoundingBox;
    /** @type {GSplatOctree|null} */
    octree: GSplatOctree | null;
    /**
     * Destroys the octree resource and cleans up all associated resources.
     */
    destroy(): void;
}
import { BoundingBox } from '../../core/shape/bounding-box.js';
import { GSplatOctree } from './gsplat-octree.js';
