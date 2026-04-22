# SwiftLend

SwiftLend is a TypeScript microservice for automated microloan approval using a spec-driven workflow.

## Main Files

- `requirements.md`: source of truth for business and technical requirements.
- `src/`: Express service using clean architecture.
- `tests/`: Jest unit and HTTP tests.
- `.kiro/hooks.json`: Kiro on-save spec compliance hook.
- `audit-report.md`: initial QA alignment report.
- `docs/sources/`: simulated source documents for NotebookLM.
- `docs/prompts/`: prompts for NotebookLM and Kiro audit.

## Local Commands

```bash
npm install
npm run check:spec
npm test
npm run build
npm run dev
```

The service listens on `http://localhost:3000`.

## Docker

```bash
docker compose up --build
```

Health check:

```bash
curl http://localhost:3000/health
```

## API Example

```bash
curl -X POST http://localhost:3000/loans/applications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "6a79cb91-2e46-4de2-a47c-73240f037211",
    "email": "founder@company.com",
    "birthDate": "1990-05-10",
    "creditScore": 720,
    "externalDebtCents": 100000,
    "isNewUser": true,
    "amountCents": 150000,
    "planType": "EMPRENDEDOR",
    "termMonths": 12
  }'
```

## External Actions

1. Create a NotebookLM notebook named `SwiftLend Spec-to-Code`.
2. Upload or paste the documents in `docs/sources/`.
3. Run the prompt in `docs/prompts/notebooklm-master-prompt.md`.
4. Compare NotebookLM output against `requirements.md` and replace it only if it preserves RB-01 through RB-09.
5. Open this repository in Kiro.
6. Ask Kiro to inspect `requirements.md` and create its implementation task plan.
7. Keep `.kiro/hooks.json` enabled so TypeScript saves run `npm run check:spec`.
8. Run the prompt in `docs/prompts/kiro-audit-prompt.md` and update `audit-report.md` with the generated result.

## Evaluation Trace

The implementation maps business rules to tests:

- RB-01 to RB-05 and RB-09: `tests/application/EvaluateLoanApplicationUseCase.test.ts`.
- RB-03 domain normalization: `tests/domain/riskPolicyService.test.ts`.
- RB-06 to RB-08 HTTP validation: `tests/interfaces/loanApplicationsApi.test.ts`.
