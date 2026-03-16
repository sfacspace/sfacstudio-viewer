declare const _default: "\n\n    // global texture bias for standard textures\n    #if LIT_NONE_SLICE_MODE == TILED\n        var<private> textureBias: f32 = -1000.0;\n    #else\n        uniform textureBias: f32;\n    #endif\n\n    #include \"litShaderArgsPS\"\n";
export default _default;
