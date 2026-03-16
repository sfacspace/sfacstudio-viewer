class SetUtils {
		static equals(setA, setB) {
				if (setA.size !== setB.size) {
						return false;
				}
				for (const elem of setA){
						if (!setB.has(elem)) {
								return false;
						}
				}
				return true;
		}
}

export { SetUtils };
