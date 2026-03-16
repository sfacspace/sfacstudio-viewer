var clusteredLightUtilsPS = `
struct FaceCoords {
	uv: vec2f,
	faceIndex: f32,
	tileOffset: vec2f,
}
fn getCubemapFaceCoordinates(dir: vec3f) -> FaceCoords {
	var faceIndex: f32;
	var tileOffset: vec2f;
	var uv: vec2f;
	let vAbs: vec3f = abs(dir);
	var ma: f32;
	if (vAbs.z >= vAbs.x && vAbs.z >= vAbs.y) {
		let is_neg_z = dir.z < 0.0;
		faceIndex = select(4.0, 5.0, is_neg_z);
		ma = 0.5 / vAbs.z;
		uv = vec2f(select(dir.x, -dir.x, is_neg_z), -dir.y);
		tileOffset = vec2f(2.0, select(0.0, 1.0, is_neg_z));
	} else if (vAbs.y >= vAbs.x) {
		let is_neg_y = dir.y < 0.0;
		faceIndex = select(2.0, 3.0, is_neg_y);
		ma = 0.5 / vAbs.y;
		uv = vec2f(dir.x, select(dir.z, -dir.z, is_neg_y));
		tileOffset = vec2f(1.0, select(0.0, 1.0, is_neg_y));
	} else {
		let is_neg_x = dir.x < 0.0;
		faceIndex = select(0.0, 1.0, is_neg_x);
		ma = 0.5 / vAbs.x;
		uv = vec2f(select(-dir.z, dir.z, is_neg_x), -dir.y);
		tileOffset = vec2f(0.0, select(0.0, 1.0, is_neg_x));
	}
	uv = uv * ma + 0.5;
	return FaceCoords(uv, faceIndex, tileOffset);
}
fn getCubemapAtlasCoordinates(omniAtlasViewport: vec3f, shadowEdgePixels: f32, shadowTextureResolution: f32, dir: vec3f) -> vec2f {
	let faceData: FaceCoords = getCubemapFaceCoordinates(dir);
	var uv: vec2f = faceData.uv;
	let tileOffset: vec2f = faceData.tileOffset;
	let atlasFaceSize: f32 = omniAtlasViewport.z;
	let tileSize: f32 = shadowTextureResolution * atlasFaceSize;
	var offset: f32 = shadowEdgePixels / tileSize;
	uv = uv * (1.0 - offset * 2.0) + offset;
	uv = uv * atlasFaceSize;
	uv = uv + tileOffset * atlasFaceSize;
	uv = uv + omniAtlasViewport.xy;
	return uv;
}
`;

export { clusteredLightUtilsPS as default };
