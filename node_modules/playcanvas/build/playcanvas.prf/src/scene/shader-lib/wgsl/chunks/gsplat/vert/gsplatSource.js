var gsplatSourceVS = `
attribute vertex_position: vec3f;
attribute vertex_id_attrib: u32;
uniform numSplats: u32;
uniform splatTextureSize: u32;
#ifdef STORAGE_ORDER
	var<storage, read> splatOrder: array<u32>;
#else
	var splatOrder: texture_2d<u32>;
#endif
fn initSource(source: ptr<function, SplatSource>) -> bool {
	source.order = vertex_id_attrib + u32(vertex_position.z);
	if (source.order >= uniform.numSplats) {
		return false;
	}
	#ifdef STORAGE_ORDER
		source.id = splatOrder[source.order];
	#else
		let uv = vec2u(source.order % uniform.splatTextureSize, source.order / uniform.splatTextureSize);
		source.id = textureLoad(splatOrder, vec2i(uv), 0).r;
	#endif
	source.uv = vec2i(vec2u(source.id % uniform.splatTextureSize, source.id / uniform.splatTextureSize));
	source.cornerUV = vertex_position.xy;
	return true;
}
`;

export { gsplatSourceVS as default };
