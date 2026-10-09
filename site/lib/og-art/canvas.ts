/** Shared canvas constants and colour helpers for synths. No framework imports. */

export const ART_WIDTH = 1200
export const ART_HEIGHT = 630

/** Warm dark brown ground */
export const ART_BACKGROUND = '#1a110b'

export function hsl(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(c * 255).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/** Warm cream used for dots */
export const ART_INK = hsl(30, 0.6, 0.9)

/** One decimal place keeps SVG path data small. */
export const f1 = (n: number) => (Math.round(n * 10) / 10).toString()
