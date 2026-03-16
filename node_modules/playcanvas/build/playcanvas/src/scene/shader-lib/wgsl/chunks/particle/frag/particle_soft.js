var particle_softPS = `
	var depth: f32 = getLinearScreenDepthFrag();
	var particleDepth: f32 = vDepth;
	var depthDiff: f32 = saturate(abs(particleDepth - depth) * uniform.softening);
	a = a * depthDiff;
`;

export { particle_softPS as default };
