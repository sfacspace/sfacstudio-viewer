var composeColorLutPS = `
	#ifdef COLOR_LUT
		uniform sampler2D colorLUT;
		uniform vec4 colorLUTParams;
		vec3 applyColorLUT(vec3 color) {
			vec3 c = clamp(color, 0.0, 1.0);
			float width = colorLUTParams.x;
			float height = colorLUTParams.y;
			float maxColor = colorLUTParams.z;
			float cell = c.b * maxColor;
			float cell_l = floor(cell);
			float cell_h = ceil(cell);
			float half_px_x = 0.5 / width;
			float half_px_y = 0.5 / height;
			float r_offset = half_px_x + c.r / height * (maxColor / height);
			float g_offset = half_px_y + c.g * (maxColor / height);
			vec2 uv_l = vec2(cell_l / height + r_offset, g_offset);
			vec2 uv_h = vec2(cell_h / height + r_offset, g_offset);
			vec3 color_l = texture2DLod(colorLUT, uv_l, 0.0).rgb;
			vec3 color_h = texture2DLod(colorLUT, uv_h, 0.0).rgb;
			vec3 lutColor = mix(color_l, color_h, fract(cell));
			return mix(color, lutColor, colorLUTParams.w);
		}
	#endif
`;

export { composeColorLutPS as default };
