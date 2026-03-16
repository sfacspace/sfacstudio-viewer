import { Color } from '../../core/math/color.js';

const COLOR_RED = Object.freeze(new Color(1, 0.3, 0.3));
const COLOR_GREEN = Object.freeze(new Color(0.3, 1, 0.3));
const COLOR_BLUE = Object.freeze(new Color(0.3, 0.3, 1));
Object.freeze(new Color(1, 1, 0.5));
const COLOR_GRAY = Object.freeze(new Color(0.5, 0.5, 0.5, 0.5));
const color4from3 = (color, a)=>{
		return new Color(color.r, color.g, color.b, a);
};

export { COLOR_BLUE, COLOR_GRAY, COLOR_GREEN, COLOR_RED, color4from3 };
