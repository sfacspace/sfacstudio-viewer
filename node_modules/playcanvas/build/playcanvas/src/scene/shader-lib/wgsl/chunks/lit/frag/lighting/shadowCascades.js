var shadowCascadesPS = `
fn getShadowCascadeIndex(shadowCascadeDistances: vec4f, shadowCascadeCount: i32) -> i32 {
	let depth: f32 = 1.0 / pcPosition.w;
	let comparisons: vec4f = step(shadowCascadeDistances, vec4f(depth));
	let cascadeIndex: i32 = i32(dot(comparisons, vec4f(1.0)));
	return min(cascadeIndex, shadowCascadeCount - 1);
}
fn ditherShadowCascadeIndex(cascadeIndex_in: i32, shadowCascadeDistances: vec4f, shadowCascadeCount: i32, blendFactor: f32) -> i32 {
	var cascadeIndex: i32 = cascadeIndex_in;
	if (cascadeIndex < shadowCascadeCount - 1) {
		let currentRangeEnd: f32 = shadowCascadeDistances[cascadeIndex];
		let transitionStart: f32 = blendFactor * currentRangeEnd;
		let depth: f32 = 1.0 / pcPosition.w;
		if (depth > transitionStart) {
			let transitionFactor: f32 = smoothstep(transitionStart, currentRangeEnd, depth);
			let dither: f32 = fract(sin(dot(pcPosition.xy, vec2f(12.9898, 78.233))) * 43758.5453);
			if (dither < transitionFactor) {
				cascadeIndex = cascadeIndex + 1;
			}
		}
	}
	return cascadeIndex;
}
fn fadeShadow(shadowCoord_in: vec3f, shadowCascadeDistances: vec4f) -> vec3f {
	var shadowCoord: vec3f = shadowCoord_in;
	let depth: f32 = 1.0 / pcPosition.w;
	if (depth > shadowCascadeDistances.w) {
		shadowCoord.z = -9999999.0;
	}
	return shadowCoord;
}
`;

export { shadowCascadesPS as default };
