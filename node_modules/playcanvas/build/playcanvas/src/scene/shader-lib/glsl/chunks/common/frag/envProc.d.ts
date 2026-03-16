declare const _default: "\n#ifdef LIT_SKYBOX_INTENSITY\n    uniform float skyboxIntensity;\n#endif\n\nvec3 processEnvironment(vec3 color) {\n    #ifdef LIT_SKYBOX_INTENSITY\n        return color * skyboxIntensity;\n    #else\n        return color;\n    #endif\n}\n";
export default _default;
