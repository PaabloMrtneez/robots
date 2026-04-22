import { EvaluateLoanApplicationUseCase } from "../../src/application/use-cases/EvaluateLoanApplicationUseCase";
import { createValidLoanApplication } from "../helpers/loanApplicationFactory";
import { FixedClock, FixedIdGenerator } from "../helpers/fakes";

function createUseCase(): EvaluateLoanApplicationUseCase {
  return new EvaluateLoanApplicationUseCase(
    new FixedIdGenerator(),
    new FixedClock()
  );
}

describe("EvaluateLoanApplicationUseCase", () => {
  it("approves an eligible EMPRENDEDOR application and calculates simple interest", () => {
    const result = createUseCase().execute(createValidLoanApplication());

    expect(result.loan.status).toBe("APPROVED");
    expect(result.loan.interestRate).toBe(0.05);
    expect(result.decision.reasons).toEqual([]);
    expect(result.repaymentPlan).toEqual({
      principalCents: 150_000,
      interestCents: 7_500,
      totalRepaymentCents: 157_500,
      monthlyPaymentCents: 13_125,
      termMonths: 12,
      currency: "USD"
    });
  });

  it("uses the PERSONAL annual interest rate", () => {
    const result = createUseCase().execute(
      createValidLoanApplication({
        planType: "PERSONAL",
        termMonths: 12,
        amountCents: 100_000,
        isNewUser: false
      })
    );

    expect(result.loan.status).toBe("APPROVED");
    expect(result.loan.interestRate).toBe(0.12);
    expect(result.repaymentPlan?.interestCents).toBe(12_000);
  });

  it("collects every applicable rejection reason from RB-01 through RB-05 and RB-09", () => {
    const result = createUseCase().execute(
      createValidLoanApplication({
        amountCents: 250_000,
        creditScore: 599,
        email: "applicant@tempmail.com",
        birthDate: "2010-04-23",
        externalDebtCents: 500_001,
        planType: "PERSONAL",
        termMonths: 18
      })
    );

    expect(result.loan.status).toBe("REJECTED");
    expect(result.decision.reasons).toEqual([
      "NEW_USER_AMOUNT_LIMIT",
      "LOW_CREDIT_SCORE",
      "TEMP_EMAIL_DOMAIN",
      "UNDERAGE",
      "EXTERNAL_DEBT_TOO_HIGH",
      "INVALID_TERM_FOR_PLAN"
    ]);
    expect(result.repaymentPlan).toBeNull();
  });

  it("approves an applicant who is exactly 21 full years old", () => {
    const result = createUseCase().execute(
      createValidLoanApplication({
        birthDate: "2005-04-22"
      })
    );

    expect(result.loan.status).toBe("APPROVED");
    expect(result.decision.reasons).not.toContain("UNDERAGE");
  });

  it("rejects an applicant whose 21st birthday has not occurred yet", () => {
    const result = createUseCase().execute(
      createValidLoanApplication({
        birthDate: "2005-04-23"
      })
    );

    expect(result.loan.status).toBe("REJECTED");
    expect(result.decision.reasons).toContain("UNDERAGE");
  });
});
