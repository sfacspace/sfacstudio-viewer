/** @ignore */
export class GSplatResource extends GSplatResourceBase {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {GSplatData} gsplatData - The splat data.
     */
    constructor(device: GraphicsDevice, gsplatData: GSplatData);
    /** @type {Texture} */
    colorTexture: Texture;
    /** @type {Texture} */
    transformATexture: Texture;
    /** @type {Texture} */
    transformBTexture: Texture;
    /** @type {0 | 1 | 2 | 3} */
    shBands: 0 | 1 | 2 | 3;
    /** @type {Texture | undefined} */
    sh1to3Texture: Texture | undefined;
    /** @type {Texture | undefined} */
    sh4to7Texture: Texture | undefined;
    /** @type {Texture | undefined} */
    sh8to11Texture: Texture | undefined;
    /** @type {Texture | undefined} */
    sh12to15Texture: Texture | undefined;
    /**
     * Updates pixel data of this.colorTexture based on the supplied color components and opacity.
     * Assumes that the texture is using an RGBA format where RGB are color components influenced
     * by SH spherical harmonics and A is opacity after a sigmoid transformation.
     *
     * @param {GSplatData} gsplatData - The source data
     */
    updateColorData(gsplatData: GSplatData): void;
    /**
     * @param {GSplatData} gsplatData - The source data
     */
    updateTransformData(gsplatData: GSplatData): void;
    /**
     * @param {GSplatData} gsplatData - The source data
     */
    updateSHData(gsplatData: GSplatData): void;
}
import { GSplatResourceBase } from './gsplat-resource-base.js';
import type { Texture } from '../../platform/graphics/texture.js';
import type { GSplatData } from './gsplat-data.js';
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
