/**
 * Inline - always available type of session. It has limited features availability and is rendered
 * into HTML element.
 *
 * @category XR
 */ const XRTYPE_INLINE = 'inline';
/**
 * Immersive VR - session that provides exclusive access to VR device with best available tracking
 * features.
 *
 * @category XR
 */ const XRTYPE_VR = 'immersive-vr';
/**
 * Immersive AR - session that provides exclusive access to VR/AR device that is intended to be
 * blended with real-world environment.
 *
 * @category XR
 */ const XRTYPE_AR = 'immersive-ar';
/**
 * Viewer - always supported space with some basic tracking capabilities.
 *
 * @category XR
 */ const XRSPACE_VIEWER = 'viewer';
/**
 * Local - represents a tracking space with a native origin near the viewer at the time of
 * creation. The exact position and orientation will be initialized based on the conventions of the
 * underlying platform. When using this reference space the user is not expected to move beyond
 * their initial position much, if at all, and tracking is optimized for that purpose. For devices
 * with 6DoF tracking, local reference spaces should emphasize keeping the origin stable relative
 * to the user's environment.
 *
 * @category XR
 */ const XRSPACE_LOCAL = 'local';
/**
 * Local Floor - represents a tracking space with a native origin at the floor in a safe position
 * for the user to stand. The y axis equals 0 at floor level, with the x and z position and
 * orientation initialized based on the conventions of the underlying platform. Floor level value
 * might be estimated by the underlying platform. When using this reference space, the user is not
 * expected to move beyond their initial position much, if at all, and tracking is optimized for
 * that purpose. For devices with 6DoF tracking, local-floor reference spaces should emphasize
 * keeping the origin stable relative to the user's environment.
 *
 * @category XR
 */ const XRSPACE_LOCALFLOOR = 'local-floor';
/**
 * Bounded Floor - represents a tracking space with its native origin at the floor, where the user
 * is expected to move within a pre-established boundary. Tracking in a bounded-floor reference
 * space is optimized for keeping the native origin and bounds geometry stable relative to the
 * user's environment.
 *
 * @category XR
 */ const XRSPACE_BOUNDEDFLOOR = 'bounded-floor';
/**
 * Unbounded - represents a tracking space where the user is expected to move freely around their
 * environment, potentially even long distances from their starting point. Tracking in an unbounded
 * reference space is optimized for stability around the user's current position, and as such the
 * native origin may drift over time.
 *
 * @category XR
 */ const XRSPACE_UNBOUNDED = 'unbounded';
/**
 * Gaze - indicates the target ray will originate at the viewer and follow the direction it is
 * facing. This is commonly referred to as a "gaze input" device in the context of head-mounted
 * displays.
 *
 * @category XR
 */ const XRTARGETRAY_GAZE = 'gaze';
/**
 * Screen - indicates that the input source was an interaction with the canvas element associated
 * with an inline session's output context, such as a mouse click or touch event.
 *
 * @category XR
 */ const XRTARGETRAY_SCREEN = 'screen';
/**
 * Tracked Pointer - indicates that the target ray originates from either a handheld device or
 * other hand-tracking mechanism and represents that the user is using their hands or the held
 * device for pointing.
 *
 * @category XR
 */ const XRTARGETRAY_POINTER = 'tracked-pointer';
/**
 * None - view associated with a monoscopic screen, such as mobile phone screens.
 *
 * @category XR
 */ const XREYE_NONE = 'none';
/**
 * Left - view associated with left eye.
 *
 * @category XR
 */ const XREYE_LEFT = 'left';
/**
 * Right - view associated with right eye.
 *
 * @category XR
 */ const XREYE_RIGHT = 'right';
/**
 * None - input source is not meant to be held in hands.
 *
 * @category XR
 */ const XRHAND_NONE = 'none';
/**
 * Left - indicates that input source is meant to be held in left hand.
 *
 * @category XR
 */ const XRHAND_LEFT = 'left';
/**
 * Right - indicates that input source is meant to be held in right hand.
 *
 * @category XR
 */ const XRHAND_RIGHT = 'right';
/**
 * Point - indicates that the hit test results will be computed based on the feature points
 * detected by the underlying Augmented Reality system.
 *
 * @category XR
 */ const XRTRACKABLE_POINT = 'point';
/**
 * Plane - indicates that the hit test results will be computed based on the planes detected by the
 * underlying Augmented Reality system.
 *
 * @category XR
 */ const XRTRACKABLE_PLANE = 'plane';
/**
 * Mesh - indicates that the hit test results will be computed based on the meshes detected by the
 * underlying Augmented Reality system.
 *
 * @category XR
 */ const XRTRACKABLE_MESH = 'mesh';
/**
 * CPU - indicates that depth sensing preferred usage is CPU. This usage path is guaranteed to be
 * supported.
 *
 * @category XR
 */ const XRDEPTHSENSINGUSAGE_CPU = 'cpu-optimized';
/**
 * GPU - indicates that depth sensing preferred usage is GPU.
 *
 * @category XR
 */ const XRDEPTHSENSINGUSAGE_GPU = 'gpu-optimized';
/**
 * Luminance Alpha - indicates that depth sensing preferred raw data format is Luminance Alpha (8bit + 8bit).
 * This format is guaranteed to be supported.
 *
 * @category XR
 */ const XRDEPTHSENSINGFORMAT_L8A8 = 'luminance-alpha';
/**
 * Unsigned Short - indicates that depth sensing preferred raw data format is Unsigned Short (16 bit).
 *
 * @category XR
 */ const XRDEPTHSENSINGFORMAT_R16U = 'unsigned-short';
/**
 * Float 32 - indicates that depth sensing preferred raw data format is Float (32 bit).
 *
 * @category XR
 */ const XRDEPTHSENSINGFORMAT_F32 = 'float32';

export { XRDEPTHSENSINGFORMAT_F32, XRDEPTHSENSINGFORMAT_L8A8, XRDEPTHSENSINGFORMAT_R16U, XRDEPTHSENSINGUSAGE_CPU, XRDEPTHSENSINGUSAGE_GPU, XREYE_LEFT, XREYE_NONE, XREYE_RIGHT, XRHAND_LEFT, XRHAND_NONE, XRHAND_RIGHT, XRSPACE_BOUNDEDFLOOR, XRSPACE_LOCAL, XRSPACE_LOCALFLOOR, XRSPACE_UNBOUNDED, XRSPACE_VIEWER, XRTARGETRAY_GAZE, XRTARGETRAY_POINTER, XRTARGETRAY_SCREEN, XRTRACKABLE_MESH, XRTRACKABLE_PLANE, XRTRACKABLE_POINT, XRTYPE_AR, XRTYPE_INLINE, XRTYPE_VR };
