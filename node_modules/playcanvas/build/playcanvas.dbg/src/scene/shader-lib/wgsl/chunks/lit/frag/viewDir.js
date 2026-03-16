var viewDirPS = /* wgsl */ `
fn getViewDir() {
    dViewDirW = normalize(uniform.view_position - vPositionW);
}
`;

export { viewDirPS as default };
