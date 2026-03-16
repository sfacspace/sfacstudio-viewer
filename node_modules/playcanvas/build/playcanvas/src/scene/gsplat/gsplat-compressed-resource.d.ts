export class GSplatCompressedResource extends GSplatResourceBase {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {GSplatCompressedData} gsplatData - The splat data.
     */
    constructor(device: GraphicsDevice, gsplatData: GSplatCompressedData);
    /** @type {Texture} */
    packedTexture: Texture;
    /** @type {Texture} */
    chunkTexture: Texture;
    /** @type {Texture?} */
    shTexture0: Texture | null;
    /** @type {Texture?} */
    shTexture1: Texture | null;
    /** @type {Texture?} */
    shTexture2: Texture | null;
    chunks: Float32Array<ArrayBuffer>;
}
import { GSplatResourceBase } from './gsplat-resource-base.js';
import type { Texture } from '../../platform/graphics/texture.js';
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import type { GSplatCompressedData } from './gsplat-compressed-data.js';
