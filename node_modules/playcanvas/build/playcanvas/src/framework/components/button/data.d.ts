/**
 * @import { Asset } from '../../../framework/asset/asset.js'
 * @import { Entity } from '../../../framework/entity.js'
 */
export class ButtonComponentData {
    enabled: boolean;
    active: boolean;
    /** @type {Entity} */
    imageEntity: Entity;
    hitPadding: Vec4;
    transitionMode: number;
    hoverTint: Color;
    pressedTint: Color;
    inactiveTint: Color;
    fadeDuration: number;
    /** @type {Asset} */
    hoverSpriteAsset: Asset;
    hoverSpriteFrame: number;
    /** @type {Asset} */
    pressedSpriteAsset: Asset;
    pressedSpriteFrame: number;
    /** @type {Asset} */
    inactiveSpriteAsset: Asset;
    inactiveSpriteFrame: number;
}
import type { Entity } from '../../../framework/entity.js';
import { Vec4 } from '../../../core/math/vec4.js';
import { Color } from '../../../core/math/color.js';
import type { Asset } from '../../../framework/asset/asset.js';
