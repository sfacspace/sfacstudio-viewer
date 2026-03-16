var gsplatIntervalTextureWGSL = `
var uIntervalsTexture: texture_2d<u32>;
uniform uNumIntervals: i32;
uniform uTextureWidth: i32;
uniform uActiveSplats: i32;
fn getCoordFromIndex(index: i32, textureWidth: i32) -> vec2i {
	return vec2i(index % textureWidth, index / textureWidth);
}
@fragment
fn fragmentMain(input: FragmentInput) -> FragmentOutput {
	var output: FragmentOutput;
	
	let coord = vec2i(i32(input.position.x), i32(input.position.y));
	let targetIndex = coord.y * uniform.uTextureWidth + coord.x;
	
	if (targetIndex >= uniform.uActiveSplats) {
		output.color = 0u;
		return output;
	}
	
	var left = 0i;
	var right = uniform.uNumIntervals - 1;
	var intervalIndex = 0i;
	
	while (left <= right) {
		let mid = (left + right) / 2;
		
		let textureWidth = i32(textureDimensions(uIntervalsTexture, 0).x);
		let intervalCoord = getCoordFromIndex(mid, textureWidth);
		let intervalData = textureLoad(uIntervalsTexture, intervalCoord, 0).rg;
		
		let accumulatedSum = intervalData.g;
		
		if (u32(targetIndex) < accumulatedSum) {
			intervalIndex = mid;
			right = mid - 1;
		} else {
			left = mid + 1;
		}
	}
	
	let textureWidth = i32(textureDimensions(uIntervalsTexture, 0).x);
	let intervalCoord = getCoordFromIndex(intervalIndex, textureWidth);
	let intervalData = textureLoad(uIntervalsTexture, intervalCoord, 0).rg;
	
	let intervalStart = intervalData.r;
	let currentAccSum = intervalData.g;
	
	var prevAccSum = 0u;
	if (intervalIndex > 0) {
		let prevCoord = getCoordFromIndex(intervalIndex - 1, textureWidth);
		prevAccSum = textureLoad(uIntervalsTexture, prevCoord, 0).g;
	}
	
	let offsetInInterval = u32(targetIndex) - prevAccSum;
	let originalIndex = intervalStart + offsetInInterval;
	
	output.color = originalIndex;
	return output;
}
`;

export { gsplatIntervalTextureWGSL as default };
