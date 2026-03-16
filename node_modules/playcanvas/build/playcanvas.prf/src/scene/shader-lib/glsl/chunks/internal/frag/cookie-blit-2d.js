var cookieBlit2DPS = `
	varying vec2 uv0;
	uniform sampler2D blitTexture;
	void main(void) {
		gl_FragColor = texture2D(blitTexture, uv0);
	}
`;

export { cookieBlit2DPS as default };
