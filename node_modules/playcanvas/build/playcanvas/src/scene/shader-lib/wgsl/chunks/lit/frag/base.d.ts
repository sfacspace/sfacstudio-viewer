declare const _default: "\nuniform view_position: vec3f;\n\nuniform light_globalAmbient: vec3f;\n\nfn square(x: f32) -> f32 {\n    return x*x;\n}\n\nfn saturate(x: f32) -> f32 {\n    return clamp(x, 0.0, 1.0);\n}\n\nfn saturate3(x: vec3f) -> vec3f {\n    return clamp(x, vec3f(0.0), vec3f(1.0));\n}\n";
export default _default;
