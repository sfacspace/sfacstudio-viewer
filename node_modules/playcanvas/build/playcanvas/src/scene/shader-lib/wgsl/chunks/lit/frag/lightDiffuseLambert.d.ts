declare const _default: "\nfn getLightDiffuse(worldNormal: vec3f, viewDir: vec3f, lightDirNorm: vec3f) -> f32 {\n    return max(dot(worldNormal, -lightDirNorm), 0.0);\n}\n";
export default _default;
