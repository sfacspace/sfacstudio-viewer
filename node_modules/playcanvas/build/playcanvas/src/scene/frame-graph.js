class FrameGraph {
		addRenderPass(renderPass) {
				renderPass.frameUpdate();
				const beforePasses = renderPass.beforePasses;
				for(let i = 0; i < beforePasses.length; i++){
						const pass = beforePasses[i];
						if (pass.enabled) {
								this.addRenderPass(pass);
						}
				}
				if (renderPass.enabled) {
						this.renderPasses.push(renderPass);
				}
				const afterPasses = renderPass.afterPasses;
				for(let i = 0; i < afterPasses.length; i++){
						const pass = afterPasses[i];
						if (pass.enabled) {
								this.addRenderPass(pass);
						}
				}
		}
		reset() {
				this.renderPasses.length = 0;
		}
		compile() {
				const renderTargetMap = this.renderTargetMap;
				const renderPasses = this.renderPasses;
				for(let i = 0; i < renderPasses.length; i++){
						const renderPass = renderPasses[i];
						const renderTarget = renderPass.renderTarget;
						if (renderTarget !== undefined) {
								const prevPass = renderTargetMap.get(renderTarget);
								if (prevPass) {
										const count = renderPass.colorArrayOps.length;
										for(let j = 0; j < count; j++){
												const colorOps = renderPass.colorArrayOps[j];
												if (!colorOps.clear) {
														prevPass.colorArrayOps[j].store = true;
												}
										}
										if (!renderPass.depthStencilOps.clearDepth) {
												prevPass.depthStencilOps.storeDepth = true;
										}
										if (!renderPass.depthStencilOps.clearStencil) {
												prevPass.depthStencilOps.storeStencil = true;
										}
								}
								renderTargetMap.set(renderTarget, renderPass);
						}
				}
				for(let i = 0; i < renderPasses.length - 1; i++){
						const firstPass = renderPasses[i];
						const firstRT = firstPass.renderTarget;
						const secondPass = renderPasses[i + 1];
						const secondRT = secondPass.renderTarget;
						if (firstRT !== secondRT || firstRT === undefined) {
								continue;
						}
						if (secondPass.depthStencilOps.clearDepth || secondPass.depthStencilOps.clearStencil || secondPass.colorArrayOps.some((colorOps)=>colorOps.clear)) {
								continue;
						}
						if (firstPass.afterPasses.length > 0) {
								continue;
						}
						if (secondPass.beforePasses.length > 0) {
								continue;
						}
						firstPass._skipEnd = true;
						secondPass._skipStart = true;
				}
				let lastCubeTexture = null;
				let lastCubeRenderPass = null;
				for(let i = 0; i < renderPasses.length; i++){
						const renderPass = renderPasses[i];
						const renderTarget = renderPass.renderTarget;
						const thisTexture = renderTarget?.colorBuffer;
						if (thisTexture?.cubemap) {
								if (lastCubeTexture === thisTexture) {
										const count = lastCubeRenderPass.colorArrayOps.length;
										for(let j = 0; j < count; j++){
												lastCubeRenderPass.colorArrayOps[j].mipmaps = false;
										}
								}
								lastCubeTexture = renderTarget.colorBuffer;
								lastCubeRenderPass = renderPass;
						} else if (renderPass.requiresCubemaps) {
								lastCubeTexture = null;
								lastCubeRenderPass = null;
						}
				}
				renderTargetMap.clear();
		}
		render(device) {
				this.compile();
				const renderPasses = this.renderPasses;
				for(let i = 0; i < renderPasses.length; i++){
						renderPasses[i].render();
				}
		}
		constructor(){
				this.renderPasses = [];
				this.renderTargetMap = new Map();
		}
}

export { FrameGraph };
