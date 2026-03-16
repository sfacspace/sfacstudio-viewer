declare const _default: "\n    let sampledNormal: vec4f = textureSample(normalMap, normalMapSampler, vec2f(input.texCoordsAlphaLife.x, 1.0 - input.texCoordsAlphaLife.y));\n    let normalMap: vec3f = normalize(sampledNormal.xyz * 2.0 - 1.0);\n\n    let ParticleMat = mat3x3<f32>(ParticleMat0, ParticleMat1, ParticleMat2);\n    let normal: vec3f = ParticleMat * normalMap;\n";
export default _default;
