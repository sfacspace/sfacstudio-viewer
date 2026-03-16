declare const _default: "\nattribute vertex_position: vec2f;\n\nvarying vUv0: vec2f;\n\n@vertex\nfn vertexMain(input: VertexInput) -> VertexOutput {\n    var output: VertexOutput;\n    output.position = vec4f(input.vertex_position, 0.5, 1.0);\n    output.vUv0 = input.vertex_position.xy * 0.5 + vec2f(0.5);\n    return output;\n}\n";
export default _default;
