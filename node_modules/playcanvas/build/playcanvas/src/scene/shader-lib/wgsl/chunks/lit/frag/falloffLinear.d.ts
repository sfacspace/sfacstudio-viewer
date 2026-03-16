declare const _default: "\nfn getFalloffLinear(lightRadius: f32, lightDir: vec3f) -> f32 {\n    let d: f32 = length(lightDir);\n    return max(((lightRadius - d) / lightRadius), 0.0);\n}\n";
export default _default;
