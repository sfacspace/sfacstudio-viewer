declare const _default: "\n    varying uv0: vec2f;\n\n    var blitTexture: texture_2d<f32>;\n    var blitTextureSampler : sampler;\n\n    @fragment\n    fn fragmentMain(input : FragmentInput) -> FragmentOutput {\n        var output: FragmentOutput;\n        output.color = textureSample(blitTexture, blitTextureSampler, input.uv0);\n        return output;\n    }\n";
export default _default;
