# QA Hook Protection Demo

This document shows how the QA hook protects the project from changes that contradict `requirements.md`.

## Hook File

File: `.kiro/hooks.json`

```json
{
  "hooks": [
    {
      "name": "Spec compliance on TypeScript save",
      "description": "Runs the local spec compliance check whenever TypeScript source or test files are saved.",
      "event": "onSave",
      "include": [
        "src/**/*.ts",
        "tests/**/*.ts"
      ],
      "actions": [
        {
          "type": "command",
          "command": "npm run check:spec"
        }
      ]
    }
  ]
}
```

## Protected Scenario: Changing Interest To 0 Percent

Correct policy:

```typescript
EMPRENDEDOR: {
  annualInterestRate: 0.05,
  allowedTerms: [6, 12, 18]
},
PERSONAL: {
  annualInterestRate: 0.12,
  allowedTerms: [3, 6, 12]
}
```

Invalid change:

```typescript
EMPRENDEDOR: {
  annualInterestRate: 0.00,
  allowedTerms: [6, 12, 18]
},
PERSONAL: {
  annualInterestRate: 0.00,
  allowedTerms: [3, 6, 12]
}
```

The hook runs:

```powershell
npm run check:spec
```

The check fails because `scripts/checkSpecCompliance.js` requires:

- `annualInterestRate: 0.05`
- `annualInterestRate: 0.12`
- `allowedTerms: [6, 12, 18]`
- `allowedTerms: [3, 6, 12]`

## Other Protected Values

The hook also protects:

- Minimum amount: `minimum: 10_000`
- General maximum amount: `generalMaximum: 1_000_000`
- New user maximum amount: `newUserMaximum: 200_000`
- External debt maximum: `externalDebtMaximum: 500_000`
- Minimum credit score: `minimumCreditScore = 600`
- Minimum applicant age: `minimumApplicantAge = 21`
- Temporary email domains: `tempmail.com` and `10minutemail.com`

## Manual Check

Run:

```powershell
npm run check:spec
```

Expected successful result:

```text
Spec compliance check passed.
Test Suites: 4 passed, 4 total
Tests:       16 passed, 16 total
```
