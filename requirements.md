# SwiftLend Master Spec

## 1. Context

SwiftLend is a fintech microservice that receives microloan applications, validates applicant identity and eligibility, applies credit risk rules, and returns an approval decision plus a payment plan when applicable.

This document is the technical source of truth for the implementation. The code must not invent rules outside this document.

## 2. Stack

- Runtime: Node.js with TypeScript.
- HTTP framework: Express.
- Validation: Zod.
- Tests: Jest and Supertest.
- Infrastructure: Docker and Docker Compose.
- Architecture: Clean Architecture with domain, application, infrastructure, and HTTP interface layers.
- Naming: camelCase for variables, functions, fields, and JSON properties.

## 3. Data Model

### Loan

- `id`: UUID.
- `userId`: UUID.
- `amountCents`: integer amount in USD cents.
- `interestRate`: annual interest rate as a decimal.
- `status`: one of `PENDING`, `APPROVED`, `REJECTED`.
- `planType`: one of `EMPRENDEDOR`, `PERSONAL`.
- `termMonths`: integer.
- `rejectionReasons`: list of machine-readable reason codes.

### User Profile

- `userId`: UUID.
- `email`: valid email.
- `birthDate`: ISO date string in `YYYY-MM-DD` format.
- `creditScore`: integer from 0 to 1000.
- `externalDebtCents`: integer amount in USD cents.
- `isNewUser`: boolean.

### Repayment Plan

- `principalCents`: original amount.
- `interestCents`: interest produced by the loan.
- `totalRepaymentCents`: principal plus interest.
- `monthlyPaymentCents`: rounded monthly payment.
- `termMonths`: selected term.
- `currency`: `USD`.

## 4. Plan Types, Rates, and Terms

The service must use simple annual interest:

`totalInterest = amountCents * annualInterestRate * (termMonths / 12)`

The result must be rounded to cents.

| planType | annualInterestRate | allowedTerms |
| --- | ---: | --- |
| EMPRENDEDOR | 0.05 | 6, 12, 18 |
| PERSONAL | 0.12 | 3, 6, 12 |

## 5. API Contract

### GET /health

Returns service health.

Expected success response:

```json
{
  "status": "ok",
  "service": "swiftlend"
}
```

### POST /loans/applications

Receives a loan application and returns a decision.

Request body:

```json
{
  "userId": "6a79cb91-2e46-4de2-a47c-73240f037211",
  "email": "founder@company.com",
  "birthDate": "1990-05-10",
  "creditScore": 720,
  "externalDebtCents": 100000,
  "isNewUser": true,
  "amountCents": 150000,
  "planType": "EMPRENDEDOR",
  "termMonths": 12
}
```

Success response status: `201`.

Approved response:

```json
{
  "loan": {
    "id": "generated-uuid",
    "userId": "6a79cb91-2e46-4de2-a47c-73240f037211",
    "amountCents": 150000,
    "interestRate": 0.05,
    "status": "APPROVED",
    "planType": "EMPRENDEDOR",
    "termMonths": 12,
    "rejectionReasons": []
  },
  "decision": {
    "status": "APPROVED",
    "reasons": []
  },
  "repaymentPlan": {
    "principalCents": 150000,
    "interestCents": 7500,
    "totalRepaymentCents": 157500,
    "monthlyPaymentCents": 13125,
    "termMonths": 12,
    "currency": "USD"
  }
}
```

Rejected response:

```json
{
  "loan": {
    "id": "generated-uuid",
    "userId": "6a79cb91-2e46-4de2-a47c-73240f037211",
    "amountCents": 250000,
    "interestRate": 0.12,
    "status": "REJECTED",
    "planType": "PERSONAL",
    "termMonths": 12,
    "rejectionReasons": [
      "NEW_USER_AMOUNT_LIMIT"
    ]
  },
  "decision": {
    "status": "REJECTED",
    "reasons": [
      "NEW_USER_AMOUNT_LIMIT"
    ]
  },
  "repaymentPlan": null
}
```

Validation failure response status: `400`.

## 6. Business Rules

### RB-01 New User Limit

WHEN the applicant is a new user and the requested amount is greater than `$2,000`, THE SYSTEM SHALL reject the application with reason `NEW_USER_AMOUNT_LIMIT`.

### RB-02 Minimum Credit Score

WHEN the applicant credit score is lower than `600`, THE SYSTEM SHALL reject the application with reason `LOW_CREDIT_SCORE`.

### RB-03 Email Domain

WHEN the applicant email domain belongs to a temporary email provider list, THE SYSTEM SHALL reject the application with reason `TEMP_EMAIL_DOMAIN`.

Temporary domains must include at least:

- `tempmail.com`
- `10minutemail.com`
- `mailinator.com`
- `guerrillamail.com`

### RB-04 Legal Age

WHEN the applicant is younger than `21` full years on the application date, THE SYSTEM SHALL reject the application with reason `UNDERAGE`.

### RB-05 External Debt

WHEN the applicant external debt is greater than `$5,000`, THE SYSTEM SHALL reject the application with reason `EXTERNAL_DEBT_TOO_HIGH`.

### RB-06 Minimum Amount

WHEN the requested amount is lower than `$100`, THE SYSTEM SHALL reject the HTTP request with validation status `400`.

### RB-07 General Maximum Amount

WHEN the requested amount is greater than `$10,000`, THE SYSTEM SHALL reject the HTTP request with validation status `400`.

### RB-08 Plan Type

WHEN `planType` is not `EMPRENDEDOR` or `PERSONAL`, THE SYSTEM SHALL reject the HTTP request with validation status `400`.

### RB-09 Allowed Term

WHEN the selected term is not allowed for the selected plan type, THE SYSTEM SHALL reject the application with reason `INVALID_TERM_FOR_PLAN`.

## 7. Decision Behavior

- The system must collect all applicable business rejection reasons.
- If one or more rejection reasons exist, status must be `REJECTED`.
- If no rejection reasons exist, status must be `APPROVED`.
- A repayment plan must only be generated for approved loans.
- A rejected loan must return `repaymentPlan: null`.

## 8. Acceptance Criteria

- Unit tests must cover RB-01 through RB-09.
- HTTP tests must cover a valid approved request, a rejected request, and validation failure.
- Jest coverage must be at least 80 percent globally.
- Docker Compose must expose the service on port `3000`.
- Kiro must run a spec check on save for TypeScript files using `kiro test --check-spec requirements.md`.
