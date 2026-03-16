/**
 * A WebGL implementation of the Texture.
 *
 * @ignore
 */
export class WebglTexture {
    constructor(texture: any);
    _glTexture: any;
    _glTarget: any;
    _glFormat: any;
    _glInternalFormat: any;
    _glPixelType: any;
    _glCreated: any;
    dirtyParameterFlags: number;
    /** @type {Texture} */
    texture: Texture;
    destroy(device: any): void;
    loseContext(): void;
    propertyChanged(flag: any): void;
    initialize(device: any, texture: any): void;
    /**
     * @param {WebglGraphicsDevice} device - The device.
     * @param {Texture} texture - The texture to update.
     */
    upload(device: WebglGraphicsDevice, texture: Texture): void;
    /**
     * @param {WebglGraphicsDevice} device - The graphics device.
     * @param {Texture} texture - The texture.
     */
    uploadImmediate(device: WebglGraphicsDevice, texture: Texture): void;
    read(x: any, y: any, width: any, height: any, options: any): Promise<any>;
    write(x: any, y: any, width: any, height: any, data: any): any;
}
import type { Texture } from '../texture.js';
import type { WebglGraphicsDevice } from './webgl-graphics-device.js';
