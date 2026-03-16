/**
 * A class managing instances of world clusters used by the renderer for layers with
 * unique sets of clustered lights.
 *
 * @ignore
 */
export class WorldClustersAllocator {
    /**
     * Create a new instance.
     *
     * @param {GraphicsDevice} graphicsDevice - The graphics device.
     */
    constructor(graphicsDevice: GraphicsDevice);
    /**
     * Empty cluster with no lights.
     *
     * @type {WorldClusters|null}
     */
    _empty: WorldClusters | null;
    /**
     * All allocated clusters
     *
     * @type {WorldClusters[]}
     */
    _allocated: WorldClusters[];
    /**
     * Render actions with all unique light clusters. The key is the hash of lights on a layer, the
     * value is a render action with unique light clusters.
     *
     * @type {Map<number, RenderAction>}
     */
    _clusters: Map<number, RenderAction>;
    device: GraphicsDevice;
    destroy(): void;
    get count(): number;
    get empty(): WorldClusters;
    assign(renderPasses: any): void;
    update(renderPasses: any, lighting: any): void;
}
import { WorldClusters } from '../lighting/world-clusters.js';
import type { RenderAction } from '../composition/render-action.js';
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
