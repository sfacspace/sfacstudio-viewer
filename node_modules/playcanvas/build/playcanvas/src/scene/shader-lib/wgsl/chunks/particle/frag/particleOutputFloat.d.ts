declare const _default: "\nfn getOutput() -> vec4f {\n    if (pcPosition.y < 1.0) {\n        return vec4f(outPos, (outAngle + 1000.0) * visMode);\n    } else {\n        return vec4f(outVel, outLife);\n    }\n}\n";
export default _default;
