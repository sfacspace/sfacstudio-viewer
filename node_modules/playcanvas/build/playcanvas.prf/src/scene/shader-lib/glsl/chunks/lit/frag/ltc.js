var ltcPS = `
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
struct Coords {
	vec3 coord0;
	vec3 coord1;
	vec3 coord2;
	vec3 coord3;
};
float LTC_EvaluateRect( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in Coords rectCoords) {
	vec3 v1 = rectCoords.coord1 - rectCoords.coord0;
	vec3 v2 = rectCoords.coord3 - rectCoords.coord0;
	
	vec3 lightNormal = cross( v1, v2 );
	float factor = sign(-dot( lightNormal, P - rectCoords.coord0 ));
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 =  factor * cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords.coord0 - P );
	coords[ 1 ] = mat * ( rectCoords.coord1 - P );
	coords[ 2 ] = mat * ( rectCoords.coord2 - P );
	coords[ 3 ] = mat * ( rectCoords.coord3 - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return result;
}
Coords dLTCCoords;
Coords getLTCLightCoords(vec3 lightPos, vec3 halfWidth, vec3 halfHeight){
	Coords coords;
	coords.coord0 = lightPos + halfWidth - halfHeight;
	coords.coord1 = lightPos - halfWidth - halfHeight;
	coords.coord2 = lightPos - halfWidth + halfHeight;
	coords.coord3 = lightPos + halfWidth + halfHeight;
	return coords;
}
float dSphereRadius;
Coords getSphereLightCoords(vec3 lightPos, vec3 halfWidth, vec3 halfHeight){
	dSphereRadius = max(length(halfWidth), length(halfHeight));
	vec3 f = reflect(normalize(lightPos - view_position), vNormalW);
	vec3 w = normalize(cross(f, halfHeight));
	vec3 h = normalize(cross(f, w));
	return getLTCLightCoords(lightPos, w * dSphereRadius, h * dSphereRadius);
}
vec2 dLTCUV;
#ifdef LIT_CLEARCOAT
	vec2 ccLTCUV;
#endif
vec2 getLTCLightUV(float gloss, vec3 worldNormal, vec3 viewDir)
{
	float roughness = max((1.0 - gloss) * (1.0 - gloss), 0.001);
	return LTC_Uv( worldNormal, viewDir, roughness );
}
vec3 dLTCSpecFres;
#ifdef LIT_CLEARCOAT
	vec3 ccLTCSpecFres;
#endif
vec3 getLTCLightSpecFres(vec2 uv, vec3 specularity)
{
	vec4 t2 = texture2DLod(areaLightsLutTex2, uv, 0.0);
	return specularity * t2.x + ( vec3( 1.0 ) - specularity) * t2.y;
}
void calcLTCLightValues(float gloss, vec3 worldNormal, vec3 viewDir, vec3 specularity, float clearcoatGloss, vec3 clearcoatWorldNormal, float clearcoatSpecularity)
{
	dLTCUV = getLTCLightUV(gloss, worldNormal, viewDir);
	dLTCSpecFres = getLTCLightSpecFres(dLTCUV, specularity); 
#ifdef LIT_CLEARCOAT
	ccLTCUV = getLTCLightUV(clearcoatGloss, clearcoatWorldNormal, viewDir);
	ccLTCSpecFres = getLTCLightSpecFres(ccLTCUV, vec3(clearcoatSpecularity));
#endif
}
void calcRectLightValues(vec3 lightPos, vec3 halfWidth, vec3 halfHeight) {
	dLTCCoords = getLTCLightCoords(lightPos, halfWidth, halfHeight);
}
void calcDiskLightValues(vec3 lightPos, vec3 halfWidth, vec3 halfHeight) {
	calcRectLightValues(lightPos, halfWidth, halfHeight);
}
void calcSphereLightValues(vec3 lightPos, vec3 halfWidth, vec3 halfHeight) {
	dLTCCoords = getSphereLightCoords(lightPos, halfWidth, halfHeight);
}
vec3 SolveCubic(vec4 Coefficient)
{
	float pi = 3.14159;
	Coefficient.xyz /= Coefficient.w;
	Coefficient.yz /= 3.0;
	float A = Coefficient.w;
	float B = Coefficient.z;
	float C = Coefficient.y;
	float D = Coefficient.x;
	vec3 Delta = vec3(
		-Coefficient.z * Coefficient.z + Coefficient.y,
		-Coefficient.y * Coefficient.z + Coefficient.x,
		dot(vec2(Coefficient.z, -Coefficient.y), Coefficient.xy)
	);
	float Discriminant = dot(vec2(4.0 * Delta.x, -Delta.y), Delta.zy);
	vec2 xlc, xsc;
	{
		float A_a = 1.0;
		float C_a = Delta.x;
		float D_a = -2.0 * B * Delta.x + Delta.y;
		float Theta = atan(sqrt(Discriminant), -D_a) / 3.0;
		float x_1a = 2.0 * sqrt(-C_a) * cos(Theta);
		float x_3a = 2.0 * sqrt(-C_a) * cos(Theta + (2.0 / 3.0) * pi);
		float xl;
		if ((x_1a + x_3a) > 2.0 * B)
			xl = x_1a;
		else
			xl = x_3a;
		xlc = vec2(xl - B, A);
	}
	{
		float A_d = D;
		float C_d = Delta.z;
		float D_d = -D * Delta.y + 2.0 * C * Delta.z;
		float Theta = atan(D * sqrt(Discriminant), -D_d) / 3.0;
		float x_1d = 2.0 * sqrt(-C_d) * cos(Theta);
		float x_3d = 2.0 * sqrt(-C_d) * cos(Theta + (2.0 / 3.0) * pi);
		float xs;
		if (x_1d + x_3d < 2.0 * C)
			xs = x_1d;
		else
			xs = x_3d;
		xsc = vec2(-D, xs + C);
	}
	float E =  xlc.y * xsc.y;
	float F = -xlc.x * xsc.y - xlc.y * xsc.x;
	float G =  xlc.x * xsc.x;
	vec2 xmc = vec2(C * F - B * G, -B * F + C * E);
	vec3 Root = vec3(xsc.x / xsc.y, xmc.x / xmc.y, xlc.x / xlc.y);
	if (Root.x < Root.y && Root.x < Root.z)
		Root.xyz = Root.yxz;
	else if (Root.z < Root.x && Root.z < Root.y)
		Root.xyz = Root.xzy;
	return Root;
}
float LTC_EvaluateDisk(vec3 N, vec3 V, vec3 P, mat3 Minv, Coords points)
{
	vec3 T1 = normalize(V - N * dot(V, N));
	vec3 T2 = cross(N, T1);
	mat3 R = transposeMat3( mat3( T1, T2, N ) );
	vec3 L_[ 3 ];
	L_[ 0 ] = R * ( points.coord0 - P );
	L_[ 1 ] = R * ( points.coord1 - P );
	L_[ 2 ] = R * ( points.coord2 - P );
	vec3 C  = 0.5 * (L_[0] + L_[2]);
	vec3 V1 = 0.5 * (L_[1] - L_[2]);
	vec3 V2 = 0.5 * (L_[1] - L_[0]);
	C  = Minv * C;
	V1 = Minv * V1;
	V2 = Minv * V2;
	float a, b;
	float d11 = dot(V1, V1);
	float d22 = dot(V2, V2);
	float d12 = dot(V1, V2);
	if (abs(d12) / sqrt(d11 * d22) > 0.0001)
	{
		float tr = d11 + d22;
		float det = -d12 * d12 + d11 * d22;
		det = sqrt(det);
		float u = 0.5 * sqrt(tr - 2.0 * det);
		float v = 0.5 * sqrt(tr + 2.0 * det);
		float e_max = (u + v) * (u + v);
		float e_min = (u - v) * (u - v);
		vec3 V1_, V2_;
		if (d11 > d22)
		{
			V1_ = d12 * V1 + (e_max - d11) * V2;
			V2_ = d12 * V1 + (e_min - d11) * V2;
		}
		else
		{
			V1_ = d12*V2 + (e_max - d22)*V1;
			V2_ = d12*V2 + (e_min - d22)*V1;
		}
		a = 1.0 / e_max;
		b = 1.0 / e_min;
		V1 = normalize(V1_);
		V2 = normalize(V2_);
	}
	else
	{
		a = 1.0 / dot(V1, V1);
		b = 1.0 / dot(V2, V2);
		V1 *= sqrt(a);
		V2 *= sqrt(b);
	}
	vec3 V3 = normalize(cross(V1, V2));
	if (dot(C, V3) < 0.0)
		V3 *= -1.0;
	float L  = dot(V3, C);
	float x0 = dot(V1, C) / L;
	float y0 = dot(V2, C) / L;
	float E1 = inversesqrt(a);
	float E2 = inversesqrt(b);
	a *= L * L;
	b *= L * L;
	float c0 = a * b;
	float c1 = a * b * (1.0 + x0 * x0 + y0 * y0) - a - b;
	float c2 = 1.0 - a * (1.0 + x0 * x0) - b * (1.0 + y0 * y0);
	float c3 = 1.0;
	vec3 roots = SolveCubic(vec4(c0, c1, c2, c3));
	float e1 = roots.x;
	float e2 = roots.y;
	float e3 = roots.z;
	vec3 avgDir = vec3(a * x0 / (a - e2), b * y0 / (b - e2), 1.0);
	mat3 rotate = mat3(V1, V2, V3);
	avgDir = rotate * avgDir;
	avgDir = normalize(avgDir);
	float L1 = sqrt(-e2 / e3);
	float L2 = sqrt(-e2 / e1);
	float formFactor = max(0.0, L1 * L2 * inversesqrt((1.0 + L1 * L1) * (1.0 + L2 * L2)));
	
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	vec2 uv = vec2(avgDir.z * 0.5 + 0.5, formFactor);
	uv = uv*LUT_SCALE + LUT_BIAS;
	float scale = texture2DLod(areaLightsLutTex2, uv, 0.0).w;
	return formFactor*scale;
}
float FixNan(float value) {
	#ifdef WEBGPU
		return value != value ? 0.0 : value;
	#else
		return isnan(value) ? 0.0 : value;
	#endif
}
float getRectLightDiffuse(vec3 worldNormal, vec3 viewDir, vec3 lightDir, vec3 lightDirNorm) {
	return LTC_EvaluateRect( worldNormal, viewDir, vPositionW, mat3( 1.0 ), dLTCCoords );
}
float getDiskLightDiffuse(vec3 worldNormal, vec3 viewDir, vec3 lightDir, vec3 lightDirNorm) {
	return FixNan(LTC_EvaluateDisk( worldNormal, viewDir, vPositionW, mat3( 1.0 ), dLTCCoords ));
}
float getSphereLightDiffuse(vec3 worldNormal, vec3 viewDir, vec3 lightDir, vec3 lightDirNorm) {
	float falloff = dSphereRadius / (dot(lightDir, lightDir) + dSphereRadius);
	return FixNan(getLightDiffuse(worldNormal, viewDir, lightDirNorm) * falloff);
}
mat3 getLTCLightInvMat(vec2 uv)
{
	vec4 t1 = texture2DLod(areaLightsLutTex1, uv, 0.0);
	return mat3(
		vec3( t1.x, 0, t1.y ),
		vec3(	0, 1,	0 ),
		vec3( t1.z, 0, t1.w )
	);
}
float calcRectLightSpecular(vec3 worldNormal, vec3 viewDir, vec2 uv) {
	mat3 mInv = getLTCLightInvMat(uv);
	return LTC_EvaluateRect( worldNormal, viewDir, vPositionW, mInv, dLTCCoords );
}
float getRectLightSpecular(vec3 worldNormal, vec3 viewDir) {
	return calcRectLightSpecular(worldNormal, viewDir, dLTCUV);
}
float calcDiskLightSpecular(vec3 worldNormal, vec3 viewDir, vec2 uv) {
	mat3 mInv = getLTCLightInvMat(uv);
	return LTC_EvaluateDisk( worldNormal, viewDir, vPositionW, mInv, dLTCCoords );
}
float getDiskLightSpecular(vec3 worldNormal, vec3 viewDir) {
	return calcDiskLightSpecular(worldNormal, viewDir, dLTCUV);
}
float getSphereLightSpecular(vec3 worldNormal, vec3 viewDir) {
	return calcDiskLightSpecular(worldNormal, viewDir, dLTCUV);
}
`;

export { ltcPS as default };
