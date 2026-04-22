import { RepaymentPlan } from "../entities/RepaymentPlan";

export function createRepaymentPlan(
  principalCents: number,
  annualInterestRate: number,
  termMonths: number
): RepaymentPlan {
  const interestCents = Math.round(
    principalCents * annualInterestRate * (termMonths / 12)
  );
  const totalRepaymentCents = principalCents + interestCents;

  return {
    principalCents,
    interestCents,
    totalRepaymentCents,
    monthlyPaymentCents: Math.round(totalRepaymentCents / termMonths),
    termMonths,
    currency: "USD"
  };
}
