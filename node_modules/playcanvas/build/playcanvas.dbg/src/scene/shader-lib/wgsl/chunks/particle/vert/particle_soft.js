var particle_softVS = /* wgsl */ `
    output.vDepth = getLinearDepth(localPos);
`;

export { particle_softVS as default };
