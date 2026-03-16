var particle_wrapVS = /* wgsl */ `
    let origParticlePos: vec3f = particlePos;
    particlePos = particlePos - uniform.matrix_model[3].xyz;
    particlePos = (particlePos % uniform.wrapBounds) - uniform.wrapBounds * 0.5;
    particlePos = particlePos + uniform.matrix_model[3].xyz;
    particlePosMoved = particlePos - origParticlePos;
`;

export { particle_wrapVS as default };
