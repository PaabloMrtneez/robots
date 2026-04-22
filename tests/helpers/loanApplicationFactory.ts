import { LoanApplication } from "../../src/domain/entities/LoanApplication";

export function createValidLoanApplication(
  overrides: Partial<LoanApplication> = {}
): LoanApplication {
  return {
    userId: "6a79cb91-2e46-4de2-a47c-73240f037211",
    email: "founder@company.com",
    birthDate: "1990-05-10",
    creditScore: 720,
    externalDebtCents: 100_000,
    isNewUser: true,
    amountCents: 150_000,
    planType: "EMPRENDEDOR",
    termMonths: 12,
    ...overrides
  };
}
