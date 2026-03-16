export class ScrollViewComponentData {
    enabled: boolean;
    /** @type {boolean} */
    horizontal: boolean;
    /** @type {boolean} */
    vertical: boolean;
    /** @type {number} */
    scrollMode: number;
    /** @type {number} */
    bounceAmount: number;
    /** @type {number} */
    friction: number;
    dragThreshold: number;
    useMouseWheel: boolean;
    mouseWheelSensitivity: Vec2;
    /** @type {number} */
    horizontalScrollbarVisibility: number;
    /** @type {number} */
    verticalScrollbarVisibility: number;
    /** @type {Entity|null} */
    viewportEntity: Entity | null;
    /** @type {Entity|null} */
    contentEntity: Entity | null;
    /** @type {Entity|null} */
    horizontalScrollbarEntity: Entity | null;
    /** @type {Entity|null} */
    verticalScrollbarEntity: Entity | null;
}
import { Vec2 } from '../../../core/math/vec2.js';
import type { Entity } from '../../../framework/entity.js';
