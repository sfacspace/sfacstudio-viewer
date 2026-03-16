var stdDeclarationPS = `
	float dAlpha = 1.0;
	#if LIT_BLEND_TYPE != NONE || defined(LIT_ALPHA_TEST) || defined(LIT_ALPHA_TO_COVERAGE) || STD_OPACITY_DITHER != NONE
		#ifdef STD_OPACITY_TEXTURE_ALLOCATE
			uniform sampler2D texture_opacityMap;
		#endif
	#endif
	#ifdef FORWARD_PASS
		vec3 dAlbedo;
		vec3 dNormalW;
		vec3 dSpecularity = vec3(0.0);
		float dGlossiness = 0.0;
		#ifdef LIT_REFRACTION
			float dTransmission;
			float dThickness;
		#endif
		#ifdef LIT_SCENE_COLOR
			uniform sampler2D uSceneColorMap;
		#endif
		#ifdef LIT_SCREEN_SIZE
			uniform vec4 uScreenSize;
		#endif
		#ifdef LIT_TRANSFORMS
			uniform mat4 matrix_viewProjection;
			uniform mat4 matrix_model;
		#endif
		#ifdef STD_HEIGHT_MAP
			vec2 dUvOffset;
			#ifdef STD_HEIGHT_TEXTURE_ALLOCATE
				uniform sampler2D texture_heightMap;
			#endif
		#endif
		#ifdef STD_DIFFUSE_TEXTURE_ALLOCATE
			uniform sampler2D texture_diffuseMap;
		#endif
		#ifdef STD_DIFFUSEDETAIL_TEXTURE_ALLOCATE
			uniform sampler2D texture_diffuseDetailMap;
		#endif
		#ifdef STD_NORMAL_TEXTURE_ALLOCATE
			uniform sampler2D texture_normalMap;
		#endif
		#ifdef STD_NORMALDETAIL_TEXTURE_ALLOCATE
			uniform sampler2D texture_normalDetailMap;
		#endif
		#ifdef STD_THICKNESS_TEXTURE_ALLOCATE
			uniform sampler2D texture_thicknessMap;
		#endif
		#ifdef STD_REFRACTION_TEXTURE_ALLOCATE
			uniform sampler2D texture_refractionMap;
		#endif
		#ifdef LIT_IRIDESCENCE
			float dIridescence;
			float dIridescenceThickness;
			#ifdef STD_IRIDESCENCE_THICKNESS_TEXTURE_ALLOCATE
				uniform sampler2D texture_iridescenceThicknessMap;
			#endif
			#ifdef STD_IRIDESCENCE_TEXTURE_ALLOCATE
				uniform sampler2D texture_iridescenceMap;
			#endif
		#endif
		#ifdef LIT_CLEARCOAT
			float ccSpecularity;
			float ccGlossiness;
			vec3 ccNormalW;
		#endif
		#ifdef LIT_GGX_SPECULAR
			float dAnisotropy;
			vec2 dAnisotropyRotation;
		#endif
		#ifdef LIT_SPECULAR_OR_REFLECTION
			#ifdef LIT_SHEEN
				vec3 sSpecularity;
				float sGlossiness;
				#ifdef STD_SHEEN_TEXTURE_ALLOCATE
					uniform sampler2D texture_sheenMap;
				#endif
				#ifdef STD_SHEENGLOSS_TEXTURE_ALLOCATE
					uniform sampler2D texture_sheenGlossMap;
				#endif
			#endif
			#ifdef LIT_METALNESS
				float dMetalness;
				float dIor;
				#ifdef STD_METALNESS_TEXTURE_ALLOCATE
					uniform sampler2D texture_metalnessMap;
				#endif
			#endif
			#ifdef LIT_SPECULARITY_FACTOR
				float dSpecularityFactor;
				#ifdef STD_SPECULARITYFACTOR_TEXTURE_ALLOCATE
					uniform sampler2D texture_specularityFactorMap;
				#endif
			#endif
			#ifdef STD_SPECULAR_COLOR
				#ifdef STD_SPECULAR_TEXTURE_ALLOCATE
					uniform sampler2D texture_specularMap;
				#endif
			#endif
			#ifdef STD_GLOSS_TEXTURE_ALLOCATE
				uniform sampler2D texture_glossMap;
			#endif
		#endif
		#ifdef STD_AO
			float dAo;
			#ifdef STD_AO_TEXTURE_ALLOCATE
				uniform sampler2D texture_aoMap;
			#endif
			#ifdef STD_AODETAIL_TEXTURE_ALLOCATE
				uniform sampler2D texture_aoDetailMap;
			#endif
		#endif
		vec3 dEmission;
		#ifdef STD_EMISSIVE_TEXTURE_ALLOCATE
			uniform sampler2D texture_emissiveMap;
		#endif
		#ifdef LIT_CLEARCOAT
			#ifdef STD_CLEARCOAT_TEXTURE_ALLOCATE
				uniform sampler2D texture_clearCoatMap;
			#endif
			#ifdef STD_CLEARCOATGLOSS_TEXTURE_ALLOCATE
				uniform sampler2D texture_clearCoatGlossMap;
			#endif
			#ifdef STD_CLEARCOATNORMAL_TEXTURE_ALLOCATE
				uniform sampler2D texture_clearCoatNormalMap;
			#endif
		#endif
		
		#ifdef LIT_GGX_SPECULAR
			#ifdef STD_ANISOTROPY_TEXTURE_ALLOCATE
				uniform sampler2D texture_anisotropyMap;
			#endif
		#endif
		#if defined(STD_LIGHTMAP) || defined(STD_LIGHT_VERTEX_COLOR)
			vec3 dLightmap;
			#ifdef STD_LIGHT_TEXTURE_ALLOCATE
				uniform sampler2D texture_lightMap;
			#endif
		#endif
	#endif
	#include "litShaderCorePS"
`;

export { stdDeclarationPS as default };
