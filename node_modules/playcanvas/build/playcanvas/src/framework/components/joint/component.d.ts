/**
 * The JointComponent adds a physics joint constraint linking two rigid bodies.
 *
 * @ignore
 */
export class JointComponent extends Component {
    /**
     * Create a new JointComponent instance.
     *
     * @param {JointComponentSystem} system - The ComponentSystem that created this Component.
     * @param {Entity} entity - The Entity that this Component is attached to.
     */
    constructor(system: JointComponentSystem, entity: Entity);
    _constraint: any;
    _entityA: any;
    _entityB: any;
    _breakForce: number;
    _enableCollision: boolean;
    _linearMotionX: string;
    _linearLimitsX: Vec2;
    _linearSpringX: boolean;
    _linearStiffnessX: number;
    _linearDampingX: number;
    _linearEquilibriumX: number;
    _linearMotionY: string;
    _linearLimitsY: Vec2;
    _linearSpringY: boolean;
    _linearStiffnessY: number;
    _linearDampingY: number;
    _linearEquilibriumY: number;
    _linearMotionZ: string;
    _linearLimitsZ: Vec2;
    _linearSpringZ: boolean;
    _linearStiffnessZ: number;
    _linearDampingZ: number;
    _linearEquilibriumZ: number;
    _angularMotionX: string;
    _angularLimitsX: Vec2;
    _angularSpringX: boolean;
    _angularStiffnessX: number;
    _angularDampingX: number;
    _angularEquilibriumX: number;
    _angularMotionY: string;
    _angularLimitsY: Vec2;
    _angularSpringY: boolean;
    _angularStiffnessY: number;
    _angularDampingY: number;
    _angularEquilibriumY: number;
    _angularMotionZ: string;
    _angularLimitsZ: Vec2;
    _angularSpringZ: boolean;
    _angularEquilibriumZ: number;
    _angularDampingZ: number;
    _angularStiffnessZ: number;
    set entityA(body: any);
    get entityA(): any;
    set entityB(body: any);
    get entityB(): any;
    set breakForce(force: number);
    get breakForce(): number;
    set enableCollision(enableCollision: boolean);
    get enableCollision(): boolean;
    set angularLimitsX(limits: Vec2);
    get angularLimitsX(): Vec2;
    set angularMotionX(value: string);
    get angularMotionX(): string;
    set angularLimitsY(limits: Vec2);
    get angularLimitsY(): Vec2;
    set angularMotionY(value: string);
    get angularMotionY(): string;
    set angularLimitsZ(limits: Vec2);
    get angularLimitsZ(): Vec2;
    set angularMotionZ(value: string);
    get angularMotionZ(): string;
    set linearLimitsX(limits: Vec2);
    get linearLimitsX(): Vec2;
    set linearMotionX(value: string);
    get linearMotionX(): string;
    set linearLimitsY(limits: Vec2);
    get linearLimitsY(): Vec2;
    set linearMotionY(value: string);
    get linearMotionY(): string;
    set linearLimitsZ(limits: Vec2);
    get linearLimitsZ(): Vec2;
    set linearMotionZ(value: string);
    get linearMotionZ(): string;
    _convertTransform(pcTransform: any, ammoTransform: any): void;
    _updateAngularLimits(): void;
    _updateLinearLimits(): void;
    _createConstraint(): void;
    _destroyConstraint(): void;
    initFromData(data: any): void;
    _onSetEnabled(prop: any, old: any, value: any): void;
    _onBeforeRemove(): void;
}
import { Component } from '../component.js';
import { Vec2 } from '../../../core/math/vec2.js';
import type { JointComponentSystem } from './system.js';
import type { Entity } from '../../entity.js';
