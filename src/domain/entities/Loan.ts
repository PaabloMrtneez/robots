export const loanStatuses = ["PENDING", "APPROVED", "REJECTED"] as const;
export type LoanStatus = (typeof loanStatuses)[number];

export const planTypes = ["EMPRENDEDOR", "PERSONAL"] as const;
export type PlanType = (typeof planTypes)[number];

export const rejectionReasons = [
  "NEW_USER_AMOUNT_LIMIT",
  "LOW_CREDIT_SCORE",
  "TEMP_EMAIL_DOMAIN",
  "UNDERAGE",
  "EXTERNAL_DEBT_TOO_HIGH",
  "INVALID_TERM_FOR_PLAN"
] as const;

export type RejectionReason = (typeof rejectionReasons)[number];

export interface Loan {
  id: string;
  userId: string;
  amountCents: number;
  interestRate: number;
  status: LoanStatus;
  planType: PlanType;
  termMonths: number;
  rejectionReasons: RejectionReason[];
}
