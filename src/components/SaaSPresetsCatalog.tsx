import React, { useState, useMemo } from 'react';
import { Sparkles, Check, CheckCircle2, Search, PlusCircle, Calendar, CreditCard, RotateCw, Filter, ShoppingBag } from 'lucide-react';
import { Subscription, BillingCycle } from '../types';
import { CATEGORIES } from '../demoData';

interface SaaSPresetsCatalogProps {
  onAdd: (sub: Omit<Subscription, 'id'>) => void;
  existingSubs: Subscription[];
  isDark?: boolean;
}

export interface PresetTool {
  id: string;
  name: string;
  defaultCost: number;
  defaultBillingCycle: BillingCycle;
  category: string;
  url: string;
  notes: string;
  currencySymbol: string;
}

const COMMON_PRESETS: PresetTool[] = [
  {
    id: 'p-figma',
    name: 'Figma Professional',
    defaultCost: 15.00,
    defaultBillingCycle: 'monthly',
    category: 'Design & Creative',
    url: 'https://figma.com',
    notes: 'Team interface design & prototyping.',
    currencySymbol: '$'
  },
  {
    id: 'p-copilot',
    name: 'GitHub Copilot',
    defaultCost: 10.00,
    defaultBillingCycle: 'monthly',
    category: 'Development / DevOps',
    url: 'https://github.com',
    notes: 'AI software developer companion.',
    currencySymbol: '$'
  },
  {
    id: 'p-chatgpt',
    name: 'ChatGPT Plus',
    defaultCost: 20.00,
    defaultBillingCycle: 'monthly',
    category: 'Productivity & Office',
    url: 'https://openai.com',
    notes: 'Premium research & AI drafting.',
    currencySymbol: '$'
  },
  {
    id: 'p-netflix',
    name: 'Netflix Premium',
    defaultCost: 22.99,
    defaultBillingCycle: 'monthly',
    category: 'Entertainment & Leisure',
    url: 'https://netflix.com',
    notes: 'High-definition video streaming.',
    currencySymbol: '$'
  },
  {
    id: 'p-g1',
    name: 'Google One 2TB',
    defaultCost: 99.99,
    defaultBillingCycle: 'yearly',
    category: 'Utilities & General',
    url: 'https://one.google.com',
    notes: 'Secure persistent cloud storage.',
    currencySymbol: '$'
  },
  {
    id: 'p-adobe',
    name: 'Adobe Creative Cloud',
    defaultCost: 54.99,
    defaultBillingCycle: 'monthly',
    category: 'Design & Creative',
    url: 'https://adobe.com',
    notes: 'Full video & graphics workspace tools.',
    currencySymbol: '$'
  },
  {
    id: 'p-notion',
    name: 'Notion Plus',
    defaultCost: 10.00,
    defaultBillingCycle: 'monthly',
    category: 'Productivity & Office',
    url: 'https://notion.so',
    notes: 'Collaborative note-taking & wikis.',
    currencySymbol: '$'
  },
  {
    id: 'p-slack',
    name: 'Slack Pro',
    defaultCost: 8.75,
    defaultBillingCycle: 'monthly',
    category: 'Productivity & Office',
    url: 'https://slack.com',
    notes: 'Real-time team messaging service.',
    currencySymbol: '$'
  },
  {
    id: 'p-zoom',
    name: 'Zoom Meeting One',
    defaultCost: 15.99,
    defaultBillingCycle: 'monthly',
    category: 'Productivity & Office',
    url: 'https://zoom.us',
    notes: 'Professional video conference calls.',
    currencySymbol: '$'
  },
  {
    id: 'p-spotify',
    name: 'Spotify Premium',
    defaultCost: 11.99,
    defaultBillingCycle: 'monthly',
    category: 'Entertainment & Leisure',
    url: 'https://spotify.com',
    notes: 'Music & podcasts playlist stream.',
    currencySymbol: '$'
  },
  {
    id: 'p-aws',
    name: 'AWS Cloud Hosting',
    defaultCost: 48.50,
    defaultBillingCycle: 'monthly',
    category: 'Development / DevOps',
    url: 'https://aws.amazon.com',
    notes: 'Development servers and backend endpoints.',
    currencySymbol: '$'
  },
  {
    id: 'p-m365',
    name: 'Microsoft 365 Personal',
    defaultCost: 6.99,
    defaultBillingCycle: 'monthly',
    category: 'Productivity & Office',
    url: 'https://microsoft.com',
    notes: 'Suite of Office apps and OneDrive.',
    currencySymbol: '$'
  },
  {
    id: 'p-dropbox',
    name: 'Dropbox Personal',
    defaultCost: 11.99,
    defaultBillingCycle: 'monthly',
    category: 'Utilities & General',
    url: 'https://dropbox.com',
    notes: 'Shared work dynamic folder backup.',
    currencySymbol: '$'
  },
  {
    id: 'p-apple',
    name: 'Apple One Individual',
    defaultCost: 19.95,
    defaultBillingCycle: 'monthly',
    category: 'Entertainment & Leisure',
    url: 'https://apple.com',
    notes: 'Music, TV+, Arcade and iCloud storage.',
    currencySymbol: '$'
  },
  {
    id: 'p-midjourney',
    name: 'Midjourney AI',
    defaultCost: 10.00,
    defaultBillingCycle: 'monthly',
    category: 'Design & Creative',
    url: 'https://midjourney.com',
    notes: 'Text-to-image graphic generation.',
    currencySymbol: '$'
  },
  {
    id: 'p-x',
    name: 'X Premium Blue',
    defaultCost: 8.00,
    defaultBillingCycle: 'monthly',
    category: 'Entertainment & Leisure',
    url: 'https://x.com',
    notes: 'Social media enhanced distribution and analytics.',
    currencySymbol: '$'
  }
];

export default function SaaSPresetsCatalog({ onAdd, existingSubs, isDark = false }: SaaSPresetsCatalogProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Track inline edited states per preset catalog item
  // Key is preset.id, value is customized form values
  const [editedStates, setEditedStates] = useState<Record<string, {
    cost: string;
    billingCycle: BillingCycle;
    renewalDate: string;
    currencySymbol: string;
  }>>({});

  // Success notifications to give user visual feedback when a preset is added
  const [addedLogs, setAddedLogs] = useState<Record<string, boolean>>({});

  // Filter lists
  const filteredPresets = useMemo(() => {
    return COMMON_PRESETS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const initItemState = (item: PresetTool) => {
    if (!editedStates[item.id]) {
      setEditedStates(prev => ({
        ...prev,
        [item.id]: {
          cost: item.defaultCost.toFixed(2),
          billingCycle: item.defaultBillingCycle,
          renewalDate: '',
          currencySymbol: item.currencySymbol
        }
      }));
    }
  };

  const handleFieldChange = (itemId: string, field: string, value: any) => {
    setEditedStates(prev => {
      const currentState = prev[itemId] || {
        cost: COMMON_PRESETS.find(p => p.id === itemId)!.defaultCost.toFixed(2),
        billingCycle: COMMON_PRESETS.find(p => p.id === itemId)!.defaultBillingCycle,
        renewalDate: '',
        currencySymbol: COMMON_PRESETS.find(p => p.id === itemId)!.currencySymbol
      };
      return {
        ...prev,
        [itemId]: {
          ...currentState,
          [field]: value
        }
      };
    });
  };

  const handleAddClick = (item: PresetTool) => {
    const state = editedStates[item.id] || {
      cost: item.defaultCost.toFixed(2),
      billingCycle: item.defaultBillingCycle,
      renewalDate: '',
      currencySymbol: item.currencySymbol
    };

    const costNum = parseFloat(state.cost);
    if (isNaN(costNum) || costNum <= 0) {
      alert('Please enter a valid price greater than 0');
      return;
    }

    onAdd({
      name: item.name,
      cost: costNum,
      billingCycle: state.billingCycle,
      category: item.category,
      renewalDate: state.renewalDate || undefined,
      url: item.url,
      notes: item.notes,
      status: 'active',
      currencySymbol: state.currencySymbol
    });

    // Mark as added for a brief animation trigger
    setAddedLogs(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedLogs(prev => ({ ...prev, [item.id]: false }));
    }, 1800);
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-xs transition-all duration-300 ${
      isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-900'
    }`} id="presets-catalog-card">
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b pb-3 ${
        isDark ? 'border-slate-800' : 'border-slate-100/80'
      }`}>
        <div>
          <h3 className={`text-sm font-semibold flex items-center gap-2 font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <ShoppingBag size={18} className="text-indigo-500" />
            Common SaaS Library
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Customize and append popular SaaS tools with 1-click.</p>
        </div>
        <span className={`text-[10px] font-semibold uppercase tracking-widest font-mono self-start sm:self-auto border px-2 py-0.5 rounded-md ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-400'
        }`}>Catalog</span>
      </div>

      <div className="space-y-3 font-sans">
        {/* Search and Filters */}
        <div className="space-y-2">
          {/* Dynamic Search Bar */}
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search common subscriptions (e.g. Figma, GitHub)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-8 pr-3.5 py-1.5 text-xs rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-sans ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-slate-200 focus:bg-slate-900 placeholder:text-slate-600' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white placeholder:text-slate-400'
              }`}
            />
          </div>

          {/* Quick Category Filters Horizontal Scroll */}
          <div className="flex items-center gap-1 overflow-x-auto scroller-none pb-1" id="presets-categories-chips">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer border ${
                selectedCategory === 'All'
                  ? isDark 
                    ? 'bg-slate-105 bg-slate-200 text-slate-900 border-slate-200' 
                    : 'bg-slate-900 text-white border-slate-900'
                  : isDark 
                    ? 'bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-slate-300 border-slate-850' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-100'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => {
              // Find short name for category
              let displayCat = cat.split('/')[0].split('&')[0].trim();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer border ${
                    selectedCategory === cat
                      ? isDark 
                        ? 'bg-slate-105 bg-slate-200 text-slate-900 border-slate-200' 
                        : 'bg-slate-900 text-white border-slate-900'
                      : isDark 
                        ? 'bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-slate-300 border-slate-850' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-100'
                  }`}
                >
                  {displayCat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable preset library list */}
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1" id="presets-library-scroll-container">
          {filteredPresets.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 italic">
              No matching preset tools found in catalog.
            </div>
          ) : (
            filteredPresets.map(preset => {
              // Ensure its form state is initialized safely
              const state = editedStates[preset.id] || {
                cost: preset.defaultCost.toFixed(2),
                billingCycle: preset.defaultBillingCycle,
                renewalDate: '',
                currencySymbol: preset.currencySymbol
              };

              const isAlreadyAdded = existingSubs.some(sub => sub.name.toLowerCase() === preset.name.toLowerCase());
              const isAddedJustNow = addedLogs[preset.id];

              return (
                <div 
                  key={preset.id}
                  onFocus={() => initItemState(preset)}
                  onMouseEnter={() => initItemState(preset)}
                  className={`border rounded-xl p-3 transition-all space-y-2.5 relative ${
                    isDark 
                      ? 'bg-slate-955/60 bg-slate-950 hover:bg-slate-950/80 border-slate-850 hover:border-slate-800' 
                      : 'bg-slate-50 hover:bg-slate-50/80 border-slate-100 hover:border-slate-200/80'
                  }`}
                >
                  {/* Top line Info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold text-xs tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{preset.name}</span>
                        {isAlreadyAdded && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono font-medium ${
                            isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200/60 text-slate-600'
                          }`}>Included</span>
                        )}
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold mt-0.5 inline-block border ${
                        isDark 
                          ? 'text-indigo-400 bg-indigo-950/40 border-indigo-900/30' 
                          : 'text-indigo-600/85 bg-indigo-50 border border-indigo-100/30'
                      }`}>{preset.category}</span>
                      <p className={`text-[11px] mt-1 leading-normal italic font-sans ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{preset.notes}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-rose-500 font-mono tracking-tight">${preset.defaultCost.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 font-medium block">/{preset.defaultBillingCycle}</span>
                    </div>
                  </div>

                  {/* Inline interactive editor fields */}
                  <div className={`grid grid-cols-12 gap-1.5 pt-1.5 border-t border-dashed items-end ${isDark ? 'border-slate-800' : 'border-slate-200/70'}`}>
                    
                    {/* Currency Symbol & Pricing Input */}
                    <div className="col-span-4">
                      <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-0.5 font-display ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Amount</label>
                      <div className="relative">
                        <span className="absolute left-1.5 top-1 text-xs font-bold text-slate-400 font-mono">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.1"
                          value={state.cost}
                          onChange={(e) => handleFieldChange(preset.id, 'cost', e.target.value)}
                          placeholder={preset.defaultCost.toString()}
                          className={`w-full pl-4.5 pr-1 py-1 text-xs border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono ${
                            isDark 
                              ? 'bg-slate-900 border-slate-800 text-slate-205 text-slate-200' 
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Period (Billing Cycle) Select */}
                    <div className="col-span-4">
                      <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-0.5 font-display ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Period</label>
                      <select
                        value={state.billingCycle}
                        onChange={(e) => handleFieldChange(preset.id, 'billingCycle', e.target.value as BillingCycle)}
                        className={`w-full px-1.5 py-1 text-xs border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-400 font-medium ${
                          isDark 
                            ? 'bg-slate-900 border-slate-800 text-slate-350 bg-slate-900' 
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <option value="weekly" className={isDark ? 'bg-slate-900' : ''}>Weekly</option>
                        <option value="monthly" className={isDark ? 'bg-slate-900' : ''}>Monthly</option>
                        <option value="quarterly" className={isDark ? 'bg-slate-900' : ''}>Quarterly</option>
                        <option value="yearly" className={isDark ? 'bg-slate-900' : ''}>Yearly</option>
                      </select>
                    </div>

                    {/* Next Renewal Date */}
                    <div className="col-span-4">
                      <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-0.5 font-display ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Renewal Date</label>
                      <input
                        type="date"
                        value={state.renewalDate}
                        onChange={(e) => handleFieldChange(preset.id, 'renewalDate', e.target.value)}
                        className={`w-full px-1.5 py-1 text-xs border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-400 font-sans ${
                          isDark 
                            ? 'bg-slate-900 border-slate-800 text-slate-350 bg-slate-900' 
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      />
                    </div>

                  </div>

                  {/* Add action button */}
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleAddClick(preset)}
                      disabled={isAddedJustNow}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                        isAddedJustNow 
                          ? 'bg-emerald-500 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow-md'
                      }`}
                    >
                      {isAddedJustNow ? (
                        <>
                          <Check size={13} className="stroke-[3]" /> Added
                        </>
                      ) : (
                        <>
                          <PlusCircle size={13} /> Add to Ledger
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
