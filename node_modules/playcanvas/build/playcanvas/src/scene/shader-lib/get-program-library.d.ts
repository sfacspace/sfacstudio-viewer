/**
 * Returns program library for a specified instance of a device.
 *
 * @param {GraphicsDevice} device - The graphics device used to own the program library.
 * @returns {ProgramLibrary} The instance of {@link ProgramLibrary}
 * @ignore
 */
export function getProgramLibrary(device: GraphicsDevice): ProgramLibrary;
/**
 * Assigns the program library to device cache.
 *
 * @param {GraphicsDevice} device - The graphics device used to own the program library.
 * @param {ProgramLibrary} library - The instance of {@link ProgramLibrary}.
 * @ignore
 */
export function setProgramLibrary(device: GraphicsDevice, library: ProgramLibrary): void;
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import type { ProgramLibrary } from './program-library.js';
