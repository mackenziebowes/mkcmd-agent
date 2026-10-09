import type { ArtSeed } from '../seed'
import { terrain } from './terrain'
import { ridgeline } from './ridgeline'

/** A synth is a pure function from a seed to an SVG string. */
export type Synth<Options = unknown> = (seed: ArtSeed, options?: Options) => string

export const synths = { terrain, ridgeline } as const
export type SynthName = keyof typeof synths

export { terrain, ridgeline }
export type { ArtStyle, TerrainOptions, TerrainPalette } from './terrain'
export { WARM } from './terrain'
