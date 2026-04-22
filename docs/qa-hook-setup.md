# QA Hook Setup

The project includes a Kiro on-save hook that runs the local spec compliance check whenever TypeScript files are saved.

## Hook Configuration

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

## Why This Uses npm

The project statement mentions:

```text
kiro test --check-spec requirements.md
```

In the tested environment, Kiro CLI 2.0.1 does not expose a `test` subcommand. The repository therefore uses this equivalent local command:

```powershell
npm run check:spec
```

## What The Check Does

`npm run check:spec` executes:

```text
node scripts/checkSpecCompliance.js && npm test
```

The script checks that:

- `requirements.md` still contains RB-01 through RB-09.
- `requirements.md` still contains the required interest rates.
- `src/domain/policies/swiftLendPolicy.ts` still contains the required business constants.
- All Jest tests pass.
- Coverage thresholds configured in `jest.config.cjs` are respected.

## Verified Result

Latest verified result:

```text
Spec compliance check passed.
Test Suites: 4 passed, 4 total
Tests:       16 passed, 16 total
Coverage:    98.09% statements
```
