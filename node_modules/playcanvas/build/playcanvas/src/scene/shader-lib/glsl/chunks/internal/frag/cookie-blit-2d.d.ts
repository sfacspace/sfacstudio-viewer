declare const _default: "\n    varying vec2 uv0;\n    uniform sampler2D blitTexture;\n    void main(void) {\n        gl_FragColor = texture2D(blitTexture, uv0);\n    }\n";
export default _default;
