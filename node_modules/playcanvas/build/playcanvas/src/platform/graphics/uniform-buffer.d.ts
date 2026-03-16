/**
 * A uniform buffer represents a GPU memory buffer storing the uniforms.
 *
 * @ignore
 */
export class UniformBuffer {
    /**
     * Create a new UniformBuffer instance.
     *
     * @param {GraphicsDevice} graphicsDevice - The graphics device used to manage this uniform
     * buffer.
     * @param {UniformBufferFormat} format - Format of the uniform buffer.
     * @param {boolean} [persistent] - Whether the buffer is persistent. Defaults to true.
     */
    constructor(graphicsDevice: GraphicsDevice, format: UniformBufferFormat, persistent?: boolean);
    device: GraphicsDevice;
    /** @type {boolean} */
    persistent: boolean;
    /** @type {DynamicBufferAllocation} */
    allocation: DynamicBufferAllocation;
    /** @type {Float32Array} */
    storageFloat32: Float32Array;
    /** @type {Int32Array} */
    storageInt32: Int32Array;
    /** @type {Uint32Array} */
    storageUint32: Uint32Array;
    /**
     * A render version used to track the last time the properties requiring bind group to be
     * updated were changed.
     *
     * @type {number}
     */
    renderVersionDirty: number;
    format: UniformBufferFormat;
    impl: any;
    /**
     * Frees resources associated with this uniform buffer.
     */
    destroy(): void;
    get offset(): number;
    /**
     * Assign a storage to this uniform buffer.
     *
     * @param {Int32Array} storage - The storage to assign to this uniform buffer.
     */
    assignStorage(storage: Int32Array): void;
    /**
     * Called when the rendering context was lost. It releases all context related resources.
     */
    loseContext(): void;
    /**
     * Assign a value to the uniform specified by its format. This is the fast version of assigning
     * a value to a uniform, avoiding any lookups.
     *
     * @param {UniformFormat} uniformFormat - The format of the uniform.
     * @param {any} value - The value to assign to the uniform.
     */
    setUniform(uniformFormat: UniformFormat, value: any): void;
    /**
     * Assign a value to the uniform specified by name.
     *
     * @param {string} name - The name of the uniform.
     * @param {any} value - The value to assign to the uniform.
     */
    set(name: string, value: any): void;
    startUpdate(dynamicBindGroup: any): void;
    endUpdate(): void;
    /**
     * @param {DynamicBindGroup} [dynamicBindGroup] - The function fills in the info about the
     * dynamic bind group for this frame, which uses this uniform buffer. Only used if the uniform
     * buffer is non-persistent. This allows the uniform buffer to be used without having to create
     * a bind group for it. Note that the bind group can only contains this single uniform buffer,
     * and no other resources.
     */
    update(dynamicBindGroup?: DynamicBindGroup): void;
}
import type { GraphicsDevice } from './graphics-device.js';
import { DynamicBufferAllocation } from './dynamic-buffers.js';
import type { UniformBufferFormat } from './uniform-buffer-format.js';
import type { UniformFormat } from './uniform-buffer-format.js';
import type { DynamicBindGroup } from './bind-group.js';
