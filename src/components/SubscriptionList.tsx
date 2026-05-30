import React, { useState } from 'react';
import { 
  Search, Filter, ArrowUpDown, Trash2, 
  ExternalLink, Calendar, CheckSquare, Coffee,
  AlertCircle, ShieldAlert, Sparkles, Check, Play, Pause, X
} from 'lucide-react';
import { Subscription, BillingCycle } from '../types';
import { CATEGORIES } from '../demoData';
import { getDaysUntilRenewal, getMonthlyEquivalent, formatCurrency, isHighCost } from '../utils';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export default function SubscriptionList({ 
  subscriptions, 
  onDelete, 
  onToggleStatus 
}: SubscriptionListProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'renewal'>('cost');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Auditing Multi-Select Simulator state
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  // Filter & Sort math
  const filteredSubscriptions = subscriptions
    .filter(sub => {
      const matchesSearch = sub.name.toLowerCase().includes(search.toLowerCase()) || 
        (sub.notes && sub.notes.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = categoryFilter === 'All' || sub.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || sub.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'cost') {
        comparison = getMonthlyEquivalent(a.cost, a.billingCycle) - getMonthlyEquivalent(b.cost, b.billingCycle);
      } else if (sortBy === 'renewal') {
        const d_a = getDaysUntilRenewal(a.renewalDate) ?? 999999;
        const d_b = getDaysUntilRenewal(b.renewalDate) ?? 999999;
        comparison = d_a - d_b;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (type: 'name' | 'cost' | 'renewal') => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  const handleSelectSub = (id: string) => {
    setSelectedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allChecked: Record<string, boolean> = {};
      filteredSubscriptions.forEach(sub => {
        if (sub.status === 'active') {
          allChecked[sub.id] = true;
        }
      });
      setSelectedIds(allChecked);
    } else {
      setSelectedIds({});
    }
  };

  // Audit Calculations
  const selectedList = Object.keys(selectedIds).filter(id => selectedIds[id]);
  const simulatedSavingsMonthly = selectedList.reduce((acc, id) => {
    const sub = subscriptions.find(s => s.id === id);
    if (sub && sub.status === 'active') {
      return acc + getMonthlyEquivalent(sub.cost, sub.billingCycle);
    }
    return acc;
  }, 0);

  const simulatedSavingsYearly = simulatedSavingsMonthly * 12;

  return (
    <div className="space-y-6">
      {/* Filtering Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs" id="ledger-filters">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-slate-400">
              <Search size={16} />
            </span>
            <input
              id="ledger-search-input"
              type="text"
              placeholder="Search by dashboard service or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <Filter size={12} className="text-slate-400" />
              <select
                id="filter-category-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent focus:outline-hidden text-slate-700 font-medium py-1"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <select
                id="filter-status-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent focus:outline-hidden text-slate-700 font-medium py-1"
              >
                <option value="All">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="paused">Paused Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Planner Drawer / Live Banner if items are selected */}
      {simulatedSavingsMonthly > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in" id="audio-simulator-panel">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-800">
              <Sparkles size={18} className="text-emerald-600 shrink-0" />
              <h4 className="font-semibold text-sm font-display">Simulated Cancellation Savings Auditor</h4>
            </div>
            <p className="text-slate-600 text-xs">
              If you cancel the <span className="font-semibold text-emerald-700">{selectedList.length}</span> selected subscription{selectedList.length === 1 ? '' : 's'}, you instantly recover cash assets.
            </p>
          </div>
          <div className="flex items-stretch md:items-center gap-5 shrink-0 self-end md:self-auto">
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-700 block tracking-tight font-display">
                {formatCurrency(simulatedSavingsMonthly)}
                <span className="text-[10px] text-slate-500 font-medium tracking-normal">/mo</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({formatCurrency(simulatedSavingsYearly)}/yr saved)
              </span>
            </div>
            <button
              id="clear-simulated-audit"
              onClick={() => setSelectedIds({})}
              className="px-3 bg-white hover:bg-slate-100 border border-emerald-200 text-emerald-800 text-xs font-semibold py-1.5 rounded-xl transition flex items-center justify-center cursor-pointer"
            >
              Clear Audit
            </button>
          </div>
        </div>
      )}

      {/* Subscription Table Layout */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs" id="ledger-table-container">
        {filteredSubscriptions.length === 0 ? (
          <div className="p-12 text-center text-slate-500" id="ledger-empty-state">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Coffee size={20} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No subscriptions matched</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or record a new automated service above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="ledger-table">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="p-4 w-12 text-center">
                    <input
                      id="checkbox-select-all"
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={filteredSubscriptions.length > 0 && filteredSubscriptions.every(s => s.status !== 'active' || selectedIds[s.id])}
                      className="w-4 h-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      title="Select all active for simulated audit"
                    />
                  </th>
                  <th className="p-4 font-display font-semibold text-xs text-slate-500 uppercase tracking-wider">
                    <button 
                      onClick={() => toggleSort('name')}
                      className="flex items-center gap-1.5 hover:text-slate-900 cursor-pointer font-semibold transition"
                    >
                      SaaS Service
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </button>
                  </th>
                  <th className="p-4 font-display font-semibold text-xs text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="p-4 font-display font-semibold text-xs text-slate-500 uppercase tracking-wider">
                    <button 
                      onClick={() => toggleSort('cost')}
                      className="flex items-center gap-1.5 hover:text-slate-900 cursor-pointer font-semibold transition"
                    >
                      Price & Outflow
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </button>
                  </th>
                  <th className="p-4 font-display font-semibold text-xs text-slate-500 uppercase tracking-wider">
                    <button 
                      onClick={() => toggleSort('renewal')}
                      className="flex items-center gap-1.5 hover:text-slate-900 cursor-pointer font-semibold transition"
                    >
                      Renewal Period
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </button>
                  </th>
                  <th className="p-4 font-display font-semibold text-xs text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="p-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubscriptions.map((sub) => {
                  const monthlyVal = getMonthlyEquivalent(sub.cost, sub.billingCycle);
                  const isSelectedForAudit = selectedIds[sub.id] || false;
                  const daysLeft = getDaysUntilRenewal(sub.renewalDate);
                  const isPaused = sub.status === 'paused';

                  return (
                    <tr 
                      key={sub.id} 
                      className={`group transition-all hover:bg-slate-50 ${isPaused ? 'opacity-55' : ''} ${isSelectedForAudit ? 'bg-emerald-50/25 hover:bg-emerald-50/40' : ''}`}
                      id={`row-${sub.id}`}
                    >
                      {/* Checkbox selector for simulations */}
                      <td className="p-4 text-center">
                        <input
                          id={`checkbox-audit-${sub.id}`}
                          type="checkbox"
                          disabled={isPaused}
                          checked={isSelectedForAudit}
                          onChange={() => handleSelectSub(sub.id)}
                          className="w-4 h-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title={isPaused ? "First reactivate subscription to audit it" : "Select to simulate cancellation"}
                        />
                      </td>

                      {/* Name & Url & Notes */}
                      <td className="p-4 max-w-xs md:max-w-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 text-sm font-sans tracking-tight">
                            {sub.name}
                          </span>
                          {sub.url && (
                            <a 
                              href={sub.url} 
                              target="_blank" 
                              rel="noreferrer referrer"
                              className="text-slate-400 hover:text-indigo-600 transition"
                              title={`Visit ${sub.name}`}
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                        {sub.notes && (
                          <p className="text-slate-400 text-xs font-normal line-clamp-1 mt-0.5 group-hover:line-clamp-none transition">
                            {sub.notes}
                          </p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200/55">
                          {sub.category}
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="p-4 whitespace-nowrap font-mono">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 text-sm">
                              {formatCurrency(sub.cost, sub.currencySymbol)}
                            </span>
                            {isHighCost(sub.cost, sub.billingCycle) && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200/50 uppercase tracking-widest" title="Substantial cost above $100/mo equivalent. Great cancellation target.">
                                High Cost
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                            per {sub.billingCycle}
                            {sub.billingCycle !== 'monthly' && ` (~${formatCurrency(monthlyVal, sub.currencySymbol)}/mo)`}
                          </span>
                        </div>
                      </td>

                      {/* Renewal timer */}
                      <td className="p-4 whitespace-nowrap font-mono text-xs">
                        {sub.renewalDate ? (
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1.5 font-medium text-slate-600">
                              <Calendar size={12} className="text-slate-400" />
                              {sub.renewalDate}
                            </span>
                            {daysLeft !== null && (
                              <span 
                                className={`text-[10px] font-bold mt-0.5 ${
                                  daysLeft < 3 
                                    ? 'text-rose-600 font-extrabold' 
                                    : daysLeft < 10 
                                      ? 'text-amber-600 font-semibold' 
                                      : 'text-slate-400'
                                }`}
                              >
                                {daysLeft < 0 
                                  ? '⚠️ Passed Renewal' 
                                  : daysLeft === 0 
                                    ? '⚡ Renews Today!' 
                                    : daysLeft === 1 
                                      ? '⏳ Renews Tomorrow' 
                                      : `${daysLeft} days until renewal`}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal">No date specified</span>
                        )}
                      </td>

                      {/* Status Toggle & Badge */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          id={`btn-status-${sub.id}`}
                          onClick={() => onToggleStatus(sub.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                            isPaused 
                              ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200' 
                              : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'
                          }`}
                          title={isPaused ? "Reactivate pricing outplays" : "Temporarily pause audit tracking"}
                        >
                          {isPaused ? <Play size={10} className="fill-slate-500" /> : <Pause size={10} className="fill-indigo-700" />}
                          {isPaused ? 'Paused' : 'Active'}
                        </button>
                      </td>

                      {/* Remove delete control */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          id={`btn-delete-${sub.id}`}
                          onClick={() => onDelete(sub.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-150 cursor-pointer"
                          title="Purge SaaS from list"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
