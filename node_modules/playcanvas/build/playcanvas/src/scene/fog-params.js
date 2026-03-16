import { Color } from '../core/math/color.js';
import { FOG_NONE } from './constants.js';

class FogParams {
		constructor(){
				this.type = FOG_NONE;
				this.color = new Color(0, 0, 0);
				this.density = 0;
				this.start = 1;
				this.end = 1000;
		}
}

export { FogParams };
