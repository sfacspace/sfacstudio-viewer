var lightFunctionLightPS = `
#if defined(LIGHT{i})
fn evaluateLight{i}(
	#if defined(LIT_IRIDESCENCE)
		iridescenceFresnel: vec3f
	#endif
) {
	var lightColor: vec3f = uniform.light{i}_color;
	#if LIGHT{i}TYPE == DIRECTIONAL && !defined(LIT_SHADOW_CATCHER)
		if (all(lightColor == vec3f(0.0, 0.0, 0.0))) {
			return;
		}
	#endif
	#if LIGHT{i}TYPE == DIRECTIONAL
		dLightDirNormW = uniform.light{i}_direction;
		dAtten = 1.0;
	#else
		var lightDirW: vec3f = evalOmniLight(uniform.light{i}_position);
		dLightDirNormW = normalize(lightDirW);
		#if defined(LIGHT{i}COOKIE)
			#if LIGHT{i}TYPE == SPOT
				#ifdef LIGHT{i}COOKIE_FALLOFF
					#ifdef LIGHT{i}COOKIE_TRANSFORM
						var cookieAttenuation: vec3f = getCookie2DXform(uniform.light{i}_cookie, uniform.light{i}_shadowMatrix, uniform.light{i}_cookieIntensity, uniform.light{i}_cookieMatrix, uniform.light{i}_cookieOffset).{LIGHT{i}COOKIE_CHANNEL};
					#else
						var cookieAttenuation: vec3f = getCookie2D(uniform.light{i}_cookie, uniform.light{i}_shadowMatrix, uniform.light{i}_cookieIntensity).{LIGHT{i}COOKIE_CHANNEL};
					#endif
				#else
					#ifdef LIGHT{i}COOKIE_TRANSFORM
						var cookieAttenuation: vec3f = getCookie2DClipXform(uniform.light{i}_cookie, uniform.light{i}_shadowMatrix, uniform.light{i}_cookieIntensity, uniform.light{i}_cookieMatrix, uniform.light{i}_cookieOffset).{LIGHT{i}COOKIE_CHANNEL};
					#else
						var cookieAttenuation: vec3f = getCookie2DClip(uniform.light{i}_cookie, uniform.light{i}_shadowMatrix, uniform.light{i}_cookieIntensity).{LIGHT{i}COOKIE_CHANNEL};
					#endif
				#endif
			#endif
			#if LIGHT{i}TYPE == OMNI
				var cookieAttenuation: vec3f = getCookieCube(uniform.light{i}_cookie, uniform.light{i}_shadowMatrix, uniform.light{i}_cookieIntensity).{LIGHT{i}COOKIE_CHANNEL};
			#endif
			lightColor = lightColor * cookieAttenuation;
		#endif
		#if LIGHT{i}SHAPE == PUNCTUAL
			#if LIGHT{i}FALLOFF == LINEAR
				dAtten = getFalloffLinear(uniform.light{i}_radius, lightDirW);
			#else
				dAtten = getFalloffInvSquared(uniform.light{i}_radius, lightDirW);
			#endif
		#else
			dAtten = getFalloffWindow(uniform.light{i}_radius, lightDirW);
		#endif
		#if LIGHT{i}TYPE == SPOT
			#if !defined(LIGHT{i}COOKIE) || defined(LIGHT{i}COOKIE_FALLOFF)
				dAtten = dAtten * getSpotEffect(uniform.light{i}_direction, uniform.light{i}_innerConeAngle, uniform.light{i}_outerConeAngle, dLightDirNormW);
			#endif
		#endif
	#endif
	if (dAtten < 0.00001) {
		return;
	}
	#if LIGHT{i}SHAPE != PUNCTUAL
		#if LIGHT{i}SHAPE == RECT
			calcRectLightValues(uniform.light{i}_position, uniform.light{i}_halfWidth, uniform.light{i}_halfHeight);
		#elif LIGHT{i}SHAPE == DISK
			calcDiskLightValues(uniform.light{i}_position, uniform.light{i}_halfWidth, uniform.light{i}_halfHeight);
		#elif LIGHT{i}SHAPE == SPHERE
			calcSphereLightValues(uniform.light{i}_position, uniform.light{i}_halfWidth, uniform.light{i}_halfHeight);
		#endif
	#endif
	#if LIGHT{i}SHAPE != PUNCTUAL
		#if LIGHT{i}TYPE == DIRECTIONAL
			var attenDiffuse: f32 = getLightDiffuse(litArgs_worldNormal, dViewDirW, dLightDirNormW);
		#else
			#if LIGHT{i}SHAPE == RECT
				var attenDiffuse: f32 = getRectLightDiffuse(litArgs_worldNormal, dViewDirW, lightDirW, dLightDirNormW) * 16.0;
			#elif LIGHT{i}SHAPE == DISK
				var attenDiffuse: f32 = getDiskLightDiffuse(litArgs_worldNormal, dViewDirW, lightDirW, dLightDirNormW) * 16.0;
			#elif LIGHT{i}SHAPE == SPHERE
				var attenDiffuse: f32 = getSphereLightDiffuse(litArgs_worldNormal, dViewDirW, lightDirW, dLightDirNormW) * 16.0;
			#endif
		#endif
	#else
		dAtten = dAtten * getLightDiffuse(litArgs_worldNormal, vec3(0.0), dLightDirNormW);
	#endif
	#ifdef LIGHT{i}CASTSHADOW
		#if LIGHT{i}TYPE == DIRECTIONAL
			var shadow: f32 = getShadow{i}(vec3(0.0));
		#else
			var shadow: f32 = getShadow{i}(lightDirW);
		#endif
		shadow = mix(1.0, shadow, uniform.light{i}_shadowIntensity);
		dAtten = dAtten * shadow;
		#if defined(LIT_SHADOW_CATCHER) && LIGHT{i}TYPE == DIRECTIONAL
			dShadowCatcher = dShadowCatcher * shadow;
		#endif			
	#endif
	#if LIGHT{i}SHAPE != PUNCTUAL
		#ifdef LIT_SPECULAR
			dDiffuseLight = dDiffuseLight + (((attenDiffuse * dAtten) * lightColor) * (1.0 - dLTCSpecFres));
		#else
			dDiffuseLight = dDiffuseLight + ((attenDiffuse * dAtten) * lightColor);
		#endif						
	#else
		#if defined(AREA_LIGHTS) && defined(LIT_SPECULAR)
			dDiffuseLight = dDiffuseLight + ((dAtten * lightColor) * (1.0 - litArgs_specularity));
		#else
			dDiffuseLight = dDiffuseLight + (dAtten * lightColor);
		#endif
	#endif
	#ifdef LIGHT{i}AFFECT_SPECULARITY
		#if LIGHT{i}SHAPE != PUNCTUAL
			#ifdef LIT_CLEARCOAT
				#if LIGHT{i}SHAPE == RECT
					ccSpecularLight = ccSpecularLight + (ccLTCSpecFres * getRectLightSpecular(litArgs_clearcoat_worldNormal, dViewDirW) * dAtten * lightColor);
				#elif LIGHT{i}SHAPE == DISK
					ccSpecularLight = ccSpecularLight + (ccLTCSpecFres * getDiskLightSpecular(litArgs_clearcoat_worldNormal, dViewDirW) * dAtten * lightColor);
				#elif LIGHT{i}SHAPE == SPHERE
					ccSpecularLight = ccSpecularLight + (ccLTCSpecFres * getSphereLightSpecular(litArgs_clearcoat_worldNormal, dViewDirW) * dAtten * lightColor);
				#endif
			#endif
			#ifdef LIT_SPECULAR
				#if LIGHT{i}SHAPE == RECT
					dSpecularLight = dSpecularLight + (dLTCSpecFres * getRectLightSpecular(litArgs_worldNormal, dViewDirW) * dAtten * lightColor);
				#elif LIGHT{i}SHAPE == DISK
					dSpecularLight = dSpecularLight + (dLTCSpecFres * getDiskLightSpecular(litArgs_worldNormal, dViewDirW) * dAtten * lightColor);
				#elif LIGHT{i}SHAPE == SPHERE
					dSpecularLight = dSpecularLight + (dLTCSpecFres * getSphereLightSpecular(litArgs_worldNormal, dViewDirW) * dAtten * lightColor);
				#endif
			#endif
		#else
			#if LIGHT{i}TYPE == DIRECTIONAL && LIT_FRESNEL_MODEL != NONE
				#define LIGHT{i}FRESNEL
			#endif
			#ifdef LIT_SPECULAR
				var halfDirW: vec3f = normalize(-dLightDirNormW + dViewDirW);
			#endif
			#ifdef LIT_CLEARCOAT
				var lightspecularCC: vec3f = getLightSpecular(halfDirW, ccReflDirW, litArgs_clearcoat_worldNormal, dViewDirW, dLightDirNormW, litArgs_clearcoat_gloss, dTBN) * dAtten * lightColor;
				#ifdef LIGHT{i}FRESNEL
					lightspecularCC = lightspecularCC * getFresnelCC(dot(dViewDirW, halfDirW));
				#endif
				ccSpecularLight = ccSpecularLight + lightspecularCC;
			#endif
			#ifdef LIT_SHEEN
				sSpecularLight = sSpecularLight + (getLightSpecularSheen(halfDirW, litArgs_worldNormal, dViewDirW, dLightDirNormW, litArgs_sheen_gloss) * dAtten * lightColor);
			#endif
			#ifdef LIT_SPECULAR
				var lightSpecular: vec3f = getLightSpecular(halfDirW, dReflDirW, litArgs_worldNormal, dViewDirW, dLightDirNormW, litArgs_gloss, dTBN) * dAtten * lightColor;
				#ifdef LIGHT{i}FRESNEL
					#if defined(LIT_IRIDESCENCE)
						lightSpecular = lightSpecular * getFresnel(dot(dViewDirW, halfDirW), litArgs_gloss, litArgs_specularity, iridescenceFresnel, litArgs_iridescence_intensity);
					#else
						lightSpecular = lightSpecular * getFresnel(dot(dViewDirW, halfDirW), litArgs_gloss, litArgs_specularity);
					#endif
				#else
					lightSpecular = lightSpecular * litArgs_specularity;
				#endif
				
				dSpecularLight = dSpecularLight + lightSpecular;
			#endif
		#endif
	#endif
}
#endif
`;

export { lightFunctionLightPS as default };
