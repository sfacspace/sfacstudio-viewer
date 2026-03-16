declare const _default: "\n\nattribute vec4 instance_line1;\nattribute vec4 instance_line2;\nattribute vec4 instance_line3;\nattribute vec4 instance_line4;\n\nmat4 getModelMatrix() {\n    return matrix_model * mat4(instance_line1, instance_line2, instance_line3, instance_line4);\n}\n";
export default _default;
