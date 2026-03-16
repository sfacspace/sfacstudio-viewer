var particle_softVS = `
	output.vDepth = getLinearDepth(localPos);
`;

export { particle_softVS as default };
