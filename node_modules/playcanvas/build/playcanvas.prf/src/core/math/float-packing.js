const floatView = new Float32Array(1);
const int32View = new Int32Array(floatView.buffer);
class FloatPacking {
		static float2Half(value) {
				floatView[0] = value;
				const x = int32View[0];
				let bits = x >> 16 & 0x8000;
				let m = x >> 12 & 0x07ff;
				const e = x >> 23 & 0xff;
				if (e < 103) {
						return bits;
				}
				if (e > 142) {
						bits |= 0x7c00;
						bits |= (e === 255 ? 0 : 1) && x & 0x007fffff;
						return bits;
				}
				if (e < 113) {
						m |= 0x0800;
						bits |= (m >> 114 - e) + (m >> 113 - e & 1);
						return bits;
				}
				bits |= e - 112 << 10 | m >> 1;
				bits += m & 1;
				return bits;
		}
		static float2RGBA8(value, data) {
				floatView[0] = value;
				const intBits = int32View[0];
				data.r = (intBits >> 24 & 0xFF) / 255.0;
				data.g = (intBits >> 16 & 0xFF) / 255.0;
				data.b = (intBits >> 8 & 0xFF) / 255.0;
				data.a = (intBits & 0xFF) / 255.0;
		}
}

export { FloatPacking };
