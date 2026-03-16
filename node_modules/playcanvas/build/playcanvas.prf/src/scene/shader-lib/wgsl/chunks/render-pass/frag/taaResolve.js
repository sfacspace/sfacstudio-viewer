var wgsltaaResolvePS = `
	#include "sampleCatmullRomPS"
	#include "screenDepthPS"
	var sourceTexture: texture_2d<f32>;
	var sourceTextureSampler: sampler;
	var historyTexture: texture_2d<f32>;
	var historyTextureSampler: sampler;
	uniform matrix_viewProjectionPrevious: mat4x4f;
	uniform matrix_viewProjectionInverse: mat4x4f;
	uniform jitters: vec4f;
	uniform textureSize: vec2f;
	varying uv0: vec2f;
	fn reproject(uv: vec2f, depth: f32) -> vec2f {
		var ndc = vec4f(uv * 2.0 - 1.0, depth, 1.0);
		ndc = vec4f(ndc.xy - uniform.jitters.xy, ndc.zw);
		var worldPosition = uniform.matrix_viewProjectionInverse * ndc;
		worldPosition = worldPosition / worldPosition.w;
		let screenPrevious = uniform.matrix_viewProjectionPrevious * worldPosition;
		return (screenPrevious.xy / screenPrevious.w) * 0.5 + 0.5;
	}
	fn colorClamp(uv: vec2f, historyColor: vec4f) -> vec4f {
		var minColor = vec3f(9999.0);
		var maxColor = vec3f(-9999.0);
		for (var ix: i32 = -1; ix <= 1; ix = ix + 1) {
			for (var iy: i32 = -1; iy <= 1; iy = iy + 1) {
				let color_sample = textureSample(sourceTexture, sourceTextureSampler, uv + vec2f(f32(ix), f32(iy)) / uniform.textureSize).rgb;
				minColor = min(minColor, color_sample);
				maxColor = max(maxColor, color_sample);
			}
		}
		let clamped = clamp(historyColor.rgb, minColor, maxColor);
		return vec4f(clamped, historyColor.a);
	}
	@fragment
	fn fragmentMain(input: FragmentInput) -> FragmentOutput {
		var output: FragmentOutput;
		var uv = input.uv0;
		uv.y = 1.0 - uv.y;
		let srcColor = textureSample(sourceTexture, sourceTextureSampler, uv);
		let linearDepth = getLinearScreenDepth(uv0);
		let depth = delinearizeDepth(linearDepth);
		let historyUv = reproject(uv0, depth);
		#ifdef QUALITY_HIGH
			var historyColor: vec4f = SampleTextureCatmullRom(historyTexture, historyTextureSampler, historyUv, uniform.textureSize);
		#else
			var historyColor: vec4f = textureSample(historyTexture, historyTextureSampler, historyUv);
		#endif
		let historyColorClamped = colorClamp(uv, historyColor);
		let mixFactor_condition = historyUv.x < 0.0 || historyUv.x > 1.0 || historyUv.y < 0.0 || historyUv.y > 1.0;
		let mixFactor = select(0.05, 1.0, mixFactor_condition);
		output.color = mix(historyColorClamped, srcColor, mixFactor);
		return output;
	}
`;

export { wgsltaaResolvePS as default };
