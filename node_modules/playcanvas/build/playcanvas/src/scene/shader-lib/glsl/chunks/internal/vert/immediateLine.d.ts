declare const _default: "\n    attribute vec4 vertex_position;\n    attribute vec4 vertex_color;\n    uniform mat4 matrix_model;\n    uniform mat4 matrix_viewProjection;\n    varying vec4 color;\n    void main(void) {\n        color = vertex_color;\n        gl_Position = matrix_viewProjection * matrix_model * vertex_position;\n    }\n";
export default _default;
