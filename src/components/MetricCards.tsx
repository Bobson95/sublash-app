import { useState, useMemo } from 'react';
import { TrendingUp, Award, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Subscription } from '../types';
import { getMonthlyEquivalent, getYearlyEquivalent, formatCurrency } from '../utils';
import { ALTERNATIVE_INVESTMENTS } from '../demoData';

interface MetricCardsProps {
  subscriptions: Subscription[];
}

export default function MetricCards({ subscriptions }: MetricCardsProps) {
  const [projectionYears, setProjectionYears] = useState<number>(5);
  const [targetBudget, setTargetBudget] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('subslash_target_budget') || '';
      } catch {
        return '';
      }
    }
    return '';
  });

  const activeSubs = subscriptions.filter(s => s.status === 'active');
  
  // Calculate aggregate metrics
  const totalMonthly = activeSubs.reduce((acc, sub) => {
    return acc + getMonthlyEquivalent(sub.cost, sub.billingCycle);
  }, 0);

  const budgetNum = parseFloat(targetBudget) || 0;
  const percentage = budgetNum > 0 ? Math.min(100, (totalMonthly / budgetNum) * 100) : 0;

  const totalYearly = activeSubs.reduce((acc, sub) => {
    return acc + getYearlyEquivalent(sub.cost, sub.billingCycle);
  }, 0);

  const projectedAmount = totalYearly * projectionYears;

  // Calculate category aggregates for the breakdown chart
  const categoryChartData = useMemo(() => {
    const aggregates: Record<string, number> = {};
    activeSubs.forEach(sub => {
      const monthlyVal = getMonthlyEquivalent(sub.cost, sub.billingCycle);
      aggregates[sub.category] = (aggregates[sub.category] || 0) + monthlyVal;
    });

    return Object.entries(aggregates)
      .map(([name, value]) => {
        // Shorten name if too long for display
        let shortName = name;
        if (name.includes('/')) {
          shortName = name.split('/')[0].trim();
        } else if (name.includes('&')) {
          shortName = name.split('&')[0].trim();
        }
        return {
          name: shortName,
          fullName: name,
          value: parseFloat(value.toFixed(2)),
        };
      })
      .sort((a, b) => b.value - a.value); // sort descending
  }, [activeSubs]);

  // Find suitable alternative investments
  const getSuggestions = (amount: number) => {
    // Sort investments ascending
    const sorted = [...ALTERNATIVE_INVESTMENTS].sort((a, b) => a.cost - b.cost);
    const affordable = sorted.filter(inv => inv.cost <= amount);
    
    if (affordable.length === 0) {
      return {
        label: "fractional holdings in high-yielding S&P 500 capital stock ETFs 📈",
        remaining: amount
      };
    }
    
    // Pick the most expensive one you can afford
    const topPick = affordable[affordable.length - 1];
    const remaining = amount - topPick.cost;
    return {
      label: topPick.label,
      remaining
    };
  };

  const suggestion = getSuggestions(projectedAmount);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Monthly Outflow Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-200" id="card-monthly">
        <div className="absolute right-0 top-0 w-24 h-24 bg-rose-50 rounded-bl-full opacity-60 pointer-events-none" />
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Clock size={20} className="stroke-[2.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase font-display">Monthly Burn Rate</span>
        </div>
        
        <div className="flex items-baseline space-x-1">
          <span className="text-4xl font-extrabold tracking-tight text-slate-900 font-display">
            {formatCurrency(totalMonthly)}
          </span>
          <span className="text-slate-500 text-sm font-medium">/ mo</span>
        </div>
        
        <p className="mt-2 text-xs text-slate-500">
          Spread across <span className="font-semibold text-rose-600">{activeSubs.length}</span> active subscription{activeSubs.length === 1 ? '' : 's'}.
        </p>

        <div className="mt-4 pt-4 border-t border-slate-100/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-display">Target Budget Limit</span>
            {targetBudget && budgetNum > 0 && (
              <span className={`text-[11px] font-bold ${totalMonthly > budgetNum ? 'text-rose-600 animate-pulse' : 'text-emerald-600'}`}>
                {totalMonthly > budgetNum 
                  ? `Over limit by ${formatCurrency(totalMonthly - budgetNum)}` 
                  : `${percentage.toFixed(0)}% Utilized`}
              </span>
            )}
          </div>

          {/* Dynamic Budget Progress Bar */}
          {targetBudget && budgetNum > 0 ? (
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3.5 relative" title={`${percentage.toFixed(0)}% of your target budget used`}>
              <div 
                className={`h-full transition-all duration-500 ease-out rounded-full ${
                  totalMonthly > budgetNum ? 'bg-rose-500' : percentage >= 85 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic mb-3.5 leading-tight">
              No custom budget set. Enter a threshold below to keep your outlays in check.
            </div>
          )}

          {/* Mini Budget Input Field */}
          <div className="relative rounded-lg shadow-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
              <span className="text-[11px] font-mono text-slate-400 font-bold">$</span>
            </div>
            <input
              id="target-budget-input"
              type="number"
              min="0"
              step="10"
              placeholder="e.g. 500"
              value={targetBudget}
              onChange={(e) => {
                const val = e.target.value;
                setTargetBudget(val);
                try {
                  localStorage.setItem('subslash_target_budget', val);
                } catch {
                  // Fallback safe
                }
              }}
              className="block w-full rounded-lg border border-slate-100 bg-slate-50/50 py-1.5 pl-5 pr-12 text-xs text-slate-800 placeholder:text-slate-400 focus:border-rose-500/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-rose-500/20 transition-all font-mono"
            />
            {targetBudget && (
              <button
                type="button"
                onClick={() => {
                  setTargetBudget('');
                  try {
                    localStorage.removeItem('subslash_target_budget');
                  } catch {
                    // Fallback safe
                  }
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-rose-600 text-[10px] font-bold uppercase cursor-pointer transition-colors"
                id="clear-budget-btn"
                title="Clear budget limit"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Yearly Outflow Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-200" id="card-yearly">
        <div className="absolute right-0 top-0 w-24 h-24 bg-violet-50 rounded-bl-full opacity-60 pointer-events-none" />
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
            <DollarSign size={20} className="stroke-[2.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase font-display">Yearly Outplay</span>
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-4xl font-extrabold tracking-tight text-slate-900 font-display">
            {formatCurrency(totalYearly)}
          </span>
          <span className="text-slate-500 text-sm font-medium">/ yr</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Your automated annual subscription budget commitment.
        </p>
      </div>

      {/* Shock Sticker Card - Projector */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden lg:col-span-1 border border-slate-850" id="card-sticker-shock">
        <div className="absolute right-3 top-3 opacity-10">
          <TrendingUp size={120} />
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <TrendingUp size={18} />
            </div>
            <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase font-display">STICKER SHOCK OUTLOOK</span>
          </div>
          
          <div className="flex items-center bg-slate-800 rounded-lg px-2.5 py-1 border border-slate-700">
            <span className="font-mono text-[10px] font-bold text-slate-300">{projectionYears}Y Horizon</span>
          </div>
        </div>

        <div className="mb-4">
          <span className="text-5xl font-extrabold tracking-tight text-white font-display block select-all decoration-rose-500 underline decoration-3 underline-offset-4">
            {formatCurrency(projectedAmount)}
          </span>
          
          <div className="mt-4 flex flex-wrap gap-1.5" id="projection-duration-selectors">
            {[1, 2, 3, 4, 5].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setProjectionYears(yr)}
                className={`flex-1 text-center py-1 rounded-lg text-xs font-semibold font-mono transition-all border cursor-pointer ${
                  projectionYears === yr
                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700/80 hover:border-slate-600'
                }`}
                id={`btn-projection-${yr}y`}
              >
                {yr}Yr
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Vary range (1Y - 5Y)</span>
            <span className="text-[11px] text-rose-400 font-medium">Accumulating Outlay</span>
          </div>
          <input
            id="projection-slider"
            type="range"
            min="1"
            max="5"
            step="1"
            value={projectionYears}
            onChange={(e) => setProjectionYears(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 mt-1 focus:outline-hidden"
          />
        </div>

        {/* Category Breakdown Mini-Chart */}
        <div className="mb-4 bg-slate-850/50 border border-slate-800/80 rounded-xl p-3" id="sticker-breakdown-chart">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 font-display">Monthly Outplay by Category</p>
          {categoryChartData.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-4">No active subscriptions to analyze.</p>
          ) : (
            <div className="h-[100px] w-full" id="recharts-category-bar-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryChartData}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: -25, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-950/95 border border-slate-800 p-2 rounded-lg text-xs shadow-xl min-w-[120px]">
                            <p className="font-bold text-slate-200 text-[10px]">{payload[0].payload.fullName}</p>
                            <p className="font-mono text-emerald-400 font-bold mt-0.5">{formatCurrency(payload[0].value as number)}/mo</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={8}>
                    {categoryChartData.map((entry, index) => {
                      const colors = ['#f43f5e', '#818cf8', '#34d399', '#fbbf24', '#a78bfa', '#22d3ee', '#f472b6'];
                      return (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Dynamic Alternative Trigger */}
        <div className="bg-slate-850/80 rounded-xl p-3 border border-slate-800 flex items-start space-x-2.5">
          <div className="mt-0.5 text-rose-400">
            <Award size={16} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 leading-none mb-1">Psychological Outlay Opportunity Cost</p>
            <p className="text-xs font-normal text-slate-200">
              For this outlay, you could purchase <span className="font-semibold text-rose-300">{suggestion.label}</span>
              {suggestion.remaining > 10 && (
                <span>, plus <span className="font-semibold text-slate-300">{formatCurrency(suggestion.remaining)}</span> remaining cash!</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
