declare const _default: "\n        #include \"gammaPS\"\n        varying vec4 color;\n        void main(void) {\n            gl_FragColor = vec4(gammaCorrectOutput(decodeGamma(color.rgb)), color.a);\n        }\n";
export default _default;
