declare const _default: "\n\nattribute instance_line1: vec4f;\nattribute instance_line2: vec4f;\nattribute instance_line3: vec4f;\nattribute instance_line4: vec4f;\n\nfn getModelMatrix() -> mat4x4f {\n    return uniform.matrix_model * mat4x4f(instance_line1, instance_line2, instance_line3, instance_line4);\n}\n";
export default _default;
