export type GSplatOctreeNodeLod = {
    /**
     * - The file path
     */
    file: string;
    /**
     * - The file index in the octree files array
     */
    fileIndex: number;
    /**
     * - The offset in the file
     */
    offset: number;
    /**
     * - The count of items
     */
    count: number;
};
export class GSplatOctreeNode {
    /**
     * @param {GSplatOctreeNodeLod[]} lods - The LOD data for this node
     * @param {Object} [boundData] - The bounding box data with min and max arrays
     */
    constructor(lods: GSplatOctreeNodeLod[], boundData?: any);
    /**
     * @type {GSplatOctreeNodeLod[]}
     */
    lods: GSplatOctreeNodeLod[];
    /**
     * @type {BoundingBox}
     */
    bounds: BoundingBox;
}
import { BoundingBox } from '../../core/shape/bounding-box.js';
