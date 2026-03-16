declare const _default: "\n\nuniform mediump sampler2D splatColor;\n\nvec4 readColor(in SplatSource source) {\n    return texelFetch(splatColor, source.uv, 0);\n}\n\n";
export default _default;
