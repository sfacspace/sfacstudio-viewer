var sharedGLSL = `
vec2 getGrabScreenPos(vec4 clipPos) {
	vec2 uv = (clipPos.xy / clipPos.w) * 0.5 + 0.5;
	#ifdef WEBGPU
		uv.y = 1.0 - uv.y;
	#endif
	return uv;
}
vec2 getImageEffectUV(vec2 uv) {
	#ifdef WEBGPU
		uv.y = 1.0 - uv.y;
	#endif
	return uv;
}
`;

export { sharedGLSL as default };
