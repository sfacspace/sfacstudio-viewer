declare const _default: "\n    localPos *= particle_vertexData2.y * emitterScale;\n    localPos += particlePos;\n\n    #ifdef SCREEN_SPACE\n    gl_Position = vec4(localPos.x, localPos.y, 0.0, 1.0);\n    #else\n    gl_Position = matrix_viewProjection * vec4(localPos, 1.0);\n    #endif\n";
export default _default;
