# SwiftLend System Specification

## 1. Context

SwiftLend is a fintech microservice that processes microloan applications, validates applicant eligibility, applies credit risk policies, and returns approval decisions with payment plans when applicable.

**Source**: risk-policy.md, technical-style-guide.md

## 2. Technology Stack

- Runtime: Node.js with TypeScript
- HTTP framework: Express
- Validation: Zod
- Testing: Jest
- Architecture: Clean Architecture (domain, application, infrastructure, interfaces)
- Naming convention: camelCase for variables, functions, and JSON properties

**Source**: technical-style-guide.md

## 3. Data Model

### Loan Application

- `userId`: UUID
- `email`: valid email address
- `birthDate`: ISO date string (YYYY-MM-DD)
- `creditScore`: integer (0-1000)
- `externalDebtCents`: integer amount in USD cents
- `isNewUser`: boolean
- `amountCents`: integer amount in USD cents
- `planType`: one of `EMPRENDEDOR`, `PERSONAL`
- `termMonths`: integer

### Loan

- `id`: UUID
- `userId`: UUID
- `amountCents`: integer
- `interestRate`: annual rate as decimal
- `status`: one of `PENDING`, `APPROVED`, `REJECTED`
- `planType`: one of `EMPRENDEDOR`, `PERSONAL`
- `termMonths`: integer
- `rejectionReasons`: array of reason codes

### Repayment Plan

- `principalCents`: original loan amount
- `interestCents`: calculated interest
- `totalRepaymentCents`: principal + interest
- `monthlyPaymentCents`: monthly payment amount
- `termMonths`: loan term
- `currency`: `USD`

**Source**: technical-style-guide.md, rates-and-terms.md

## 4. Plan Types, Rates, and Terms

The system must use simple annual interest calculation:

`totalInterest = amountCents * annualInterestRate * (termMonths / 12)`

Results must be rounded to cents.

| planType | annualInterestRate | allowedTerms |
| --- | ---: | --- |
| EMPRENDEDOR | 0.05 | 6, 12, 18 |
| PERSONAL | 0.12 | 3, 6, 12 |

**Source**: rates-and-terms.md

## 5. API Contract

### GET /health

Returns service health status.

Response:
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
  "userId": "uuid",
  "email": "user@domain.com",
  "birthDate": "YYYY-MM-DD",
  "creditScore": 720,
  "externalDebtCents": 100000,
  "isNewUser": true,
  "amountCents": 150000,
  "planType": "EMPRENDEDOR",
  "termMonths": 12
}
```

Success response (201):
```json
{
  "loan": {
    "id": "uuid",
    "userId": "uuid",
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

Rejected response (201):
```json
{
  "loan": {
    "id": "uuid",
    "userId": "uuid",
    "amountCents": 250000,
    "interestRate": 0.12,
    "status": "REJECTED",
    "planType": "PERSONAL",
    "termMonths": 12,
    "rejectionReasons": ["NEW_USER_AMOUNT_LIMIT"]
  },
  "decision": {
    "status": "REJECTED",
    "reasons": ["NEW_USER_AMOUNT_LIMIT"]
  },
  "repaymentPlan": null
}
```

Validation error response (400).

**Source**: technical-style-guide.md

## 6. Business Rules

### RB-01: New User Amount Limit

WHEN the applicant is a new user AND the requested amount exceeds $2,000, THE SYSTEM SHALL reject the application with reason `NEW_USER_AMOUNT_LIMIT`.

**Source**: risk-policy.md (Section 2, RB-01)

### RB-02: Minimum Credit Score

WHEN the applicant credit score is lower than 600, THE SYSTEM SHALL reject the application with reason `LOW_CREDIT_SCORE`.

**Source**: risk-policy.md (Section 2, RB-02)

### RB-03: Temporary Email Domain

WHEN the applicant email domain belongs to a temporary email provider list, THE SYSTEM SHALL reject the application with reason `TEMP_EMAIL_DOMAIN`.

Temporary domains include at least:
- `tempmail.com`
- `10minutemail.com`

**Note**: Additional temporary domains (`mailinator.com`, `guerrillamail.com`) require confirmation.

**Source**: risk-policy.md (Section 1, Validacion de identidad)

### RB-04: Legal Age

WHEN the applicant is younger than 21 full years on the application date, THE SYSTEM SHALL reject the application with reason `UNDERAGE`.

**Source**: risk-policy.md (Section 1, Edad minima)

### RB-05: External Debt Limit

WHEN the applicant external debt exceeds $5,000, THE SYSTEM SHALL reject the application with reason `EXTERNAL_DEBT_TOO_HIGH`.

**Source**: risk-policy.md (Section 2, RB-03)

### RB-06: Minimum Loan Amount

WHEN the requested amount is lower than $100, THE SYSTEM SHALL reject the HTTP request with validation status 400.

**Note**: Requires confirmation - not explicitly stated in sources.

### RB-07: Maximum Loan Amount

WHEN the requested amount exceeds $10,000, THE SYSTEM SHALL reject the HTTP request with validation status 400.

**Note**: Requires confirmation - not explicitly stated in sources.

### RB-08: Valid Plan Type

WHEN `planType` is not `EMPRENDEDOR` or `PERSONAL`, THE SYSTEM SHALL reject the HTTP request with validation status 400.

**Source**: rates-and-terms.md

### RB-09: Allowed Term Validation

WHEN the selected term is not in the allowed terms for the selected plan type, THE SYSTEM SHALL reject the application with reason `INVALID_TERM_FOR_PLAN`.

**Source**: rates-and-terms.md

## 7. Decision Behavior

- The system must collect all applicable rejection reasons
- If one or more rejection reasons exist, status must be `REJECTED`
- If no rejection reasons exist, status must be `APPROVED`
- Repayment plan must only be generated for approved loans
- Rejected loans must return `repaymentPlan: null`

**Source**: technical-style-guide.md

## 8. Acceptance Criteria

- Unit tests must cover RB-01 through RB-09
- HTTP tests must cover approved requests, rejected requests, and validation failures
- Jest coverage must be at least 80% globally
- Business logic must be testable without HTTP server
- Docker Compose must expose service on port 3000

**Source**: technical-style-guide.md

## 9. Traceability Matrix

| Rule | Source Document | Section |
| --- | --- | --- |
| RB-01 | risk-policy.md | Section 2, RB-01 |
| RB-02 | risk-policy.md | Section 2, RB-02 |
| RB-03 | risk-policy.md | Section 1, Validacion de identidad |
| RB-04 | risk-policy.md | Section 1, Edad minima |
| RB-05 | risk-policy.md | Section 2, RB-03 |
| RB-06 | (requires confirmation) | - |
| RB-07 | (requires confirmation) | - |
| RB-08 | rates-and-terms.md | Table header |
| RB-09 | rates-and-terms.md | plazos_meses column |
| Interest calculation | rates-and-terms.md | Formula note |
| Stack | technical-style-guide.md | Full document |
