declare const _default: "\nuniform exposure: f32;\n\nfn toneMap(color: vec3f) -> vec3f {\n    let tA: f32 = 2.51;\n    let tB: f32 = 0.03;\n    let tC: f32 = 2.43;\n    let tD: f32 = 0.59;\n    let tE: f32 = 0.14;\n    let x: vec3f = color * uniform.exposure;\n    return (x * (tA * x + tB)) / (x * (tC * x + tD) + tE);\n}\n";
export default _default;
