declare const _default: "\n    attribute vec2 aPosition;\n    varying vec2 uv0;\n    void main(void)\n    {\n        gl_Position = vec4(aPosition, 0.0, 1.0);\n        uv0 = getImageEffectUV((aPosition.xy + 1.0) * 0.5);\n    }\n";
export default _default;
