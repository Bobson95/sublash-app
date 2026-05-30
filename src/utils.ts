import { Subscription, BillingCycle } from './types';

/**
 * Calculates the monthly cost equivalent for a subscription based on its billing cycle.
 */
export function getMonthlyEquivalent(cost: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'weekly':
      return (cost * 52) / 12;
    case 'quarterly':
      return cost / 3;
    case 'yearly':
      return cost / 12;
    case 'monthly':
    default:
      return cost;
  }
}

/**
 * Calculates the yearly cost equivalent for a subscription based on its billing cycle.
 */
export function getYearlyEquivalent(cost: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'weekly':
      return cost * 52;
    case 'quarterly':
      return cost * 4;
    case 'monthly':
      return cost * 12;
    case 'yearly':
    default:
      return cost;
  }
}

/**
 * Calculates the number of days remaining until the next renewal date.
 */
export function getDaysUntilRenewal(renewalDateStr?: string): number | null {
  if (!renewalDateStr) return null;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const renewalDate = new Date(renewalDateStr);
    renewalDate.setHours(0, 0, 0, 0);
    
    // If date is invalid
    if (isNaN(renewalDate.getTime())) return null;
    
    // If the renewal date is in the past, calculate for the next recurrence
    // For simplicity of prototype UI, we show days relative to current time 
    const diffTime = renewalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (e) {
    return null;
  }
}

/**
 * Format a number to currency string.
 */
export function formatCurrency(amount: number, symbol: string = '$'): string {
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Checks if a subscription has a high monthly equivalent cost (e.g. above $100/mo).
 */
export function isHighCost(cost: number, cycle: BillingCycle, threshold: number = 100): boolean {
  return getMonthlyEquivalent(cost, cycle) >= threshold;
}
