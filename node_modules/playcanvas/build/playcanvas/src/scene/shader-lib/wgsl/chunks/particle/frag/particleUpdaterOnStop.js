var particleUpdaterOnStopPS = `
	visMode = select(visMode, -1.0, outLife < 0.0);
`;

export { particleUpdaterOnStopPS as default };
