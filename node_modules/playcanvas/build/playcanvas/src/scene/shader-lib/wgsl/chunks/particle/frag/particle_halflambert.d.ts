declare const _default: "\n    var negNormal: vec3f = normal * 0.5 + 0.5;\n    var posNormal: vec3f = -normal * 0.5 + 0.5;\n    negNormal = negNormal * negNormal;\n    posNormal = posNormal * posNormal;\n";
export default _default;
