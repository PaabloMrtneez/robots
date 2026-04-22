export interface RepaymentPlan {
  principalCents: number;
  interestCents: number;
  totalRepaymentCents: number;
  monthlyPaymentCents: number;
  termMonths: number;
  currency: "USD";
}
