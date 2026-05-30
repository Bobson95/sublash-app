import React, { useRef } from 'react';
import { ShieldCheck, Download, Upload, RotateCcw, HelpCircle } from 'lucide-react';
import { Subscription } from '../types';

interface PrivacyBannerProps {
  onImport: (importedData: Subscription[]) => void;
  onExport: () => void;
  onExportCsv: () => void;
  onReset: () => void;
  totalCount: number;
}

export default function PrivacyBanner({ onImport, onExport, onExportCsv, onReset, totalCount }: PrivacyBannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // Soft validation
          const isValid = parsed.every(item => item.name && typeof item.cost === 'number' && item.billingCycle);
          if (isValid) {
            onImport(parsed as Subscription[]);
            alert('Subscriptions imported successfully!');
          } else {
            alert('Invalid backup file. Ensure subscriptions have name, cost and billingCycle attributes.');
          }
        } else {
          alert('Parsed content is not a list structure. Make sure you load a valid backup file.');
        }
      } catch (err) {
        alert('Failed parsing the backup file. Ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
    
    // clear input value so same file can trigger change again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-850 flex flex-col md:flex-row items-center justify-between gap-4" id="privacy-banner-section">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 bg-indigo-505 bg-indigo-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
          <ShieldCheck size={20} className="stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm tracking-tight font-display">Privacy-First Architecture</h4>
            <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider border border-emerald-500/20">Active</span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5 max-w-xl">
            Pure client-side system. Every pricing audit, input, state, and category filter is saved to your computer's <b>localStorage</b>. Your proprietary data never touches secondary servers.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
        <input
          id="backup-import-uploader"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
          title="Backup upload file selector"
        />

        <button
          id="btn-import-backup"
          onClick={triggerImport}
          className="px-3.5 py-1.5 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          title="Import JSON backup of your auditor data"
        >
          <Upload size={13} />
          Load JSON
        </button>

        <button
          id="btn-export-csv"
          onClick={onExportCsv}
          disabled={totalCount === 0}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-705 lg:hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
          title="Export the subscriptions table as a spreadsheet-friendly CSV file"
        >
          <Download size={13} className="text-emerald-400" />
          Export CSV
        </button>

        <button
          id="btn-export-backup"
          onClick={onExport}
          disabled={totalCount === 0}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
          title="Download the subscriptions table as a portable JSON file"
        >
          <Download size={13} />
          Backup Outlays
        </button>

        <button
          id="btn-reset-defaults"
          onClick={onReset}
          className="p-2 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-705 border-slate-700/80 transition-all flex items-center justify-center cursor-pointer"
          title="Revert back to standard demo subscriptions"
        >
          <RotateCcw size={13} />
        </button>
      </div>
    </div>
  );
}
