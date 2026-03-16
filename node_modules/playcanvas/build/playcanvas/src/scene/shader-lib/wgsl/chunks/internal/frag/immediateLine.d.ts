declare const _default: "\n    #include \"gammaPS\"\n    varying color: vec4f;\n    @fragment\n    fn fragmentMain(input : FragmentInput) -> FragmentOutput {\n        var output: FragmentOutput;\n        output.color = vec4f(gammaCorrectOutput(decodeGamma3(input.color.rgb)), input.color.a);\n        return output;\n    }\n";
export default _default;
