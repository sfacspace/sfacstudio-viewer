import { Vec2 } from '../../../core/math/vec2.js';

/**
 * @import { Entity } from '../../../framework/entity.js'
 */ const DEFAULT_DRAG_THRESHOLD = 10;
class ScrollViewComponentData {
    constructor(){
        this.enabled = true;
        this.dragThreshold = DEFAULT_DRAG_THRESHOLD;
        this.useMouseWheel = true;
        this.mouseWheelSensitivity = new Vec2(1, 1);
        /** @type {number} */ this.horizontalScrollbarVisibility = 0;
        /** @type {number} */ this.verticalScrollbarVisibility = 0;
        /** @type {Entity|null} */ this.viewportEntity = null;
        /** @type {Entity|null} */ this.contentEntity = null;
        /** @type {Entity|null} */ this.horizontalScrollbarEntity = null;
        /** @type {Entity|null} */ this.verticalScrollbarEntity = null;
    }
}

export { ScrollViewComponentData };
