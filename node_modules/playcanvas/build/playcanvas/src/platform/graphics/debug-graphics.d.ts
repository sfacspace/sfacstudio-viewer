/**
 * @import { GraphicsDevice } from './graphics-device.js'
 */
/**
 * Internal graphics debug system - gpu markers and similar. Note that the functions only execute
 * in the debug build, and are stripped out in other builds.
 */
export class DebugGraphics {
    /**
     * An array of markers, representing a stack.
     *
     * @type {string[]}
     * @private
     */
    private static markers;
    /**
     * Clear internal stack of the GPU markers. It should be called at the start of the frame to
     * prevent the array growing if there are exceptions during the rendering.
     */
    static clearGpuMarkers(): void;
    /**
     * Push GPU marker to the stack on the device.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {string} name - The name of the marker.
     */
    static pushGpuMarker(device: GraphicsDevice, name: string): void;
    /**
     * Pop GPU marker from the stack on the device.
     *
     * @param {GraphicsDevice} device - The graphics device.
     */
    static popGpuMarker(device: GraphicsDevice): void;
    /**
     * Converts current markers into a single string format.
     *
     * @returns {string} String representation of current markers.
     */
    static toString(): string;
}
import type { GraphicsDevice } from './graphics-device.js';
