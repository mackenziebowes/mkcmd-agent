/**
 * ArtSeed: a plain-JSON description of *a thing* (a page, a file, a clip), written by an
 * analyzer and read by synths. It describes the source; it does not say how to draw it.
 *
 * Rules that keep it useful to many synths:
 *  - Descriptive, not prescriptive: no colours, coordinates, line widths or primitive counts.
 *  - Features are 0..1 and use a small medium-agnostic vocabulary; anything medium-specific
 *    goes in `extras` under the analyzer's namespace.
 *  - Everything a synth needs is in the seed. Synths are pure: no clock, no Math.random().
 *  - Consumers must tolerate missing features, marks and series (use `feature()` fallbacks).
 *  - Additive changes only within a version; unknown fields are ignored.
 */

export const SEED_VERSION = 1

/**
 * The shared feature vocabulary. All values are 0..1. Each analyzer documents how it maps
 * its medium onto these.
 *
 *  density      how much there is (log-scaled size)
 *  variety      how many different kinds of element there are
 *  scale        typical size of structure: fine (0) to broad (1)
 *  intricacy    how tangled the structure is: plain (0) to nested and clause-heavy (1)
 *  roughness    how abrupt and uneven it is: smooth (0) to jagged (1)
 *  quantitative how measured or numeric it is
 */
export const CORE_FEATURES = ['density', 'variety', 'scale', 'intricacy', 'roughness', 'quantitative'] as const
export type CoreFeature = (typeof CORE_FEATURES)[number]

/** A salient, named thing in the source. Synths decide whether it becomes a hill, a star, a cell... */
export interface ArtMark {
  /** Stable 32-bit id (hash of the label) */
  id: number
  label: string
  /** 0..1 */
  weight: number
}

export interface ArtSeed {
  v: typeof SEED_VERSION
  /** What was analyzed: "text", "code", "image", ... */
  kind: string
  /** Which analyzer wrote this, with a version: "text@1" */
  analyzer: string
  /** Human title, for alt text. Never for drawing. */
  label?: string
  /**
   * Three independent 32-bit entropy sources:
   *  identity - stable for the thing across edits (e.g. derived from its route)
   *  content  - changes completely on any edit
   *  revision - changes with the last-edit date
   */
  entropy: { identity: number; content: number; revision: number }
  /** ISO timestamps */
  time: { modified: string; published?: string }
  features: Partial<Record<CoreFeature, number>> & Record<string, number | undefined>
  marks: ArtMark[]
  /** Ordered profiles along the source's extent, resampled to a fixed length, values 0..1 */
  series: Record<string, number[]>
  /** Analyzer-specific raw data under a namespace (e.g. "text.words"). Free-form. */
  extras: Record<string, unknown>
}

export function hash32(input: string): number {
  // cyrb53, folded to 32 bits
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (h2 ^ h1) >>> 0
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}


export type EntropySource = keyof ArtSeed['entropy']

/**
 * An independent random stream for a named purpose. Different `ns` values never disturb
 * each other, so adding a new random consumer to a synth does not re-roll the others.
 */
export function rng(seed: ArtSeed, ns: string, from: EntropySource = 'content'): () => number {
  return mulberry32(hash32(`${ns}:${seed.entropy[from]}`))
}

/** A feature value, or `fallback` if the analyzer did not provide it. */
export function feature(seed: ArtSeed, name: string, fallback = 0.5): number {
  const v = seed.features[name]
  return typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : fallback
}

/** A series, or `null` if absent or empty. */
export function series(seed: ArtSeed, name: string): number[] | null {
  const s = seed.series[name]
  return Array.isArray(s) && s.length > 1 ? s : null
}

const u32 = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) ? n >>> 0 : 0)
const clamp01 = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0)

/**
 * Make an arbitrary value (hand-edited JSON, another tool's output) safe to give to a synth:
 * fill defaults, clamp features and weights, drop malformed marks and series.
 */
export function coerceSeed(input: unknown): ArtSeed {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, any>
  const entropy = raw.entropy ?? {}
  const features: ArtSeed['features'] = {}
  for (const [k, v] of Object.entries(raw.features ?? {})) {
    if (typeof v === 'number' && Number.isFinite(v)) features[k] = clamp01(v)
  }
  const marks: ArtMark[] = (Array.isArray(raw.marks) ? raw.marks : [])
    .filter((m: any) => m && typeof m.label === 'string')
    .map((m: any) => ({ id: u32(m.id ?? hash32(m.label)), label: m.label, weight: clamp01(m.weight) }))
  const outSeries: ArtSeed['series'] = {}
  for (const [k, v] of Object.entries(raw.series ?? {})) {
    if (Array.isArray(v)) outSeries[k] = v.filter((n) => typeof n === 'number' && Number.isFinite(n)).map(clamp01)
  }
  return {
    v: SEED_VERSION,
    kind: typeof raw.kind === 'string' ? raw.kind : 'unknown',
    analyzer: typeof raw.analyzer === 'string' ? raw.analyzer : 'unknown',
    label: typeof raw.label === 'string' ? raw.label : undefined,
    entropy: { identity: u32(entropy.identity), content: u32(entropy.content), revision: u32(entropy.revision) },
    time: {
      modified: typeof raw.time?.modified === 'string' ? raw.time.modified : '2026-01-01T00:00:00.000Z',
      published: typeof raw.time?.published === 'string' ? raw.time.published : undefined,
    },
    features,
    marks,
    series: outSeries,
    extras: raw.extras && typeof raw.extras === 'object' ? raw.extras : {},
  }
}
