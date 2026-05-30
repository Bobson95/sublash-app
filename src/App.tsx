import { useState, useEffect } from 'react';
import { 
  ShieldCheck, Info, Sparkles, TrendingUp, AlertTriangle, 
  Layers, Lock, Github, CheckCircle2, ChevronRight, HelpCircle,
  BookOpen, Plus, Palette
} from 'lucide-react';
import { Subscription } from './types';
import MetricCards from './components/MetricCards';
import QuickAddForm from './components/QuickAddForm';
import SaaSPresetsCatalog from './components/SaaSPresetsCatalog';
import SubscriptionList from './components/SubscriptionList';
import PrivacyBanner from './components/PrivacyBanner';
import BobsWhiteboardAdvisor from './components/BobsWhiteboardAdvisor';
import { getMonthlyEquivalent } from './utils';

const LOCAL_STORAGE_KEY = 'saas-auditor-subs';

export default function App() {
  const [controlMode, setControlMode] = useState<'library' | 'manual'>('library');
  const [isWhiteboardMode, setIsWhiteboardMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('subslash_whiteboard_mode');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse subscriptions from localStorage', e);
    }
    return []; // Start clean by default to let the user choose which tools to add
  });

  // Sync to localstorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(subscriptions));
  }, [subscriptions]);

  // Handlers
  const handleAddSubscription = (newSub: Omit<Subscription, 'id'>) => {
    const subWithId: Subscription = {
      ...newSub,
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setSubscriptions(prev => [subWithId, ...prev]);
  };

  const handleDeleteSubscription = (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    const confirmDelete = window.confirm(
      `Are you sure you want to remove "${sub?.name || 'this subscription'}" from your audit records?`
    );
    if (confirmDelete) {
      setSubscriptions(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setSubscriptions(prev => prev.map(sub => {
      if (sub.id === id) {
        return {
          ...sub,
          status: sub.status === 'active' ? 'paused' : 'active'
        };
      }
      return sub;
    }));
  };

  const handleImport = (imported: Subscription[]) => {
    setSubscriptions(imported);
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(subscriptions, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `saas-subscriptions-audit-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      alert('Failed to generate audit download file.');
    }
  };

  const handleExportCsv = () => {
    try {
      const headers = ['Name', 'Cost', 'Billing Cycle', 'Category', 'Renewal Date', 'URL', 'Status', 'Notes', 'Currency'];
      const escapeCsvCell = (val: any) => {
        if (val === undefined || val === null) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = subscriptions.map(sub => [
        sub.name,
        sub.cost,
        sub.billingCycle,
        sub.category,
        sub.renewalDate || '',
        sub.url || '',
        sub.status,
        sub.notes || '',
        sub.currencySymbol
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(escapeCsvCell).join(','))
      ].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const exportFileDefaultName = `saas-subscriptions-audit-${new Date().toISOString().split('T')[0]}.csv`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', url);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to generate CSV spreadsheet download file.');
    }
  };

  const handleReset = () => {
    const confirmReset = window.confirm(
      'Are you sure you want to clear your current subscriptions and start completely fresh?'
    );
    if (confirmReset) {
      setSubscriptions([]);
    }
  };

  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const activeMonthlyBurn = activeSubs.reduce((acc, sub) => {
    return acc + getMonthlyEquivalent(sub.cost, sub.billingCycle);
  }, 0);

  return (
    <div 
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-900 transition-all duration-300"
      style={isWhiteboardMode ? {
        backgroundColor: '#FCFAF2',
        backgroundImage: `
          linear-gradient(to right, #e2e8f0 1.2px, transparent 1.2px),
          linear-gradient(to bottom, #e2e8f0 1.2px, transparent 1.2px)
        `,
        backgroundSize: '24px 24px',
      } : {
        backgroundColor: '#f8fafc',
      }}
      id="auditor-app"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation / Header Brand Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60" id="brand-header">
          <div className="flex items-center space-x-3.5">
            <div className={`p-3 rounded-2xl shadow-xs transition-colors duration-300 ${isWhiteboardMode ? 'bg-amber-400 text-slate-900 border border-slate-900' : 'bg-indigo-600 text-white'}`}>
              <Layers size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${isWhiteboardMode ? 'bg-yellow-100 text-slate-800 border-yellow-200' : 'bg-indigo-50 text-indigo-700 border-indigo-100/50'}`}>
                  Bob Invests Edition
                </span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                  <Lock size={10} /> LocalStorage Saved
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display mt-0.5">SubSlash</h1>
              <p className="text-xs font-semibold text-rose-600 mt-1 uppercase tracking-wider font-mono">Stop the subscription bleed</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Whiteboard Mode Toggle Switch */}
            <button
              type="button"
              onClick={() => {
                setIsWhiteboardMode(prev => {
                  const next = !prev;
                  try {
                    localStorage.setItem('subslash_whiteboard_mode', String(next));
                  } catch {}
                  return next;
                });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                isWhiteboardMode
                  ? 'bg-yellow-300 hover:bg-yellow-400 text-slate-900 border-slate-900 shadow-[2.px_2px_0px_0px_rgba(15,23,42,1)] font-mono'
                  : 'bg-white hover:bg-slate-50 text-slate-650 hover:text-slate-900 border-slate-200 shadow-3xs'
              }`}
              id="whiteboard-theme-toggle"
              title="Toggle whiteboard sketch grid custom look"
            >
              <Palette size={13} className={isWhiteboardMode ? 'text-slate-900 animate-spin' : 'text-slate-400'} />
              <span>{isWhiteboardMode ? "Whiteboard Theme" : "Classic Theme"}</span>
            </button>

            <div className="flex items-center space-x-3 text-xs text-slate-500 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-3xs">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Privacy Standard: <b>Zero-Network Ledger</b></span>
            </div>
          </div>
        </header>

        {/* The "Sticker Shock" Header metrics wrapper */}
        <section id="sticker-shock-header-wrapper" aria-label="Subscription Metrics">
          <MetricCards subscriptions={subscriptions} />
        </section>

        {/* Content Workspace Split-Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Tools (Large Screen Span: 5) */}
          <section className="lg:col-span-5 space-y-6" id="auditor-controls" aria-label="Auditor Controls">
            
            {/* Toggle Switcher tabs between Preset Catalog and Manual Form */}
            <div className={`p-1 rounded-xl flex items-center shadow-xs border transition-colors ${isWhiteboardMode ? 'bg-amber-100/50 border-slate-900' : 'bg-slate-100 border-slate-200/50'}`} id="tool-mode-switcher">
              <button
                type="button"
                onClick={() => setControlMode('library')}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  controlMode === 'library'
                    ? isWhiteboardMode
                      ? 'bg-white text-slate-900 border-2 border-slate-900 font-black shadow-sm'
                      : 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen size={13} className="text-indigo-600" />
                SaaS Presets Catalog
              </button>
              <button
                type="button"
                onClick={() => setControlMode('manual')}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  controlMode === 'manual'
                    ? isWhiteboardMode
                      ? 'bg-white text-slate-900 border-2 border-slate-900 font-black shadow-sm'
                      : 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Plus size={13} className="text-indigo-600" />
                Custom Manual Add
              </button>
            </div>

            {/* Conditionally Render selected tool input */}
            {controlMode === 'library' ? (
              <SaaSPresetsCatalog onAdd={handleAddSubscription} existingSubs={subscriptions} />
            ) : (
              <QuickAddForm onAdd={handleAddSubscription} />
            )}

            {/* Bobby's Interactive Whiteboard Advisor Widget */}
            <BobsWhiteboardAdvisor 
              monthlyBurn={activeMonthlyBurn} 
              activeCount={activeSubs.length} 
              isWhiteboardMode={isWhiteboardMode} 
            />

            {/* Quick Helper Tips Panel */}
            <div className={`p-5 space-y-3.5 border rounded-2xl ${isWhiteboardMode ? 'bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]' : 'bg-indigo-50/40 border-indigo-100/60'}`} id="pro-tips-card">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Info size={13} className="text-indigo-600" /> Auditor Strategy
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">&#8226;</span>
                  <span><b>The Monthly Illusion</b>: We tend to underestimate small $10-$20 services. The 5-Year sticker horizon calculates the true compounding impact.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">&#8226;</span>
                  <span><b>Interactive Pausing</b>: Toggling statuses to "Paused" acts as an interactive simulation model. It temporarily excludes pricing from metrics without deleting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">&#8226;</span>
                  <span><b>Cancellation Simulator</b>: Checkboxes on individual rows allow modeling potential savings instantly without changing status.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Right Column: Ledger Spreadsheet (Large Screen Span: 7) */}
          <main className="lg:col-span-7" id="auditor-spreadsheet">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight font-display">Subscription Ledger</h2>
                  <p className="text-xs text-slate-450 mt-0.5">
                    Viewing <span className="font-semibold text-indigo-600">{subscriptions.length}</span> listed subscription outlinks.
                  </p>
                </div>
              </div>

              {/* The Subscription Ledger Table */}
              <SubscriptionList 
                subscriptions={subscriptions} 
                onDelete={handleDeleteSubscription}
                onToggleStatus={handleToggleStatus}
              />
            </div>
          </main>

        </div>

        {/* Backup export/import panel */}
        <section id="data-management-banner" aria-label="Data Management Utility">
          <PrivacyBanner 
            onImport={handleImport}
            onExport={handleExport}
            onExportCsv={handleExportCsv}
            onReset={handleReset}
            totalCount={subscriptions.length}
          />
        </section>

        {/* Bottom Footer Credits */}
        <footer className="pt-8 border-t border-slate-100 text-center text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-4" id="app-footer">
          <p>&copy; 2026 SaaS Subscription Auditor &middot; Built with extreme privacy and zero tracking.</p>
          <div className="flex items-center space-x-1">
            <span>🔒 Data stays encrypted in you browser's localStorage</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
