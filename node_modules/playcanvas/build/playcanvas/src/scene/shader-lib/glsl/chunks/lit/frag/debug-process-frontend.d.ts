declare const _default: "\n#ifdef DEBUG_LIGHTING_PASS\nlitArgs_albedo = vec3(0.5);\n#endif\n\n#ifdef DEBUG_UV0_PASS\n#ifdef VARYING_VUV0\nlitArgs_albedo = vec3(vUv0, 0);\n#else\nlitArgs_albedo = vec3(0);\n#endif\n#endif\n";
export default _default;
