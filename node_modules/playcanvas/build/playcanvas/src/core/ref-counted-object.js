class RefCountedObject {
		incRefCount() {
				this._refCount++;
		}
		decRefCount() {
				this._refCount--;
		}
		get refCount() {
				return this._refCount;
		}
		constructor(){
				this._refCount = 0;
		}
}

export { RefCountedObject };
