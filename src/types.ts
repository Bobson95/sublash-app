export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'quarterly';

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  billingCycle: BillingCycle;
  category: string;
  renewalDate?: string;
  url?: string;
  status: 'active' | 'paused';
  notes?: string;
  currencySymbol: string;
}

export interface SpendingStats {
  monthlyTotal: number;
  yearlyTotal: number;
  fiveYearProjection: number;
  activeCount: number;
  pausedCount: number;
}
