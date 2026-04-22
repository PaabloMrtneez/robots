import { PlanType } from "./Loan";
import { UserProfile } from "./UserProfile";

export interface LoanApplication extends UserProfile {
  amountCents: number;
  planType: PlanType;
  termMonths: number;
}
