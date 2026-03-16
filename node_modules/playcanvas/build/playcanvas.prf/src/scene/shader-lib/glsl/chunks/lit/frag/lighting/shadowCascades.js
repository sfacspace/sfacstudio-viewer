var shadowCascadesPS = `
int getShadowCascadeIndex(vec4 shadowCascadeDistances, int shadowCascadeCount) {
	float depth = 1.0 / gl_FragCoord.w;
	vec4 comparisons = step(shadowCascadeDistances, vec4(depth));
	int cascadeIndex = int(dot(comparisons, vec4(1.0)));
	return min(cascadeIndex, shadowCascadeCount - 1);
}
int ditherShadowCascadeIndex(int cascadeIndex, vec4 shadowCascadeDistances, int shadowCascadeCount, float blendFactor) {
 
	if (cascadeIndex < shadowCascadeCount - 1) {
		float currentRangeEnd = shadowCascadeDistances[cascadeIndex];
		float transitionStart = blendFactor * currentRangeEnd;
		float depth = 1.0 / gl_FragCoord.w;
		if (depth > transitionStart) {
			float transitionFactor = smoothstep(transitionStart, currentRangeEnd, depth);
			float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
			if (dither < transitionFactor) {
				cascadeIndex += 1;
			}
		}
	}
	return cascadeIndex;
}
vec3 fadeShadow(vec3 shadowCoord, vec4 shadowCascadeDistances) {				  
	float depth = 1.0 / gl_FragCoord.w;
	if (depth > shadowCascadeDistances.w) {
		shadowCoord.z = -9999999.0;
	}
	return shadowCoord;
}
`;

export { shadowCascadesPS as default };
