class MapUtils {
		static merge(...maps) {
				const result = new Map(maps[0] ?? []);
				for(let i = 1; i < maps.length; i++){
						const map = maps[i];
						if (map) {
								for (const [key, value] of map){
										result.set(key, value);
								}
						}
				}
				return result;
		}
}

export { MapUtils };
