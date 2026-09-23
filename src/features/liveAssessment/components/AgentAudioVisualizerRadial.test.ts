import { describe, expect, it } from "vitest"
import { normalizeVolumeBands } from "../radialVisualizer"

describe("normalizeVolumeBands", () => {
  it("pads and trims LiveKit volume data to the radial bar count", () => {
    expect(normalizeVolumeBands([0.2, 0.4], 4)).toEqual([0.2, 0.4, 0.4, 0.4])
    expect(normalizeVolumeBands([0.1, 0.2, 0.3], 2)).toEqual([0.1, 0.2])
    expect(normalizeVolumeBands([], 2)).toEqual([0, 0])
  })
})
