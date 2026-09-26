import { z } from "zod"

export const overviewSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(200, "Assessment name must be 200 characters or fewer."),
  description: z.string().trim().min(1, "Description is required.").max(10_000, "Description must be 10,000 characters or fewer."),
  preparationInstructions: z.string().trim().max(10_000, "Preparation instructions must be 10,000 characters or fewer."),
})

export const competencySchema = z.object({
  name: z.string().trim().min(1, "Competency name is required.").max(200, "Competency name must be 200 characters or fewer."),
  description: z.string().trim().min(1, "Competency description is required.").max(5_000, "Competency description must be 5,000 characters or fewer."),
})

export const scenarioSchema = z.object({
  title: z.string().trim().min(1, "Scenario title is required.").max(300, "Scenario title must be 300 characters or fewer."),
  prompt: z.string().trim().min(1, "Scenario prompt is required.").max(20_000, "Scenario prompt must be 20,000 characters or fewer."),
  followUpGuidance: z.string().trim().max(10_000, "Follow-up guidance must be 10,000 characters or fewer."),
  competencyId: z.string().uuid("Choose a competency."),
})

export const generationSchema = z.object({
  brief: z.string().trim().min(10, "Describe the assessment in at least 10 characters.").max(20_000, "Assessment brief must be 20,000 characters or fewer."),
})

export const rubricSchema = z.object({
  competencyId: z.string().uuid("Choose a competency."),
  title: z.string().trim().min(1, "Rubric title is required.").max(300, "Rubric title must be 300 characters or fewer."),
  low: z.string().trim().min(1, "Describe a score of 1.").max(2_000, "Score descriptions must be 2,000 characters or fewer."),
  medium: z.string().trim().min(1, "Describe a score of 3.").max(2_000, "Score descriptions must be 2,000 characters or fewer."),
  high: z.string().trim().min(1, "Describe a score of 5.").max(2_000, "Score descriptions must be 2,000 characters or fewer."),
  expected: z.string().transform((value) => value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)).pipe(
    z.array(z.string().max(2_000, "Each expected behaviour must be 2,000 characters or fewer.")).min(1, "Enter at least one expected behaviour.").max(30, "Enter no more than 30 expected behaviours."),
  ),
})
