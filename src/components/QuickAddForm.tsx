import React, { useState } from 'react';
import { PlusCircle, Link, HelpCircle, Sparkles, AlertCircle } from 'lucide-react';
import { Subscription, BillingCycle } from '../types';
import { CATEGORIES } from '../demoData';

interface QuickAddFormProps {
  onAdd: (sub: Omit<Subscription, 'id'>) => void;
}

const POPULAR_PRESETS = [
  { name: 'Figma Pro', cost: 15.00, cycle: 'monthly' as const, category: 'Design & Creative', url: 'https://figma.com' },
  { name: 'Netflix Premium', cost: 22.99, cycle: 'monthly' as const, category: 'Entertainment & Leisure', url: 'https://netflix.com' },
  { name: 'GitHub Copilot', cost: 10.00, cycle: 'monthly' as const, category: 'Development / DevOps', url: 'https://github.com' },
  { name: 'ChatGPT Plus', cost: 20.00, cycle: 'monthly' as const, category: 'Productivity & Office', url: 'https://openai.com' },
];

export default function QuickAddForm({ onAdd }: QuickAddFormProps) {
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

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs" id="quick-add-section">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 font-display">
          <PlusCircle size={18} className="text-indigo-600" />
          Acre Subscription Account
        </h3>
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest font-mono">Quick Form</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-start gap-2 text-xs">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Service Name */}
          <div>
            <label htmlFor="service-name-input" className="block text-xs font-medium text-slate-700 mb-1">Service & SaaS Name</label>
            <input
              id="service-name-input"
              type="text"
              placeholder="e.g. Figma, AWS, Netflix"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
              required
            />
          </div>

          {/* Pricing & Cycle combined */}
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3">
              <label htmlFor="currency-select" className="block text-xs font-medium text-slate-700 mb-1">Curr</label>
              <select
                id="currency-select"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-2 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-center font-mono font-bold"
              >
                <option value="$">$ USD</option>
                <option value="€">€ EUR</option>
                <option value="£">£ GBP</option>
                <option value="¥">¥ JPY</option>
                <option value="₣">₣ CHF</option>
              </select>
            </div>
            
            <div className="col-span-5">
              <label htmlFor="price-input" className="block text-xs font-medium text-slate-700 mb-1">Price</label>
              <input
                id="price-input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                required
              />
            </div>

            <div className="col-span-4">
              <label htmlFor="cycle-select" className="block text-xs font-medium text-slate-700 mb-1">Billing Cycle</label>
              <select
                id="cycle-select"
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                className="w-full px-2 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category */}
          <div>
            <label htmlFor="category-select" className="block text-xs font-medium text-slate-700 mb-1">Category</label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans text-slate-850"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Next Renewal Date */}
          <div>
            <label htmlFor="renewal-date-input" className="block text-xs font-medium text-slate-700 mb-1">
              Next Renewal <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="renewal-date-input"
              type="date"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans text-slate-750"
            />
          </div>

          {/* Website Link */}
          <div>
            <label htmlFor="website-url-input" className="block text-xs font-medium text-slate-700 mb-1">
              Website URL <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
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
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
              />
            </div>
          </div>
        </div>

        {/* Collapsible notes field to save visual space */}
        <div>
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition"
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
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          )}
        </div>

        {/* Action controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-2 gap-3">
          {/* Quick Preset suggestion chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={10} className="text-amber-500" /> Preloads:
            </span>
            {POPULAR_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all border border-slate-200/50"
              >
                {p.name}
              </button>
            ))}
          </div>

          <button
            id="btn-add-subscription"
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md"
          >
            <PlusCircle size={16} />
            Include Subscription
          </button>
        </div>
      </form>
    </div>
  );
}
