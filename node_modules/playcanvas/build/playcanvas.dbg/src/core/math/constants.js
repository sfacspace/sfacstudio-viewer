/**
 * A linear interpolation scheme.
 *
 * @category Math
 */ const CURVE_LINEAR = 0;
/**
 * A smooth step interpolation scheme.
 *
 * @category Math
 */ const CURVE_SMOOTHSTEP = 1;
/**
 * Cardinal spline interpolation scheme. For a Catmull-Rom spline, specify a curve tension of 0.5.
 *
 * @category Math
 */ const CURVE_SPLINE = 4;
/**
 * A stepped interpolator that does not perform any blending.
 *
 * @category Math
 */ const CURVE_STEP = 5;

export { CURVE_LINEAR, CURVE_SMOOTHSTEP, CURVE_SPLINE, CURVE_STEP };
