/**
 * Internal cache data for the evaluation of a single curve timeline.
 *
 * @ignore
 */
export class AnimCache {
    _left: number;
    _right: number;
    _len: number;
    _recip: number;
    _p0: number;
    _p1: number;
    _t: number;
    _hermite: {
        valid: boolean;
        p0: number;
        m0: number;
        p1: number;
        m1: number;
    };
    update(time: any, input: any): void;
    _findKey(time: any, input: any): number;
    eval(result: any, interpolation: any, output: any): void;
}
