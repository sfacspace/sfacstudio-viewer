/**
 * Shared superclass of {@link CapsuleGeometry}, {@link ConeGeometry} and {@link CylinderGeometry}.
 * Use those classes instead of this one.
 */
export class ConeBaseGeometry extends Geometry {
    constructor(baseRadius: any, peakRadius: any, height: any, heightSegments: any, capSegments: any, roundedCaps: any);
    indices: any[];
}
import { Geometry } from './geometry.js';
