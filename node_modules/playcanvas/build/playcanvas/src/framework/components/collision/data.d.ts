/**
 * @import { Asset } from '../../../framework/asset/asset.js'
 * @import { Model } from '../../../scene/model.js'
 */
export class CollisionComponentData {
    enabled: boolean;
    type: string;
    halfExtents: Vec3;
    linearOffset: Vec3;
    angularOffset: Quat;
    radius: number;
    axis: number;
    height: number;
    convexHull: boolean;
    /** @type {Asset | number} */
    asset: Asset | number;
    /** @type {Asset | number} */
    renderAsset: Asset | number;
    checkVertexDuplicates: boolean;
    shape: any;
    /** @type {Model | null} */
    model: Model | null;
    render: any;
    initialized: boolean;
}
import { Vec3 } from '../../../core/math/vec3.js';
import { Quat } from '../../../core/math/quat.js';
import type { Asset } from '../../../framework/asset/asset.js';
import type { Model } from '../../../scene/model.js';
