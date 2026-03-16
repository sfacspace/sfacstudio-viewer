/**
 * @import { Morph } from './morph.js'
 * @import { Shader } from '../platform/graphics/shader.js'
 */
/**
 * An instance of {@link Morph}. Contains weights to assign to every {@link MorphTarget}, manages
 * selection of active morph targets.
 *
 * @category Graphics
 */
export class MorphInstance {
    /**
     * Create a new MorphInstance instance.
     *
     * @param {Morph} morph - The {@link Morph} to instance.
     */
    constructor(morph: Morph);
    /**
     * The morph with its targets, which is being instanced.
     *
     * @type {Morph}
     */
    morph: Morph;
    device: import("../index.js").GraphicsDevice;
    shader: Shader;
    _weights: any[];
    _weightMap: Map<any, any>;
    _shaderMorphWeights: Float32Array<ArrayBuffer>;
    _shaderMorphIndex: Uint32Array<ArrayBuffer>;
    rtPositions: RenderTarget;
    rtNormals: RenderTarget;
    _textureParams: Float32Array<ArrayBuffer>;
    _aabbSize: Float32Array<ArrayBuffer>;
    _aabbMin: Float32Array<ArrayBuffer>;
    _aabbNrmSize: Float32Array<ArrayBuffer>;
    _aabbNrmMin: Float32Array<ArrayBuffer>;
    aabbSizeId: import("../index.js").ScopeId;
    aabbMinId: import("../index.js").ScopeId;
    morphTextureId: import("../index.js").ScopeId;
    morphFactor: import("../index.js").ScopeId;
    morphIndex: import("../index.js").ScopeId;
    countId: import("../index.js").ScopeId;
    zeroTextures: boolean;
    /**
     * Frees video memory allocated by this object.
     */
    destroy(): void;
    texturePositions: any;
    textureNormals: any;
    /**
     * Clones a MorphInstance. The returned clone uses the same {@link Morph} and weights are set
     * to defaults.
     *
     * @returns {MorphInstance} A clone of the specified MorphInstance.
     */
    clone(): MorphInstance;
    _getWeightIndex(key: any): any;
    /**
     * Gets current weight of the specified morph target.
     *
     * @param {string|number} key - An identifier for the morph target. Either the weight index or
     * the weight name.
     * @returns {number} Weight.
     */
    getWeight(key: string | number): number;
    /**
     * Sets weight of the specified morph target.
     *
     * @param {string|number} key - An identifier for the morph target. Either the weight index or
     * the weight name.
     * @param {number} weight - Weight.
     */
    setWeight(key: string | number, weight: number): void;
    _dirty: boolean;
    /**
     * Create the shader for texture based morphing.
     *
     * @param {number} maxCount - Maximum bumber of textures to blend.
     * @returns {Shader} Shader.
     * @private
     */
    private _createShader;
    _updateTextureRenderTarget(renderTarget: any, activeCount: any, isPos: any): void;
    _updateTextureMorph(activeCount: any): void;
    setAabbUniforms(isPos?: boolean): void;
    prepareRendering(device: any): void;
    /**
     * Selects active morph targets and prepares morph for rendering. Called automatically by
     * renderer.
     */
    update(): void;
}
import type { Morph } from './morph.js';
import type { Shader } from '../platform/graphics/shader.js';
import { RenderTarget } from '../platform/graphics/render-target.js';
