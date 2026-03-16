var aoDiffuseOccPS = `
fn occludeDiffuse(ao: f32) {
	dDiffuseLight = dDiffuseLight * ao;
}
`;

export { aoDiffuseOccPS as default };
