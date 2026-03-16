declare const _default: "\nattribute vec2 vertex_position;\nuniform vec4 uvMod;\nvarying vec2 vUv0;\n\nvoid main(void) {\n    gl_Position = vec4(vertex_position, 0.5, 1.0);\n    vUv0 = getImageEffectUV((vertex_position.xy * 0.5 + 0.5) * uvMod.xy + uvMod.zw);\n}\n";
export default _default;
