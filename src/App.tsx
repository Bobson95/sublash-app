import { useState, useEffect } from 'react';
import { 
  ShieldCheck, Info, Sparkles, TrendingUp, AlertTriangle, 
  Layers, Lock, Github, CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';
import { Subscription } from './types';
import { INITIAL_SUBSCRIPTIONS } from './demoData';
import MetricCards from './components/MetricCards';
import QuickAddForm from './components/QuickAddForm';
import SubscriptionList from './components/SubscriptionList';
import PrivacyBanner from './components/PrivacyBanner';

const LOCAL_STORAGE_KEY = 'saas-auditor-subs';

export default function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse subscriptions from localStorage', e);
    }
    return INITIAL_SUBSCRIPTIONS;
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
      'Are you sure you want to clear your current subscriptions and reload the standard baseline demo outlays?'
    );
    if (confirmReset) {
      setSubscriptions(INITIAL_SUBSCRIPTIONS);
    }
  };

  const totalActiveCostMonthly = subscriptions
    .filter(s => s.status === 'active')
    .length;

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-900" id="auditor-app">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation / Header Brand Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100" id="brand-header">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xs">
              <Layers size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100/50 uppercase tracing-wider">SaaS Utility</span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                  <Lock size={10} /> LocalStorage Saved
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display mt-0.5">SubSlash</h1>
              <p className="text-xs font-semibold text-rose-600 mt-1 uppercase tracking-wider font-mono">Stop the subscription bleed</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-slate-500 bg-white border border-slate-150 px-3.5 py-1.5 rounded-xl">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Privacy Standard: <b>Zero-Network Ledger</b></span>
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
            {/* Quick-Add Form Card */}
            <QuickAddForm onAdd={handleAddSubscription} />

            {/* Quick Helper Tips Panel */}
            <div className="bg-slate-550 bg-indigo-50/40 border border-indigo-100/60 rounded-2xl p-5 space-y-3.5" id="pro-tips-card">
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
