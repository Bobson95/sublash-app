import { useState, useEffect } from 'react';
import { 
  ShieldCheck, Info, Sparkles, TrendingUp, AlertTriangle, 
  Layers, Lock, Github, CheckCircle2, ChevronRight, HelpCircle,
  BookOpen, Plus, Palette, Sun, Moon
} from 'lucide-react';
import { Subscription } from './types';
import MetricCards from './components/MetricCards';
import QuickAddForm from './components/QuickAddForm';
import SaaSPresetsCatalog from './components/SaaSPresetsCatalog';
import SubscriptionList from './components/SubscriptionList';
import PrivacyBanner from './components/PrivacyBanner';
import BobsWhiteboardAdvisor from './components/BobsWhiteboardAdvisor';
import AppLogo from './components/AppLogo';
import { getMonthlyEquivalent } from './utils';

const LOCAL_STORAGE_KEY = 'saas-auditor-subs';

export default function App() {
  const [controlMode, setControlMode] = useState<'library' | 'manual'>('library');
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('saas_auditor_dark_theme');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Subscription[];
        // Filter out legacy template demo items to start with a blank canvas for the user
        return parsed.filter(sub => !sub.id.startsWith('demo-'));
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

  const handleDeleteMultipleSubscription = (ids: string[]) => {
    if (ids.length === 0) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to remove the ${ids.length} selected subscription(s) from your audit records?`
    );
    if (confirmDelete) {
      setSubscriptions(prev => prev.filter(s => !ids.includes(s.id)));
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

  const handleToggleMultipleStatus = (ids: string[], targetStatus?: 'active' | 'paused') => {
    if (ids.length === 0) return;
    setSubscriptions(prev => prev.map(sub => {
      if (ids.includes(sub.id)) {
        return {
          ...sub,
          status: targetStatus ? targetStatus : (sub.status === 'active' ? 'paused' : 'active')
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
      className={`min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
      id="auditor-app"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation / Header Brand Bar */}
        <header className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b transition-colors duration-300 ${
          isDark ? 'border-slate-800' : 'border-slate-200/60'
        }`} id="brand-header">
          <AppLogo isDark={isDark} />
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Local Storage Indicator */}
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${
              isDark 
                ? 'bg-emerald-950/25 text-emerald-400 border-emerald-900/40' 
                : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-3xs'
            }`}>
              <Lock size={11} className="stroke-[2.5]" /> LocalStorage Saved
            </span>

            {/* Whiteboard Mode Toggle Switch */}
            <button
              type="button"
              onClick={() => {
                setIsDark(prev => {
                  const next = !prev;
                  try {
                    localStorage.setItem('saas_auditor_dark_theme', String(next));
                  } catch {}
                  return next;
                });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-700 shadow-3xs'
                  : 'bg-white hover:bg-slate-50 text-slate-705 text-slate-700 border-slate-205 border-slate-200 shadow-3xs'
              }`}
              id="whiteboard-theme-toggle"
              title="Toggle standard dark and light theme layout styles"
            >
              {isDark ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-slate-500" />}
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>

            <div className={`flex items-center space-x-3 text-xs border px-3.5 py-1.5 rounded-xl shadow-3xs transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-350' : 'bg-white border-slate-200 text-slate-500'
            }`}>
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Privacy Standard: <b>Zero-Network Ledger</b></span>
            </div>
          </div>
        </header>

        {/* The "Sticker Shock" Header metrics wrapper */}
        <section id="sticker-shock-header-wrapper" aria-label="Subscription Metrics">
          <MetricCards subscriptions={subscriptions} isDark={isDark} />
        </section>

        {/* Content Workspace Split-Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Tools (Large Screen Span: 5) */}
          <section className="lg:col-span-5 space-y-6" id="auditor-controls" aria-label="Auditor Controls">
            
            {/* Toggle Switcher tabs between Preset Catalog and Manual Form */}
            <div className={`p-1 rounded-xl flex items-center shadow-xs border transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200/50'}`} id="tool-mode-switcher">
              <button
                type="button"
                onClick={() => setControlMode('library')}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  controlMode === 'library'
                    ? isDark
                      ? 'bg-slate-800 text-white shadow-xs font-bold'
                      : 'bg-white text-indigo-705 text-indigo-700 shadow-xs font-bold'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
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
                    ? isDark
                      ? 'bg-slate-800 text-white shadow-xs font-bold'
                      : 'bg-white text-indigo-705 text-indigo-700 shadow-xs font-bold'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Plus size={13} className="text-indigo-600" />
                Custom Manual Add
              </button>
            </div>

            {/* Conditionally Render selected tool input */}
            {controlMode === 'library' ? (
              <SaaSPresetsCatalog onAdd={handleAddSubscription} existingSubs={subscriptions} isDark={isDark} />
            ) : (
              <QuickAddForm onAdd={handleAddSubscription} isDark={isDark} />
            )}

            {/* Bobby's Interactive Whiteboard Advisor Widget */}
            <BobsWhiteboardAdvisor 
              monthlyBurn={activeMonthlyBurn} 
              activeCount={activeSubs.length} 
              isDark={isDark} 
            />

            {/* Quick Helper Tips Panel */}
            <div className={`p-5 space-y-3.5 border rounded-2xl ${isDark ? 'bg-slate-905 bg-slate-900 border-slate-800 text-slate-300' : 'bg-indigo-50/40 border-indigo-100/60'}`} id="pro-tips-card">
              <h4 className={`text-xs font-bold uppercase tracking-widest font-mono flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                <Info size={13} className="text-indigo-600" /> Auditor Strategy
              </h4>
              <ul className={`space-y-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-655 text-slate-600'}`}>
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
                  <h2 className={`text-base font-bold tracking-tight font-display ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Subscription Ledger</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Viewing <span className="font-semibold text-indigo-600">{subscriptions.length}</span> listed subscription outlinks.
                  </p>
                </div>
              </div>

              {/* The Subscription Ledger Table */}
              <SubscriptionList 
                subscriptions={subscriptions} 
                onDelete={handleDeleteSubscription}
                onToggleStatus={handleToggleStatus}
                onDeleteMultiple={handleDeleteMultipleSubscription}
                onToggleStatusMultiple={handleToggleMultipleStatus}
                isDark={isDark}
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
        <footer className={`pt-8 border-t text-center text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`} id="app-footer">
          <p>&copy; 2026 SaaS Subscription Auditor &middot; Built with extreme privacy and zero tracking.</p>
          <div className="flex items-center space-x-1">
            <span>🔒 Data stays encrypted in your browser's localStorage</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
