var uv1VS = /* wgsl */ `
fn getUv1() -> vec2f {
    return vertex_texCoord1;
}
`;

export { uv1VS as default };
