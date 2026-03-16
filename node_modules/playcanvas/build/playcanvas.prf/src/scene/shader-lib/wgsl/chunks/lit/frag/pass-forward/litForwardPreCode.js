var litForwardPreCodePS = `
#include "basePS"
#include "sphericalPS"
#include "decodePS"
#include "gammaPS"
#include "tonemappingPS"
#include "fogPS"
#if LIT_NONE_SLICE_MODE == SLICED
	#include "baseNineSlicedPS"
#elif LIT_NONE_SLICE_MODE == TILED
	#include "baseNineSlicedTiledPS"
#endif
#ifdef LIT_TBN
	#include "TBNPS"
	#ifdef LIT_TWO_SIDED_LIGHTING
		#include "twoSidedLightingPS"
	#endif
#endif
`;

export { litForwardPreCodePS as default };
