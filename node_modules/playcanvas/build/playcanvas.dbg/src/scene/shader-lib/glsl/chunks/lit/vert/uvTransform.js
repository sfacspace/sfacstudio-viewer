// chunk that generates uv coordinate transformed by uv transform matrix
var uvTransformVS = /* glsl */ `
vUV{TRANSFORM_UV_{i}}_{TRANSFORM_ID_{i}} = vec2(
    dot(vec3(uv{TRANSFORM_UV_{i}}, 1), {TRANSFORM_NAME_{i}}0),
    dot(vec3(uv{TRANSFORM_UV_{i}}, 1), {TRANSFORM_NAME_{i}}1)
);
`;

export { uvTransformVS as default };
