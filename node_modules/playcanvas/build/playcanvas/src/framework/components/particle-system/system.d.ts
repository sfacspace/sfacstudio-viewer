/**
 * Allows an Entity to render a particle system.
 *
 * @category Graphics
 */
export class ParticleSystemComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof ParticleSystemComponent;
    DataType: typeof ParticleSystemComponentData;
    schema: string[];
    propertyTypes: {
        emitterExtents: string;
        emitterExtentsInner: string;
        particleNormal: string;
        wrapBounds: string;
        localVelocityGraph: string;
        localVelocityGraph2: string;
        velocityGraph: string;
        velocityGraph2: string;
        colorGraph: string;
        colorGraph2: string;
        alphaGraph: string;
        alphaGraph2: string;
        rotationSpeedGraph: string;
        rotationSpeedGraph2: string;
        radialSpeedGraph: string;
        radialSpeedGraph2: string;
        scaleGraph: string;
        scaleGraph2: string;
    };
    initializeComponentData(component: any, _data: any, properties: any): void;
    cloneComponent(entity: any, clone: any): import("../component.js").Component;
    onUpdate(dt: any): void;
    onBeforeRemove(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { ParticleSystemComponent } from './component.js';
import { ParticleSystemComponentData } from './data.js';
