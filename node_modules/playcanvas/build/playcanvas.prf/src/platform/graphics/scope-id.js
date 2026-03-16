import { VersionedObject } from './versioned-object.js';

class ScopeId {
		toJSON(key) {
				return undefined;
		}
		setValue(value) {
				this.value = value;
				this.versionObject.increment();
		}
		getValue() {
				return this.value;
		}
		constructor(name){
				this.name = name;
				this.value = null;
				this.versionObject = new VersionedObject();
		}
}

export { ScopeId };
