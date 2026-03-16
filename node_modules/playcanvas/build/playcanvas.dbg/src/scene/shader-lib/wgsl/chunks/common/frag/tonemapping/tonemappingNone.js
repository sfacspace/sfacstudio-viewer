var tonemappingNonePS = /* wgsl */ `
fn toneMap(color: vec3f) -> vec3f {
    return color;
}
`;

export { tonemappingNonePS as default };
