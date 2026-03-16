import { Vec2 } from '../../../core/math/vec2.js';

const DEFAULT_DRAG_THRESHOLD = 10;
class ScrollViewComponentData {
		constructor(){
				this.enabled = true;
				this.dragThreshold = DEFAULT_DRAG_THRESHOLD;
				this.useMouseWheel = true;
				this.mouseWheelSensitivity = new Vec2(1, 1);
				this.horizontalScrollbarVisibility = 0;
				this.verticalScrollbarVisibility = 0;
				this.viewportEntity = null;
				this.contentEntity = null;
				this.horizontalScrollbarEntity = null;
				this.verticalScrollbarEntity = null;
		}
}

export { ScrollViewComponentData };
