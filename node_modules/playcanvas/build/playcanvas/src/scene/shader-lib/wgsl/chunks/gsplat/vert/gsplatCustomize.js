var gsplatCustomizeVS = `
fn modifyCenter(center: ptr<function, vec3f>) {
}
fn modifyCovariance(originalCenter: vec3f, modifiedCenter: vec3f, covA: ptr<function, vec3f>, covB: ptr<function, vec3f>) {
}
fn modifyColor(center: vec3f, color: ptr<function, vec4f>) {
}
`;

export { gsplatCustomizeVS as default };
