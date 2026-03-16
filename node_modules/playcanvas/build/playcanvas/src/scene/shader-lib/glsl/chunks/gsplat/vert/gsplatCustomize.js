var gsplatCustomizeVS = `
void modifyCenter(inout vec3 center) {
}
void modifyCovariance(vec3 originalCenter, vec3 modifiedCenter, inout vec3 covA, inout vec3 covB) {
}
void modifyColor(vec3 center, inout vec4 color) {
}
`;

export { gsplatCustomizeVS as default };
