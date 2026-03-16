declare const _default: "\n\nvar splatColor: texture_2d<uff>;\n\nfn readColor(source: ptr<function, SplatSource>) -> vec4f {\n    return textureLoad(splatColor, source.uv, 0);\n}\n";
export default _default;
