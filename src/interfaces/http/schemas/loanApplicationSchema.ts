import { z } from "zod";
import { planTypes } from "../../../domain/entities/Loan";
import { loanAmountLimitsCents } from "../../../domain/policies/swiftLendPolicy";

export const loanApplicationSchema = z
  .object({
    userId: z.string().uuid(),
    email: z.string().email().transform((value) => value.toLowerCase()),
    birthDate: z.string().refine(isValidIsoDateOnly, {
      message: "birthDate must be a valid YYYY-MM-DD date"
    }),
    creditScore: z.number().int().min(0).max(1000),
    externalDebtCents: z.number().int().min(0),
    isNewUser: z.boolean(),
    amountCents: z
      .number()
      .int()
      .min(loanAmountLimitsCents.minimum)
      .max(loanAmountLimitsCents.generalMaximum),
    planType: z.enum(planTypes),
    termMonths: z.number().int().positive()
  })
  .strict();

export type LoanApplicationRequest = z.infer<typeof loanApplicationSchema>;

function isValidIsoDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}
