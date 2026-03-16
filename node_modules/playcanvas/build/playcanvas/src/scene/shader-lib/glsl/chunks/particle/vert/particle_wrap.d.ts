declare const _default: "\n    vec3 origParticlePos = particlePos;\n    particlePos -= matrix_model[3].xyz;\n    particlePos = mod(particlePos, wrapBounds) - wrapBounds * 0.5;\n    particlePos += matrix_model[3].xyz;\n    particlePosMoved = particlePos - origParticlePos;\n";
export default _default;
