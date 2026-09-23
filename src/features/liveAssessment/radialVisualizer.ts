export function normalizeVolumeBands(bands: number[], count: number): number[] {
  if (bands.length === count) return bands
  if (bands.length > count) return bands.slice(0, count)
  const lastValue = bands.at(-1) ?? 0
  return [...bands, ...new Array(count - bands.length).fill(lastValue)]
}
