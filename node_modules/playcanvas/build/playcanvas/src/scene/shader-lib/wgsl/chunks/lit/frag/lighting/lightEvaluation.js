var lightEvaluationPS = `
#if defined(LIGHT{i})
	evaluateLight{i}(
		#if defined(LIT_IRIDESCENCE)
			iridescenceFresnel
		#endif
	);
#endif
`;

export { lightEvaluationPS as default };
