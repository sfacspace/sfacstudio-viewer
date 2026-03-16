import { ORIENTATION_HORIZONTAL } from '../../../scene/constants.js';

class ScrollbarComponentData {
		constructor(){
				this.enabled = true;
				this.orientation = ORIENTATION_HORIZONTAL;
				this.value = 0;
				this.handleSize = 0;
				this.handleEntity = null;
		}
}

export { ScrollbarComponentData };
