var uvTransformVS = `
output.vUV{TRANSFORM_UV_{i}}_{TRANSFORM_ID_{i}} = vec2f(
	dot(vec3f(uv{TRANSFORM_UV_{i}}, 1), uniform.{TRANSFORM_NAME_{i}}0),
	dot(vec3f(uv{TRANSFORM_UV_{i}}, 1), uniform.{TRANSFORM_NAME_{i}}1)
);
`;

export { uvTransformVS as default };
