var gsplatOutputVS = `
#include "tonemappingPS"
#include "decodePS"
#include "gammaPS"
fn prepareOutputFromGamma(gammaColor: vec3f) -> vec3f {
	#if TONEMAP == NONE
		#if GAMMA == NONE
			return decodeGamma3(gammaColor);
		#else 
			return gammaColor;
		#endif
	#else
		return gammaCorrectOutput(toneMap(decodeGamma3(gammaColor)));
	#endif
}
`;

export { gsplatOutputVS as default };
