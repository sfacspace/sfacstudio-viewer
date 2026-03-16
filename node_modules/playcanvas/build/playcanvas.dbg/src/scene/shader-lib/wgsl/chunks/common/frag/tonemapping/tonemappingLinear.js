var tonemappingLinearPS = /* wgsl */ `
uniform exposure: f32;

fn toneMap(color: vec3f) -> vec3f {
    return color * uniform.exposure;
}
`;

export { tonemappingLinearPS as default };
