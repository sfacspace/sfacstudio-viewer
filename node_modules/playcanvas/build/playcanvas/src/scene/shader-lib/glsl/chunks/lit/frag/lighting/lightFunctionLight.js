var lightFunctionLightPS = `
#if defined(LIGHT{i})
void evaluateLight{i}(
	#if defined(LIT_IRIDESCENCE)
		vec3 iridescenceFresnel
	#endif
) {
	vec3 lightColor = light{i}_color;
	#if LIGHT{i}TYPE == DIRECTIONAL && !defined(LIT_SHADOW_CATCHER)
		if (all(equal(lightColor, vec3(0.0)))) {
			return;
		}
	#endif
	#if LIGHT{i}TYPE == DIRECTIONAL
		dLightDirNormW = light{i}_direction;
		dAtten = 1.0;
	#else
		
		vec3 lightDirW = evalOmniLight(light{i}_position);
		dLightDirNormW = normalize(lightDirW);
		#if defined(LIGHT{i}COOKIE)
			#if LIGHT{i}TYPE == SPOT
				#ifdef LIGHT{i}COOKIE_FALLOFF
					#ifdef LIGHT{i}COOKIE_TRANSFORM
						vec3 cookieAttenuation = getCookie2DXform(light{i}_cookie, light{i}_shadowMatrix, light{i}_cookieIntensity, light{i}_cookieMatrix, light{i}_cookieOffset).{LIGHT{i}COOKIE_CHANNEL};
					#else
						vec3 cookieAttenuation = getCookie2D(light{i}_cookie, light{i}_shadowMatrix, light{i}_cookieIntensity).{LIGHT{i}COOKIE_CHANNEL};
					#endif
				#else
					#ifdef LIGHT{i}COOKIE_TRANSFORM
						vec3 cookieAttenuation = getCookie2DClipXform(light{i}_cookie, light{i}_shadowMatrix, light{i}_cookieIntensity, light{i}_cookieMatrix, light{i}_cookieOffset).{LIGHT{i}COOKIE_CHANNEL};
					#else
						vec3 cookieAttenuation = getCookie2DClip(light{i}_cookie, light{i}_shadowMatrix, light{i}_cookieIntensity).{LIGHT{i}COOKIE_CHANNEL};
					#endif
				#endif
			#endif
			#if LIGHT{i}TYPE == OMNI
				vec3 cookieAttenuation = getCookieCube(light{i}_cookie, light{i}_shadowMatrix, light{i}_cookieIntensity).{LIGHT{i}COOKIE_CHANNEL};
			#endif
			lightColor *= cookieAttenuation;
		#endif
		#if LIGHT{i}SHAPE == PUNCTUAL
			#if LIGHT{i}FALLOFF == LINEAR
				dAtten = getFalloffLinear(light{i}_radius, lightDirW);
			#else
				dAtten = getFalloffInvSquared(light{i}_radius, lightDirW);
			#endif
		#else
			dAtten = getFalloffWindow(light{i}_radius, lightDirW);
		#endif
		#if LIGHT{i}TYPE == SPOT
			#if !defined(LIGHT{i}COOKIE) || defined(LIGHT{i}COOKIE_FALLOFF)
				dAtten *= getSpotEffect(light{i}_direction, light{i}_innerConeAngle, light{i}_outerConeAngle, dLightDirNormW);
			#endif
		#endif
	#endif
	if (dAtten < 0.00001) {
		return;
	}
	#if LIGHT{i}SHAPE != PUNCTUAL
		#if LIGHT{i}SHAPE == RECT
			calcRectLightValues(light{i}_position, light{i}_halfWidth, light{i}_halfHeight);
		#elif LIGHT{i}SHAPE == DISK
			calcDiskLightValues(light{i}_position, light{i}_halfWidth, light{i}_halfHeight);
		#elif LIGHT{i}SHAPE == SPHERE
			calcSphereLightValues(light{i}_position, light{i}_halfWidth, light{i}_halfHeight);
		#endif
	#endif
	#if LIGHT{i}SHAPE != PUNCTUAL
		#if LIGHT{i}TYPE == DIRECTIONAL
			float attenDiffuse = getLightDiffuse(litArgs_worldNormal, dViewDirW, dLightDirNormW);
		#else
			#if LIGHT{i}SHAPE == RECT
				float attenDiffuse = getRectLightDiffuse(litArgs_worldNormal, dViewDirW, lightDirW, dLightDirNormW) * 16.0;
			#elif LIGHT{i}SHAPE == DISK
				float attenDiffuse = getDiskLightDiffuse(litArgs_worldNormal, dViewDirW, lightDirW, dLightDirNormW) * 16.0;
			#elif LIGHT{i}SHAPE == SPHERE
				float attenDiffuse = getSphereLightDiffuse(litArgs_worldNormal, dViewDirW, lightDirW, dLightDirNormW) * 16.0;
			#endif
		#endif
	#else
		dAtten *= getLightDiffuse(litArgs_worldNormal, vec3(0.0), dLightDirNormW);
	#endif
	#ifdef LIGHT{i}CASTSHADOW
		#if LIGHT{i}TYPE == DIRECTIONAL
			float shadow = getShadow{i}(vec3(0.0));
		#else
			float shadow = getShadow{i}(lightDirW);
		#endif
		shadow = mix(1.0, shadow, light{i}_shadowIntensity);
		dAtten *= shadow;
		#if defined(LIT_SHADOW_CATCHER) && LIGHT{i}TYPE == DIRECTIONAL
			dShadowCatcher *= shadow;
		#endif			
	#endif
	#if LIGHT{i}SHAPE != PUNCTUAL
		#ifdef LIT_SPECULAR
			dDiffuseLight += ((attenDiffuse * dAtten) * lightColor) * (1.0 - dLTCSpecFres);
		#else
			dDiffuseLight += (attenDiffuse * dAtten) * lightColor;
		#endif						
	#else
		#if defined(AREA_LIGHTS) && defined(LIT_SPECULAR)
			dDiffuseLight += (dAtten * lightColor) * (1.0 - litArgs_specularity);
		#else
			dDiffuseLight += dAtten * lightColor;
		#endif
	#endif
	#ifdef LIGHT{i}AFFECT_SPECULARITY
		#if LIGHT{i}SHAPE != PUNCTUAL
			#ifdef LIT_CLEARCOAT
				#if LIGHT{i}SHAPE == RECT
					ccSpecularLight += ccLTCSpecFres * getRectLightSpecular(litArgs_clearcoat_worldNormal, dViewDirW) * dAtten * lightColor;
				#elif LIGHT{i}SHAPE == DISK
					ccSpecularLight += ccLTCSpecFres * getDiskLightSpecular(litArgs_clearcoat_worldNormal, dViewDirW) * dAtten * lightColor;
				#elif LIGHT{i}SHAPE == SPHERE
					ccSpecularLight += ccLTCSpecFres * getSphereLightSpecular(litArgs_clearcoat_worldNormal, dViewDirW) * dAtten * lightColor;
				#endif
			#endif
			#ifdef LIT_SPECULAR
				#if LIGHT{i}SHAPE == RECT
					dSpecularLight += dLTCSpecFres * getRectLightSpecular(litArgs_worldNormal, dViewDirW) * dAtten * lightColor;
				#elif LIGHT{i}SHAPE == DISK
					dSpecularLight += dLTCSpecFres * getDiskLightSpecular(litArgs_worldNormal, dViewDirW) * dAtten * lightColor;
				#elif LIGHT{i}SHAPE == SPHERE
					dSpecularLight += dLTCSpecFres * getSphereLightSpecular(litArgs_worldNormal, dViewDirW) * dAtten * lightColor;
				#endif
			#endif
		#else
			#if LIGHT{i}TYPE == DIRECTIONAL && LIT_FRESNEL_MODEL != NONE
				#define LIGHT{i}FRESNEL
			#endif
			#ifdef LIT_SPECULAR
				vec3 halfDirW = normalize(-dLightDirNormW + dViewDirW);
			#endif
			#ifdef LIT_CLEARCOAT
				vec3 lightspecularCC = getLightSpecular(halfDirW, ccReflDirW, litArgs_clearcoat_worldNormal, dViewDirW, dLightDirNormW, litArgs_clearcoat_gloss, dTBN) * dAtten * lightColor;
				#ifdef LIGHT{i}FRESNEL
					lightspecularCC *= getFresnelCC(dot(dViewDirW, halfDirW));
				#endif
				ccSpecularLight += lightspecularCC;
			#endif
			#ifdef LIT_SHEEN
				sSpecularLight += getLightSpecularSheen(halfDirW, litArgs_worldNormal, dViewDirW, dLightDirNormW, litArgs_sheen_gloss) * dAtten * lightColor;
			#endif
			#ifdef LIT_SPECULAR
				vec3 lightSpecular = getLightSpecular(halfDirW, dReflDirW, litArgs_worldNormal, dViewDirW, dLightDirNormW, litArgs_gloss, dTBN) * dAtten * lightColor;
				#ifdef LIGHT{i}FRESNEL
					#if defined(LIT_IRIDESCENCE)
						lightSpecular *= getFresnel(dot(dViewDirW, halfDirW), litArgs_gloss, litArgs_specularity, iridescenceFresnel, litArgs_iridescence_intensity);
					#else
						lightSpecular *= getFresnel(dot(dViewDirW, halfDirW), litArgs_gloss, litArgs_specularity);
					#endif
				#else
					lightSpecular *= litArgs_specularity;
				#endif
				
				dSpecularLight += lightSpecular;
			#endif
		#endif
	#endif
}
#endif
`;

export { lightFunctionLightPS as default };
