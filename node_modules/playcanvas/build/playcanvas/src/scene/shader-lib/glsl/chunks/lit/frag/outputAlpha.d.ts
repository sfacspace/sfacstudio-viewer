declare const _default: "\n\n#if LIT_BLEND_TYPE == NORMAL || LIT_BLEND_TYPE == ADDITIVEALPHA || defined(LIT_ALPHA_TO_COVERAGE)\n\n    gl_FragColor.a = litArgs_opacity;\n\n#elif LIT_BLEND_TYPE == PREMULTIPLIED\n\n    gl_FragColor.rgb *= litArgs_opacity;\n    gl_FragColor.a = litArgs_opacity;\n\n#else\n\n    gl_FragColor.a = 1.0;\n\n#endif\n";
export default _default;
