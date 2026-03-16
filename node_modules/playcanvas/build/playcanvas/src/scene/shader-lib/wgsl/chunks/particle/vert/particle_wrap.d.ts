declare const _default: "\n    let origParticlePos: vec3f = particlePos;\n    particlePos = particlePos - uniform.matrix_model[3].xyz;\n    particlePos = (particlePos % uniform.wrapBounds) - uniform.wrapBounds * 0.5;\n    particlePos = particlePos + uniform.matrix_model[3].xyz;\n    particlePosMoved = particlePos - origParticlePos;\n";
export default _default;
