/**
 * @import { Asset } from '../../../framework/asset/asset.js'
 * @import { CurveSet } from '../../../core/math/curve-set.js'
 * @import { Curve } from '../../../core/math/curve.js'
 * @import { Mesh } from '../../../scene/mesh.js'
 * @import { Texture } from '../../../platform/graphics/texture.js'
 */
export class ParticleSystemComponentData {
    numParticles: number;
    rate: number;
    /** @type {number} */
    rate2: number;
    startAngle: number;
    /** @type {number} */
    startAngle2: number;
    lifetime: number;
    emitterExtents: Vec3;
    emitterExtentsInner: Vec3;
    emitterRadius: number;
    emitterRadiusInner: number;
    emitterShape: number;
    initialVelocity: number;
    wrap: boolean;
    wrapBounds: Vec3;
    localSpace: boolean;
    screenSpace: boolean;
    /** @type {Texture} */
    colorMap: Texture;
    /** @type {Asset} */
    colorMapAsset: Asset;
    /** @type {Texture} */
    normalMap: Texture;
    /** @type {Asset} */
    normalMapAsset: Asset;
    loop: boolean;
    preWarm: boolean;
    sort: number;
    mode: number;
    scene: any;
    lighting: boolean;
    halfLambert: boolean;
    intensity: number;
    stretch: number;
    alignToMotion: boolean;
    depthSoftening: number;
    /** @type {Asset} */
    renderAsset: Asset;
    /** @type {Asset} */
    meshAsset: Asset;
    /** @type {Mesh} */
    mesh: Mesh;
    depthWrite: boolean;
    noFog: boolean;
    orientation: number;
    particleNormal: Vec3;
    animTilesX: number;
    animTilesY: number;
    animStartFrame: number;
    animNumFrames: number;
    animNumAnimations: number;
    animIndex: number;
    randomizeAnimIndex: boolean;
    animSpeed: number;
    animLoop: boolean;
    /** @type {Curve} */
    scaleGraph: Curve;
    /** @type {Curve} */
    scaleGraph2: Curve;
    /** @type {CurveSet} */
    colorGraph: CurveSet;
    /** @type {CurveSet} */
    colorGraph2: CurveSet;
    /** @type {Curve} */
    alphaGraph: Curve;
    /** @type {Curve} */
    alphaGraph2: Curve;
    /** @type {CurveSet} */
    localVelocityGraph: CurveSet;
    /** @type {CurveSet} */
    localVelocityGraph2: CurveSet;
    /** @type {CurveSet} */
    velocityGraph: CurveSet;
    /** @type {CurveSet} */
    velocityGraph2: CurveSet;
    /** @type {Curve} */
    rotationSpeedGraph: Curve;
    /** @type {Curve} */
    rotationSpeedGraph2: Curve;
    /** @type {Curve} */
    radialSpeedGraph: Curve;
    /** @type {Curve} */
    radialSpeedGraph2: Curve;
    blendType: number;
    enabled: boolean;
    paused: boolean;
    autoPlay: boolean;
    layers: number[];
}
import { Vec3 } from '../../../core/math/vec3.js';
import type { Texture } from '../../../platform/graphics/texture.js';
import type { Asset } from '../../../framework/asset/asset.js';
import type { Mesh } from '../../../scene/mesh.js';
import type { Curve } from '../../../core/math/curve.js';
import type { CurveSet } from '../../../core/math/curve-set.js';
