var TBNPS = `
#ifdef LIT_TANGENTS
	#define TBN_TANGENTS
#else
	#if defined(LIT_USE_NORMALS) || defined(LIT_USE_CLEARCOAT_NORMALS)
		#define TBN_DERIVATIVES
	#endif
#endif
#if defined(TBN_DERIVATIVES)
	uniform tbnBasis: f32;
#endif
fn getTBN(tangent: vec3f, binormal: vec3f, normal: vec3f) {
	#ifdef TBN_TANGENTS
		dTBN = mat3x3f(normalize(tangent), normalize(binormal), normalize(normal));
	#elif defined(TBN_DERIVATIVES)
		let uv: vec2f = {lightingUv};
		let dp1: vec3f = dpdx( vPositionW );
		let dp2: vec3f = dpdy( vPositionW );
		let duv1: vec2f = dpdx( uv );
		let duv2: vec2f = dpdy( uv );
		let dp2perp: vec3f = cross( dp2, normal );
		let dp1perp: vec3f = cross( normal, dp1 );
		let T: vec3f = dp2perp * duv1.x + dp1perp * duv2.x;
		let B: vec3f = dp2perp * duv1.y + dp1perp * duv2.y;
		let denom: f32 = max( dot(T, T), dot(B, B) );
		let invmax: f32 = select(uniform.tbnBasis / sqrt( denom ), 0.0, denom == 0.0);
		dTBN = mat3x3f(T * invmax, -B * invmax, normal );
	#else
		var B: vec3f = cross(normal, vObjectSpaceUpW);
		var T: vec3f = cross(normal, B);
		if (dot(B,B) == 0.0)
		{
			let major: f32 = max(max(normal.x, normal.y), normal.z);
			if (normal.x == major)
			{
				B = cross(normal, vec3f(0.0, 1.0, 0.0));
				T = cross(normal, B);
			}
			else if (normal.y == major)
			{
				B = cross(normal, vec3f(0.0, 0.0, 1.0));
				T = cross(normal, B);
			}
			else
			{
				B = cross(normal, vec3f(1.0, 0.0, 0.0));
				T = cross(normal, B);
			}
		}
		dTBN = mat3x3f(normalize(T), normalize(B), normalize(normal));
	#endif
}`;

export { TBNPS as default };
