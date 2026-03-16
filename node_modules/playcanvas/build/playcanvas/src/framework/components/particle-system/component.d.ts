/**
 * Used to simulate particles and produce renderable particle mesh on either CPU or GPU. GPU
 * simulation is generally much faster than its CPU counterpart, because it avoids slow CPU-GPU
 * synchronization and takes advantage of many GPU cores. However, it requires client to support
 * reasonable uniform count, reading from multiple textures in vertex shader and OES_texture_float
 * extension, including rendering into float textures. Most mobile devices fail to satisfy these
 * requirements, so it's not recommended to simulate thousands of particles on them. GPU version
 * also can't sort particles, so enabling sorting forces CPU mode too. Particle rotation is
 * specified by a single angle parameter: default billboard particles rotate around camera facing
 * axis, while mesh particles rotate around 2 different view-independent axes. Most of the
 * simulation parameters are specified with {@link Curve} or {@link CurveSet}. Curves are
 * interpolated based on each particle's lifetime, therefore parameters are able to change over
 * time. Most of the curve parameters can also be specified by 2 minimum/maximum curves, this way
 * each particle will pick a random value in-between.
 *
 * @hideconstructor
 * @category Graphics
 */
export class ParticleSystemComponent extends Component {
    /**
     * Create a new ParticleSystemComponent.
     *
     * @param {ParticleSystemComponentSystem} system - The ComponentSystem that created this Component.
     * @param {Entity} entity - The Entity this Component is attached to.
     */
    constructor(system: ParticleSystemComponentSystem, entity: Entity);
    /** @private */
    private _requestedDepth;
    /** @private */
    private _drawOrder;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtLayersChanged;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtLayerAdded;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtLayerRemoved;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtSetMeshes;
    /**
     * @type {ParticleSystemComponentData}
     * @ignore
     */
    get data(): ParticleSystemComponentData;
    /**
     * Sets whether the particle system plays automatically on creation. If set to false, it is
     * necessary to call {@link ParticleSystemComponent#play} for the particle system to play.
     * Defaults to true.
     *
     * @type {boolean}
     */
    set autoPlay(arg: boolean);
    /**
     * Gets whether the particle system plays automatically on creation.
     *
     * @type {boolean}
     */
    get autoPlay(): boolean;
    /**
     * Sets the maximum number of simulated particles.
     *
     * @type {number}
     */
    set numParticles(arg: number);
    /**
     * Gets the maximum number of simulated particles.
     *
     * @type {number}
     */
    get numParticles(): number;
    /**
     * Sets the length of time in seconds between a particle's birth and its death.
     *
     * @type {number}
     */
    set lifetime(arg: number);
    /**
     * Gets the length of time in seconds between a particle's birth and its death.
     *
     * @type {number}
     */
    get lifetime(): number;
    /**
     * Sets the minimal interval in seconds between particle births.
     *
     * @type {number}
     */
    set rate(arg: number);
    /**
     * Gets the minimal interval in seconds between particle births.
     *
     * @type {number}
     */
    get rate(): number;
    /**
     * Sets the maximal interval in seconds between particle births.
     *
     * @type {number}
     */
    set rate2(arg: number);
    /**
     * Gets the maximal interval in seconds between particle births.
     *
     * @type {number}
     */
    get rate2(): number;
    /**
     * Sets the minimal initial Euler angle of a particle.
     *
     * @type {number}
     */
    set startAngle(arg: number);
    /**
     * Gets the minimal initial Euler angle of a particle.
     *
     * @type {number}
     */
    get startAngle(): number;
    /**
     * Sets the maximal initial Euler angle of a particle.
     *
     * @type {number}
     */
    set startAngle2(arg: number);
    /**
     * Gets the maximal initial Euler angle of a particle.
     *
     * @type {number}
     */
    get startAngle2(): number;
    /**
     * Sets whether the particle system loops.
     *
     * @type {boolean}
     */
    set loop(arg: boolean);
    /**
     * Gets whether the particle system loops.
     *
     * @type {boolean}
     */
    get loop(): boolean;
    /**
     * Sets whether the particle system will be initialized as though it has already completed a
     * full cycle. This only works with looping particle systems.
     *
     * @type {boolean}
     */
    set preWarm(arg: boolean);
    /**
     * Gets whether the particle system will be initialized as though it has already completed a
     * full cycle.
     *
     * @type {boolean}
     */
    get preWarm(): boolean;
    /**
     * Sets whether particles will be lit by ambient and directional lights.
     *
     * @type {boolean}
     */
    set lighting(arg: boolean);
    /**
     * Gets whether particles will be lit by ambient and directional lights.
     *
     * @type {boolean}
     */
    get lighting(): boolean;
    /**
     * Sets whether Half Lambert lighting is enabled. Enabling Half Lambert lighting avoids
     * particles looking too flat in shadowed areas. It is a completely non-physical lighting model
     * but can give more pleasing visual results.
     *
     * @type {boolean}
     */
    set halfLambert(arg: boolean);
    /**
     * Gets whether Half Lambert lighting is enabled.
     *
     * @type {boolean}
     */
    get halfLambert(): boolean;
    /**
     * Sets the color multiplier.
     *
     * @type {number}
     */
    set intensity(arg: number);
    /**
     * Gets the color multiplier.
     *
     * @type {number}
     */
    get intensity(): number;
    /**
     * Sets whether depth writes is enabled. If enabled, the particles will write to the depth
     * buffer. If disabled, the depth buffer is left unchanged and particles will be guaranteed to
     * overwrite one another in the order in which they are rendered.
     *
     * @type {boolean}
     */
    set depthWrite(arg: boolean);
    /**
     * Gets whether depth writes is enabled.
     *
     * @type {boolean}
     */
    get depthWrite(): boolean;
    /**
     * Sets whether fogging is ignored.
     *
     * @type {boolean}
     */
    set noFog(arg: boolean);
    /**
     * Gets whether fogging is ignored.
     *
     * @type {boolean}
     */
    get noFog(): boolean;
    /**
     * Sets whether depth softening is enabled. Controls fading of particles near their
     * intersections with scene geometry. This effect, when it's non-zero, requires scene depth map
     * to be rendered. Multiple depth-dependent effects can share the same map, but if you only use
     * it for particles, bear in mind that it can double engine draw calls.
     *
     * @type {number}
     */
    set depthSoftening(arg: number);
    /**
     * Gets whether depth softening is enabled.
     *
     * @type {number}
     */
    get depthSoftening(): number;
    /**
     * Sets the particle sorting mode. Forces CPU simulation, so be careful.
     *
     * - {@link PARTICLESORT_NONE}: No sorting, particles are drawn in arbitrary order. Can be
     * simulated on GPU.
     * - {@link PARTICLESORT_DISTANCE}: Sorting based on distance to the camera. CPU only.
     * - {@link PARTICLESORT_NEWER_FIRST}: Newer particles are drawn first. CPU only.
     * - {@link PARTICLESORT_OLDER_FIRST}: Older particles are drawn first. CPU only.
     *
     * @type {number}
     */
    set sort(arg: number);
    /**
     * Gets the particle sorting mode.
     *
     * @type {number}
     */
    get sort(): number;
    /**
     * Sets how particles are blended when being written to the currently active render target.
     * Can be:
     *
     * - {@link BLEND_SUBTRACTIVE}: Subtract the color of the source fragment from the destination
     * fragment and write the result to the frame buffer.
     * - {@link BLEND_ADDITIVE}: Add the color of the source fragment to the destination fragment and
     * write the result to the frame buffer.
     * - {@link BLEND_NORMAL}: Enable simple translucency for materials such as glass. This is
     * equivalent to enabling a source blend mode of {@link BLENDMODE_SRC_ALPHA} and
     * a destination
     * blend mode of {@link BLENDMODE_ONE_MINUS_SRC_ALPHA}.
     * - {@link BLEND_NONE}: Disable blending.
     * - {@link BLEND_PREMULTIPLIED}: Similar to {@link BLEND_NORMAL} expect
     * the source fragment is
     * assumed to have already been multiplied by the source alpha value.
     * - {@link BLEND_MULTIPLICATIVE}: Multiply the color of the source fragment by the color of the
     * destination fragment and write the result to the frame buffer.
     * - {@link BLEND_ADDITIVEALPHA}: Same as {@link BLEND_ADDITIVE} except
     * the source RGB is
     * multiplied by the source alpha.
     *
     * @type {number}
     */
    set blendType(arg: number);
    /**
     * Gets how particles are blended when being written to the currently active render target.
     *
     * @type {number}
     */
    get blendType(): number;
    /**
     * Sets how much particles are stretched in their direction of motion. This is a value in world
     * units that controls the amount by which particles are stretched based on their velocity.
     * Particles are stretched from their center towards their previous position.
     *
     * @type {number}
     */
    set stretch(arg: number);
    /**
     * Gets how much particles are stretched in their direction of motion.
     *
     * @type {number}
     */
    get stretch(): number;
    /**
     * Sets whether particles are oriented in their direction of motion or not.
     *
     * @type {boolean}
     */
    set alignToMotion(arg: boolean);
    /**
     * Gets whether particles are oriented in their direction of motion or not.
     *
     * @type {boolean}
     */
    get alignToMotion(): boolean;
    /**
     * Sets the shape of the emitter. Defines the bounds inside which particles are spawned. Also
     * affects the direction of initial velocity.
     *
     * - {@link EMITTERSHAPE_BOX}: Box shape parameterized by emitterExtents. Initial velocity is
     * directed towards local Z axis.
     * - {@link EMITTERSHAPE_SPHERE}: Sphere shape parameterized by emitterRadius. Initial velocity is
     * directed outwards from the center.
     *
     * @type {number}
     */
    set emitterShape(arg: number);
    /**
     * Gets the shape of the emitter.
     *
     * @type {number}
     */
    get emitterShape(): number;
    /**
     * Sets the extents of a local space bounding box within which particles are spawned at random
     * positions. This only applies to particle system with the shape `EMITTERSHAPE_BOX`.
     *
     * @type {Vec3}
     */
    set emitterExtents(arg: Vec3);
    /**
     * Gets the extents of a local space bounding box within which particles are spawned at random
     * positions.
     *
     * @type {Vec3}
     */
    get emitterExtents(): Vec3;
    /**
     * Sets the exception of extents of a local space bounding box within which particles are not
     * spawned. It is aligned to the center of emitterExtents. This only applies to particle system
     * with the shape `EMITTERSHAPE_BOX`.
     *
     * @type {Vec3}
     */
    set emitterExtentsInner(arg: Vec3);
    /**
     * Gets the exception of extents of a local space bounding box within which particles are not
     * spawned.
     *
     * @type {Vec3}
     */
    get emitterExtentsInner(): Vec3;
    /**
     * Sets the radius within which particles are spawned at random positions. This only applies to
     * particle system with the shape `EMITTERSHAPE_SPHERE`.
     *
     * @type {number}
     */
    set emitterRadius(arg: number);
    /**
     * Gets the radius within which particles are spawned at random positions.
     *
     * @type {number}
     */
    get emitterRadius(): number;
    /**
     * Sets the inner radius within which particles are not spawned. This only applies to particle
     * system with the shape `EMITTERSHAPE_SPHERE`.
     *
     * @type {number}
     */
    set emitterRadiusInner(arg: number);
    /**
     * Gets the inner radius within which particles are not spawned.
     *
     * @type {number}
     */
    get emitterRadiusInner(): number;
    /**
     * Sets the magnitude of the initial emitter velocity. Direction is given by emitter shape.
     *
     * @type {number}
     */
    set initialVelocity(arg: number);
    /**
     * Gets the magnitude of the initial emitter velocity.
     *
     * @type {number}
     */
    get initialVelocity(): number;
    /**
     * Sets whether particles wrap based on the set wrap bounds.
     *
     * @type {boolean}
     */
    set wrap(arg: boolean);
    /**
     * Gets whether particles wrap based on the set wrap bounds.
     *
     * @type {boolean}
     */
    get wrap(): boolean;
    /**
     * Sets the wrap bounds of the particle system. This is half extents of a world space box
     * volume centered on the owner entity's position. If a particle crosses the boundary of one
     * side of the volume, it teleports to the opposite side.
     *
     * @type {Vec3}
     */
    set wrapBounds(arg: Vec3);
    /**
     * Gets the wrap bounds of the particle system.
     *
     * @type {Vec3}
     */
    get wrapBounds(): Vec3;
    /**
     * Sets whether particles move with respect to the emitter's transform rather then world space.
     *
     * @type {boolean}
     */
    set localSpace(arg: boolean);
    /**
     * Gets whether particles move with respect to the emitter's transform rather then world space.
     *
     * @type {boolean}
     */
    get localSpace(): boolean;
    /**
     * Sets whether particles are rendered in 2D screen space. This needs to be set when particle
     * system is part of hierarchy with {@link ScreenComponent} as its ancestor, and allows
     * particle system to integrate with the rendering of {@link ElementComponent}s. Note that an
     * entity with ParticleSystem component cannot be parented directly to {@link ScreenComponent},
     * but has to be a child of a {@link ElementComponent}, for example {@link LayoutGroupComponent}.
     *
     * @type {boolean}
     */
    set screenSpace(arg: boolean);
    /**
     * Gets whether particles are rendered in 2D screen space.
     *
     * @type {boolean}
     */
    get screenSpace(): boolean;
    /**
     * Sets the {@link Asset} used to set the colorMap.
     *
     * @type {Asset}
     */
    set colorMapAsset(arg: Asset);
    /**
     * Gets the {@link Asset} used to set the colorMap.
     *
     * @type {Asset}
     */
    get colorMapAsset(): Asset;
    /**
     * Sets the {@link Asset} used to set the normalMap.
     *
     * @type {Asset}
     */
    set normalMapAsset(arg: Asset);
    /**
     * Gets the {@link Asset} used to set the normalMap.
     *
     * @type {Asset}
     */
    get normalMapAsset(): Asset;
    /**
     * Sets the polygonal mesh to be used as a particle. Only first vertex/index buffer is used.
     * Vertex buffer must contain local position at first 3 floats of each vertex.
     *
     * @type {Mesh}
     */
    set mesh(arg: Mesh);
    /**
     * Gets the polygonal mesh to be used as a particle.
     *
     * @type {Mesh}
     */
    get mesh(): Mesh;
    /**
     * Sets the {@link Asset} used to set the mesh.
     *
     * @type {Asset}
     */
    set meshAsset(arg: Asset);
    /**
     * Gets the {@link Asset} used to set the mesh.
     *
     * @type {Asset}
     */
    get meshAsset(): Asset;
    /**
     * Sets the Render {@link Asset} used to set the mesh.
     *
     * @type {Asset}
     */
    set renderAsset(arg: Asset);
    /**
     * Gets the Render {@link Asset} used to set the mesh.
     *
     * @type {Asset}
     */
    get renderAsset(): Asset;
    /**
     * Sets the particle orientation mode. Can be:
     *
     * - {@link PARTICLEORIENTATION_SCREEN}: Particles are facing camera.
     * - {@link PARTICLEORIENTATION_WORLD}: User defined world space normal (particleNormal) to set
     * planes orientation.
     * - {@link PARTICLEORIENTATION_EMITTER}: Similar to previous, but the normal is affected by
     * emitter (entity) transformation.
     *
     * @type {number}
     */
    set orientation(arg: number);
    /**
     * Gets the particle orientation mode.
     *
     * @type {number}
     */
    get orientation(): number;
    /**
     * Sets the particle normal. This only applies to particle system with the orientation modes
     * `PARTICLEORIENTATION_WORLD` and `PARTICLEORIENTATION_EMITTER`.
     *
     * @type {Vec3}
     */
    set particleNormal(arg: Vec3);
    /**
     * Gets the particle normal.
     *
     * @type {Vec3}
     */
    get particleNormal(): Vec3;
    /**
     * Sets the local space velocity graph.
     *
     * @type {CurveSet}
     */
    set localVelocityGraph(arg: CurveSet);
    /**
     * Gets the local space velocity graph.
     *
     * @type {CurveSet}
     */
    get localVelocityGraph(): CurveSet;
    /**
     * Sets the second velocity graph. If not null, particles pick random values between
     * localVelocityGraph and localVelocityGraph2.
     *
     * @type {CurveSet}
     */
    set localVelocityGraph2(arg: CurveSet);
    /**
     * Gets the second velocity graph.
     *
     * @type {CurveSet}
     */
    get localVelocityGraph2(): CurveSet;
    /**
     * Sets the world space velocity graph.
     *
     * @type {CurveSet}
     */
    set velocityGraph(arg: CurveSet);
    /**
     * Gets the world space velocity graph.
     *
     * @type {CurveSet}
     */
    get velocityGraph(): CurveSet;
    /**
     * Sets the second world space velocity graph. If not null, particles pick random values
     * between velocityGraph and velocityGraph2.
     *
     * @type {CurveSet}
     */
    set velocityGraph2(arg: CurveSet);
    /**
     * Gets the second world space velocity graph.
     *
     * @type {CurveSet}
     */
    get velocityGraph2(): CurveSet;
    /**
     * Sets the rotation speed graph.
     *
     * @type {Curve}
     */
    set rotationSpeedGraph(arg: Curve);
    /**
     * Gets the rotation speed graph.
     *
     * @type {Curve}
     */
    get rotationSpeedGraph(): Curve;
    /**
     * Sets the second rotation speed graph. If not null, particles pick random values between
     * rotationSpeedGraph and rotationSpeedGraph2.
     *
     * @type {Curve}
     */
    set rotationSpeedGraph2(arg: Curve);
    /**
     * Gets the second rotation speed graph.
     *
     * @type {Curve}
     */
    get rotationSpeedGraph2(): Curve;
    /**
     * Sets the radial speed graph. Velocity vector points from emitter origin to particle position.
     *
     * @type {Curve}
     */
    set radialSpeedGraph(arg: Curve);
    /**
     * Gets the radial speed graph.
     *
     * @type {Curve}
     */
    get radialSpeedGraph(): Curve;
    /**
     * Sets the second radial speed graph. If not null, particles pick random values between
     * radialSpeedGraph and radialSpeedGraph2. Velocity vector points from emitter origin to
     * particle position.
     *
     * @type {Curve}
     */
    set radialSpeedGraph2(arg: Curve);
    /**
     * Gets the second radial speed graph.
     *
     * @type {Curve}
     */
    get radialSpeedGraph2(): Curve;
    /**
     * Sets the scale graph.
     *
     * @type {Curve}
     */
    set scaleGraph(arg: Curve);
    /**
     * Gets the scale graph.
     *
     * @type {Curve}
     */
    get scaleGraph(): Curve;
    /**
     * Sets the second scale graph. If not null, particles pick random values between `scaleGraph`
     * and `scaleGraph2`.
     *
     * @type {Curve}
     */
    set scaleGraph2(arg: Curve);
    /**
     * Gets the second scale graph.
     *
     * @type {Curve}
     */
    get scaleGraph2(): Curve;
    /**
     * Sets the color graph.
     *
     * @type {CurveSet}
     */
    set colorGraph(arg: CurveSet);
    /**
     * Gets the color graph.
     *
     * @type {CurveSet}
     */
    get colorGraph(): CurveSet;
    /**
     * Sets the second color graph. If not null, particles pick random values between `colorGraph`
     * and `colorGraph2`.
     *
     * @type {CurveSet}
     */
    set colorGraph2(arg: CurveSet);
    /**
     * Gets the second color graph.
     *
     * @type {CurveSet}
     */
    get colorGraph2(): CurveSet;
    /**
     * Sets the alpha graph.
     *
     * @type {Curve}
     */
    set alphaGraph(arg: Curve);
    /**
     * Gets the alpha graph.
     *
     * @type {Curve}
     */
    get alphaGraph(): Curve;
    /**
     * Sets the second alpha graph. If not null, particles pick random values between `alphaGraph`
     * and `alphaGraph2`.
     *
     * @type {Curve}
     */
    set alphaGraph2(arg: Curve);
    /**
     * Gets the second alpha graph.
     *
     * @type {Curve}
     */
    get alphaGraph2(): Curve;
    /**
     * Sets the color map texture to apply to all particles in the system. If no texture is
     * assigned, a default spot texture is used.
     *
     * @type {Texture}
     */
    set colorMap(arg: Texture);
    /**
     * Gets the color map texture to apply to all particles in the system.
     *
     * @type {Texture}
     */
    get colorMap(): Texture;
    /**
     * Sets the normal map texture to apply to all particles in the system. If no texture is
     * assigned, an approximate spherical normal is calculated for each vertex.
     *
     * @type {Texture}
     */
    set normalMap(arg: Texture);
    /**
     * Gets the normal map texture to apply to all particles in the system.
     *
     * @type {Texture}
     */
    get normalMap(): Texture;
    /**
     * Sets the number of horizontal tiles in the sprite sheet.
     *
     * @type {number}
     */
    set animTilesX(arg: number);
    /**
     * Gets the number of horizontal tiles in the sprite sheet.
     *
     * @type {number}
     */
    get animTilesX(): number;
    /**
     * Sets the number of vertical tiles in the sprite sheet.
     *
     * @type {number}
     */
    set animTilesY(arg: number);
    /**
     * Gets the number of vertical tiles in the sprite sheet.
     *
     * @type {number}
     */
    get animTilesY(): number;
    /**
     * Sets the sprite sheet frame that the animation should begin playing from. Indexed from the
     * start of the current animation.
     *
     * @type {number}
     */
    set animStartFrame(arg: number);
    /**
     * Gets the sprite sheet frame that the animation should begin playing from.
     *
     * @type {number}
     */
    get animStartFrame(): number;
    /**
     * Sets the number of sprite sheet frames in the current sprite sheet animation. The number of
     * animations multiplied by number of frames should be a value less than `animTilesX`
     * multiplied by `animTilesY`.
     *
     * @type {number}
     */
    set animNumFrames(arg: number);
    /**
     * Gets the number of sprite sheet frames in the current sprite sheet animation.
     *
     * @type {number}
     */
    get animNumFrames(): number;
    /**
     * Sets the number of sprite sheet animations contained within the current sprite sheet. The
     * number of animations multiplied by number of frames should be a value less than `animTilesX`
     * multiplied by `animTilesY`.
     *
     * @type {number}
     */
    set animNumAnimations(arg: number);
    /**
     * Gets the number of sprite sheet animations contained within the current sprite sheet.
     *
     * @type {number}
     */
    get animNumAnimations(): number;
    /**
     * Sets the index of the animation to play. When `animNumAnimations` is greater than 1, the
     * sprite sheet animation index determines which animation the particle system should play.
     *
     * @type {number}
     */
    set animIndex(arg: number);
    /**
     * Gets the index of the animation to play.
     *
     * @type {number}
     */
    get animIndex(): number;
    /**
     * Sets whether each particle emitted by the system will play a random animation from the
     * sprite sheet, up to `animNumAnimations`.
     *
     * @type {boolean}
     */
    set randomizeAnimIndex(arg: boolean);
    /**
     * Gets whether each particle emitted by the system will play a random animation from the
     * sprite sheet, up to `animNumAnimations`.
     *
     * @type {boolean}
     */
    get randomizeAnimIndex(): boolean;
    /**
     * Sets the sprite sheet animation speed. 1 = particle lifetime, 2 = double the particle
     * lifetime, etc.
     *
     * @type {number}
     */
    set animSpeed(arg: number);
    /**
     * Gets the sprite sheet animation speed.
     *
     * @type {number}
     */
    get animSpeed(): number;
    /**
     * Sets whether the sprite sheet animation plays once or loops continuously.
     *
     * @type {boolean}
     */
    set animLoop(arg: boolean);
    /**
     * Gets whether the sprite sheet animation plays once or loops continuously.
     *
     * @type {boolean}
     */
    get animLoop(): boolean;
    /**
     * Sets the array of layer IDs ({@link Layer#id}) to which this particle system should belong.
     * Don't push/pop/splice or modify this array. If you want to change it, set a new one instead.
     *
     * @type {number[]}
     */
    set layers(arg: number[]);
    /**
     * Gets the array of layer IDs ({@link Layer#id}) to which this particle system belongs.
     *
     * @type {number[]}
     */
    get layers(): number[];
    /**
     * Sets the draw order of the component. A higher value means that the component will be
     * rendered on top of other components in the same layer. This is not used unless the layer's
     * sort order is set to {@link SORTMODE_MANUAL}.
     *
     * @type {number}
     */
    set drawOrder(drawOrder: number);
    /**
     * Gets the draw order of the component.
     *
     * @type {number}
     */
    get drawOrder(): number;
    /** @ignore */
    _setValue(name: any, value: any): void;
    addMeshInstanceToLayers(): void;
    removeMeshInstanceFromLayers(): void;
    onSetLayers(name: any, oldValue: any, newValue: any): void;
    onLayersChanged(oldComp: any, newComp: any): void;
    onLayerAdded(layer: any): void;
    onLayerRemoved(layer: any): void;
    _bindColorMapAsset(asset: any): void;
    _unbindColorMapAsset(asset: any): void;
    _onColorMapAssetLoad(asset: any): void;
    _onColorMapAssetUnload(asset: any): void;
    _onColorMapAssetRemove(asset: any): void;
    _onColorMapAssetChange(asset: any): void;
    onSetColorMapAsset(name: any, oldValue: any, newValue: any): void;
    _bindNormalMapAsset(asset: any): void;
    _unbindNormalMapAsset(asset: any): void;
    _onNormalMapAssetLoad(asset: any): void;
    _onNormalMapAssetUnload(asset: any): void;
    _onNormalMapAssetRemove(asset: any): void;
    _onNormalMapAssetChange(asset: any): void;
    onSetNormalMapAsset(name: any, oldValue: any, newValue: any): void;
    _bindMeshAsset(asset: any): void;
    _unbindMeshAsset(asset: any): void;
    _onMeshAssetLoad(asset: any): void;
    _onMeshAssetUnload(asset: any): void;
    _onMeshAssetRemove(asset: any): void;
    _onMeshAssetChange(asset: any): void;
    onSetMeshAsset(name: any, oldValue: any, newValue: any): void;
    onSetMesh(name: any, oldValue: any, newValue: any): void;
    _onMeshChanged(mesh: any): void;
    onSetRenderAsset(name: any, oldValue: any, newValue: any): void;
    _bindRenderAsset(asset: any): void;
    _unbindRenderAsset(asset: any): void;
    _onRenderAssetLoad(asset: any): void;
    _onRenderAssetUnload(asset: any): void;
    _onRenderAssetRemove(asset: any): void;
    _onRenderChanged(render: any): void;
    _onRenderSetMeshes(meshes: any): void;
    onSetLoop(name: any, oldValue: any, newValue: any): void;
    onSetBlendType(name: any, oldValue: any, newValue: any): void;
    _requestDepth(): void;
    _releaseDepth(): void;
    onSetDepthSoftening(name: any, oldValue: any, newValue: any): void;
    onSetSimpleProperty(name: any, oldValue: any, newValue: any): void;
    onSetComplexProperty(name: any, oldValue: any, newValue: any): void;
    onSetGraphProperty(name: any, oldValue: any, newValue: any): void;
    emitter: ParticleEmitter;
    onBeforeRemove(): void;
    /**
     * Resets particle state, doesn't affect playing.
     */
    reset(): void;
    /**
     * Disables the emission of new particles, lets existing to finish their simulation.
     */
    stop(): void;
    /**
     * Freezes the simulation.
     */
    pause(): void;
    /**
     * Unfreezes the simulation.
     */
    unpause(): void;
    /**
     * Enables/unfreezes the simulation.
     */
    play(): void;
    /**
     * Checks if simulation is in progress.
     *
     * @returns {boolean} True if the particle system is currently playing and false otherwise.
     */
    isPlaying(): boolean;
    /**
     * Called by the Editor when the component is selected, to allow custom in Editor behavior.
     *
     * @private
     */
    private setInTools;
    /**
     * Rebuilds all data used by this particle system.
     *
     * @private
     */
    private rebuild;
}
import { Component } from '../component.js';
import type { ParticleSystemComponentData } from './data.js';
import type { Vec3 } from '../../../core/math/vec3.js';
import { Asset } from '../../asset/asset.js';
import { Mesh } from '../../../scene/mesh.js';
import type { CurveSet } from '../../../core/math/curve-set.js';
import type { Curve } from '../../../core/math/curve.js';
import type { Texture } from '../../../platform/graphics/texture.js';
import { ParticleEmitter } from '../../../scene/particle-system/particle-emitter.js';
import type { ParticleSystemComponentSystem } from './system.js';
import type { Entity } from '../../entity.js';
