var glsltaaResolvePS = `
	#include  "sampleCatmullRomPS"
	#include  "screenDepthPS"
	uniform sampler2D sourceTexture;
	uniform sampler2D historyTexture;
	uniform mat4 matrix_viewProjectionPrevious;
	uniform mat4 matrix_viewProjectionInverse;
	uniform vec4 jitters;
	uniform vec2 textureSize;
	varying vec2 uv0;
	vec2 reproject(vec2 uv, float depth) {
		#ifndef WEBGPU
			depth = depth * 2.0 - 1.0;
		#endif
		vec4 ndc = vec4(uv * 2.0 - 1.0, depth, 1.0);
		ndc.xy -= jitters.xy;
		vec4 worldPosition = matrix_viewProjectionInverse * ndc;
		worldPosition /= worldPosition.w;
		vec4 screenPrevious = matrix_viewProjectionPrevious * worldPosition;
		return (screenPrevious.xy / screenPrevious.w) * 0.5 + 0.5;
	}
	vec4 colorClamp(vec2 uv, vec4 historyColor) {
		vec3 minColor = vec3(9999.0);
		vec3 maxColor = vec3(-9999.0);
		for(float x = -1.0; x <= 1.0; ++x) {
			for(float y = -1.0; y <= 1.0; ++y) {
				vec3 color = texture2D(sourceTexture, uv + vec2(x, y) / textureSize).rgb;
				minColor = min(minColor, color);
				maxColor = max(maxColor, color);
			}
		}
		vec3 clamped = clamp(historyColor.rgb, minColor, maxColor);
		return vec4(clamped, historyColor.a);
	}
	void main()
	{
		vec2 uv = uv0;
		#ifdef WEBGPU
			uv.y = 1.0 - uv.y;
		#endif
		vec4 srcColor = texture2D(sourceTexture, uv);
		float linearDepth = getLinearScreenDepth(uv0);
		float depth = delinearizeDepth(linearDepth);
		vec2 historyUv = reproject(uv0, depth);
		#ifdef QUALITY_HIGH
			vec4 historyColor = SampleTextureCatmullRom(TEXTURE_PASS(historyTexture), historyUv, textureSize);
		#else
			vec4 historyColor = texture2D(historyTexture, historyUv);
		#endif
		vec4 historyColorClamped = colorClamp(uv, historyColor);
		float mixFactor = (historyUv.x < 0.0 || historyUv.x > 1.0 || historyUv.y < 0.0 || historyUv.y > 1.0) ?
			1.0 : 0.05;
		gl_FragColor = mix(historyColorClamped, srcColor, mixFactor);
	}
`;

export { glsltaaResolvePS as default };
