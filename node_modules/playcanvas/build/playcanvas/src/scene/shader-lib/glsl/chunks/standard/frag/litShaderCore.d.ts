declare const _default: "\n\n    // global texture bias for standard textures\n    #if LIT_NONE_SLICE_MODE == TILED\n        const float textureBias = -1000.0;\n    #else\n        uniform float textureBias;\n    #endif\n\n    #include \"litShaderArgsPS\"\n";
export default _default;
