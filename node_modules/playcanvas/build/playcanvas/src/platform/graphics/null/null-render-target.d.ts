/**
 * A Null implementation of the RenderTarget.
 *
 * @ignore
 */
export class NullRenderTarget {
    destroy(device: any): void;
    init(device: any, renderTarget: any): void;
    loseContext(): void;
    resolve(device: any, target: any, color: any, depth: any): void;
}
