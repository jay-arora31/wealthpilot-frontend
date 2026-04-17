export interface HouseholdSummary {
  id: string;
  name: string;
  income: number | null;
  net_worth: number | null;
  member_count: number;
}

export interface Member {
  id: string;
  household_id: string;
  name: string;
  date_of_birth: string | null;
  email: string | null;
  phone: string | null;
  member_relationship: string | null;
  address: string | null;
  created_at: string;
}

export interface AccountOwnership {
  id: string;
  member_id: string;
  ownership_percentage: number | null;
  member_name: string | null;
}

export interface FinancialAccount {
  id: string;
  household_id: string;
  account_number: string | null;
  custodian: string | null;
  account_type: string | null;
  account_value: number | null;
  ownerships: AccountOwnership[];
}

export interface BankDetail {
  id: string;
  household_id: string;
  bank_name: string | null;
  account_number: string | null;
  routing_number: string | null;
}

export interface DataConflict {
  id: string;
  household_id: string;
  field_name: string;
  existing_value: string | null;
  incoming_value: string | null;
  source_quote: string | null;
  source: "excel" | "audio";
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  resolved_at: string | null;
}

export interface HouseholdDetail {
  id: string;
  name: string;
  income: number | null;
  net_worth: number | null;
  liquid_net_worth: number | null;
  expense_range: string | null;
  tax_bracket: string | null;
  risk_tolerance: string | null;
  time_horizon: string | null;
  goals: string | null;
  preferences: string | null;
  members: Member[];
  financial_accounts: FinancialAccount[];
  bank_details: BankDetail[];
  pending_conflict_count: number;
  created_at: string;
  updated_at: string;
}

export interface HouseholdCreate {
  name: string;
  income?: number | null;
  net_worth?: number | null;
}

export interface HouseholdUpdate {
  name?: string;
  income?: number | null;
  net_worth?: number | null;
  liquid_net_worth?: number | null;
  expense_range?: string | null;
  tax_bracket?: string | null;
  risk_tolerance?: string | null;
  time_horizon?: string | null;
  goals?: string | null;
  preferences?: string | null;
}

export interface MemberCreate {
  name: string;
  date_of_birth?: string | null;
  email?: string | null;
  phone?: string | null;
  member_relationship?: string | null;
  address?: string | null;
}

export interface MemberUpdate {
  name?: string;
  date_of_birth?: string | null;
  email?: string | null;
  phone?: string | null;
  member_relationship?: string | null;
  address?: string | null;
}

export interface AccountUpdate {
  account_number?: string | null;
  custodian?: string | null;
  account_type?: string | null;
  account_value?: number | null;
}

export interface BankDetailUpdate {
  bank_name?: string | null;
  account_number?: string | null;
  routing_number?: string | null;
}

export interface AccountCreate {
  account_number?: string | null;
  custodian?: string | null;
  account_type?: string | null;
  account_value?: number | null;
  ownerships?: Array<{ member_id: string; ownership_percentage: number | null }>;
}

export interface IncomeExpenseItem {
  household_id: string;
  household_name: string;
  income: number | null;
  expense_range: string | null;
}

export interface NetWorthBreakdown {
  household_id: string;
  household_name: string;
  net_worth: number | null;
  liquid_net_worth: number | null;
}

export interface AccountDistribution {
  account_type: string;
  total_value: number;
  count: number;
}

export interface MembersPerHousehold {
  household_id: string;
  household_name: string;
  member_count: number;
}

export interface TaxBracketDistribution {
  tax_bracket: string;
  household_count: number;
}

export interface RiskToleranceDistribution {
  risk_tolerance: string;
  household_count: number;
}

export interface TopHouseholdByWealth {
  household_id: string;
  household_name: string;
  net_worth: number;
  liquid_net_worth: number;
  income: number;
}

export interface LiquidityRatio {
  household_id: string;
  household_name: string;
  liquid_ratio: number;
}

export interface InsightsResponse {
  income_vs_expenses: IncomeExpenseItem[];
  net_worth: NetWorthBreakdown[];
  account_distribution: AccountDistribution[];
  members_per_household: MembersPerHousehold[];
  tax_bracket_distribution: TaxBracketDistribution[];
  risk_tolerance_distribution: RiskToleranceDistribution[];
  top_households_by_wealth: TopHouseholdByWealth[];
  liquidity_ratios: LiquidityRatio[];
}

export interface JobStatus {
  job_id: string;
  status: "queued" | "running" | "done" | "failed";
  job_type: "excel" | "audio";
  steps: string[];
  result: Record<string, unknown> | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}
