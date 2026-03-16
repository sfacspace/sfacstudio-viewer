var floatAsUintPS = `
#ifndef FLOAT_AS_UINT
#define FLOAT_AS_UINT
fn float2uint(value: f32) -> vec4f {
	let intBits = bitcast<u32>(value);
	return vec4f(
		f32((intBits >> 24u) & 0xffu),
		f32((intBits >> 16u) & 0xffu),
		f32((intBits >> 8u) & 0xffu),
		f32(intBits & 0xffu)
	) / 255.0;
}
fn uint2float(value: vec4f) -> f32 {
	let rgba_u32 = vec4<u32>(value * 255.0);
	let intBits: u32 =
		(rgba_u32.r << 24u) |
		(rgba_u32.g << 16u) |
		(rgba_u32.b << 8u)  |
		 rgba_u32.a;
	return bitcast<f32>(intBits);
}
fn float2vec4(value: f32) -> vec4f {
	#if defined(CAPS_TEXTURE_FLOAT_RENDERABLE)
		return vec4f(value, 1.0, 1.0, 1.0);
	#else
		return float2uint(value);
	#endif
}
#endif
`;

export { floatAsUintPS as default };
