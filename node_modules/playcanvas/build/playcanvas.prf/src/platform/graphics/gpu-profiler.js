import { TRACEID_GPU_TIMINGS } from '../../core/constants.js';
import { Tracing } from '../../core/tracing.js';

class GpuProfiler {
		loseContext() {
				this.pastFrameAllocations.clear();
		}
		set enabled(value) {
				this._enableRequest = value;
		}
		get enabled() {
				return this._enableRequest;
		}
		get passTimings() {
				return this._passTimings;
		}
		processEnableRequest() {
				if (this._enableRequest !== this._enabled) {
						this._enabled = this._enableRequest;
						if (!this._enabled) {
								this._frameTime = 0;
						}
				}
		}
		request(renderVersion) {
				this.pastFrameAllocations.set(renderVersion, this.frameAllocations);
				this.frameAllocations = [];
		}
		_parsePassName(name) {
				let parsedName = this._nameCache.get(name);
				if (parsedName === undefined) {
						if (name.startsWith('RenderPass')) {
								parsedName = name.substring(10);
						} else {
								parsedName = name;
						}
						this._nameCache.set(name, parsedName);
				}
				return parsedName;
		}
		report(renderVersion, timings) {
				if (timings) {
						const allocations = this.pastFrameAllocations.get(renderVersion);
						if (!allocations) {
								return;
						}
						if (timings.length > 0) {
								this._frameTime = timings.reduce((sum, t)=>sum + t, 0);
						}
						this._passTimings.clear();
						for(let i = 0; i < allocations.length; ++i){
								const name = allocations[i];
								const timing = timings[i];
								const parsedName = this._parsePassName(name);
								this._passTimings.set(parsedName, (this._passTimings.get(parsedName) || 0) + timing);
						}
						if (Tracing.get(TRACEID_GPU_TIMINGS)) {
								let total = 0;
								for(let i = 0; i < allocations.length; ++i){
										allocations[i];
										total += timings[i];
								}
						}
				}
				this.pastFrameAllocations.delete(renderVersion);
		}
		getSlot(name) {
				if (this.frameAllocations.length >= this.maxCount) {
						return -1;
				}
				const slot = this.frameAllocations.length;
				this.frameAllocations.push(name);
				return slot;
		}
		get slotCount() {
				return this.frameAllocations.length;
		}
		constructor(){
				this.frameAllocations = [];
				this.pastFrameAllocations = new Map();
				this._enabled = false;
				this._enableRequest = false;
				this._frameTime = 0;
				this._passTimings = new Map();
				this._nameCache = new Map();
				this.maxCount = 9999;
		}
}

export { GpuProfiler };
