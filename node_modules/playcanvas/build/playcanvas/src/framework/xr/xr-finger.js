class XrFinger {
		get index() {
				return this._index;
		}
		get hand() {
				return this._hand;
		}
		get joints() {
				return this._joints;
		}
		get tip() {
				return this._tip;
		}
		constructor(index, hand){
				this._joints = [];
				this._tip = null;
				this._index = index;
				this._hand = hand;
				this._hand._fingers.push(this);
		}
}

export { XrFinger };
