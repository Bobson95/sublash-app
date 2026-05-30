import { CreditCard, Shield, TrendingDown, Sparkles } from 'lucide-react';

interface AppLogoProps {
  isDark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function AppLogo({ isDark = false, size = 'md' }: AppLogoProps) {
  // Size-specific dimensions
  const containerClasses = {
    sm: 'p-1.5 rounded-xl gap-2',
    md: 'p-3 rounded-2xl gap-3.5',
    lg: 'p-4 rounded-[1.5rem] gap-4'
  }[size];

  const iconContainerSize = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-12 h-12 rounded-xl',
    lg: 'w-16 h-16 rounded-2xl'
  }[size];

  const cardIconSize = {
    sm: 14,
    md: 20,
    lg: 28
  }[size];

  const shieldIconSize = {
    sm: 10,
    md: 14,
    lg: 18
  }[size];

  const titleTextClasses = {
    sm: 'text-sm font-black',
    md: 'text-xl font-black md:text-2xl',
    lg: 'text-3xl font-black'
  }[size];

  const subtitleTextClasses = {
    sm: 'text-[9px]',
    md: 'text-xs',
    lg: 'text-sm'
  }[size];

  return (
    <div className={`flex items-center ${containerClasses} font-sans`} id="app-logo-component">
      {/* Sleek Layered Modern Icon */}
      <div 
        className={`relative flex items-center justify-center shrink-0 shadow-md transition-all duration-500 overflow-visible group ${iconContainerSize} ${
          isDark 
            ? 'bg-slate-900 border border-slate-800' 
            : 'bg-indigo-600 border border-indigo-500 shadow-indigo-600/20'
        }`}
      >
        {/* Ambient Back Glow - ONLY in Dark Mode */}
        {isDark && (
          <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-md opacity-75 -z-10 group-hover:blur-lg transition-all duration-300" />
        )}

        {/* Outer Tech Gradients */}
        <div className={`absolute inset-0.5 rounded-[10px] opacity-10 transition-opacity group-hover:opacity-20 ${
          isDark ? 'bg-gradient-to-tr from-rose-500 to-indigo-500' : 'bg-gradient-to-tr from-white to-indigo-300'
        }`} />

        {/* Overlapping Core Artwork: A credit card tilted backwards, guarded by a shield in front */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Credit Card Shadow Asset (Tilted) */}
          <div className="absolute transform -translate-x-1 -translate-y-1 -rotate-[12deg] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:-rotate-[15deg]">
            <CreditCard 
              size={cardIconSize} 
              className={`stroke-[1.75] ${
                isDark ? 'text-slate-500' : 'text-indigo-200'
              }`} 
            />
          </div>

          {/* Glowing Saver Arrow / Trend-down cutting the cost, positioned on the card */}
          <div className="absolute right-2 top-2 transform translate-x-1.5 -translate-y-1.5 transition-all duration-300 group-hover:scale-110">
            <TrendingDown 
              size={shieldIconSize + 2} 
              className="text-emerald-400 stroke-[2.5] drop-shadow-[0_2px_4px_rgba(16,185,129,0.3)]" 
            />
          </div>

          {/* Protective Forefront Shield Icon */}
          <div className="absolute transform translate-x-1 translate-y-1 shadow-sm rounded-full p-0.5 bg-slate-950/40 backdrop-blur-xs transition-all duration-300 group-hover:translate-x-1.5 group-hover:translate-y-1.5">
            <Shield 
              size={shieldIconSize} 
              className={`stroke-[2.5] ${
                isDark ? 'text-indigo-400 fill-indigo-950/50' : 'text-white fill-indigo-600'
              }`} 
            />
          </div>

          {/* Blinking Live Active Ledger Protection Light (Tiny green dot) */}
          <span className="absolute bottom-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      </div>

      {/* Brand Text Columns */}
      <div className="flex flex-col justify-center">
        {/* Top Badges */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border tracking-wide uppercase transition-colors ${
            isDark 
              ? 'bg-indigo-950 text-indigo-400 border-indigo-900/60' 
              : 'bg-indigo-50 text-indigo-600 border-indigo-100/60'
          }`}>
            SaaS Protection
          </span>
          <span className={`flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border transition-colors ${
            isDark 
              ? 'bg-rose-950/30 text-rose-400 border-rose-900/50' 
              : 'bg-rose-50 text-rose-600 border-rose-100/50'
          }`}>
            <Sparkles size={8} className="animate-pulse" /> Stop Bleed
          </span>
        </div>

        {/* Main Logo Title */}
        <h1 className={`tracking-tight font-display font-black leading-none ${titleTextClasses} ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Bob's <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 bg-clip-text text-transparent">Sub Bleed</span> Tracker
        </h1>

        {/* Subtitle / Promise Line */}
        <p className={`font-mono font-bold uppercase tracking-wider mt-1 ${subtitleTextClasses} ${
          isDark ? 'text-rose-400/90' : 'text-rose-600'
        }`}>
          Smart Subscription Audit &amp; Ledger
        </p>
      </div>
    </div>
  );
}
