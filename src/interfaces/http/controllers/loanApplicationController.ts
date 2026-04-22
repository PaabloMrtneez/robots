import { Request, Response } from "express";
import { EvaluateLoanApplicationUseCase } from "../../../application/use-cases/EvaluateLoanApplicationUseCase";
import { loanApplicationSchema } from "../schemas/loanApplicationSchema";

export class LoanApplicationController {
  constructor(
    private readonly evaluateLoanApplication: EvaluateLoanApplicationUseCase
  ) {}

  create = (request: Request, response: Response): Response => {
    const parsed = loanApplicationSchema.safeParse(request.body);

    if (!parsed.success) {
      return response.status(400).json({
        message: "Validation failed",
        errors: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    const result = this.evaluateLoanApplication.execute(parsed.data);
    return response.status(201).json(result);
  };
}
