/**
 * @import { GraphicsDevice } from './graphics-device.js'
 */
/**
 * A base class representing a single per platform buffer.
 *
 * @ignore
 */
export class DynamicBuffer {
    constructor(device: any);
    /** @type {GraphicsDevice} */
    device: GraphicsDevice;
    /**
     * A cache of bind groups for each uniform buffer size, which is used to avoid creating a new
     * bind group for each uniform buffer.
     *
     * @type {Map<number, BindGroup>}
     */
    bindGroupCache: Map<number, BindGroup>;
    bindGroupFormat: BindGroupFormat;
    getBindGroup(ub: any): BindGroup;
}
import type { GraphicsDevice } from './graphics-device.js';
import { BindGroup } from './bind-group.js';
import { BindGroupFormat } from './bind-group-format.js';
