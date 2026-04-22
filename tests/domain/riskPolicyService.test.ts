import {
  getEmailDomain,
  isTemporaryEmailDomain
} from "../../src/domain/services/riskPolicyService";

describe("riskPolicyService", () => {
  it("normalizes email domains before checking temporary providers", () => {
    expect(getEmailDomain("Applicant@TempMail.COM")).toBe("tempmail.com");
    expect(isTemporaryEmailDomain("Applicant@TempMail.COM")).toBe(true);
  });

  it("does not reject verified domains as temporary email domains", () => {
    expect(isTemporaryEmailDomain("founder@company.com")).toBe(false);
  });
});
