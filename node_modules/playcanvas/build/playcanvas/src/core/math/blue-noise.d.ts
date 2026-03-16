/**
 * Blue noise based random numbers API.
 *
 * @ignore
 */
export class BlueNoise {
    constructor(seed?: number);
    seed: number;
    _next(): void;
    value(): number;
    vec4(dest?: Vec4): Vec4;
}
export function blueNoiseData(): any;
import { Vec4 } from './vec4.js';
