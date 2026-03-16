// uniform declaration for uv transform matrix, 3x2 matrix
var uvTransformUniformsPS = /* wgsl */ `
    uniform {TRANSFORM_NAME_{i}}0: vec3f;
    uniform {TRANSFORM_NAME_{i}}1: vec3f;
`;

export { uvTransformUniformsPS as default };
