import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { EvaluateLoanApplicationUseCase } from "./application/use-cases/EvaluateLoanApplicationUseCase";
import { CryptoIdGenerator } from "./infrastructure/ids/CryptoIdGenerator";
import { SystemClock } from "./infrastructure/time/SystemClock";
import { createRoutes } from "./interfaces/http/routes";

interface CreateAppOptions {
  evaluateLoanApplication?: EvaluateLoanApplicationUseCase;
}

export function createApp(options: CreateAppOptions = {}): Express {
  const app = express();
  const evaluateLoanApplication =
    options.evaluateLoanApplication ??
    new EvaluateLoanApplicationUseCase(new CryptoIdGenerator(), new SystemClock());

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({
      status: "ok",
      service: "swiftlend"
    });
  });

  app.use(createRoutes(evaluateLoanApplication));

  app.use(
    (
      error: Error,
      _request: Request,
      response: Response,
      _next: NextFunction
    ) => {
      response.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  );

  return app;
}
