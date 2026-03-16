class Version {
		equals(other) {
				return this.globalId === other.globalId && this.revision === other.revision;
		}
		copy(other) {
				this.globalId = other.globalId;
				this.revision = other.revision;
		}
		reset() {
				this.globalId = 0;
				this.revision = 0;
		}
		constructor(){
				this.globalId = 0;
				this.revision = 0;
		}
}

export { Version };
