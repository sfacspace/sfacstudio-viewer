/**
 * @import { ParticleEmitter } from './particle-emitter.js'
 */
/**
 * A material for rendering particle geometry by the particle emitter.
 *
 * @category Graphics
 * @ignore
 */
export class ParticleMaterial extends Material {
    constructor(emitter: any);
    /**
     * The color of the particles.
     *
     * @type {ParticleEmitter}
     */
    emitter: ParticleEmitter;
    getShaderVariant(params: any): import("../../index.js").Shader;
}
import { Material } from '../materials/material.js';
import type { ParticleEmitter } from './particle-emitter.js';
