import { afterEach, describe, expect, it, vi } from "vitest"
import { retryEvaluation } from "./api/evaluations"
import { evaluationQuery, evaluationStatusLabel } from "./evaluationFormat"

afterEach(() => vi.unstubAllGlobals())

describe("evaluation list behavior", () => {
  it("formats every evaluation status and serializes filters", () => {
    expect(evaluationStatusLabel).toEqual({ PENDING: "Queued", PROCESSING: "Processing", COMPLETED: "Completed", FAILED: "Failed" })
    expect(evaluationQuery({ status: "FAILED", assessmentId: "00000000-0000-4000-8000-000000000001" })).toBe("?status=FAILED&assessmentId=00000000-0000-4000-8000-000000000001")
    expect(evaluationQuery({})).toBe("")
  })

  it("posts the retry action to the existing evaluation", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { id: "eval-1", status: "PENDING" } }), { status: 200, headers: { "Content-Type": "application/json" } }))
    vi.stubGlobal("fetch", fetch)
    await expect(retryEvaluation("eval-1")).resolves.toEqual({ id: "eval-1", status: "PENDING" })
    expect(fetch).toHaveBeenCalledWith("/api/admin/evaluations/eval-1/retry", expect.objectContaining({ method: "POST", credentials: "include" }))
  })
})
