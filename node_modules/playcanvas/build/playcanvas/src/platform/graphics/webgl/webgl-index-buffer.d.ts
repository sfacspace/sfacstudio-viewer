/**
 * A WebGL implementation of the IndexBuffer.
 *
 * @ignore
 */
export class WebglIndexBuffer extends WebglBuffer {
    constructor(indexBuffer: any);
    glFormat: any;
    unlock(indexBuffer: any): void;
}
import { WebglBuffer } from './webgl-buffer.js';
