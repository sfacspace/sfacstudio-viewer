var particleAnimFrameLoopVS = `
	let animFrame: f32 = floor((output.texCoordsAlphaLife.w * uniform.animTexParams.y + uniform.animTexParams.x) % (uniform.animTexParams.z + 1.0));	
`;

export { particleAnimFrameLoopVS as default };
