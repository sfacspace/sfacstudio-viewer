import { RefCountedObject } from './ref-counted-object.js';

class Entry extends RefCountedObject {
		constructor(obj){
				super();
				this.object = obj;
				this.incRefCount();
		}
}
class RefCountedKeyCache {
		destroy() {
				this.cache.forEach((entry)=>{
						entry.object?.destroy();
				});
				this.cache.clear();
		}
		clear() {
				this.cache.clear();
		}
		get(key) {
				const entry = this.cache.get(key);
				if (entry) {
						entry.incRefCount();
						return entry.object;
				}
				return null;
		}
		set(key, object) {
				this.cache.set(key, new Entry(object));
		}
		release(key) {
				const entry = this.cache.get(key);
				if (entry) {
						entry.decRefCount();
						if (entry.refCount === 0) {
								this.cache.delete(key);
								entry.object?.destroy();
						}
				}
		}
		constructor(){
				this.cache = new Map();
		}
}

export { RefCountedKeyCache };
