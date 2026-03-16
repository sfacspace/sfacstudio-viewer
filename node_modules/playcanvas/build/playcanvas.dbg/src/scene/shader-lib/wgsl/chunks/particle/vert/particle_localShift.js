var particle_localShiftVS = /* wgsl */ `
particlePos = (uniform.matrix_model * vec4f(particlePos, 1.0)).xyz;
`;

export { particle_localShiftVS as default };
