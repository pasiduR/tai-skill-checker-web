import { z } from "zod"

export const overviewSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(200),
  description: z.string().trim().min(1, "Description is required.").max(10_000),
  preparationInstructions: z.string().trim().max(10_000),
})

export const competencySchema = z.object({ name: z.string().trim().min(1), description: z.string().trim().min(1) })
export const scenarioSchema = z.object({ title: z.string().trim().min(1), prompt: z.string().trim().min(1), followUpGuidance: z.string().trim(), competencyId: z.string().uuid("Choose a competency.") })
export const generationSchema = z.object({ brief: z.string().trim().min(10, "Describe the assessment in at least 10 characters.").max(20_000) })
