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
  onDeleteMultiple?: (ids: string[]) => void;
  onToggleStatusMultiple?: (ids: string[], targetStatus?: 'active' | 'paused') => void;
  isDark?: boolean;
}

export default function SubscriptionList({ 
  subscriptions, 
  onDelete, 
  onToggleStatus,
  onDeleteMultiple,
  onToggleStatusMultiple,
  isDark = false
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
        allChecked[sub.id] = true;
      });
      setSelectedIds(allChecked);
    } else {
      setSelectedIds({});
    }
  };

  // Audit Calculations & Bulk Action Handlers
  const selectedList = Object.keys(selectedIds).filter(id => selectedIds[id]);
  const selectedCount = selectedList.length;

  const handleBulkDelete = () => {
    if (selectedList.length === 0) return;
    if (onDeleteMultiple) {
      onDeleteMultiple(selectedList);
    } else {
      selectedList.forEach(id => onDelete(id));
    }
    setSelectedIds({});
  };

  const handleBulkToggleStatus = (targetStatus: 'active' | 'paused') => {
    if (selectedList.length === 0) return;
    if (onToggleStatusMultiple) {
      onToggleStatusMultiple(selectedList, targetStatus);
    } else {
      selectedList.forEach(id => {
        const sub = subscriptions.find(s => s.id === id);
        if (sub && sub.status !== targetStatus) {
          onToggleStatus(id);
        }
      });
    }
    setSelectedIds({});
  };

  const simulatedSavingsMonthly = selectedList.reduce((acc, id) => {
    const sub = subscriptions.find(s => s.id === id);
    if (sub && sub.status === 'active') {
      return acc + getMonthlyEquivalent(sub.cost, sub.billingCycle);
    }
    return acc;
  }, 0);

  const simulatedSavingsYearly = simulatedSavingsMonthly * 12;

  return (
    <div className="space-y-6 font-sans">
      {/* Filtering Toolbar */}
      <div className={`rounded-2xl border p-4 shadow-xs transition-all duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-900'
      }`} id="ledger-filters">
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
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-slate-200 focus:bg-slate-900 placeholder:text-slate-600' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white placeholder:text-slate-400'
              }`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category filter */}
            <div className={`flex items-center gap-1.5 border rounded-xl px-2.5 py-1 text-xs ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <Filter size={12} className="text-slate-400" />
              <select
                id="filter-category-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`bg-transparent focus:outline-hidden font-medium py-1 ${
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                <option value="All" className={isDark ? 'bg-slate-950' : ''}>All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className={isDark ? 'bg-slate-950' : ''}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div className={`flex items-center gap-1.5 border rounded-xl px-2.5 py-1 text-xs ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <select
                id="filter-status-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`bg-transparent focus:outline-hidden font-medium py-1 ${
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                <option value="All" className={isDark ? 'bg-slate-950' : ''}>All Statuses</option>
                <option value="active" className={isDark ? 'bg-slate-950' : ''}>Active Only</option>
                <option value="paused" className={isDark ? 'bg-slate-950' : ''}>Paused Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Planner Drawer / Live Banner if items are selected */}
      {simulatedSavingsMonthly > 0 && (
        <div className={`border p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in ${
          isDark 
            ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-100' 
            : 'bg-emerald-50 border-emerald-200'
        }`} id="audio-simulator-panel">
          <div className="space-y-1">
            <div className={`flex items-center gap-2 ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
              <Sparkles size={18} className="text-emerald-500 shrink-0" />
              <h4 className="font-semibold text-sm font-display">Simulated Cancellation Savings Auditor</h4>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              If you cancel the <span className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{selectedList.length}</span> selected subscription{selectedList.length === 1 ? '' : 's'}, you instantly recover cash assets.
            </p>
          </div>
          <div className="flex items-stretch md:items-center gap-5 shrink-0 self-end md:self-auto">
            <div className="text-right">
              <span className={`text-2xl font-black block tracking-tight font-display ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                {formatCurrency(simulatedSavingsMonthly)}
                <span className="text-[10px] text-slate-500 font-medium tracking-normal">/mo</span>
              </span>
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                ({formatCurrency(simulatedSavingsYearly)}/yr saved)
              </span>
            </div>
            <button
              id="clear-simulated-audit"
              onClick={() => setSelectedIds({})}
              className={`px-3 text-xs font-semibold py-1.5 rounded-xl transition flex items-center justify-center cursor-pointer border ${
                isDark 
                  ? 'bg-emerald-900 hover:bg-emerald-850 border-emerald-800 text-emerald-250' 
                  : 'bg-white hover:bg-slate-100 border-emerald-200 text-emerald-800 shadow-xs'
              }`}
            >
              Clear Audit
            </button>
          </div>
        </div>
      )}

      {/* Subscription Table Layout */}
      <div className={`rounded-2xl border overflow-hidden shadow-xs transition-all duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`} id="ledger-table-container">
        {selectedCount > 0 && (
          <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-4 py-3 border-b text-xs transition-all duration-200 ${
            isDark 
              ? 'bg-slate-950 border-slate-800 text-slate-200' 
              : 'bg-indigo-50 border-slate-200 text-slate-800'
          }`} id="bulk-action-bar">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded-full ${
                isDark ? 'bg-indigo-900 text-indigo-300 border border-indigo-800' : 'bg-indigo-200 text-indigo-800'
              }`}>
                {selectedCount}
              </span>
              <span className="font-semibold">subscriptions selected</span>
              
              {/* Visual line divider */}
              <div className={`hidden sm:block h-4 w-px mx-2 ${isDark ? 'bg-slate-800' : 'bg-indigo-200'}`} />
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
              {/* Bulk Pause action */}
              <button
                type="button"
                onClick={() => handleBulkToggleStatus('paused')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer select-none ${
                  isDark 
                    ? 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white' 
                    : 'bg-white text-slate-700 border-slate-205 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-3xs'
                }`}
                title="Pause selected subscriptions"
              >
                <Pause size={12} className="text-slate-500 fill-slate-500" />
                <span>Pause Selected</span>
              </button>

              {/* Bulk Resume/Activate action */}
              <button
                type="button"
                onClick={() => handleBulkToggleStatus('active')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer select-none ${
                  isDark 
                    ? 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white' 
                    : 'bg-white text-slate-700 border-slate-205 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-3xs'
                }`}
                title="Activate selected subscriptions"
              >
                <Play size={12} className="text-slate-500 fill-slate-500" />
                <span>Activate Selected</span>
              </button>

              {/* Bulk Delete action */}
              <button
                type="button"
                onClick={handleBulkDelete}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer select-none ${
                  isDark 
                    ? 'bg-rose-950/40 text-rose-400 border-rose-900/60 hover:bg-rose-900/50 hover:text-rose-300' 
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/80 hover:text-rose-800 shadow-3xs'
                }`}
                title="Delete multiple selected subscriptions"
              >
                <Trash2 size={12} />
                <span>Delete Selected</span>
              </button>

              {/* Visual line divider */}
              <div className={`h-4 w-px mx-1 ${isDark ? 'bg-slate-800' : 'bg-indigo-200'}`} />

              {/* Uncheck / Cancel action */}
              <button
                type="button"
                onClick={() => setSelectedIds({})}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-indigo-100'
                }`}
                title="Clear selection"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
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
                <tr className={`border-b ${
                  isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-100 bg-slate-50/50 text-slate-500'
                }`}>
                  <th className="p-4 w-12 text-center">
                    <input
                      id="checkbox-select-all"
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={filteredSubscriptions.length > 0 && filteredSubscriptions.every(s => selectedIds[s.id])}
                      className="w-4 h-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      title="Select all shown subscriptions on this view"
                    />
                  </th>
                  <th className={`p-4 font-display font-semibold text-xs uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <button 
                      onClick={() => toggleSort('name')}
                      className={`flex items-center gap-1.5 cursor-pointer font-semibold transition ${
                        isDark ? 'hover:text-white text-slate-400' : 'hover:text-slate-900 text-slate-500'
                      }`}
                    >
                      SaaS Service
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </button>
                  </th>
                  <th className={`p-4 font-display font-semibold text-xs uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-505 text-slate-500'
                  }`}>Category</th>
                  <th className={`p-4 font-display font-semibold text-xs uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-505 text-slate-500'
                  }`}>
                    <button 
                      onClick={() => toggleSort('cost')}
                      className={`flex items-center gap-1.5 cursor-pointer font-semibold transition ${
                        isDark ? 'hover:text-white text-slate-400' : 'hover:text-slate-900 text-slate-505'
                      }`}
                    >
                      Price & Outflow
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </button>
                  </th>
                  <th className={`p-4 font-display font-semibold text-xs uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-505 text-slate-500'
                  }`}>
                    <button 
                      onClick={() => toggleSort('renewal')}
                      className={`flex items-center gap-1.5 cursor-pointer font-semibold transition ${
                        isDark ? 'hover:text-white text-slate-400' : 'hover:text-slate-900 text-slate-505'
                      }`}
                    >
                      Renewal Period
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </button>
                  </th>
                  <th className={`p-4 font-display font-semibold text-xs uppercase tracking-wider text-center ${
                    isDark ? 'text-slate-400' : 'text-slate-505 text-slate-500'
                  }`}>Status</th>
                  <th className="p-4 text-right"></th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {filteredSubscriptions.map((sub) => {
                  const monthlyVal = getMonthlyEquivalent(sub.cost, sub.billingCycle);
                  const isSelectedForAudit = selectedIds[sub.id] || false;
                  const daysLeft = getDaysUntilRenewal(sub.renewalDate);
                  const isPaused = sub.status === 'paused';

                  return (
                    <tr 
                      key={sub.id} 
                      className={`group transition-all ${
                        isPaused ? 'opacity-55' : ''
                      } ${
                        isSelectedForAudit 
                          ? isDark ? 'bg-emerald-950/20 hover:bg-emerald-950/30' : 'bg-emerald-50/25 hover:bg-emerald-50/40'
                          : isDark ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50'
                      }`}
                      id={`row-${sub.id}`}
                    >
                      {/* Checkbox selector for simulations & bulk actions */}
                      <td className="p-4 text-center">
                        <input
                          id={`checkbox-audit-${sub.id}`}
                          type="checkbox"
                          checked={isSelectedForAudit}
                          onChange={() => handleSelectSub(sub.id)}
                          className="w-4 h-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          title="Select subscription for bulk action or audit simulation"
                        />
                      </td>

                      {/* Name & Url & Notes */}
                      <td className="p-4 max-w-xs md:max-w-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`font-semibold text-sm font-sans tracking-tight ${
                            isDark ? 'text-slate-200' : 'text-slate-800'
                          }`}>
                            {sub.name}
                          </span>
                          {sub.url && (
                            <a 
                              href={sub.url} 
                              target="_blank" 
                              rel="noreferrer referrer"
                              className={`transition ${isDark ? 'text-slate-500 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'}`}
                              title={`Visit ${sub.name}`}
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                          {daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && (
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border font-mono uppercase tracking-wider animate-pulse ${
                              isDark 
                                ? 'bg-amber-950/40 text-amber-400 border-amber-900/50' 
                                : 'bg-amber-50 text-amber-700 border-amber-200 shadow-3xs'
                            }`} title={`Renews in ${daysLeft} days! Near deadline warning.`}>
                              <AlertCircle size={9} className="stroke-[2.5]" />
                              Expiring Soon ({daysLeft}d)
                            </span>
                          )}
                        </div>
                        {sub.notes && (
                          <p className={`text-xs font-normal line-clamp-1 mt-0.5 group-hover:line-clamp-none transition ${
                            isDark ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            {sub.notes}
                          </p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="p-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          isDark 
                            ? 'bg-slate-950 text-slate-400 border-slate-800-unused border-slate-800' 
                            : 'bg-slate-100 text-slate-600 border-slate-200/55'
                        }`}>
                          {sub.category}
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="p-4 whitespace-nowrap font-mono">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                              {formatCurrency(sub.cost, sub.currencySymbol)}
                            </span>
                            {isHighCost(sub.cost, sub.billingCycle) && (
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-extrabold uppercase tracking-widest border ${
                                isDark 
                                  ? 'bg-amber-950/20 text-amber-555 text-amber-500 border-amber-900/60' 
                                  : 'bg-amber-50 text-amber-700 border-amber-200/50'
                              }`} title="Substantial cost above $100/mo equivalent. Great cancellation target.">
                                High Cost
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-405 text-slate-400 font-medium uppercase tracking-wider">
                            per {sub.billingCycle}
                            {sub.billingCycle !== 'monthly' && ` (~${formatCurrency(monthlyVal, sub.currencySymbol)}/mo)`}
                          </span>
                        </div>
                      </td>

                      {/* Renewal timer */}
                      <td className="p-4 whitespace-nowrap font-mono text-xs">
                        {sub.renewalDate ? (
                          <div className="flex flex-col">
                            <span className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                              <Calendar size={12} className="text-slate-400" />
                              {sub.renewalDate}
                            </span>
                            {daysLeft !== null && (
                              <span 
                                className={`text-[10px] font-bold mt-0.5 ${
                                  daysLeft < 3 
                                    ? 'text-rose-500 font-extrabold' 
                                    : daysLeft < 10 
                                      ? 'text-amber-500 font-semibold' 
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
                              ? isDark 
                                ? 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900' 
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200' 
                              : isDark 
                                ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/40 hover:bg-indigo-900/30' 
                                : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'
                          }`}
                          title={isPaused ? "Reactivate pricing outplays" : "Temporarily pause audit tracking"}
                        >
                          {isPaused ? <Play size={10} className="fill-slate-500" /> : <Pause size={10} className="fill-indigo-400" />}
                          {isPaused ? 'Paused' : 'Active'}
                        </button>
                      </td>

                      {/* Remove delete control */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          id={`btn-delete-${sub.id}`}
                          onClick={() => onDelete(sub.id)}
                          className={`p-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                            isDark 
                              ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-955 hover:bg-rose-950/20' 
                              : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'
                          }`}
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
