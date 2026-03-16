/**
 * Callback used by {@link GraphNode#find} and {@link GraphNode#findOne} to search through a graph
 * node and all of its descendants.
 */
export type FindNodeCallback = (node: GraphNode) => boolean;
/**
 * Callback used by {@link GraphNode#forEach} to iterate through a graph node and all of its
 * descendants.
 */
export type ForEachNodeCallback = (node: GraphNode) => void;
/**
 * @callback FindNodeCallback
 * Callback used by {@link GraphNode#find} and {@link GraphNode#findOne} to search through a graph
 * node and all of its descendants.
 * @param {GraphNode} node - The current graph node.
 * @returns {boolean} Returning `true` will result in that node being returned from
 * {@link GraphNode#find} or {@link GraphNode#findOne}.
 */
/**
 * @callback ForEachNodeCallback
 * Callback used by {@link GraphNode#forEach} to iterate through a graph node and all of its
 * descendants.
 * @param {GraphNode} node - The current graph node.
 * @returns {void}
 */
/**
 * The GraphNode class represents a node within a hierarchical scene graph. Each GraphNode can
 * reference an array of {@link children}. This creates a tree-like structure that is fundamental
 * for organizing and managing the spatial relationships between objects in a 3D scene. This class
 * provides a comprehensive API for manipulating the position, rotation, and scale of nodes both
 * locally (relative to the {@link parent}) and in world space (relative to the {@link Scene}
 * origin).
 *
 * During the application's (see {@link AppBase}) main update loop, the engine automatically
 * synchronizes the entire GraphNode hierarchy each frame. This process ensures that the world
 * transformation matrices for all nodes are up-to-date. A node's world transformation matrix is
 * calculated by combining its local transformation matrix (derived from its local position,
 * rotation, and scale) with the world transformation matrix of its parent node. For the scene
 * graph's {@link root} node (which has no parent), its world matrix is simply its local matrix.
 * This hierarchical update mechanism ensures that changes made to a parent node's transform
 * correctly propagate down to all its children and descendants, accurately reflecting their final
 * position, orientation, and scale in the world. This synchronized world transform is essential
 * for systems like rendering and physics.
 *
 * GraphNode is the superclass of {@link Entity}, which is the primary class for creating objects
 * in a PlayCanvas application. For this reason, developers typically interact with the scene
 * hierarchy and transformations through the Entity interface rather than using GraphNode directly.
 * However, GraphNode provides the underlying powerful set of features for hierarchical
 * transformations that Entity leverages.
 */
export class GraphNode extends EventHandler {
    /**
     * Create a new GraphNode instance.
     *
     * @param {string} [name] - The non-unique name of a graph node. Defaults to 'Untitled'.
     */
    constructor(name?: string);
    /**
     * The non-unique name of a graph node. Defaults to 'Untitled'.
     *
     * @type {string}
     */
    name: string;
    /**
     * Interface for tagging graph nodes. Tag based searches can be performed using the
     * {@link findByTag} function.
     *
     * @type {Tags}
     */
    tags: Tags;
    /**
     * @type {Vec3}
     * @private
     */
    private localPosition;
    /**
     * @type {Quat}
     * @private
     */
    private localRotation;
    /**
     * @type {Vec3}
     * @private
     */
    private localScale;
    /**
     * @type {Vec3}
     * @private
     */
    private localEulerAngles;
    /**
     * @type {Vec3}
     * @private
     */
    private position;
    /**
     * @type {Quat}
     * @private
     */
    private rotation;
    /**
     * @type {Vec3}
     * @private
     */
    private eulerAngles;
    /**
     * @type {Vec3|null}
     * @private
     */
    private _scale;
    /**
     * @type {Mat4}
     * @private
     */
    private localTransform;
    /**
     * @type {boolean}
     * @private
     */
    private _dirtyLocal;
    /**
     * @type {number}
     * @private
     */
    private _aabbVer;
    /**
     * Marks the node to ignore hierarchy sync entirely (including children nodes). The engine code
     * automatically freezes and unfreezes objects whenever required. Segregating dynamic and
     * stationary nodes into subhierarchies allows to reduce sync time significantly.
     *
     * @type {boolean}
     * @private
     */
    private _frozen;
    /**
     * @type {Mat4}
     * @private
     */
    private worldTransform;
    /**
     * @type {boolean}
     * @private
     */
    private _dirtyWorld;
    /**
     * Cached value representing the negatively scaled world transform. If the value is 0, this
     * marks this value as dirty and it needs to be recalculated. If the value is 1, the world
     * transform is not negatively scaled. If the value is -1, the world transform is negatively
     * scaled.
     *
     * @type {number}
     * @private
     */
    private _worldScaleSign;
    /**
     * @type {Mat3}
     * @private
     */
    private _normalMatrix;
    /**
     * @type {boolean}
     * @private
     */
    private _dirtyNormal;
    /**
     * @type {Vec3|null}
     * @private
     */
    private _right;
    /**
     * @type {Vec3|null}
     * @private
     */
    private _up;
    /**
     * @type {Vec3|null}
     * @private
     */
    private _forward;
    /**
     * @type {GraphNode|null}
     * @private
     */
    private _parent;
    /**
     * @type {GraphNode[]}
     * @protected
     */
    protected _children: GraphNode[];
    /**
     * @type {number}
     * @private
     */
    private _graphDepth;
    /**
     * Represents enabled state of the entity. If the entity is disabled, the entity including all
     * children are excluded from updates.
     *
     * @type {boolean}
     * @private
     */
    private _enabled;
    /**
     * Represents enabled state of the entity in the hierarchy. It's true only if this entity and
     * all parent entities all the way to the scene's root are enabled.
     *
     * @type {boolean}
     * @private
     */
    private _enabledInHierarchy;
    /**
     * @type {boolean}
     * @ignore
     */
    scaleCompensation: boolean;
    /**
     * Gets the normalized local space X-axis vector of the graph node in world space.
     *
     * @type {Vec3}
     */
    get right(): Vec3;
    /**
     * Gets the normalized local space Y-axis vector of the graph node in world space.
     *
     * @type {Vec3}
     */
    get up(): Vec3;
    /**
     * Gets the normalized local space negative Z-axis vector of the graph node in world space.
     *
     * @type {Vec3}
     */
    get forward(): Vec3;
    /**
     * Gets the 3x3 transformation matrix used to transform normals.
     *
     * @type {Mat3}
     * @ignore
     */
    get normalMatrix(): Mat3;
    /**
     * Sets the enabled state of the GraphNode. If one of the GraphNode's parents is disabled there
     * will be no other side effects. If all the parents are enabled then the new value will
     * activate or deactivate all the enabled children of the GraphNode.
     *
     * @type {boolean}
     */
    set enabled(enabled: boolean);
    /**
     * Gets the enabled state of the GraphNode.
     *
     * @type {boolean}
     */
    get enabled(): boolean;
    /**
     * Gets the parent of this graph node.
     *
     * @type {GraphNode|null}
     */
    get parent(): GraphNode | null;
    /**
     * Gets the path of this graph node relative to the root of the hierarchy.
     *
     * @type {string}
     */
    get path(): string;
    /**
     * Gets the oldest ancestor graph node from this graph node.
     *
     * @type {GraphNode}
     */
    get root(): GraphNode;
    /**
     * Gets the children of this graph node.
     *
     * @type {GraphNode[]}
     */
    get children(): GraphNode[];
    /**
     * Gets the depth of this child within the graph. Note that for performance reasons this is
     * only recalculated when a node is added to a new parent. In other words, it is not
     * recalculated when a node is simply removed from the graph.
     *
     * @type {number}
     */
    get graphDepth(): number;
    /**
     * @param {GraphNode} node - Graph node to update.
     * @param {boolean} enabled - True if enabled in the hierarchy, false if disabled.
     * @protected
     */
    protected _notifyHierarchyStateChanged(node: GraphNode, enabled: boolean): void;
    /**
     * Called when the enabled flag of the entity or one of its parents changes.
     *
     * @param {boolean} enabled - True if enabled in the hierarchy, false if disabled.
     * @protected
     */
    protected _onHierarchyStateChanged(enabled: boolean): void;
    /**
     * @param {this} clone - The cloned graph node to copy into.
     * @private
     */
    private _cloneInternal;
    /**
     * Clone a graph node.
     *
     * @returns {this} A clone of the specified graph node.
     */
    clone(): this;
    /**
     * Copy a graph node.
     *
     * @param {GraphNode} source - The graph node to copy.
     * @returns {GraphNode} The destination graph node.
     * @ignore
     */
    copy(source: GraphNode): GraphNode;
    /**
     * Destroy the graph node and all of its descendants. First, the graph node is removed from the
     * hierarchy. This is then repeated recursively for all descendants of the graph node.
     *
     * The last thing the graph node does is fire the `destroy` event.
     *
     * @example
     * const firstChild = graphNode.children[0];
     * firstChild.destroy(); // destroy child and all of its descendants
     */
    destroy(): void;
    /**
     * Search the graph node and all of its descendants for the nodes that satisfy some search
     * criteria.
     *
     * @param {FindNodeCallback|string} attr - This can either be a function or a string. If it's a
     * function, it is executed for each descendant node to test if node satisfies the search
     * logic. Returning true from the function will include the node into the results. If it's a
     * string then it represents the name of a field or a method of the node. If this is the name
     * of a field then the value passed as the second argument will be checked for equality. If
     * this is the name of a function then the return value of the function will be checked for
     * equality against the valued passed as the second argument to this function.
     * @param {*} [value] - If the first argument (attr) is a property name then this value
     * will be checked against the value of the property.
     * @returns {GraphNode[]} The array of graph nodes that match the search criteria.
     * @example
     * // Finds all nodes that have a model component and have 'door' in their lower-cased name
     * const doors = house.find((node) => {
     *     return node.model && node.name.toLowerCase().indexOf('door') !== -1;
     * });
     * @example
     * // Finds all nodes that have the name property set to 'Test'
     * const entities = parent.find('name', 'Test');
     */
    find(attr: FindNodeCallback | string, value?: any): GraphNode[];
    /**
     * Search the graph node and all of its descendants for the first node that satisfies some
     * search criteria.
     *
     * @param {FindNodeCallback|string} attr - This can either be a function or a string. If it's a
     * function, it is executed for each descendant node to test if node satisfies the search
     * logic. Returning true from the function will result in that node being returned from
     * findOne. If it's a string then it represents the name of a field or a method of the node. If
     * this is the name of a field then the value passed as the second argument will be checked for
     * equality. If this is the name of a function then the return value of the function will be
     * checked for equality against the valued passed as the second argument to this function.
     * @param {*} [value] - If the first argument (attr) is a property name then this value
     * will be checked against the value of the property.
     * @returns {GraphNode|null} A graph node that match the search criteria. Returns null if no
     * node is found.
     * @example
     * // Find the first node that is called 'head' and has a model component
     * const head = player.findOne((node) => {
     *     return node.model && node.name === 'head';
     * });
     * @example
     * // Finds the first node that has the name property set to 'Test'
     * const node = parent.findOne('name', 'Test');
     */
    findOne(attr: FindNodeCallback | string, value?: any): GraphNode | null;
    /**
     * Return all graph nodes that satisfy the search query. Query can be simply a string, or comma
     * separated strings, to have inclusive results of assets that match at least one query. A
     * query that consists of an array of tags can be used to match graph nodes that have each tag
     * of array.
     *
     * @param {...*} query - Name of a tag or array of tags.
     * @returns {GraphNode[]} A list of all graph nodes that match the query.
     * @example
     * // Return all graph nodes that tagged by `animal`
     * const animals = node.findByTag("animal");
     * @example
     * // Return all graph nodes that tagged by `bird` OR `mammal`
     * const birdsAndMammals = node.findByTag("bird", "mammal");
     * @example
     * // Return all assets that tagged by `carnivore` AND `mammal`
     * const meatEatingMammals = node.findByTag(["carnivore", "mammal"]);
     * @example
     * // Return all assets that tagged by (`carnivore` AND `mammal`) OR (`carnivore` AND `reptile`)
     * const meatEatingMammalsAndReptiles = node.findByTag(["carnivore", "mammal"], ["carnivore", "reptile"]);
     */
    findByTag(...query: any[]): GraphNode[];
    /**
     * Get the first node found in the graph with the name. The search is depth first.
     *
     * @param {string} name - The name of the graph.
     * @returns {GraphNode|null} The first node to be found matching the supplied name. Returns
     * null if no node is found.
     */
    findByName(name: string): GraphNode | null;
    /**
     * Get the first node found in the graph by its full path in the graph. The full path has this
     * form 'parent/child/sub-child'. The search is depth first.
     *
     * @param {string|string[]} path - The full path of the GraphNode as either a string or array
     * of GraphNode names.
     * @returns {GraphNode|null} The first node to be found matching the supplied path. Returns
     * null if no node is found.
     * @example
     * // String form
     * const grandchild = this.entity.findByPath('child/grandchild');
     * @example
     * // Array form
     * const grandchild = this.entity.findByPath(['child', 'grandchild']);
     */
    findByPath(path: string | string[]): GraphNode | null;
    /**
     * Executes a provided function once on this graph node and all of its descendants.
     *
     * @param {ForEachNodeCallback} callback - The function to execute on the graph node and each
     * descendant.
     * @param {object} [thisArg] - Optional value to use as this when executing callback function.
     * @example
     * // Log the path and name of each node in descendant tree starting with "parent"
     * parent.forEach((node) => {
     *     console.log(node.path + "/" + node.name);
     * });
     */
    forEach(callback: ForEachNodeCallback, thisArg?: object): void;
    /**
     * Check if node is descendant of another node.
     *
     * @param {GraphNode} node - Potential ancestor of node.
     * @returns {boolean} If node is descendant of another node.
     * @example
     * if (roof.isDescendantOf(house)) {
     *     // roof is descendant of house entity
     * }
     */
    isDescendantOf(node: GraphNode): boolean;
    /**
     * Check if node is ancestor for another node.
     *
     * @param {GraphNode} node - Potential descendant of node.
     * @returns {boolean} If node is ancestor for another node.
     * @example
     * if (body.isAncestorOf(foot)) {
     *     // foot is within body's hierarchy
     * }
     */
    isAncestorOf(node: GraphNode): boolean;
    /**
     * Get the world space rotation for the specified GraphNode in Euler angles. The angles are in
     * degrees and in XYZ order.
     *
     * Important: The value returned by this function should be considered read-only. In order to
     * set the world space rotation of the graph node, use {@link setEulerAngles}.
     *
     * @returns {Vec3} The world space rotation of the graph node in Euler angle form.
     * @example
     * const angles = this.entity.getEulerAngles();
     * angles.y = 180; // rotate the entity around Y by 180 degrees
     * this.entity.setEulerAngles(angles);
     */
    getEulerAngles(): Vec3;
    /**
     * Get the local space rotation for the specified GraphNode in Euler angles. The angles are in
     * degrees and in XYZ order.
     *
     * Important: The value returned by this function should be considered read-only. In order to
     * set the local space rotation of the graph node, use {@link setLocalEulerAngles}.
     *
     * @returns {Vec3} The local space rotation of the graph node as Euler angles in XYZ order.
     * @example
     * const angles = this.entity.getLocalEulerAngles();
     * angles.y = 180;
     * this.entity.setLocalEulerAngles(angles);
     */
    getLocalEulerAngles(): Vec3;
    /**
     * Get the position in local space for the specified GraphNode. The position is returned as a
     * {@link Vec3}. The returned vector should be considered read-only. To update the local
     * position, use {@link setLocalPosition}.
     *
     * @returns {Vec3} The local space position of the graph node.
     * @example
     * const position = this.entity.getLocalPosition();
     * position.x += 1; // move the entity 1 unit along x.
     * this.entity.setLocalPosition(position);
     */
    getLocalPosition(): Vec3;
    /**
     * Get the rotation in local space for the specified GraphNode. The rotation is returned as a
     * {@link Quat}. The returned quaternion should be considered read-only. To update the local
     * rotation, use {@link setLocalRotation}.
     *
     * @returns {Quat} The local space rotation of the graph node as a quaternion.
     * @example
     * const rotation = this.entity.getLocalRotation();
     */
    getLocalRotation(): Quat;
    /**
     * Get the scale in local space for the specified GraphNode. The scale is returned as a
     * {@link Vec3}. The returned vector should be considered read-only. To update the local scale,
     * use {@link setLocalScale}.
     *
     * @returns {Vec3} The local space scale of the graph node.
     * @example
     * const scale = this.entity.getLocalScale();
     * scale.x = 100;
     * this.entity.setLocalScale(scale);
     */
    getLocalScale(): Vec3;
    /**
     * Get the local transform matrix for this graph node. This matrix is the transform relative to
     * the node's parent's world transformation matrix.
     *
     * @returns {Mat4} The node's local transformation matrix.
     * @example
     * const transform = this.entity.getLocalTransform();
     */
    getLocalTransform(): Mat4;
    /**
     * Get the world space position for the specified GraphNode. The position is returned as a
     * {@link Vec3}. The value returned by this function should be considered read-only. In order
     * to set the world space position of the graph node, use {@link setPosition}.
     *
     * @returns {Vec3} The world space position of the graph node.
     * @example
     * const position = this.entity.getPosition();
     * position.x = 10;
     * this.entity.setPosition(position);
     */
    getPosition(): Vec3;
    /**
     * Get the world space rotation for the specified GraphNode. The rotation is returned as a
     * {@link Quat}. The value returned by this function should be considered read-only. In order
     * to set the world space rotation of the graph node, use {@link setRotation}.
     *
     * @returns {Quat} The world space rotation of the graph node as a quaternion.
     * @example
     * const rotation = this.entity.getRotation();
     */
    getRotation(): Quat;
    /**
     * Get the world space scale for the specified GraphNode. The returned value will only be
     * correct for graph nodes that have a non-skewed world transform (a skew can be introduced by
     * the compounding of rotations and scales higher in the graph node hierarchy). The scale is
     * returned as a {@link Vec3}. The value returned by this function should be considered
     * read-only. Note that it is not possible to set the world space scale of a graph node
     * directly.
     *
     * @returns {Vec3} The world space scale of the graph node.
     * @example
     * const scale = this.entity.getScale();
     * @ignore
     */
    getScale(): Vec3;
    /**
     * Get the world transformation matrix for this graph node.
     *
     * @returns {Mat4} The node's world transformation matrix.
     * @example
     * const transform = this.entity.getWorldTransform();
     */
    getWorldTransform(): Mat4;
    /**
     * Gets the cached value of negative scale sign of the world transform.
     *
     * @returns {number} -1 if world transform has negative scale, 1 otherwise.
     * @ignore
     */
    get worldScaleSign(): number;
    /**
     * Remove graph node from current parent.
     */
    remove(): void;
    /**
     * Remove graph node from current parent and add as child to new parent.
     *
     * @param {GraphNode} parent - New parent to attach graph node to.
     * @param {number} [index] - The child index where the child node should be placed.
     */
    reparent(parent: GraphNode, index?: number): void;
    /**
     * Sets the local space rotation of the specified graph node using Euler angles. Eulers are
     * interpreted in XYZ order.
     *
     * @overload
     * @param {number} x - Rotation around local space x-axis in degrees.
     * @param {number} y - Rotation around local space y-axis in degrees.
     * @param {number} z - Rotation around local space z-axis in degrees.
     * @returns {void}
     * @example
     * // Set rotation of 90 degrees around y-axis via 3 numbers
     * this.entity.setLocalEulerAngles(0, 90, 0);
     */
    setLocalEulerAngles(x: number, y: number, z: number): void;
    /**
     * Sets the local space rotation of the specified graph node using Euler angles. Eulers are
     * interpreted in XYZ order.
     *
     * @overload
     * @param {Vec3} angles - Vector holding rotations around local space axes in degrees.
     * @returns {void}
     * @example
     * // Set rotation of 90 degrees around y-axis via a vector
     * const angles = new pc.Vec3(0, 90, 0);
     * this.entity.setLocalEulerAngles(angles);
     */
    setLocalEulerAngles(angles: Vec3): void;
    /**
     * Sets the local space position of the specified graph node.
     *
     * @overload
     * @param {number} x - X-coordinate of local space position.
     * @param {number} y - Y-coordinate of local space position.
     * @param {number} z - Z-coordinate of local space position.
     * @returns {void}
     * @example
     * this.entity.setLocalPosition(0, 10, 0);
     */
    setLocalPosition(x: number, y: number, z: number): void;
    /**
     * Sets the local space position of the specified graph node.
     *
     * @overload
     * @param {Vec3} position - Vector holding local space position.
     * @returns {void}
     * @example
     * const pos = new pc.Vec3(0, 10, 0);
     * this.entity.setLocalPosition(pos);
     */
    setLocalPosition(position: Vec3): void;
    /**
     * Sets the local space rotation of the specified graph node.
     *
     * @overload
     * @param {number} x - X-component of local space quaternion rotation.
     * @param {number} y - Y-component of local space quaternion rotation.
     * @param {number} z - Z-component of local space quaternion rotation.
     * @param {number} w - W-component of local space quaternion rotation.
     * @returns {void}
     * @example
     * this.entity.setLocalRotation(0, 0, 0, 1);
     */
    setLocalRotation(x: number, y: number, z: number, w: number): void;
    /**
     * Sets the local space rotation of the specified graph node.
     *
     * @overload
     * @param {Quat} rotation - Quaternion holding local space rotation.
     * @returns {void}
     * @example
     * const q = new pc.Quat();
     * this.entity.setLocalRotation(q);
     */
    setLocalRotation(rotation: Quat): void;
    /**
     * Sets the local space scale factor of the specified graph node.
     *
     * @overload
     * @param {number} x - X-coordinate of local space scale.
     * @param {number} y - Y-coordinate of local space scale.
     * @param {number} z - Z-coordinate of local space scale.
     * @returns {void}
     * @example
     * this.entity.setLocalScale(10, 10, 10);
     */
    setLocalScale(x: number, y: number, z: number): void;
    /**
     * Sets the local space scale factor of the specified graph node.
     *
     * @overload
     * @param {Vec3} scale - Vector holding local space scale.
     * @returns {void}
     * @example
     * const scale = new pc.Vec3(10, 10, 10);
     * this.entity.setLocalScale(scale);
     */
    setLocalScale(scale: Vec3): void;
    /** @private */
    private _dirtifyLocal;
    /** @private */
    private _unfreezeParentToRoot;
    /** @private */
    private _dirtifyWorld;
    /** @private */
    private _dirtifyWorldInternal;
    /**
     * Sets the world space position of the specified graph node.
     *
     * @overload
     * @param {number} x - X-coordinate of world space position.
     * @param {number} y - Y-coordinate of world space position.
     * @param {number} z - Z-coordinate of world space position.
     * @returns {void}
     * @example
     * this.entity.setPosition(0, 10, 0);
     */
    setPosition(x: number, y: number, z: number): void;
    /**
     * Sets the world space position of the specified graph node.
     *
     * @overload
     * @param {Vec3} position - Vector holding world space position.
     * @returns {void}
     * @example
     * const position = new pc.Vec3(0, 10, 0);
     * this.entity.setPosition(position);
     */
    setPosition(position: Vec3): void;
    /**
     * Sets the world space rotation of the specified graph node.
     *
     * @overload
     * @param {number} x - X-component of world space quaternion rotation.
     * @param {number} y - Y-component of world space quaternion rotation.
     * @param {number} z - Z-component of world space quaternion rotation.
     * @param {number} w - W-component of world space quaternion rotation.
     * @returns {void}
     * @example
     * this.entity.setRotation(0, 0, 0, 1);
     */
    setRotation(x: number, y: number, z: number, w: number): void;
    /**
     * Sets the world space rotation of the specified graph node.
     *
     * @overload
     * @param {Quat} rotation - Quaternion holding world space rotation.
     * @returns {void}
     * @example
     * const rotation = new pc.Quat();
     * this.entity.setRotation(rotation);
     */
    setRotation(rotation: Quat): void;
    /**
     * Sets the world space position and rotation of the specified graph node. This is faster than
     * setting the position and rotation independently.
     *
     * @param {Vec3} position - The world space position to set.
     * @param {Quat} rotation - The world space rotation to set.
     * @example
     * const position = new pc.Vec3(0, 10, 0);
     * const rotation = new pc.Quat().setFromEulerAngles(0, 90, 0);
     * this.entity.setPositionAndRotation(position, rotation);
     */
    setPositionAndRotation(position: Vec3, rotation: Quat): void;
    /**
     * Sets the world space rotation of the specified graph node using Euler angles. Eulers are
     * interpreted in XYZ order.
     *
     * @overload
     * @param {number} x - Rotation around world space x-axis in degrees.
     * @param {number} y - Rotation around world space y-axis in degrees.
     * @param {number} z - Rotation around world space z-axis in degrees.
     * @returns {void}
     * @example
     * this.entity.setEulerAngles(0, 90, 0);
     */
    setEulerAngles(x: number, y: number, z: number): void;
    /**
     * Sets the world space rotation of the specified graph node using Euler angles. Eulers are
     * interpreted in XYZ order.
     *
     * @overload
     * @param {Vec3} angles - Vector holding rotations around world space axes in degrees.
     * @returns {void}
     * @example
     * const angles = new pc.Vec3(0, 90, 0);
     * this.entity.setEulerAngles(angles);
     */
    setEulerAngles(angles: Vec3): void;
    /**
     * Add a new child to the child list and update the parent value of the child node.
     * If the node already had a parent, it is removed from its child list.
     *
     * @param {GraphNode} node - The new child to add.
     * @example
     * const e = new pc.Entity(app);
     * this.entity.addChild(e);
     */
    addChild(node: GraphNode): void;
    /**
     * Add a child to this node, maintaining the child's transform in world space.
     * If the node already had a parent, it is removed from its child list.
     *
     * @param {GraphNode} node - The child to add.
     * @example
     * const e = new pc.Entity(app);
     * this.entity.addChildAndSaveTransform(e);
     * @ignore
     */
    addChildAndSaveTransform(node: GraphNode): void;
    /**
     * Insert a new child to the child list at the specified index and update the parent value of
     * the child node. If the node already had a parent, it is removed from its child list.
     *
     * @param {GraphNode} node - The new child to insert.
     * @param {number} index - The index in the child list of the parent where the new node will be
     * inserted.
     * @example
     * const e = new pc.Entity(app);
     * this.entity.insertChild(e, 1);
     */
    insertChild(node: GraphNode, index: number): void;
    /**
     * Prepares node for being inserted to a parent node, and removes it from the previous parent.
     *
     * @param {GraphNode} node - The node being inserted.
     * @private
     */
    private _prepareInsertChild;
    /**
     * Fires an event on all children of the node. The event `name` is fired on the first (root)
     * node only. The event `nameHierarchy` is fired for all children.
     *
     * @param {string} name - The name of the event to fire on the root.
     * @param {string} nameHierarchy - The name of the event to fire for all descendants.
     * @param {GraphNode} parent - The parent of the node being added/removed from the hierarchy.
     * @private
     */
    private _fireOnHierarchy;
    /**
     * Called when a node is inserted into a node's child list.
     *
     * @param {GraphNode} node - The node that was inserted.
     * @private
     */
    private _onInsertChild;
    /**
     * Recurse the hierarchy and update the graph depth at each node.
     *
     * @private
     */
    private _updateGraphDepth;
    /**
     * Remove the node from the child list and update the parent value of the child.
     *
     * @param {GraphNode} child - The node to remove.
     * @example
     * const child = this.entity.children[0];
     * this.entity.removeChild(child);
     */
    removeChild(child: GraphNode): void;
    _sync(): void;
    /**
     * Updates the world transformation matrices at this node and all of its descendants.
     *
     * @ignore
     */
    syncHierarchy(): void;
    /**
     * Reorients the graph node so that the negative z-axis points towards the target.
     *
     * @overload
     * @param {number} x - X-component of the world space coordinate to look at.
     * @param {number} y - Y-component of the world space coordinate to look at.
     * @param {number} z - Z-component of the world space coordinate to look at.
     * @param {number} [ux] - X-component of the up vector for the look at transform. Defaults to 0.
     * @param {number} [uy] - Y-component of the up vector for the look at transform. Defaults to 1.
     * @param {number} [uz] - Z-component of the up vector for the look at transform. Defaults to 0.
     * @returns {void}
     * @example
     * // Look at the world space origin, using the (default) positive y-axis for up
     * this.entity.lookAt(0, 0, 0);
     * @example
     * // Look at world space coordinate [10, 10, 10], using the negative world y-axis for up
     * this.entity.lookAt(10, 10, 10, 0, -1, 0);
     */
    lookAt(x: number, y: number, z: number, ux?: number, uy?: number, uz?: number): void;
    /**
     * Reorients the graph node so that the negative z-axis points towards the target.
     *
     * @overload
     * @param {Vec3} target - The world space coordinate to look at.
     * @param {Vec3} [up] - The world space up vector for look at transform. Defaults to {@link Vec3.UP}.
     * @returns {void}
     * @example
     * // Look at another entity, using the (default) positive y-axis for up
     * const target = otherEntity.getPosition();
     * this.entity.lookAt(target);
     * @example
     * // Look at another entity, using the negative world y-axis for up
     * const target = otherEntity.getPosition();
     * this.entity.lookAt(target, pc.Vec3.DOWN);
     */
    lookAt(target: Vec3, up?: Vec3): void;
    /**
     * Translates the graph node in world space by the specified translation vector.
     *
     * @overload
     * @param {number} x - X-coordinate of world space translation.
     * @param {number} y - Y-coordinate of world space translation.
     * @param {number} z - Z-coordinate of world space translation.
     * @returns {void}
     * @example
     * this.entity.translate(10, 0, 0);
     */
    translate(x: number, y: number, z: number): void;
    /**
     * Translates the graph node in world space by the specified translation vector.
     *
     * @overload
     * @param {Vec3} translation - Vector holding world space translation.
     * @returns {void}
     * @example
     * const translation = new pc.Vec3(10, 0, 0);
     * this.entity.translate(translation);
     */
    translate(translation: Vec3): void;
    /**
     * Translates the graph node in local space by the specified translation vector.
     *
     * @overload
     * @param {number} x - X-coordinate of local space translation.
     * @param {number} y - Y-coordinate of local space translation.
     * @param {number} z - Z-coordinate of local space translation.
     * @returns {void}
     * @example
     * this.entity.translateLocal(10, 0, 0);
     */
    translateLocal(x: number, y: number, z: number): void;
    /**
     * Translates the graph node in local space by the specified translation vector.
     *
     * @overload
     * @param {Vec3} translation - Vector holding local space translation.
     * @returns {void}
     * @example
     * const t = new pc.Vec3(10, 0, 0);
     * this.entity.translateLocal(t);
     */
    translateLocal(translation: Vec3): void;
    /**
     * Rotates the graph node in world space by the specified Euler angles. Eulers are specified in
     * degrees in XYZ order.
     *
     * @overload
     * @param {number} x - Rotation around world space x-axis in degrees.
     * @param {number} y - Rotation around world space y-axis in degrees.
     * @param {number} z - Rotation around world space z-axis in degrees.
     * @returns {void}
     * @example
     * this.entity.rotate(0, 90, 0);
     */
    rotate(x: number, y: number, z: number): void;
    /**
     * Rotates the graph node in world space by the specified Euler angles. Eulers are specified in
     * degrees in XYZ order.
     *
     * @overload
     * @param {Vec3} rotation - Vector holding world space rotation.
     * @returns {void}
     * @example
     * const rotation = new pc.Vec3(0, 90, 0);
     * this.entity.rotate(rotation);
     */
    rotate(rotation: Vec3): void;
    /**
     * Rotates the graph node in local space by the specified Euler angles. Eulers are specified in
     * degrees in XYZ order.
     *
     * @overload
     * @param {number} x - Rotation around local space x-axis in degrees.
     * @param {number} y - Rotation around local space y-axis in degrees.
     * @param {number} z - Rotation around local space z-axis in degrees.
     * @returns {void}
     * @example
     * this.entity.rotateLocal(0, 90, 0);
     */
    rotateLocal(x: number, y: number, z: number): void;
    /**
     * Rotates the graph node in local space by the specified Euler angles. Eulers are specified in
     * degrees in XYZ order.
     *
     * @overload
     * @param {Vec3} rotation - Vector holding local space rotation.
     * @returns {void}
     * @example
     * const rotation = new pc.Vec3(0, 90, 0);
     * this.entity.rotateLocal(rotation);
     */
    rotateLocal(rotation: Vec3): void;
}
import { EventHandler } from '../core/event-handler.js';
import { Tags } from '../core/tags.js';
import { Vec3 } from '../core/math/vec3.js';
import { Mat3 } from '../core/math/mat3.js';
import { Quat } from '../core/math/quat.js';
import { Mat4 } from '../core/math/mat4.js';
