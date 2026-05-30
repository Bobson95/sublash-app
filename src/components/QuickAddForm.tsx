import React, { useState } from 'react';
import { PlusCircle, Link, HelpCircle, Sparkles, AlertCircle } from 'lucide-react';
import { Subscription, BillingCycle } from '../types';
import { CATEGORIES } from '../demoData';

interface QuickAddFormProps {
  onAdd: (sub: Omit<Subscription, 'id'>) => void;
  isDark?: boolean;
}

const POPULAR_PRESETS = [
  { name: 'Figma Pro', cost: 15.00, cycle: 'monthly' as const, category: 'Design & Creative', url: 'https://figma.com' },
  { name: 'Netflix Premium', cost: 22.99, cycle: 'monthly' as const, category: 'Entertainment & Leisure', url: 'https://netflix.com' },
  { name: 'GitHub Copilot', cost: 10.00, cycle: 'monthly' as const, category: 'Development / DevOps', url: 'https://github.com' },
  { name: 'ChatGPT Plus', cost: 20.00, cycle: 'monthly' as const, category: 'Productivity & Office', url: 'https://openai.com' },
];

export default function QuickAddForm({ onAdd, isDark = false }: QuickAddFormProps) {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [renewalDate, setRenewalDate] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [showNotes, setShowNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Service name is required');
      return;
    }

    const costNum = parseFloat(cost);
    if (isNaN(costNum) || costNum <= 0) {
      setError('Please provide a valid price greater than 0');
      return;
    }

    // Clean up url
    let cleanedUrl = url.trim();
    if (cleanedUrl && !/^https?:\/\//i.test(cleanedUrl)) {
      cleanedUrl = `https://${cleanedUrl}`;
    }

    onAdd({
      name: name.trim(),
      cost: costNum,
      billingCycle,
      category,
      renewalDate: renewalDate || undefined,
      url: cleanedUrl || undefined,
      notes: notes.trim() || undefined,
      status: 'active',
      currencySymbol
    });

    // Reset simple state
    setName('');
    setCost('');
    setRenewalDate('');
    setUrl('');
    setNotes('');
    setError(null);
  };

  const applyPreset = (preset: typeof POPULAR_PRESETS[0]) => {
    setName(preset.name);
    setCost(preset.cost.toString());
    setBillingCycle(preset.cycle);
    setCategory(preset.category);
    setUrl(preset.url);
  };

  const inputClass = `w-full px-3.5 py-2 text-sm rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans ${
    isDark 
      ? 'bg-slate-950 border-slate-800 text-slate-200 focus:bg-slate-900 placeholder:text-slate-600' 
      : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white placeholder:text-slate-400'
  }`;

  const selectClass = `w-full px-2 py-2 text-sm rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium ${
    isDark 
      ? 'bg-slate-950 border-slate-800 text-slate-200 focus:bg-slate-900' 
      : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
  }`;

  const labelClass = `block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`;

  return (
    <div className={`rounded-2xl border p-6 shadow-xs ${
      isDark ? 'bg-slate-900 border-slate-800/80 text-slate-100' : 'bg-white border-slate-100 text-slate-900'
    }`} id="quick-add-section">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-semibold flex items-center gap-2 font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <PlusCircle size={18} className="text-indigo-500" />
          Acre Subscription Account
        </h3>
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest font-mono">Quick Form</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {error && (
          <div className={`${isDark ? 'bg-rose-950/20 border-rose-900/40 text-rose-350' : 'bg-rose-50 border-rose-200 text-rose-700'} p-3 rounded-xl flex items-start gap-2 text-xs border`}>
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Service Name */}
          <div>
            <label htmlFor="service-name-input" className={labelClass}>Service & SaaS Name</label>
            <input
              id="service-name-input"
              type="text"
              placeholder="e.g. Figma, AWS, Netflix"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          {/* Pricing & Cycle combined */}
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3">
              <label htmlFor="currency-select" className={labelClass}>Curr</label>
              <select
                id="currency-select"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className={`${selectClass} text-center font-mono font-bold`}
              >
                <option value="$" className={isDark ? 'bg-slate-900' : ''}>$</option>
                <option value="€" className={isDark ? 'bg-slate-900' : ''}>€</option>
                <option value="£" className={isDark ? 'bg-slate-900' : ''}>£</option>
                <option value="¥" className={isDark ? 'bg-slate-900' : ''}>¥</option>
                <option value="₣" className={isDark ? 'bg-slate-900' : ''}>₣</option>
              </select>
            </div>
            
            <div className="col-span-5">
              <label htmlFor="price-input" className={labelClass}>Price</label>
              <input
                id="price-input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className={`${inputClass} font-mono`}
                required
              />
            </div>

            <div className="col-span-4">
              <label htmlFor="cycle-select" className={labelClass}>Billing Cycle</label>
              <select
                id="cycle-select"
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                className={`${selectClass} text-slate-700 dark:text-slate-300`}
              >
                <option value="weekly" className={isDark ? 'bg-slate-900' : ''}>Weekly</option>
                <option value="monthly" className={isDark ? 'bg-slate-900' : ''}>Monthly</option>
                <option value="quarterly" className={isDark ? 'bg-slate-900' : ''}>Quarterly</option>
                <option value="yearly" className={isDark ? 'bg-slate-900' : ''}>Yearly</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category */}
          <div>
            <label htmlFor="category-select" className={labelClass}>Category</label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${selectClass} font-sans`}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className={isDark ? 'bg-slate-900' : ''}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Next Renewal Date */}
          <div>
            <label htmlFor="renewal-date-input" className={labelClass}>
              Next Renewal <span className="text-[10px] text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              id="renewal-date-input"
              type="date"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
              className={`${inputClass} font-sans`}
            />
          </div>

          {/* Website Link */}
          <div>
            <label htmlFor="website-url-input" className={labelClass}>
              Website URL <span className="text-[10px] text-slate-500 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400">
                <Link size={14} />
              </span>
              <input
                id="website-url-input"
                type="text"
                placeholder="domain.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={`${inputClass} pl-9 font-sans`}
              />
            </div>
          </div>
        </div>

        {/* Collapsible notes field to save visual space */}
        <div>
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="text-xs text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            {showNotes ? '− Hide optional notes' : '+ Add detailed notes & description'}
          </button>
          {showNotes && (
            <div className="mt-2">
              <textarea
                id="notes-textarea"
                rows={2}
                placeholder="Add billing details, account references, or usage reasons..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`${inputClass} text-xs py-2`}
              />
            </div>
          )}
        </div>

        {/* Action controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-2 gap-3">
          {/* Quick Preset suggestion chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 font-sans">
              <Sparkles size={10} className="text-amber-500 animate-pulse" /> Preloads:
            </span>
            {POPULAR_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className={`px-2 py-0.5 text-xs rounded-lg transition-all border cursor-pointer ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700/80' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/50'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <button
            id="btn-add-subscription"
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md shrink-0"
          >
            <PlusCircle size={16} />
            Include Subscription
          </button>
        </div>
      </form>
    </div>
  );
}
