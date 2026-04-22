import { PlanType } from "../entities/Loan";

export const loanAmountLimitsCents = {
  minimum: 10_000,
  generalMaximum: 1_000_000,
  newUserMaximum: 200_000,
  externalDebtMaximum: 500_000
} as const;

export const minimumCreditScore = 600;
export const minimumApplicantAge = 21;

export const temporaryEmailDomains = [
  "tempmail.com",
  "10minutemail.com",
  "mailinator.com",
  "guerrillamail.com"
] as const;

export const planPolicy: Record<
  PlanType,
  {
    annualInterestRate: number;
    allowedTerms: readonly number[];
  }
> = {
  EMPRENDEDOR: {
    annualInterestRate: 0.05,
    allowedTerms: [6, 12, 18]
  },
  PERSONAL: {
    annualInterestRate: 0.12,
    allowedTerms: [3, 6, 12]
  }
};
