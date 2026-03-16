var skyboxVS = `
	attribute aPosition : vec4f;
	uniform matrix_view : mat4x4f;
	uniform matrix_projectionSkybox : mat4x4f;
	uniform cubeMapRotationMatrix : mat3x3f;
	varying vViewDir : vec3f;
	#ifdef PREPASS_PASS
		varying vLinearDepth: f32;
	#endif
	#ifdef SKYMESH
		uniform matrix_model : mat4x4f;
		varying vWorldPos : vec3f;
	#endif
	@vertex
	fn vertexMain(input : VertexInput) -> VertexOutput {
		var output : VertexOutput;
		var view : mat4x4f = uniform.matrix_view;
		#ifdef SKYMESH
			var worldPos : vec4f = uniform.matrix_model * input.aPosition;
			output.vWorldPos = worldPos.xyz;
			output.position = uniform.matrix_projectionSkybox * (view * worldPos);
			#ifdef PREPASS_PASS
				output.vLinearDepth = -(uniform.matrix_view * vec4f(worldPos.xyz, 1.0)).z;
			#endif
		#else
			view[3][0] = 0.0;
			view[3][1] = 0.0;
			view[3][2] = 0.0;
			output.position = uniform.matrix_projectionSkybox * (view * input.aPosition);
			output.vViewDir = input.aPosition.xyz * uniform.cubeMapRotationMatrix;
			#ifdef PREPASS_PASS
				output.vLinearDepth = -pcPosition.w;
			#endif
		#endif
		output.position.z = output.position.w - 1.0e-7;
		return output;
	}
`;

export { skyboxVS as default };
