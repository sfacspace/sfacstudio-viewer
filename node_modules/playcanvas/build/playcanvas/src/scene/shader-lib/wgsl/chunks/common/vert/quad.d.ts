declare const _default: "\n    attribute aPosition: vec2f;\n    varying uv0: vec2f;\n    @vertex fn vertexMain(input: VertexInput) -> VertexOutput {\n        var output: VertexOutput;\n        output.position = vec4f(input.aPosition, 0.0, 1.0);\n        output.uv0 = getImageEffectUV((input.aPosition + 1.0) * 0.5);\n        return output;\n    }\n";
export default _default;
