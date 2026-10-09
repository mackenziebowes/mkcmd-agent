import { feature, rng, series, type ArtSeed } from '../seed'
import { ART_BACKGROUND, ART_HEIGHT, ART_INK, ART_WIDTH, f1, hsl } from '../canvas'

/**
 * Ridgeline synth: stacked line profiles in the "Unknown Pleasures" form. It reads parts of the
 * seed the terrain synth ignores: the `sentenceLength` series becomes the shape of the ridges,
 * `numeric` becomes bright dots where the source gets measured, `density` sets the row count.
 * Each row draws from its own named random stream, so rows never disturb each other.
 */
export function ridgeline(seed: ArtSeed): string {
  const rows = 14 + Math.round(feature(seed, 'density') * 20)
  const pts = 96
  const profile = series(seed, 'sentenceLength')
  const numeric = series(seed, 'numeric')
  const tremor = 0.2 + 0.8 * feature(seed, 'roughness')
  const hue = 21 + (seed.entropy.revision % 15) - 7

  const left = 90
  const right = ART_WIDTH - 90
  const top = 90
  const bottom = ART_HEIGHT - 60
  const pitch = (bottom - top) / (rows - 1)
  const amp = pitch * (3 + 3 * feature(seed, 'scale'))

  const sample = (list: number[], t: number) => {
    const f = t * (list.length - 1)
    const i = Math.floor(f)
    const j = Math.min(list.length - 1, i + 1)
    return list[i] + (list[j] - list[i]) * (f - i)
  }

  const bumps = seed.marks.map((m) => ({ x: 0.1 + ((m.id % 1000) / 1000) * 0.8, w: m.weight }))
  const parts: string[] = []
  const dots: string[] = []

  for (let r = 0; r < rows; r++) {
    const noise = rng(seed, `ridge-${r}`)
    const wobble = Array.from({ length: pts }, () => noise())
    const baseY = top + r * pitch
    const t = r / (rows - 1)
    const coords: string[] = []

    for (let i = 0; i < pts; i++) {
      const u = i / (pts - 1)
      const window = Math.pow(Math.sin(Math.PI * u), 1.6)
      const shape = profile ? sample(profile, u) : 0.5
      let h = shape * 0.8 + (wobble[i] - 0.5) * tremor
      for (const b of bumps) h += b.w * 0.9 * Math.exp(-((u - b.x) ** 2) / (2 * 0.03 ** 2))
      const y = baseY - Math.max(0, h) * window * amp
      const x = left + u * (right - left)
      coords.push(`${f1(x)} ${f1(y)}`)
      if (numeric && sample(numeric, u) > 0.35 && wobble[i] > 0.6) {
        dots.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="1.6"/>`)
      }
    }

    const index = r % 5 === 4
    const stroke = hsl(hue - 5 + 6 * t, index ? 0.9 : 0.55 + 0.3 * t, index ? 0.52 : 0.3 + 0.2 * t)
    // Fill with the ground colour so lower rows hide the ones behind them, then stroke only the ridge
    const line = coords.join('L')
    parts.push(
      `<path d="M${line}L${f1(right)} ${ART_HEIGHT}L${f1(left)} ${ART_HEIGHT}Z" fill="${ART_BACKGROUND}"/>`,
      `<path d="M${line}" fill="none" stroke="${stroke}" stroke-width="${index ? 1.8 : 1.2}" stroke-linejoin="round"/>`,
    )
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ART_WIDTH}" height="${ART_HEIGHT}" viewBox="0 0 ${ART_WIDTH} ${ART_HEIGHT}">`,
    `<rect width="${ART_WIDTH}" height="${ART_HEIGHT}" fill="${ART_BACKGROUND}"/>`,
    ...parts,
    dots.length ? `<g fill="${ART_INK}" opacity="0.7">${dots.join('')}</g>` : '',
    `</svg>`,
  ].join('')
}
