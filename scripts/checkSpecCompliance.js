const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const requirements = readFile("requirements.md");
const policy = readFile("src/domain/policies/swiftLendPolicy.ts");

const requiredSpecTokens = [
  "RB-01",
  "RB-02",
  "RB-03",
  "RB-04",
  "RB-05",
  "RB-06",
  "RB-07",
  "RB-08",
  "RB-09",
  "EMPRENDEDOR | 0.05",
  "PERSONAL | 0.12"
];

const requiredPolicyTokens = [
  "minimum: 10_000",
  "generalMaximum: 1_000_000",
  "newUserMaximum: 200_000",
  "externalDebtMaximum: 500_000",
  "minimumCreditScore = 600",
  "minimumApplicantAge = 21",
  "annualInterestRate: 0.05",
  "annualInterestRate: 0.12",
  "allowedTerms: [6, 12, 18]",
  "allowedTerms: [3, 6, 12]",
  "\"tempmail.com\"",
  "\"10minutemail.com\""
];

const failures = [
  ...missingTokens("requirements.md", requirements, requiredSpecTokens),
  ...missingTokens("src/domain/policies/swiftLendPolicy.ts", policy, requiredPolicyTokens)
];

if (failures.length > 0) {
  console.error("Spec compliance check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Spec compliance check passed.");

function readFile(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

function missingTokens(fileName, content, tokens) {
  return tokens
    .filter((token) => !content.includes(token))
    .map((token) => `${fileName} is missing required token: ${token}`);
}
