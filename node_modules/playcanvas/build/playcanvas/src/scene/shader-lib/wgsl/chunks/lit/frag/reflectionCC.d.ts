declare const _default: "\n#ifdef LIT_CLEARCOAT\nfn addReflectionCC(reflDir: vec3f, gloss: f32) {\n    ccReflection = ccReflection + calcReflection(reflDir, gloss);\n}\n#endif\n";
export default _default;
