var floatAsUintPS = `
#ifndef FLOAT_AS_UINT
#define FLOAT_AS_UINT
vec4 float2uint(float value) {
	uint intBits = floatBitsToUint(value);
	return vec4(
		float((intBits >> 24u) & 0xFFu) / 255.0,
		float((intBits >> 16u) & 0xFFu) / 255.0,
		float((intBits >> 8u) & 0xFFu) / 255.0,
		float(intBits & 0xFFu) / 255.0
	);
}
float uint2float(vec4 value) {
	uint intBits = 
		(uint(value.r * 255.0) << 24u) |
		(uint(value.g * 255.0) << 16u) |
		(uint(value.b * 255.0) << 8u) |
		uint(value.a * 255.0);
	return uintBitsToFloat(intBits);
}
vec4 float2vec4(float value) {
	#if defined(CAPS_TEXTURE_FLOAT_RENDERABLE)
		return vec4(value, 1.0, 1.0, 1.0);
	#else
		return float2uint(value);
	#endif
}
#endif
`;

export { floatAsUintPS as default };
