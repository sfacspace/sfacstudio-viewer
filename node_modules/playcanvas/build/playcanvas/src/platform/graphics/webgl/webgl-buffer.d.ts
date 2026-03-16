/**
 * A WebGL implementation of the Buffer.
 *
 * @ignore
 */
export class WebglBuffer {
    bufferId: any;
    destroy(device: any): void;
    get initialized(): boolean;
    loseContext(): void;
    unlock(device: any, usage: any, target: any, storage: any): void;
}
