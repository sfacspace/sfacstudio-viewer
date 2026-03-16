var quadVS = `
	attribute aPosition: vec2f;
	varying uv0: vec2f;
	@vertex fn vertexMain(input: VertexInput) -> VertexOutput {
		var output: VertexOutput;
		output.position = vec4f(input.aPosition, 0.0, 1.0);
		output.uv0 = getImageEffectUV((input.aPosition + 1.0) * 0.5);
		return output;
	}
`;

export { quadVS as default };
