class AnimEvents {
		get events() {
				return this._events;
		}
		constructor(events){
				this._events = [
						...events
				];
				this._events.sort((a, b)=>a.time - b.time);
		}
}

export { AnimEvents };
