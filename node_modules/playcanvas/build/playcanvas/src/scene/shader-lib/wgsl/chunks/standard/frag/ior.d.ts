declare const _default: "\n#ifdef STD_IOR_CONSTANT\n    uniform material_refractionIndex: f32;\n#endif\n\nfn getIor() {\n#ifdef STD_IOR_CONSTANT\n    dIor = uniform.material_refractionIndex;\n#else\n    dIor = 1.0 / 1.5;\n#endif\n}\n";
export default _default;
