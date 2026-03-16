export class LightmapCache {
    static cache: RefCountedCache;
    static incRef(texture: any): void;
    static decRef(texture: any): void;
    static destroy(): void;
}
import { RefCountedCache } from '../../core/ref-counted-cache.js';
