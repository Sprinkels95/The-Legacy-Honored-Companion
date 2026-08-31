import React, { useState } from 'react';
import { 
  Sparkles, Droplets, HeartPulse, Moon, Coffee, Utensils, 
  Flame, CheckCircle2, ChevronDown, ChevronUp, RefreshCw, 
  ArrowUpRight, Heart, Zap, Award
} from 'lucide-react';
import { AdaptiveVoiceOrderItem, AgentPersonaId, BrevityMode } from '../types';

interface AdaptiveVoiceOrdersPanelProps {
  orders: AdaptiveVoiceOrderItem[];
  onTriggerOrder: (order: AdaptiveVoiceOrderItem) => void;
  isHardDay?: boolean;
  selectedPersona?: AgentPersonaId;
  brevityMode?: BrevityMode;
}

export const AdaptiveVoiceOrdersPanel: React.FC<AdaptiveVoiceOrdersPanelProps> = ({
  orders,
  onTriggerOrder,
  isHardDay = false,
  selectedPersona = 'dr-evil',
  brevityMode = 'STANDARD_SENTENCE'
}) => {
  const [showAll, setShowAll] = useState(false);
  const [lastTappedId, setLastTappedId] = useState<string | null>(null);

  // Sort orders dynamically by request frequency (highest first)
  const sortedOrders = [...orders].sort((a, b) => b.orderCount - a.orderCount);
  const displayedOrders = showAll ? sortedOrders : sortedOrders.slice(0, 4);

  const handleTap = (order: AdaptiveVoiceOrderItem) => {
    setLastTappedId(order.id);
    onTriggerOrder(order);
    setTimeout(() => {
      setLastTappedId(null);
    }, 2500);
  };

  // Helper for custom thematic icon representation
  const renderOrderIcon = (order: AdaptiveVoiceOrderItem) => {
    switch (order.iconType) {
      case 'pudding':
        return (
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <span className="text-xl select-none">🍮</span>
          </div>
        );
      case 'rootbeer':
        return (
          <div className="w-11 h-11 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
            <span className="text-xl select-none">🍺</span>
          </div>
        );
      case 'icecream':
        return (
          <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <span className="text-xl select-none">🍨</span>
          </div>
        );
      case 'juice':
        return (
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Droplets className="w-6 h-6" />
          </div>
        );
      case 'water':
        return (
          <div className="w-11 h-11 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
            <Droplets className="w-6 h-6" />
          </div>
        );
      case 'pads':
        return (
          <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
            <HeartPulse className="w-6 h-6" />
          </div>
        );
      case 'rest':
        return (
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Moon className="w-6 h-6" />
          </div>
        );
      case 'snack':
      default:
        return (
          <div className="w-11 h-11 rounded-2xl bg-purple-500 text-white flex items-center justify-center shadow-xs">
            <Utensils className="w-6 h-6" />
          </div>
        );
    }
  };

  const getCardThemeClasses = (colorTheme: string, isTopThree: boolean, isLastTapped: boolean) => {
    if (isLastTapped) {
      return 'bg-emerald-100 border-emerald-400 ring-4 ring-emerald-200 scale-[1.02] shadow-md';
    }

    switch (colorTheme) {
      case 'amber':
        return 'bg-amber-50/80 hover:bg-amber-100/90 border-amber-200 hover:border-amber-300 text-amber-950';
      case 'orange':
        return 'bg-orange-50/80 hover:bg-orange-100/90 border-orange-200 hover:border-orange-300 text-orange-950';
      case 'emerald':
        return 'bg-emerald-50/80 hover:bg-emerald-100/90 border-emerald-200 hover:border-emerald-300 text-emerald-950';
      case 'sky':
        return 'bg-sky-50/80 hover:bg-sky-100/90 border-sky-200 hover:border-sky-300 text-sky-950';
      case 'rose':
        return 'bg-rose-50/80 hover:bg-rose-100/90 border-rose-200 hover:border-rose-300 text-rose-950';
      case 'purple':
        return 'bg-purple-50/80 hover:bg-purple-100/90 border-purple-200 hover:border-purple-300 text-purple-950';
      case 'indigo':
      default:
        return 'bg-indigo-50/80 hover:bg-indigo-100/90 border-indigo-200 hover:border-indigo-300 text-indigo-950';
    }
  };

  return (
    <div 
      id="wade-adaptive-quick-orders-panel"
      className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5"
    >
      {/* Header & Adaptive Intelligence Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Quick Voice Orders (Large Tap Targets)
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              Adapts to Wade's Favorites
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ranked by request frequency — taps automatically update inventory and trigger background fulfillment.
          </p>
        </div>

        {sortedOrders.length > 4 && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 self-start sm:self-auto py-1 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            <span>{showAll ? 'Show Top 4 Favorites' : `View All (${sortedOrders.length})`}</span>
            {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Grid of Adaptive Large Tap Targets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {displayedOrders.map((order, index) => {
          const isTopThree = index < 3;
          const isLastTapped = lastTappedId === order.id;

          return (
            <button
              key={order.id}
              type="button"
              id={`quick-order-btn-${order.id}`}
              onClick={() => handleTap(order)}
              className={`p-5 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between gap-3 relative overflow-hidden group shadow-2xs cursor-pointer ${
                getCardThemeClasses(order.colorTheme, isTopThree, isLastTapped)
              }`}
            >
              {/* Top Row: Icon + Frequency Rank Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="group-hover:scale-105 transition-transform">
                  {renderOrderIcon(order)}
                </div>

                <div className="flex flex-col items-end">
                  {index === 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-white shadow-2xs">
                      <Flame className="w-3 h-3 fill-current" />
                      #1 Favorite
                    </span>
                  )}
                  {index === 1 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-500 text-white shadow-2xs">
                      <Award className="w-3 h-3" />
                      #2 Top Pick
                    </span>
                  )}
                  {index === 2 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white shadow-2xs">
                      <Heart className="w-3 h-3 fill-current" />
                      #3 Favorite
                    </span>
                  )}
                  <span className="text-[11px] font-bold text-slate-500 mt-1">
                    {order.orderCount} requests
                  </span>
                </div>
              </div>

              {/* Middle: Title & Subtitle */}
              <div className="space-y-0.5 pt-1">
                <div className="font-black text-slate-900 text-base sm:text-lg tracking-tight leading-snug group-hover:text-indigo-950">
                  {order.name}
                </div>
                <div className="text-xs text-slate-600 font-medium line-clamp-1">
                  {order.subtitle}
                </div>
              </div>

              {/* Bottom Row: Spoken Preview & Tap Prompt */}
              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 text-[11px] truncate max-w-[170px]">
                  "{order.spokenPhrase}"
                </span>
                <div className="w-6 h-6 rounded-full bg-white/80 border border-black/10 flex items-center justify-center text-slate-700 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {isLastTapped ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-pulse" />
                  ) : (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Subtle Learning Note */}
      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Self-Learning Favorites:</strong> Speaking orders into the giant mic or tapping these cards automatically updates the rankings in real-time.
          </span>
        </div>
        <div className="text-[11px] text-slate-500 font-semibold shrink-0">
          Last item tapped: {displayedOrders[0]?.name || 'Pudding'} ({displayedOrders[0]?.orderCount || 42} total)
        </div>
      </div>
    </div>
  );
};
