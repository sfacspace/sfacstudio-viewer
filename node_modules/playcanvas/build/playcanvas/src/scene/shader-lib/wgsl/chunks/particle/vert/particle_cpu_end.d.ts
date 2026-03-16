declare const _default: "\n    localPos = localPos * input.particle_vertexData2.y * uniform.emitterScale;\n    localPos = localPos + particlePos;\n\n    #ifdef SCREEN_SPACE\n        output.position = vec4f(localPos.x, localPos.y, 0.0, 1.0);\n    #else\n        output.position = uniform.matrix_viewProjection * vec4f(localPos, 1.0);\n    #endif\n";
export default _default;
