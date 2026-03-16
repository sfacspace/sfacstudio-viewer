declare const _default: "\nvarying vUv0: vec2f;\nvar source: texture_2d<f32>;\nvar sourceSampler: sampler;\n\n@fragment fn fragmentMain(input : FragmentInput) -> FragmentOutput {\n    var output: FragmentOutput;\n    output.color = textureSample(source, sourceSampler, input.vUv0);\n    return output;\n}\n";
export default _default;
