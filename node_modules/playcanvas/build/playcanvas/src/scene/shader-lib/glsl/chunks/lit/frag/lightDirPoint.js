var lightDirPointPS = `
vec3 evalOmniLight(vec3 lightPosW) {
	return vPositionW - lightPosW;
}
`;

export { lightDirPointPS as default };
