// evaluation of a light with index {i}, driven by defines
var lightEvaluationPS = /* glsl */ `
#if defined(LIGHT{i})
    evaluateLight{i}(
        #if defined(LIT_IRIDESCENCE)
            iridescenceFresnel
        #endif
    );
#endif
`;

export { lightEvaluationPS as default };
