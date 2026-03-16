declare const _default: "\n#if defined(LIGHT{i})\n    evaluateLight{i}(\n        #if defined(LIT_IRIDESCENCE)\n            iridescenceFresnel\n        #endif\n    );\n#endif\n";
export default _default;
