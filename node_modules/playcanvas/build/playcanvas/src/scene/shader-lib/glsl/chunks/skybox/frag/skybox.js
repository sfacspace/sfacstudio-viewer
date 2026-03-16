var skyboxPS = `
	#define LIT_SKYBOX_INTENSITY
	#include "envProcPS"
	#include "gammaPS"
	#include "tonemappingPS"
	#ifdef PREPASS_PASS
		varying float vLinearDepth;
		#include "floatAsUintPS"
	#endif
	varying vec3 vViewDir;
	uniform float skyboxHighlightMultiplier;
	#ifdef SKY_CUBEMAP
		uniform samplerCube texture_cubeMap;
		#ifdef SKYMESH
			varying vec3 vWorldPos;
			uniform mat3 cubeMapRotationMatrix;
			uniform vec3 projectedSkydomeCenter;
		#endif
	#else
		#include "sphericalPS"
		#include "envAtlasPS"
		uniform sampler2D texture_envAtlas;
		uniform float mipLevel;
	#endif
	void main(void) {
		#ifdef PREPASS_PASS
			gl_FragColor = float2vec4(vLinearDepth);
		#else
			#ifdef SKY_CUBEMAP
				#ifdef SKYMESH
					vec3 envDir = normalize(vWorldPos - projectedSkydomeCenter);
					vec3 dir = envDir * cubeMapRotationMatrix;
				#else
					vec3 dir = vViewDir;
				#endif
				dir.x *= -1.0;
				vec3 linear = {SKYBOX_DECODE_FNC}(textureCube(texture_cubeMap, dir));
			#else
				vec3 dir = vViewDir * vec3(-1.0, 1.0, 1.0);
				vec2 uv = toSphericalUv(normalize(dir));
				vec3 linear = {SKYBOX_DECODE_FNC}(texture2D(texture_envAtlas, mapRoughnessUv(uv, mipLevel)));
			#endif
			if (any(greaterThanEqual(linear, vec3(64.0)))) {
				linear *= skyboxHighlightMultiplier;
			}
			gl_FragColor = vec4(gammaCorrectOutput(toneMap(processEnvironment(linear))), 1.0);
		#endif
	}
`;

export { skyboxPS as default };
