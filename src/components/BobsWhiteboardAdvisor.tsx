import React, { useState } from 'react';
import { Sparkles, TrendingUp, HelpCircle, Award, Coffee, BookOpen, ChevronRight, Bookmark, ThumbsUp, Heart } from 'lucide-react';
import { formatCurrency } from '../utils';

interface BobsWhiteboardAdvisorProps {
  monthlyBurn: number;
  activeCount: number;
  isDark?: boolean;
}

export default function BobsWhiteboardAdvisor({ monthlyBurn, activeCount, isDark = false }: BobsWhiteboardAdvisorProps) {
  const [compoundingYears, setCompoundingYears] = useState<number>(10);
  const [returnRate, setReturnRate] = useState<number>(8); // 8% average index fund return

  // Compounding formula: A = PMT * [((1 + r/n)^(nt) - 1) / (r/n)] * (1 + r/n)
  // Monthly deposits
  const r = returnRate / 100;
  const n = 12; // monthly balance
  const t = compoundingYears;
  const pmt = monthlyBurn;

  let compoundedWealth = 0;
  if (pmt > 0) {
    if (r > 0) {
      compoundedWealth = pmt * (((Math.pow(1 + r/n, n * t) - 1) / (r/n)) * (1 + r/n));
    } else {
      compoundedWealth = pmt * n * t;
    }
  }

  // Pure cash saved without return
  const ordinarySavings = pmt * 12 * t;
  const interestEarned = Math.max(0, compoundedWealth - ordinarySavings);

  // Bobby's channel tips list
  const tips = [
    {
      id: 'tip-1',
      title: "The 'Rule of 200' Explainer",
      content: "For every $1 you save monthly and invest at 8%, in 10 years you earn $200. That casual $15/mo lunch-hour app is actually taking $3,000 out of your retirement mailbox! Look at your ledger - what is your true long-term price?"
    },
    {
      id: 'tip-2',
      title: "Audit with the 'One-in, One-out' Policy",
      content: "Before you sign up for ChatGPT Plus (Plus, Gemini, etc.), force yourself to immediately cancel one other tool of equal cost. Real builders curate their stack, they don't collect them like physical stickers."
    },
    {
      id: 'tip-3',
      title: "The 30-Day Sandbox Freeze",
      content: "Next time a productivity tool claims it's critical, write a card to add it to your slate as 'Paused'. Force yourself to wait 30 days. If your workflow still aches without it, reactivate it. 80% of our tech desires disappear in 2 weeks!"
    }
  ];

  const [activeTip, setActiveTip] = useState<number>(0);

  // Personal channel viewer challenge checklist saved locally
  const [challengeState, setChallengeState] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('bob_challenge_status');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      stmt: false,
      trial: false,
      pause: false,
      budget: false,
      share: false,
    };
  });

  const toggleChallenge = (key: string) => {
    setChallengeState(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('bob_challenge_status', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const challengeScore = Object.values(challengeState).filter(Boolean).length;

  return (
    <div 
      className={`rounded-2xl border transition-all duration-300 p-5 p-6 relative ${
        isDark
          ? 'bg-slate-900 border-slate-800 shadow-sm text-slate-100'
          : 'bg-white border-slate-100 shadow-xs text-slate-900'
      }`}
      id="bobs-whiteboard-advisor-card"
    >
      {/* Visual Marker Banner */}
      <div className="absolute top-0 right-8 transform -translate-y-1/2 font-sans">
        <span className={`text-[10px] font-black tracking-widest uppercase px-3.5 py-1 rounded-full border shadow-xs inline-flex items-center gap-1.5 ${
          isDark
            ? 'bg-slate-800 text-indigo-400 border-slate-700'
            : 'bg-indigo-600 text-white border-indigo-700'
        }`}>
          <Sparkles size={11} className="animate-spin" /> YouTube Viewer Companion
        </span>
      </div>

      <div className="mb-5">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${isDark ? 'bg-rose-955/60 text-rose-400 bg-rose-950/40 border border-rose-900/40' : 'bg-rose-50 text-rose-600'}`}>
            <TrendingUp size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className={`text-sm font-bold tracking-tight font-display flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Bob Invests Companion Panel
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Let's turn subscription leakage into compound investing fuel!</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: Wealth Multiplier Simulator */}
      <div className={`rounded-xl p-4.5 mb-5 border ${
        isDark
          ? 'bg-slate-950/80 border-slate-800/80 text-slate-350'
          : 'bg-slate-50 border-slate-100 text-slate-650'
      }`}>
        <div className="flex items-center justify-between mb-3.5 font-sans">
          <span className={`text-[11px] font-bold tracking-wider uppercase font-display leading-none px-2 py-1 rounded-md ${
            isDark ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-900/30' : 'bg-emerald-50 text-emerald-800'
          }`}>
            🧮 Bob's Compounded Wealth Multiplier
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Build income while you sleep</span>
        </div>

        {monthlyBurn === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 italic">
            Add active subscriptions to see what this money would look like if invested instead!
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Your Total Savings Outlay:</span>
                <span className="text-3xl font-black text-rose-600 font-mono tracking-tight leading-none block">
                  {formatCurrency(monthlyBurn)}
                  <span className="text-xs text-slate-400 font-normal"> /mo</span>
                </span>
                <p className="text-[10px] text-slate-400 mt-1">If you canceled all &amp; invested instead.</p>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Estimated Compound Future:</span>
                <span className="text-3xl font-black text-emerald-600 font-mono tracking-tight leading-none block">
                  {formatCurrency(compoundedWealth)}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">
                  At <span className="text-emerald-600 font-bold">{returnRate}%</span> over <span className="text-slate-900 font-bold">{compoundingYears} Years</span>.
                </p>
              </div>
            </div>

            {/* Visual Bar showing pure cash saved vs compound growth */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Direct Principal: {formatCurrency(ordinarySavings)}</span>
                <span className="text-emerald-600 font-bold">Compound Growth: +{formatCurrency(interestEarned)}</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-lg overflow-hidden flex" title="Cash saved vs compounded return growth">
                <div className="bg-slate-400/80 h-full" style={{ width: `${(ordinarySavings / compoundedWealth) * 100}%` }} />
                <div className="bg-emerald-500 h-full flex-1" />
              </div>
            </div>

            {/* Interactive sliders */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div id="multiplier-horizon-field">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Timeline Limit:</span>
                  <span className={`font-bold font-mono ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{compoundingYears} Yrs</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="40"
                  step="1"
                  value={compoundingYears}
                  onChange={(e) => setCompoundingYears(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div id="multiplier-rate-field">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Averaged ETF Return:</span>
                  <span className={`font-bold font-mono ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{returnRate}%</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="15"
                  step="0.5"
                  value={returnRate}
                  onChange={(e) => setReturnRate(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            <p className={`text-[11px] leading-normal italic text-center p-2 rounded-lg border ${
              isDark ? 'bg-indigo-950/20 text-indigo-300 border-indigo-900/30' : 'bg-yellow-100/40 text-slate-500 border-yellow-200/25'
            }`}>
              💡 Canceled subscriptions are instant cash. By adding this sum into a low-fee S&amp;P 500 capital stock index fund, you secure passive returns while resting!
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: Advisor Explainers Notes */}
      <div className="mb-5 font-sans">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 font-display">
            Bobby's Advisor Notebook
          </span>
          <div className="flex gap-1">
            {tips.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTip(idx)}
                style={{ width: '8px', height: '8px' }}
                className={`rounded-full transition-all cursor-pointer ${
                  activeTip === idx 
                    ? 'bg-rose-500 scale-125' 
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
                title={`View advisor tip ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${
          isDark
            ? 'bg-slate-950 border-slate-800 text-slate-300'
            : 'bg-indigo-50/20 border-indigo-100/50'
        }`}>
          <h4 className={`text-xs font-bold flex items-center gap-1.5 font-display mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <Bookmark size={12} className="text-rose-500" />
            {tips[activeTip].title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans mt-0.5">
            {tips[activeTip].content}
          </p>
          
          <div className="flex items-center justify-end mt-2">
            <button
              type="button"
              onClick={() => setActiveTip((prev) => (prev + 1) % tips.length)}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
            >
              Next Advisor Tip <ChevronRight size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: YouTube Viewer Challenge Tracker */}
      <div className={`border-t pt-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="flex items-center justify-between mb-3 font-sans">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">Viewer Challenge Block</span>
            <p className={`text-xs font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Bobby's Subscription Bleed Mission</p>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md font-mono ${
            isDark ? 'text-indigo-400 bg-indigo-950/50 border border-indigo-900/35' : 'text-indigo-600 bg-indigo-50 border border-indigo-100'
          }`}>
            {challengeScore}/5 Crushed
          </span>
        </div>

        <div className="space-y-2">
          {[
            { key: 'stmt', text: 'Scrutinized last 3 monthly debit card & credit card statements.' },
            { key: 'trial', text: 'Paused/canceled 1 dormant trial account before it billed again.' },
            { key: 'pause', text: 'Mock-paused at least 1 subscription using the "Paused" simulator.' },
            { key: 'budget', text: 'Set a monthly budget target limit under my previous burn rate.' },
            { key: 'share', text: 'Subscribed to Bob Invests and pledged to compound my excess ledger.' }
          ].map((item, idx) => (
            <label 
              key={item.key} 
              className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
                challengeState[item.key]
                  ? isDark
                    ? 'bg-emerald-950/20 border-emerald-900 text-slate-200'
                    : 'bg-emerald-50/50 border-emerald-150/50 text-slate-700'
                  : isDark
                    ? 'bg-slate-950/30 border-transparent hover:bg-slate-950/60'
                    : 'bg-slate-50/20 border-transparent hover:bg-slate-50/60'
              }`}
            >
              <input
                type="checkbox"
                checked={challengeState[item.key]}
                onChange={() => toggleChallenge(item.key)}
                className="mt-0.5 h-3.5 w-3.5 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
              />
              <span className="text-[11px] leading-tight select-none">
                <span className="font-semibold text-slate-400 mr-1">Step {idx + 1}:</span>
                {item.text}
              </span>
            </label>
          ))}
        </div>

        {challengeScore === 5 && (
          <div className="mt-3 bg-emerald-500 border border-emerald-600 text-white rounded-lg p-2.5 text-center text-[11px] font-bold flex items-center justify-center gap-1.5 animate-bounce">
            <ThumbsUp size={12} /> You have successfully finished Bob's Bleed Challenge! Let's compound wealth!
          </div>
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-200/50 text-center flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
        <Heart size={10} className="text-rose-500 fill-rose-500" /> Inspired by 
        <a 
          href="https://youtube.com/channel/UCAKBDBaY1dP7OdZkGPiDnug" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="font-bold underline text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Bob Invests YouTube Channel
        </a>
      </div>
    </div>
  );
}
