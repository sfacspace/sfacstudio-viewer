var encodePS = `
vec4 encodeLinear(vec3 source) {
	return vec4(source, 1.0);
}
vec4 encodeGamma(vec3 source) {
	return vec4(pow(source + 0.0000001, vec3(1.0 / 2.2)), 1.0);
}
vec4 encodeRGBM(vec3 source) {
	vec4 result;
	result.rgb = pow(source.rgb, vec3(0.5));
	result.rgb *= 1.0 / 8.0;
	result.a = saturate( max( max( result.r, result.g ), max( result.b, 1.0 / 255.0 ) ) );
	result.a = ceil(result.a * 255.0) / 255.0;
	result.rgb /= result.a;
	return result;
}
vec4 encodeRGBP(vec3 source) {
	vec3 gamma = pow(source, vec3(0.5));
	float maxVal = min(8.0, max(1.0, max(gamma.x, max(gamma.y, gamma.z))));
	float v = 1.0 - ((maxVal - 1.0) / 7.0);
	v = ceil(v * 255.0) / 255.0;
	return vec4(gamma / (-v * 7.0 + 8.0), v);	
}
vec4 encodeRGBE(vec3 source) {
	float maxVal = max(source.x, max(source.y, source.z));
	if (maxVal < 1e-32) {
		return vec4(0, 0, 0, 0);
	} else {
		float e = ceil(log2(maxVal));
		return vec4(source / pow(2.0, e), (e + 128.0) / 255.0);
	}
}
`;

export { encodePS as default };
