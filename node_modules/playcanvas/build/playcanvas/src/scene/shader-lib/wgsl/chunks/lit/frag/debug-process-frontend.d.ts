declare const _default: "\n#ifdef DEBUG_LIGHTING_PASS\n    litArgs_albedo = vec3f(0.5);\n#endif\n\n#ifdef DEBUG_UV0_PASS\n#ifdef VARYING_VUV0\n    litArgs_albedo = vec3f(vUv0, 0.0);\n#else\n    litArgs_albedo = vec3f(0.0);\n#endif\n#endif\n";
export default _default;
