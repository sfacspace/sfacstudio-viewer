var lightDirPointPS = /* wgsl */ `
fn evalOmniLight(lightPosW: vec3f) -> vec3f {
    return vPositionW - lightPosW;
}
`;

export { lightDirPointPS as default };
