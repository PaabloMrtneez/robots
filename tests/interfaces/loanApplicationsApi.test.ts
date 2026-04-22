import request from "supertest";
import { EvaluateLoanApplicationUseCase } from "../../src/application/use-cases/EvaluateLoanApplicationUseCase";
import { createApp } from "../../src/app";
import { createValidLoanApplication } from "../helpers/loanApplicationFactory";
import { FixedClock, FixedIdGenerator } from "../helpers/fakes";

function createTestApp() {
  return createApp({
    evaluateLoanApplication: new EvaluateLoanApplicationUseCase(
      new FixedIdGenerator(),
      new FixedClock()
    )
  });
}

describe("SwiftLend HTTP API", () => {
  it("returns service health", async () => {
    const response = await request(createApp()).get("/health").expect(200);

    expect(response.body).toEqual({
      status: "ok",
      service: "swiftlend"
    });
  });

  it("creates an approved loan application decision", async () => {
    const response = await request(createTestApp())
      .post("/loans/applications")
      .send(createValidLoanApplication())
      .expect(201);

    expect(response.body.loan).toMatchObject({
      id: "00000000-0000-4000-8000-000000000001",
      status: "APPROVED",
      interestRate: 0.05,
      rejectionReasons: []
    });
    expect(response.body.repaymentPlan).toMatchObject({
      principalCents: 150_000,
      interestCents: 7_500,
      totalRepaymentCents: 157_500,
      monthlyPaymentCents: 13_125
    });
  });

  it("creates a rejected decision with all business reasons", async () => {
    const response = await request(createTestApp())
      .post("/loans/applications")
      .send(
        createValidLoanApplication({
          amountCents: 250_000,
          creditScore: 599,
          email: "person@10minutemail.com",
          birthDate: "2010-04-22",
          externalDebtCents: 500_001
        })
      )
      .expect(201);

    expect(response.body.decision.status).toBe("REJECTED");
    expect(response.body.decision.reasons).toEqual([
      "NEW_USER_AMOUNT_LIMIT",
      "LOW_CREDIT_SCORE",
      "TEMP_EMAIL_DOMAIN",
      "UNDERAGE",
      "EXTERNAL_DEBT_TOO_HIGH"
    ]);
    expect(response.body.repaymentPlan).toBeNull();
  });

  it("returns 400 when amount is below RB-06 minimum", async () => {
    const response = await request(createTestApp())
      .post("/loans/applications")
      .send(
        createValidLoanApplication({
          amountCents: 9_999
        })
      )
      .expect(400);

    expect(response.body.errors).toContainEqual(
      expect.objectContaining({
        path: "amountCents"
      })
    );
  });

  it("returns 400 when amount is above RB-07 general maximum", async () => {
    const response = await request(createTestApp())
      .post("/loans/applications")
      .send(
        createValidLoanApplication({
          amountCents: 1_000_001
        })
      )
      .expect(400);

    expect(response.body.errors).toContainEqual(
      expect.objectContaining({
        path: "amountCents"
      })
    );
  });

  it("returns 400 when planType violates RB-08", async () => {
    const invalidBody = {
      ...createValidLoanApplication(),
      planType: "BUSINESS"
    };

    const response = await request(createTestApp())
      .post("/loans/applications")
      .send(invalidBody)
      .expect(400);

    expect(response.body.errors).toContainEqual(
      expect.objectContaining({
        path: "planType"
      })
    );
  });

  it("returns 400 when birthDate is not a valid date-only value", async () => {
    const response = await request(createTestApp())
      .post("/loans/applications")
      .send(
        createValidLoanApplication({
          birthDate: "2005-02-30"
        })
      )
      .expect(400);

    expect(response.body.errors).toContainEqual(
      expect.objectContaining({
        path: "birthDate"
      })
    );
  });
});
