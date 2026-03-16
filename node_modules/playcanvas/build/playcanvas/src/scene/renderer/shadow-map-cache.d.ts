export class ShadowMapCache {
    cache: Map<any, any>;
    destroy(): void;
    clear(): void;
    getKey(light: any): string;
    get(device: any, light: any): any;
    add(light: any, shadowMap: any): void;
}
