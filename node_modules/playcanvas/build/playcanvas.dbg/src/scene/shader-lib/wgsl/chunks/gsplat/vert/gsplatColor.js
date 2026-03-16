var gsplatColorVS = /* wgsl */ `

var splatColor: texture_2d<uff>;

fn readColor(source: ptr<function, SplatSource>) -> vec4f {
    return textureLoad(splatColor, source.uv, 0);
}
`;

export { gsplatColorVS as default };
