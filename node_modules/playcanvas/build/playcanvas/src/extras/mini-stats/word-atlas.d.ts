export class WordAtlas {
    constructor(device: any, words: any);
    placements: Map<any, any>;
    texture: Texture;
    destroy(): void;
    render(render2d: any, word: any, x: any, y: any): any;
}
import { Texture } from '../../platform/graphics/texture.js';
