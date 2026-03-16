// uniform declaration for uv transform matrix, 3x2 matrix
var uvTransformUniformsPS = /* glsl */ `
    uniform vec3 {TRANSFORM_NAME_{i}}0;
    uniform vec3 {TRANSFORM_NAME_{i}}1;
`;

export { uvTransformUniformsPS as default };
