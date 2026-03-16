/**
 * @import { Entity } from '../../../framework/entity'
 */
export class ScrollbarComponentData {
    enabled: boolean;
    orientation: number;
    value: number;
    /** @type {number} */
    handleSize: number;
    /** @type {Entity|null} */
    handleEntity: Entity | null;
}
import type { Entity } from '../../../framework/entity';
