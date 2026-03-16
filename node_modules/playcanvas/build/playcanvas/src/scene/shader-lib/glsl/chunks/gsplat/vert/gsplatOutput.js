var gsplatOutputVS = `
#include "tonemappingPS"
#include "decodePS"
#include "gammaPS"
vec3 prepareOutputFromGamma(vec3 gammaColor) {
	#if TONEMAP == NONE
		#if GAMMA == NONE
			return decodeGamma(gammaColor);
		#else
			return gammaColor;
		#endif
	#else
		return gammaCorrectOutput(toneMap(decodeGamma(gammaColor)));
	#endif
}
`;

export { gsplatOutputVS as default };
