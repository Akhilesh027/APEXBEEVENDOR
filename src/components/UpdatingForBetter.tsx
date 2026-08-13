import React from 'react';
import { useVendor } from '../context/VendorContext';
import { 
  Wrench, 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  Ticket, 
  Megaphone, 
  ShoppingBag, 
  Truck, 
  ArrowLeft, 
  Clock, 
  ShieldCheck,
  Zap
} from 'lucide-react';

interface UpdatingForBetterProps {
  moduleName: string;
  sectionName: string;
  icon?: 'bar-chart' | 'sparkles' | 'trending-up' | 'ticket' | 'megaphone' | 'shopping-bag' | 'truck' | 'default';
  description?: string;
  expectedVersion?: string;
  keyFeatures?: string[];
}

export const UpdatingForBetter: React.FC<UpdatingForBetterProps> = ({
  moduleName,
  sectionName,
  icon = 'default',
  description = 'We are currently enhancing this module with next-generation AI automation, real-time sync, and intelligent analytics to elevate your business growth.',
  expectedVersion = 'v2.4 - Upgraded Experience',
  keyFeatures = [
    'Ultra-fast real-time data sync',
    'Advanced predictive AI analytics',
    'Streamlined automated workflows',
    'Enhanced enterprise-grade security'
  ]
}) => {
  const { setCurrentPage } = useVendor();

  const renderModuleIcon = () => {
    const iconClass = "w-10 h-10 text-amber-500 animate-pulse";
    switch (icon) {
      case 'bar-chart': return <BarChart3 className={iconClass} />;
      case 'sparkles': return <Sparkles className={iconClass} />;
      case 'trending-up': return <TrendingUp className={iconClass} />;
      case 'ticket': return <Ticket className={iconClass} />;
      case 'megaphone': return <Megaphone className={iconClass} />;
      case 'shopping-bag': return <ShoppingBag className={iconClass} />;
      case 'truck': return <Truck className={iconClass} />;
      default: return <Wrench className={iconClass} />;
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-12 shadow-2xl text-white relative overflow-hidden">
        {/* Glowing Background Gradients */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Badge */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full">
            <Zap className="w-3.5 h-3.5" />
            <span>{sectionName}</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{expectedVersion}</span>
          </div>
        </div>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="w-20 h-20 bg-slate-800/90 border border-amber-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/5">
            {renderModuleIcon()}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {moduleName} <span className="text-amber-400 font-medium text-lg block sm:inline">is Upgrading for Better</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
            {description}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 mb-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>What's coming in this upgrade</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {keyFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200 bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
