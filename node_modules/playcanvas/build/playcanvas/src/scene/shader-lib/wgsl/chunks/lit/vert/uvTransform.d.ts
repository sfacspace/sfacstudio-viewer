declare const _default: "\noutput.vUV{TRANSFORM_UV_{i}}_{TRANSFORM_ID_{i}} = vec2f(\n    dot(vec3f(uv{TRANSFORM_UV_{i}}, 1), uniform.{TRANSFORM_NAME_{i}}0),\n    dot(vec3f(uv{TRANSFORM_UV_{i}}, 1), uniform.{TRANSFORM_NAME_{i}}1)\n);\n";
export default _default;
