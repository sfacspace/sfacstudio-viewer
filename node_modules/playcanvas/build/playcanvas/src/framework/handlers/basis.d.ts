/**
 * Initialize the Basis transcode worker.
 *
 * @param {object} [config] - The Basis configuration.
 * @param {string} [config.glueUrl] - URL of glue script.
 * @param {string} [config.wasmUrl] - URL of the wasm module.
 * @param {string} [config.fallbackUrl] - URL of the fallback script to use when wasm modules
 * aren't supported.
 * @param {boolean} [config.lazyInit] - Wait for first transcode request before initializing Basis
 * (default is false). Otherwise initialize Basis immediately.
 * @param {number} [config.numWorkers] - Number of workers to use for transcoding (default is 1).
 * While it is possible to improve transcode performance using multiple workers, this will likely
 * depend on the runtime platform. For example, desktop will likely benefit from more workers
 * compared to mobile. Also keep in mind that it takes time to initialize workers and increasing
 * this value could impact application startup time. Make sure to test your application performance
 * on all target platforms when changing this parameter.
 * @param {boolean} [config.eagerWorkers] - Use eager workers (default is true). When enabled, jobs
 * are assigned to workers immediately, independent of their work load. This can result in
 * unbalanced workloads, however there is no delay between jobs. If disabled, new jobs are assigned
 * to workers only when their previous job has completed. This will result in balanced workloads
 * across workers, however workers can be idle for a short time between jobs.
 * @param {string[]} [config.rgbPriority] - Array of texture compression formats in priority order
 * for textures without alpha. The supported compressed formats are: 'astc', 'atc', 'dxt', 'etc1',
 * 'etc2', 'pvr'.
 * @param {string[]} [config.rgbaPriority] - Array of texture compression formats in priority order
 * for textures with alpha. The supported compressed formats are: 'astc', 'atc', 'dxt', 'etc1',
 * 'etc2', 'pvr'.
 * @param {number} [config.maxRetries] - Number of http load retry attempts. Defaults to 5.
 */
export function basisInitialize(config?: {
    glueUrl?: string;
    wasmUrl?: string;
    fallbackUrl?: string;
    lazyInit?: boolean;
    numWorkers?: number;
    eagerWorkers?: boolean;
    rgbPriority?: string[];
    rgbaPriority?: string[];
    maxRetries?: number;
}): void;
/**
 * Enqueue a blob of basis data for transcoding.
 *
 * @param {GraphicsDevice} device - The graphics device.
 * @param {string} url - URL of the basis file.
 * @param {object} data - The file data to transcode.
 * @param {Function} callback - Callback function to receive transcode result.
 * @param {object} [options] - Options structure
 * @param {boolean} [options.isGGGR] - Indicates this is a GGGR swizzled texture. Under some
 * circumstances the texture will be unswizzled during transcoding.
 * @param {boolean} [options.isKTX2] - Indicates the image is KTX2 format. Otherwise
 * basis format is assumed.
 * @returns {boolean} True if the basis worker was initialized and false otherwise.
 * @ignore
 */
export function basisTranscode(device: GraphicsDevice, url: string, data: object, callback: Function, options?: {
    isGGGR?: boolean;
    isKTX2?: boolean;
}): boolean;
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
