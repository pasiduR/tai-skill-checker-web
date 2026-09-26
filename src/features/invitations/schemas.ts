import { z } from "zod"

export const emailsSchema = z.string().transform((value) => [...new Set(value.split(/[\n,;]/).map((email) => email.trim().toLowerCase()).filter(Boolean))]).pipe(
  z.array(z.email("One or more email addresses are invalid.")).min(1, "Enter at least one email address.").max(100, "You can invite up to 100 employees at a time."),
)
