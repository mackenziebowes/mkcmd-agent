# og-art (vendored)

Procedural Open Graph images: page text in, a topographic map out. Vendored from
[mackenziebowes/personal-site](https://github.com/mackenziebowes/personal-site) `client/lib/og-art`
at `d5e0d89`, pure parts only (seed, text analyzer, synths).

Local change: `terrain` takes a `palette` option (`TerrainPalette`), with an optional drafting
grid. The default palette reproduces the original warm output exactly. This site uses
`BLUEPRINT` from `scripts/og.ts`.

`scripts/og.ts` is the impure edge here: it reads each page's source, extracts its prose, takes
the last git commit date, and writes `public/og/<slug>.png` with resvg.
