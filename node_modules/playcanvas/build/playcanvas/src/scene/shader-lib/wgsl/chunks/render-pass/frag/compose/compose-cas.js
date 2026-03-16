var composeCasPS = `
	#ifdef CAS
		uniform sharpness: f32;
		fn maxComponent(x: f32, y: f32, z: f32) -> f32 { return max(x, max(y, z)); }
		fn toSDR(c: vec3f) -> vec3f { return c / (1.0 + maxComponent(c.r, c.g, c.b)); }
		fn toHDR(c: vec3f) -> vec3f { return c / (1.0 - maxComponent(c.r, c.g, c.b)); }
		fn applyCas(color: vec3f, uv: vec2f, sharpness: f32) -> vec3f {
			let x = uniform.sceneTextureInvRes.x;
			let y = uniform.sceneTextureInvRes.y;
			let a = toSDR(textureSampleLevel(sceneTexture, sceneTextureSampler, uv + vec2f(0.0, -y), 0.0).rgb);
			let b = toSDR(textureSampleLevel(sceneTexture, sceneTextureSampler, uv + vec2f(-x, 0.0), 0.0).rgb);
			let c = toSDR(color.rgb);
			let d = toSDR(textureSampleLevel(sceneTexture, sceneTextureSampler, uv + vec2f(x, 0.0), 0.0).rgb);
			let e = toSDR(textureSampleLevel(sceneTexture, sceneTextureSampler, uv + vec2f(0.0, y), 0.0).rgb);
			let min_g = min(a.g, min(b.g, min(c.g, min(d.g, e.g))));
			let max_g = max(a.g, max(b.g, max(c.g, max(d.g, e.g))));
			let sharpening_amount = sqrt(min(1.0 - max_g, min_g) / max_g);
			let w = sharpening_amount * uniform.sharpness;
			var res = (w * (a + b + d + e) + c) / (4.0 * w + 1.0);
			res = max(res, vec3f(0.0));
			return toHDR(res);
		}
	#endif
`;

export { composeCasPS as default };
