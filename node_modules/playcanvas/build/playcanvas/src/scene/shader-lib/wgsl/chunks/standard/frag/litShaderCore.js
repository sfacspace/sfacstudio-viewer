var litShaderCorePS = `
	#if LIT_NONE_SLICE_MODE == TILED
		var<private> textureBias: f32 = -1000.0;
	#else
		uniform textureBias: f32;
	#endif
	#include "litShaderArgsPS"
`;

export { litShaderCorePS as default };
