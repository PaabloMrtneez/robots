import { Loan } from "../../domain/entities/Loan";
import { LoanApplication } from "../../domain/entities/LoanApplication";
import { RepaymentPlan } from "../../domain/entities/RepaymentPlan";
import { planPolicy } from "../../domain/policies/swiftLendPolicy";
import { createRepaymentPlan } from "../../domain/services/repaymentPlanService";
import { evaluateRisk } from "../../domain/services/riskPolicyService";
import { Clock } from "../ports/Clock";
import { IdGenerator } from "../ports/IdGenerator";

export interface LoanApplicationResult {
  loan: Loan;
  decision: {
    status: Loan["status"];
    reasons: Loan["rejectionReasons"];
  };
  repaymentPlan: RepaymentPlan | null;
}

export class EvaluateLoanApplicationUseCase {
  constructor(
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock
  ) {}

  execute(application: LoanApplication): LoanApplicationResult {
    const policy = planPolicy[application.planType];
    const rejectionReasons = evaluateRisk(application, this.clock.now());
    const status = rejectionReasons.length > 0 ? "REJECTED" : "APPROVED";

    const loan: Loan = {
      id: this.idGenerator.generate(),
      userId: application.userId,
      amountCents: application.amountCents,
      interestRate: policy.annualInterestRate,
      status,
      planType: application.planType,
      termMonths: application.termMonths,
      rejectionReasons
    };

    return {
      loan,
      decision: {
        status,
        reasons: rejectionReasons
      },
      repaymentPlan:
        status === "APPROVED"
          ? createRepaymentPlan(
              application.amountCents,
              policy.annualInterestRate,
              application.termMonths
            )
          : null
    };
  }
}
