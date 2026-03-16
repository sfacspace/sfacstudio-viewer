import { ORIENTATION_HORIZONTAL } from '../../../scene/constants.js';

/**
 * @import { Entity } from '../../../framework/entity'
 */ class ScrollbarComponentData {
    constructor(){
        this.enabled = true;
        this.orientation = ORIENTATION_HORIZONTAL;
        this.value = 0;
        /** @type {number} */ this.handleSize = 0;
        /** @type {Entity|null} */ this.handleEntity = null;
    }
}

export { ScrollbarComponentData };
