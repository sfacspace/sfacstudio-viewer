var clusteredLightUtilsPS = `
vec2 getCubemapFaceCoordinates(const vec3 dir, out float faceIndex, out vec2 tileOffset)
{
	vec3 vAbs = abs(dir);
	float ma;
	vec2 uv;
	if (vAbs.z >= vAbs.x && vAbs.z >= vAbs.y) {
		faceIndex = dir.z < 0.0 ? 5.0 : 4.0;
		ma = 0.5 / vAbs.z;
		uv = vec2(dir.z < 0.0 ? -dir.x : dir.x, -dir.y);
		tileOffset.x = 2.0;
		tileOffset.y = dir.z < 0.0 ? 1.0 : 0.0;
	} else if(vAbs.y >= vAbs.x) {
		faceIndex = dir.y < 0.0 ? 3.0 : 2.0;
		ma = 0.5 / vAbs.y;
		uv = vec2(dir.x, dir.y < 0.0 ? -dir.z : dir.z);
		tileOffset.x = 1.0;
		tileOffset.y = dir.y < 0.0 ? 1.0 : 0.0;
	} else {
		faceIndex = dir.x < 0.0 ? 1.0 : 0.0;
		ma = 0.5 / vAbs.x;
		uv = vec2(dir.x < 0.0 ? dir.z : -dir.z, -dir.y);
		tileOffset.x = 0.0;
		tileOffset.y = dir.x < 0.0 ? 1.0 : 0.0;
	}
	return uv * ma + 0.5;
}
vec2 getCubemapAtlasCoordinates(const vec3 omniAtlasViewport, float shadowEdgePixels, float shadowTextureResolution, const vec3 dir) {
	float faceIndex;
	vec2 tileOffset;
	vec2 uv = getCubemapFaceCoordinates(dir, faceIndex, tileOffset);
	float atlasFaceSize = omniAtlasViewport.z;
	float tileSize = shadowTextureResolution * atlasFaceSize;
	float offset = shadowEdgePixels / tileSize;
	uv = uv * vec2(1.0 - offset * 2.0) + vec2(offset * 1.0);
	uv *= atlasFaceSize;
	uv += tileOffset * atlasFaceSize;
	uv += omniAtlasViewport.xy;
	return uv;
}
`;

export { clusteredLightUtilsPS as default };
