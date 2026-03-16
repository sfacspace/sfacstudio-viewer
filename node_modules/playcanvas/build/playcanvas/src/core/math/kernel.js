class Kernel {
		static concentric(numRings, numPoints) {
				const kernel = [];
				kernel.push(0, 0);
				const spacing = 2 * Math.PI / numRings / numPoints;
				for(let ring = 1; ring <= numRings; ring++){
						const radius = ring / numRings;
						const circumference = 2 * Math.PI * radius;
						const pointsPerRing = Math.max(1, Math.floor(circumference / spacing));
						const angleStep = 2 * Math.PI / pointsPerRing;
						for(let point = 0; point < pointsPerRing; point++){
								const angle = point * angleStep;
								const x = radius * Math.cos(angle);
								const y = radius * Math.sin(angle);
								kernel.push(x, y);
						}
				}
				return kernel;
		}
}

export { Kernel };
