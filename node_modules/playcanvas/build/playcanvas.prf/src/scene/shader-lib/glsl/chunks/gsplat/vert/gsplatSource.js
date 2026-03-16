var gsplatSourceVS = `
attribute vec3 vertex_position;
attribute uint vertex_id_attrib;
uniform uint numSplats;
uniform uint splatTextureSize;
uniform highp usampler2D splatOrder;
bool initSource(out SplatSource source) {
	source.order = vertex_id_attrib + uint(vertex_position.z);
	if (source.order >= numSplats) {
		return false;
	}
	ivec2 orderUV = ivec2(source.order % splatTextureSize, source.order / splatTextureSize);
	source.id = texelFetch(splatOrder, orderUV, 0).r;
	source.uv = ivec2(source.id % splatTextureSize, source.id / splatTextureSize);
	source.cornerUV = vertex_position.xy;
	return true;
}
`;

export { gsplatSourceVS as default };
