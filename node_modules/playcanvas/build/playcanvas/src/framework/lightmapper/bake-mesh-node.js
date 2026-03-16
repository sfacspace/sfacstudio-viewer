class BakeMeshNode {
		store() {
				this.castShadows = this.component.castShadows;
		}
		restore() {
				this.component.castShadows = this.castShadows;
		}
		constructor(node, meshInstances = null){
				this.node = node;
				this.component = node.render || node.model;
				meshInstances = meshInstances || this.component.meshInstances;
				this.store();
				this.meshInstances = meshInstances;
				this.bounds = null;
				this.renderTargets = [];
		}
}

export { BakeMeshNode };
