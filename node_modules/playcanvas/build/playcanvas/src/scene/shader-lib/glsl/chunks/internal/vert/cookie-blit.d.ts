declare const _default: "\n    attribute vec2 vertex_position;\n    varying vec2 uv0;\n    void main(void) {\n        gl_Position = vec4(vertex_position, 0.5, 1.0);\n        uv0 = vertex_position.xy * 0.5 + 0.5;\n        #ifndef WEBGPU\n            uv0.y = 1.0 - uv0.y;\n        #endif\n    }\n";
export default _default;
