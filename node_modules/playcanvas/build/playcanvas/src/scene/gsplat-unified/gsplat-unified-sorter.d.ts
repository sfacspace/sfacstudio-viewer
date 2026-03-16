export class GSplatUnifiedSorter extends EventHandler {
    /**
     * @param {Scene} [scene] - The scene to fire sort timing events on.
     */
    constructor(scene?: Scene);
    worker: Worker;
    bufferLength: number;
    availableOrderData: any[];
    jobsInFlight: number;
    hasNewVersion: boolean;
    /**
     * Pending sorted result to be applied next frame. If multiple sorted results are received from
     * the worker, the latest result is stored here.
     *
     * @type {{ count: number, version: number, orderData: Uint32Array }|null}
     */
    pendingSorted: {
        count: number;
        version: number;
        orderData: Uint32Array;
    } | null;
    /** @type {Set<number>} */
    centersSet: Set<number>;
    /** @type {boolean} */
    _destroyed: boolean;
    /** @type {Scene|null} */
    scene: Scene | null;
    onSorted(message: any): void;
    applyPendingSorted(): void;
    releaseOrderData(orderData: any): void;
    destroy(): void;
    /**
     * Adds or removes centers from the sorter.
     *
     * @param {number} id - The id of the centers.
     * @param {Float32Array|null} centers - The centers buffer.
     */
    setCenters(id: number, centers: Float32Array | null): void;
    /**
     * Updates centers in the worker based on current splats.
     * Adds new centers and removes centers no longer needed.
     *
     * @param {GSplatInfo[]} splats - Array of active splat infos.
     */
    updateCentersForSplats(splats: GSplatInfo[]): void;
    /**
     * Sets sort parameters data for sorting of splats.
     *
     * @param {object} payload - The sort parameters payload to send.
     */
    setSortParameters(payload: object): void;
    /**
     * Sends sorting parameters to the sorter. Called every frame sorting is needed.
     *
     * @param {object} params - The sorting parameters - per-splat directions, offsets, scales, AABBs.
     * @param {boolean} radialSorting - Whether to use radial distance sorting.
     */
    setSortParams(params: object, radialSorting: boolean): void;
}
import { EventHandler } from '../../core/event-handler.js';
import type { Scene } from '../scene.js';
import type { GSplatInfo } from './gsplat-info.js';
