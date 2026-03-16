var viewDirPS = `
fn getViewDir() {
	dViewDirW = normalize(uniform.view_position - vPositionW);
}
`;

export { viewDirPS as default };
