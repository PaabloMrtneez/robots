import { Router } from "express";
import { EvaluateLoanApplicationUseCase } from "../../application/use-cases/EvaluateLoanApplicationUseCase";
import { LoanApplicationController } from "./controllers/loanApplicationController";

export function createRoutes(
  evaluateLoanApplication: EvaluateLoanApplicationUseCase
): Router {
  const router = Router();
  const loanApplicationController = new LoanApplicationController(
    evaluateLoanApplication
  );

  router.post("/loans/applications", loanApplicationController.create);

  return router;
}
