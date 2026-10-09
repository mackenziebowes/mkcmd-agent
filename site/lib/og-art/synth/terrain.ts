import { feature, mulberry32, type ArtSeed } from '../seed'
import { ART_BACKGROUND, ART_HEIGHT, ART_INK, ART_WIDTH, f1, hsl } from '../canvas'

/* ─────────────────────────────────────────────
   Value noise
   ───────────────────────────────────────────── */

function lattice(seed: number, x: number, y: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed, 2147483647)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t)
}

function noise(seed: number, x: number, y: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const fx = smooth(x - xi)
  const fy = smooth(y - yi)
  const a = lattice(seed, xi, yi)
  const b = lattice(seed, xi + 1, yi)
  const c = lattice(seed, xi, yi + 1)
  const d = lattice(seed, xi + 1, yi + 1)
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy
}

function fbm(seed: number, x: number, y: number, octaves: number, gain: number): number {
  let sum = 0
  let amp = 1
  let norm = 0
  let freq = 1
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise(seed + o * 101, x * freq, y * freq)
    norm += amp
    amp *= gain
    freq *= 2
  }
  return sum / norm
}

/* ─────────────────────────────────────────────
   Scalar field: content terrain + date weathering
   ───────────────────────────────────────────── */

const GRID_X = 120
const GRID_Y = 63
const ASPECT = ART_WIDTH / ART_HEIGHT

interface Field {
  values: Float32Array
  min: number
  max: number
}

/** `layoutSeed` fixes where the landforms sit; `dateSeed` weathers them. */
function buildField(seed: ArtSeed, layoutSeed: number, dateSeed: number): Field {
  const rand = mulberry32(layoutSeed ^ 0x9e3779b9)
  const octaves = 3 + Math.round(feature(seed, 'variety') * 2)
  const gain = 0.42 + 0.2 * feature(seed, 'roughness')
  const scale = 1.6 + 2.2 * feature(seed, 'scale')
  const warp = 0.15 + 0.5 * feature(seed, 'intricacy')
  const weatherAmp = 0.22
  const offX = rand() * 40
  const offY = rand() * 40

  const hills = seed.marks.map((k) => {
    const h = mulberry32(k.id ^ layoutSeed)
    return {
      x: (0.08 + h() * 0.84) * ASPECT,
      y: 0.12 + h() * 0.76,
      amp: 0.25 + 0.55 * k.weight + h() * 0.15,
      r: 0.1 + h() * 0.16,
    }
  })

  const values = new Float32Array((GRID_X + 1) * (GRID_Y + 1))
  let min = Infinity
  let max = -Infinity
  for (let j = 0; j <= GRID_Y; j++) {
    for (let i = 0; i <= GRID_X; i++) {
      const x = (i / GRID_X) * ASPECT
      const y = j / GRID_Y
      const wx = x + warp * (fbm(layoutSeed + 7, x * 1.3 + offX, y * 1.3 + offY, 2, 0.5) - 0.5)
      const wy = y + warp * (fbm(layoutSeed + 13, x * 1.3 + offX, y * 1.3 + offY, 2, 0.5) - 0.5)
      let v = fbm(layoutSeed, wx * scale + offX, wy * scale + offY, octaves, gain)
      for (const hill of hills) {
        const d2 = (x - hill.x) ** 2 + (y - hill.y) ** 2
        v += hill.amp * Math.exp(-d2 / (2 * hill.r * hill.r)) * 0.55
      }
      // weathering: a weaker, finer layer seeded by the edit date
      v += weatherAmp * (fbm(dateSeed, x * 5.5, y * 5.5, 2, 0.5) - 0.5)
      values[j * (GRID_X + 1) + i] = v
      if (v < min) min = v
      if (v > max) max = v
    }
  }
  return { values, min, max }
}

/* ─────────────────────────────────────────────
   Marching squares
   ───────────────────────────────────────────── */

type Seg = [number, number, number, number]

function contour(field: Field, level: number): Seg[] {
  const { values } = field
  const stride = GRID_X + 1
  const segs: Seg[] = []
  const sx = ART_WIDTH / GRID_X
  const sy = ART_HEIGHT / GRID_Y

  for (let j = 0; j < GRID_Y; j++) {
    for (let i = 0; i < GRID_X; i++) {
      const v00 = values[j * stride + i]
      const v10 = values[j * stride + i + 1]
      const v11 = values[(j + 1) * stride + i + 1]
      const v01 = values[(j + 1) * stride + i]
      const idx = (v00 > level ? 1 : 0) | (v10 > level ? 2 : 0) | (v11 > level ? 4 : 0) | (v01 > level ? 8 : 0)
      if (idx === 0 || idx === 15) continue

      const lerp = (a: number, b: number) => (level - a) / (b - a)
      // edges: 0 top, 1 right, 2 bottom, 3 left
      const point = (edge: number): [number, number] => {
        switch (edge) {
          case 0: return [(i + lerp(v00, v10)) * sx, j * sy]
          case 1: return [(i + 1) * sx, (j + lerp(v10, v11)) * sy]
          case 2: return [(i + lerp(v01, v11)) * sx, (j + 1) * sy]
          default: return [i * sx, (j + lerp(v00, v01)) * sy]
        }
      }
      const add = (a: number, b: number) => {
        const [x1, y1] = point(a)
        const [x2, y2] = point(b)
        segs.push([x1, y1, x2, y2])
      }
      const centerHigh = (v00 + v10 + v11 + v01) / 4 > level

      switch (idx) {
        case 1: case 14: add(3, 0); break
        case 2: case 13: add(0, 1); break
        case 3: case 12: add(3, 1); break
        case 4: case 11: add(1, 2); break
        case 6: case 9: add(0, 2); break
        case 7: case 8: add(3, 2); break
        case 5:
          if (centerHigh) { add(0, 1); add(2, 3) } else { add(3, 0); add(1, 2) }
          break
        case 10:
          if (centerHigh) { add(3, 0); add(1, 2) } else { add(0, 1); add(2, 3) }
          break
      }
    }
  }
  return segs
}

/* ─────────────────────────────────────────────
   Colour
   ───────────────────────────────────────────── */


/* ─────────────────────────────────────────────
   Halftone: dots on a 45-degree screen, sized by how close each
   lattice point sits to a contour line (measured in pixels, using the
   field's gradient), so the dots trace the paths the terrain takes.
   ───────────────────────────────────────────── */

const HALFTONE_PITCH = 11

function sampleField(field: Field, x: number, y: number): number {
  const fx = Math.max(0, Math.min(GRID_X - 1e-6, (x / ART_WIDTH) * GRID_X))
  const fy = Math.max(0, Math.min(GRID_Y - 1e-6, (y / ART_HEIGHT) * GRID_Y))
  const i = Math.floor(fx)
  const j = Math.floor(fy)
  const tx = fx - i
  const ty = fy - j
  const stride = GRID_X + 1
  const v = field.values
  const a = v[j * stride + i]
  const b = v[j * stride + i + 1]
  const c = v[(j + 1) * stride + i]
  const d = v[(j + 1) * stride + i + 1]
  return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty
}

interface Ribbon {
  level: number
  index: boolean
  width: number
  rMax: number
  color: string
}

function halftone(field: Field, ribbons: Ribbon[]): string {
  const h = HALFTONE_PITCH / Math.SQRT2
  const groups = new Map<string, string[]>()

  for (let u = -90; u <= 90; u++) {
    for (let v = -90; v <= 90; v++) {
      const x = ART_WIDTH / 2 + (u - v) * h
      const y = ART_HEIGHT / 2 + (u + v) * h
      if (x < -6 || x > ART_WIDTH + 6 || y < -6 || y > ART_HEIGHT + 6) continue

      const val = sampleField(field, x, y)
      const gx = (sampleField(field, x + 2, y) - sampleField(field, x - 2, y)) / 4
      const gy = (sampleField(field, x, y + 2) - sampleField(field, x, y - 2)) / 4
      const grad = Math.hypot(gx, gy) + 1e-6

      let best: { r: number; color: string } | null = null
      for (const ribbon of ribbons) {
        const dist = Math.abs(val - ribbon.level) / grad
        if (dist >= ribbon.width) continue
        const r = ribbon.rMax * Math.pow(1 - dist / ribbon.width, 1.25)
        if (r >= 0.7 && (!best || r > best.r)) best = { r, color: ribbon.color }
      }
      if (!best) continue
      const list = groups.get(best.color) ?? []
      list.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(best.r)}"/>`)
      groups.set(best.color, list)
    }
  }

  return [...groups.entries()]
    .map(([color, circles]) => `<g class="halftone" fill="${color}">${circles.join('')}</g>`)
    .join('')
}

/* ─────────────────────────────────────────────
   Compose
   ───────────────────────────────────────────── */

function path(segs: Seg[]): string {
  return segs.map(([a, b, c, d]) => `M${f1(a)} ${f1(b)}L${f1(c)} ${f1(d)}`).join('')
}

/**
 * How the terrain is drawn.
 *  - lines:    thin contour lines only
 *  - halftone: contours rendered as ribbons of halftone dots
 *  - mixed:    thin contours everywhere, halftone ribbons on the index contours
 */
export type ArtStyle = 'lines' | 'halftone' | 'mixed'

/**
 * Colours for the terrain. `contour` gets the level's height t (0 to 1), whether it is an index
 * contour, and a small date-derived shift to apply to hue. The default is the original warm map.
 */
export interface TerrainPalette {
  background: string
  ink: string
  contour: (t: number, index: boolean, shift: number) => string
  glow: (shift: number) => string
  /** Optional drafting grid under the contours. */
  grid?: { color: string; size: number; opacity: number }
}

export const WARM: TerrainPalette = {
  background: ART_BACKGROUND,
  ink: ART_INK,
  // Low ground is brown, rising through orange to amber at the index contours
  contour: (t, index, shift) => {
    const hue = 21 + shift
    return index ? hsl(hue + 2, 0.9, 0.46 + 0.1 * t) : hsl(hue - 5 + 5 * t, 0.5 + 0.35 * t, 0.32 + 0.2 * t)
  },
  glow: (shift) => hsl(21 + shift - 3, 0.55, 0.2),
}

export interface TerrainOptions {
  style?: ArtStyle
  palette?: TerrainPalette
  /**
   * What fixes where the landforms sit. 'content' (default): any edit re-rolls the layout.
   * 'identity': the layout stays put across edits and only the details and weathering change,
   * so a page reads as the same place, re-surveyed.
   */
  layoutFrom?: 'content' | 'identity'
}

/**
 * Terrain synth: a topographic map. Features shape the land (variety -> octaves, roughness ->
 * gain, scale -> breadth, intricacy -> domain warp), marks raise hills, `quantitative` scatters
 * stipple, and the revision entropy weathers the surface and shifts the hue.
 */
/** The raw elevation grid the terrain is drawn from. Exposed for analysis and tests. */
export function terrainField(seed: ArtSeed, options: TerrainOptions = {}): Float32Array {
  const layoutSeed = options.layoutFrom === 'identity' ? seed.entropy.identity : seed.entropy.content
  return buildField(seed, layoutSeed, seed.entropy.revision).values
}

export function terrain(seed: ArtSeed, options: TerrainOptions = {}): string {
  const style: ArtStyle = options.style ?? 'mixed'
  const contentSeed = seed.entropy.content
  const dateSeed = seed.entropy.revision
  const layoutSeed = options.layoutFrom === 'identity' ? seed.entropy.identity : contentSeed

  const field = buildField(seed, layoutSeed, dateSeed)
  const rand = mulberry32(contentSeed ^ dateSeed)

  const palette = options.palette ?? WARM
  // The edit date nudges the hue a few degrees either way
  const shift = (dateSeed % 15) - 7
  const levels = 10
  const span = field.max - field.min

  const levelColor = (k: number, index: boolean) => palette.contour(k / levels, index, shift)

  const parts: string[] = []
  const ribbons: Ribbon[] = []

  for (let k = 1; k <= levels; k++) {
    const level = field.min + (span * k) / (levels + 1)
    const index = k % 4 === 0
    const color = levelColor(k, index)

    if (style === 'lines' || style === 'mixed') {
      const segs = contour(field, level)
      if (segs.length) {
        const soft = style === 'mixed' && !index
        parts.push(
          `<path d="${path(segs)}" fill="none" stroke="${color}" stroke-width="${index ? 1.9 : 1.1}" stroke-linecap="round" opacity="${index ? 0.9 : (soft ? 0.5 : 0.4) + 0.03 * k}"/>`,
        )
      }
    }
    if (style === 'halftone' || (style === 'mixed' && index)) {
      ribbons.push({
        level,
        index,
        width: index ? 22 : 10,
        rMax: index ? 5 : 2.8,
        color,
      })
    }
  }
  if (ribbons.length) parts.push(halftone(field, ribbons))

  // Stipple: more numeric pages are more speckled
  const dots = Math.min(900, Math.round(feature(seed, 'quantitative', 0) * 900))
  const dotParts: string[] = []
  for (let n = 0, tries = 0; n < dots && tries < dots * 12; tries++) {
    const x = rand() * ART_WIDTH
    const y = rand() * ART_HEIGHT
    const v = (sampleField(field, x, y) - field.min) / span
    if (rand() > v * v * 1.6) continue
    dotParts.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(0.9 + rand() * 1.5)}"/>`)
    n++
  }
  if (dotParts.length) parts.push(`<g class="stipple" fill="${palette.ink}" opacity="0.5">${dotParts.join('')}</g>`)

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ART_WIDTH}" height="${ART_HEIGHT}" viewBox="0 0 ${ART_WIDTH} ${ART_HEIGHT}">`,
    `<defs><radialGradient id="v" cx="50%" cy="50%" r="75%"><stop offset="55%" stop-color="${palette.background}" stop-opacity="0"/><stop offset="100%" stop-color="${palette.background}" stop-opacity="0.92"/></radialGradient>`,
    `<radialGradient id="g" cx="${f1(20 + (contentSeed % 60))}%" cy="${f1(30 + (dateSeed % 50))}%" r="60%"><stop offset="0%" stop-color="${palette.glow(shift)}" stop-opacity="0.55"/><stop offset="100%" stop-color="${palette.background}" stop-opacity="0"/></radialGradient>`,
    palette.grid
      ? `<pattern id="grid" width="${palette.grid.size}" height="${palette.grid.size}" patternUnits="userSpaceOnUse"><path d="M ${palette.grid.size} 0 L 0 0 0 ${palette.grid.size}" fill="none" stroke="${palette.grid.color}" stroke-width="1"/></pattern>`
      : '',
    `</defs>`,
    `<rect width="${ART_WIDTH}" height="${ART_HEIGHT}" fill="${palette.background}"/>`,
    palette.grid ? `<rect width="${ART_WIDTH}" height="${ART_HEIGHT}" fill="url(#grid)" opacity="${palette.grid.opacity}"/>` : '',
    `<rect width="${ART_WIDTH}" height="${ART_HEIGHT}" fill="url(#g)"/>`,
    ...parts,
    `<rect width="${ART_WIDTH}" height="${ART_HEIGHT}" fill="url(#v)"/>`,
    `</svg>`,
  ].join('')
}
