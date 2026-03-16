/**
 * @import { GraphicsDevice } from './graphics-device.js'
 */
/**
 * A cache storing shared resources associated with a device. The resources are removed
 * from the cache when the device is destroyed.
 */
export class DeviceCache {
    /**
     * Cache storing the resource for each GraphicsDevice
     *
     * @type {Map<GraphicsDevice, any>}
     */
    _cache: Map<GraphicsDevice, any>;
    /**
     * Returns the resources for the supplied device.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {() => any} onCreate - A function that creates the resource for the device.
     * @returns {any} The resource for the device.
     */
    get(device: GraphicsDevice, onCreate: () => any): any;
    /**
     * Destroys and removes the content of the cache associated with the device
     *
     * @param {GraphicsDevice} device - The graphics device.
     */
    remove(device: GraphicsDevice): void;
}
import type { GraphicsDevice } from './graphics-device.js';
