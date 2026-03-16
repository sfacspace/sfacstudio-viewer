var indirectCoreCS = `
struct DrawIndexedIndirectArgs {
	indexCount: u32,
	instanceCount: u32,
	firstIndex: u32,
	baseVertex: i32,
	firstInstance: u32
};
struct DrawIndirectArgs {
	vertexCount: u32,
	instanceCount: u32,
	firstVertex: u32,
	firstInstance: u32,
	_pad: u32
};
`;

export { indirectCoreCS as default };
