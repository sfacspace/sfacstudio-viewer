var bayerPS = `
fn bayer2(p: vec2f) -> f32 {
	return (2.0 * p.y + p.x + 1.0) % 4.0;
}
fn bayer4(p: vec2f) -> f32 {
	let p1: vec2f = p % vec2f(2.0);
	let p2: vec2f = floor(0.5 * (p % vec2f(4.0)));
	return 4.0 * bayer2(p1) + bayer2(p2);
}
fn bayer8(p: vec2f) -> f32 {
	let p1: vec2f = p % vec2f(2.0);
	let p2: vec2f = floor(0.5 * (p % vec2f(4.0)));
	let p4: vec2f = floor(0.25 * (p % vec2f(8.0)));
	return 4.0 * (4.0 * bayer2(p1) + bayer2(p2)) + bayer2(p4);
}
`;

export { bayerPS as default };
