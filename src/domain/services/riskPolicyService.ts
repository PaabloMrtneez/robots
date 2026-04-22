import { LoanApplication } from "../entities/LoanApplication";
import { RejectionReason } from "../entities/Loan";
import {
  loanAmountLimitsCents,
  minimumApplicantAge,
  minimumCreditScore,
  planPolicy,
  temporaryEmailDomains
} from "../policies/swiftLendPolicy";

export function evaluateRisk(
  application: LoanApplication,
  applicationDate: Date
): RejectionReason[] {
  const reasons: RejectionReason[] = [];

  if (
    application.isNewUser &&
    application.amountCents > loanAmountLimitsCents.newUserMaximum
  ) {
    reasons.push("NEW_USER_AMOUNT_LIMIT");
  }

  if (application.creditScore < minimumCreditScore) {
    reasons.push("LOW_CREDIT_SCORE");
  }

  if (isTemporaryEmailDomain(application.email)) {
    reasons.push("TEMP_EMAIL_DOMAIN");
  }

  if (calculateAge(application.birthDate, applicationDate) < minimumApplicantAge) {
    reasons.push("UNDERAGE");
  }

  if (application.externalDebtCents > loanAmountLimitsCents.externalDebtMaximum) {
    reasons.push("EXTERNAL_DEBT_TOO_HIGH");
  }

  if (!planPolicy[application.planType].allowedTerms.includes(application.termMonths)) {
    reasons.push("INVALID_TERM_FOR_PLAN");
  }

  return reasons;
}

export function isTemporaryEmailDomain(email: string): boolean {
  const domain = getEmailDomain(email);
  return temporaryEmailDomains.includes(
    domain as (typeof temporaryEmailDomains)[number]
  );
}

export function getEmailDomain(email: string): string {
  return email.split("@").at(-1)?.trim().toLowerCase() ?? "";
}

export function calculateAge(birthDate: string, onDate: Date): number {
  const birth = parseDateOnly(birthDate);
  const current = new Date(
    Date.UTC(onDate.getUTCFullYear(), onDate.getUTCMonth(), onDate.getUTCDate())
  );

  let age = current.getUTCFullYear() - birth.getUTCFullYear();
  const hasBirthdayPassed =
    current.getUTCMonth() > birth.getUTCMonth() ||
    (current.getUTCMonth() === birth.getUTCMonth() &&
      current.getUTCDate() >= birth.getUTCDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age;
}

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
