declare const _default: "\n    varying vec2 uv0;\n    uniform samplerCube blitTexture;\n    uniform mat4 invViewProj;\n    void main(void) {\n        vec4 projPos = vec4(uv0 * 2.0 - 1.0, 0.5, 1.0);\n        vec4 worldPos = invViewProj * projPos;\n        gl_FragColor = textureCube(blitTexture, worldPos.xyz);\n    }\n";
export default _default;
