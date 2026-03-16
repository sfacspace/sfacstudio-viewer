declare const _default: "\nfn getSpotEffect(lightSpotDir: vec3f, lightInnerConeAngle: f32, lightOuterConeAngle: f32, lightDirNorm: vec3f) -> f32 {\n    let cosAngle: f32 = dot(lightDirNorm, lightSpotDir);\n    return smoothstep(lightOuterConeAngle, lightInnerConeAngle, cosAngle);\n}";
export default _default;
