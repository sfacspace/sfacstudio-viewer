export namespace platform {
    export { platformName as name };
    export { environment };
    export let global: object;
    export let browser: boolean;
    export let worker: boolean;
    export let desktop: boolean;
    export let mobile: boolean;
    export let ios: boolean;
    export let android: boolean;
    export { xbox };
    export { gamepads };
    export { touch };
    export { workers };
    export { passiveEvents };
    export { browserName };
}
declare const platformName: "android" | "ios" | "windows" | "osx" | "linux" | "cros";
declare const environment: "worker" | "browser" | "node";
declare const xbox: boolean;
declare const gamepads: boolean;
declare const touch: boolean;
declare const workers: boolean;
declare const passiveEvents: boolean;
declare const browserName: "other" | "chrome" | "safari" | "firefox";
export {};
