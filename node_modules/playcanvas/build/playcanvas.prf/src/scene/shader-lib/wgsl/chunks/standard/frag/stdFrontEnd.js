var stdFrontEndPS = `
	#if LIT_BLEND_TYPE != NONE || defined(LIT_ALPHA_TEST) || defined(LIT_ALPHA_TO_COVERAGE) || STD_OPACITY_DITHER != NONE
		#include "opacityPS"
		#if defined(LIT_ALPHA_TEST)
			#include "alphaTestPS"
		#endif
		#if STD_OPACITY_DITHER != NONE
			#include "opacityDitherPS"
		#endif
	#endif
	#ifdef FORWARD_PASS
		#ifdef STD_HEIGHT_MAP
			#include "parallaxPS"
		#endif
		#include  "diffusePS"
		#ifdef LIT_NEEDS_NORMAL
			#include "normalMapPS"
		#endif
		#ifdef LIT_REFRACTION
			#include "transmissionPS"
			#include "thicknessPS"
		#endif
		#ifdef LIT_IRIDESCENCE
			#include "iridescencePS"
			#include "iridescenceThicknessPS"
		#endif
		#ifdef LIT_SPECULAR_OR_REFLECTION
			#ifdef LIT_SHEEN
				#include "sheenPS"
				#include "sheenGlossPS"
			#endif
			#ifdef LIT_METALNESS
				#include "metalnessPS"
				#include "iorPS"
			#endif
			#ifdef LIT_SPECULARITY_FACTOR
				#include "specularityFactorPS"
			#endif
			#ifdef STD_SPECULAR_COLOR
				#include "specularPS"
			#else
				fn getSpecularity() { 
					dSpecularity = vec3f(1.0, 1.0, 1.0);
				}
			#endif
			#include "glossPS"
		#endif
		#ifdef STD_AO
			#include "aoPS"
		#endif
		#include "emissivePS"
		#ifdef LIT_CLEARCOAT
			#include "clearCoatPS"
			#include "clearCoatGlossPS"
			#include "clearCoatNormalPS"
		#endif
		#if defined(LIT_SPECULAR) && defined(LIT_LIGHTING) && defined(LIT_GGX_SPECULAR)
			#include "anisotropyPS"
		#endif
		#if defined(STD_LIGHTMAP) || defined(STD_LIGHT_VERTEX_COLOR)
			#include "lightmapPS"
		#endif
	#endif
	fn evaluateFrontend() {
		#if LIT_BLEND_TYPE != NONE || defined(LIT_ALPHA_TEST) || defined(LIT_ALPHA_TO_COVERAGE) || STD_OPACITY_DITHER != NONE
			getOpacity();
			#if defined(LIT_ALPHA_TEST)
				alphaTest(dAlpha);
			#endif
			#if STD_OPACITY_DITHER != NONE
				opacityDither(dAlpha, 0.0);
			#endif
			litArgs_opacity = dAlpha;
		#endif
		#ifdef FORWARD_PASS
			#ifdef STD_HEIGHT_MAP
				getParallax();
			#endif
			getAlbedo();
			litArgs_albedo = dAlbedo;
			#ifdef LIT_NEEDS_NORMAL
				getNormal();
				litArgs_worldNormal = dNormalW;
			#endif
			#ifdef LIT_REFRACTION
				getRefraction();
				litArgs_transmission = dTransmission;
				getThickness();
				litArgs_thickness = dThickness;
				#ifdef LIT_DISPERSION
					litArgs_dispersion = uniform.material_dispersion;
				#endif
			#endif
			#ifdef LIT_IRIDESCENCE
				getIridescence();
				getIridescenceThickness();
				litArgs_iridescence_intensity = dIridescence;
				litArgs_iridescence_thickness = dIridescenceThickness;
			#endif
			#ifdef LIT_SPECULAR_OR_REFLECTION
				#ifdef LIT_SHEEN
					getSheen();
					litArgs_sheen_specularity = sSpecularity;
					getSheenGlossiness();
					litArgs_sheen_gloss = sGlossiness;
				#endif
				#ifdef LIT_METALNESS
					getMetalness();
					litArgs_metalness = dMetalness;
					getIor();
					litArgs_ior = dIor;
				#endif
				#ifdef LIT_SPECULARITY_FACTOR
					getSpecularityFactor();
					litArgs_specularityFactor = dSpecularityFactor;
				#endif
				getGlossiness();
				getSpecularity();
				litArgs_specularity = dSpecularity;
				litArgs_gloss = dGlossiness;
			#endif
			#ifdef STD_AO
				getAO();
				litArgs_ao = dAo;
			#endif
			getEmission();
			litArgs_emission = dEmission;
			#ifdef LIT_CLEARCOAT
				getClearCoat();
				getClearCoatGlossiness();
				getClearCoatNormal();
				litArgs_clearcoat_specularity = ccSpecularity;
				litArgs_clearcoat_gloss = ccGlossiness;
				litArgs_clearcoat_worldNormal = ccNormalW;
			#endif
			#if defined(LIT_SPECULAR) && defined(LIT_LIGHTING) && defined(LIT_GGX_SPECULAR)
				getAnisotropy();
			#endif
			#if defined(STD_LIGHTMAP) || defined(STD_LIGHT_VERTEX_COLOR)
				getLightMap();
				litArgs_lightmap = dLightmap;
				#ifdef STD_LIGHTMAP_DIR
					litArgs_lightmapDir = dLightmapDir;
				#endif
			#endif
		#endif
	}
`;

export { stdFrontEndPS as default };
