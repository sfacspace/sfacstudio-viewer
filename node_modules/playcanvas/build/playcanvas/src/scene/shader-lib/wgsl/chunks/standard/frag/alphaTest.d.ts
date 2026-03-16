declare const _default: "\nuniform alpha_ref: f32;\n\nfn alphaTest(a: f32) {\n    if (a < uniform.alpha_ref) {\n        discard;\n    }\n}\n";
export default _default;
