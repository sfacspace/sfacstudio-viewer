var particle_endPS = `
	rgb = addFog(rgb);
	rgb = toneMap(rgb);
	rgb = gammaCorrectOutput(rgb);
	output.color = vec4f(rgb, a);
	return output;
}
`;

export { particle_endPS as default };
