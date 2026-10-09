import { SEED_VERSION, hash32, type ArtMark, type ArtSeed } from '../seed'

/**
 * The text analyzer: prose in, ArtSeed out.
 *
 * How text maps onto the shared feature vocabulary (fixed reference ranges, so a page's
 * features do not depend on what else is on the site):
 *   density      log10(words) / 4
 *   variety      distinct words / all words
 *   scale        average sentence length / 30.8 words
 *   intricacy    punctuation per word x 4.4 (saturates at about 0.23 per word)
 *   roughness    share of 8+ letter words / 0.2
 *   quantitative share of words containing a digit / 0.28125
 * Raw measures are kept under `extras` as "text.*".
 */

export interface TextSignals {
  words: number
  avgWordLength: number
  avgSentenceLength: number
  sentenceLengthSpread: number
  uniqueRatio: number
  longWordRatio: number
  digitRatio: number
  punctuationDensity: number
  keyWords: Array<{ word: string; weight: number }>
}

const STOP = new Set(
  'about above after again also because before being between could does doing during each from have having here into just like more most much only other over same should some such than that their them then there these they this those through under until very were what when where which while with would your'.split(
    ' ',
  ),
)

export function readSignals(text: string): TextSignals {
  const tokens = text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []
  const words = tokens.length || 1
  const sentences = text.split(/[.!?]+\s/).map((s) => s.trim().split(/\s+/).length).filter((n) => n > 1)
  const avgSentence = sentences.length ? sentences.reduce((a, b) => a + b, 0) / sentences.length : 12
  const spread = sentences.length
    ? Math.sqrt(sentences.reduce((a, b) => a + (b - avgSentence) ** 2, 0) / sentences.length)
    : 4

  const freq = new Map<string, number>()
  let letters = 0
  let long = 0
  let digits = 0
  for (const t of tokens) {
    letters += t.length
    if (t.length >= 8) long++
    if (/\d/.test(t)) digits++
    if (t.length >= 6 && !STOP.has(t) && !/\d/.test(t)) freq.set(t, (freq.get(t) ?? 0) + 1)
  }
  const keyWords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .slice(0, 9)
    .map(([word, n]) => ({ word, weight: Math.min(1, Math.log2(n + 1) / 5) }))

  const punctuation = (text.match(/[,;:()—–-]/g) ?? []).length

  return {
    words,
    avgWordLength: letters / words,
    avgSentenceLength: avgSentence,
    sentenceLengthSpread: spread,
    uniqueRatio: new Set(tokens).size / words,
    longWordRatio: long / words,
    digitRatio: digits / words,
    punctuationDensity: punctuation / words,
    keyWords,
  }
}

const SERIES_POINTS = 64

/** Resample values to a fixed length by averaging equal chunks, then scale to 0..1. */
function resample(values: number[], points: number, scale: (n: number) => number): number[] {
  if (values.length === 0) return []
  const out: number[] = []
  for (let i = 0; i < points; i++) {
    const a = Math.floor((i * values.length) / points)
    const b = Math.max(a + 1, Math.floor(((i + 1) * values.length) / points))
    let sum = 0
    for (let j = a; j < b; j++) sum += values[j]
    out.push(Math.max(0, Math.min(1, scale(sum / (b - a)))))
  }
  return out
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

function toDate(value: string | Date): Date {
  const d = typeof value === 'string' ? new Date(value) : value
  return Number.isNaN(d.getTime()) ? new Date('2026-01-01T00:00:00Z') : d
}

function dayNumber(d: Date): number {
  return Math.floor(d.getTime() / 86_400_000)
}

export interface TextInput {
  text: string
  /** Last edit */
  modified: string | Date
  published?: string | Date
  /** A key that stays the same across edits, e.g. the page's route. Defaults to the text itself. */
  identity?: string
  /** Human title for alt text */
  label?: string
}

export function analyzeText(input: TextInput): ArtSeed {
  const { text } = input
  const s = readSignals(text)
  const modified = toDate(input.modified)

  const marks: ArtMark[] = s.keyWords.map((k) => ({ id: hash32(k.word), label: k.word, weight: k.weight }))

  // Profiles along the document: sentence length, and how numeric each stretch is
  const sentenceLengths = text.split(/[.!?]+\s/).map((x) => x.trim().split(/\s+/).length).filter((n) => n > 1)
  const tokens = text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []
  const numeric = tokens.map((t) => (/\d/.test(t) ? 1 : 0))

  return {
    v: SEED_VERSION,
    kind: 'text',
    analyzer: 'text@1',
    label: input.label,
    entropy: {
      identity: hash32(`id:${input.identity ?? text}`),
      content: hash32(text),
      revision: hash32(`day:${dayNumber(modified)}`),
    },
    time: {
      modified: modified.toISOString(),
      published: input.published ? toDate(input.published).toISOString() : undefined,
    },
    features: {
      density: clamp01(Math.log10(Math.max(1, s.words)) / 4),
      variety: clamp01(s.uniqueRatio),
      scale: clamp01(s.avgSentenceLength / 30.8),
      intricacy: clamp01(s.punctuationDensity * 4.4),
      roughness: clamp01(s.longWordRatio / 0.2),
      quantitative: clamp01(s.digitRatio / 0.28125),
    },
    marks,
    series: {
      sentenceLength: resample(sentenceLengths, SERIES_POINTS, (n) => n / 40),
      numeric: resample(numeric, SERIES_POINTS, (n) => n * 4),
    },
    extras: {
      'text.words': s.words,
      'text.avgWordLength': s.avgWordLength,
      'text.avgSentenceLength': s.avgSentenceLength,
      'text.sentenceLengthSpread': s.sentenceLengthSpread,
      'text.uniqueRatio': s.uniqueRatio,
      'text.longWordRatio': s.longWordRatio,
      'text.digitRatio': s.digitRatio,
      'text.punctuationDensity': s.punctuationDensity,
    },
  }
}
