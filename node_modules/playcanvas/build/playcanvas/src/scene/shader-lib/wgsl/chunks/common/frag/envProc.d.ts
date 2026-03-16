declare const _default: "\n#ifdef LIT_SKYBOX_INTENSITY\n    uniform skyboxIntensity : f32;\n#endif\n\nfn processEnvironment(color : vec3f) -> vec3f {\n    #ifdef LIT_SKYBOX_INTENSITY\n        return color * uniform.skyboxIntensity;\n    #else\n        return color;\n    #endif\n}\n";
export default _default;
