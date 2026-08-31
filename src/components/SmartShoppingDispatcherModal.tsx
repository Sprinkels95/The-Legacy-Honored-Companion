import React, { useState } from 'react';
import { 
  ShoppingCart, Zap, DollarSign, Clock, ExternalLink, ShieldCheck, 
  Sparkles, CheckCircle2, ArrowRight, X, Truck, Building2, Store
} from 'lucide-react';
import { ShoppingItem, RetailerCartOption, RetailerId } from '../types';
import { generateRetailerOptions } from '../utils/multiRetailerCartEngine';

interface SmartCartModalProps {
  item: ShoppingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmStaged: (itemId: string, retailer: RetailerId, cartUrl: string) => void;
}

export function SmartShoppingDispatcherModal({ item, isOpen, onClose, onConfirmStaged }: SmartCartModalProps) {
  const [selectedRetailer, setSelectedRetailer] = useState<RetailerId | null>(null);
  const [stagedNotification, setStagedNotification] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const { options, recommended } = generateRetailerOptions(
    item.name, 
    item.quantity, 
    item.category, 
    item.urgency
  );

  const activeRetailer = selectedRetailer || recommended.retailer;
  const currentOption = options.find(o => o.retailer === activeRetailer) || options[0];

  const handleStageToCart = (option: RetailerCartOption) => {
    // Open cart add link in new tab
    window.open(option.cartAddUrl, '_blank', 'noopener,noreferrer');
    
    setStagedNotification(`Staged into ${option.retailerName} Cart! Awaiting your final checkout click.`);
    onConfirmStaged(item.id, option.retailer, option.cartAddUrl);

    setTimeout(() => {
      setStagedNotification(null);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-400/30 rounded-2xl text-amber-300">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                  AI Multi-Retailer Cart Router
                </span>
                <span className="text-xs text-slate-300">4 Active Memberships</span>
              </div>
              <h3 className="text-xl font-black text-white mt-1">
                Stage "{item.name}"
              </h3>
              <p className="text-xs text-slate-300">
                Evaluating Walmart+, Instacart+, Amazon Prime & Costco for best price vs delivery speed.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Recommendation Banner */}
        <div className="bg-amber-50 border-b border-amber-200 p-4 px-6 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-extrabold text-amber-950 block">
              AI Decision Rule: {recommended.reason === 'FASTEST_DELIVERY' ? '⚡ Urgency Priority (Fastest Delivery)' : '💰 Value Priority (Lowest Total Cost)'}
            </span>
            <span className="text-amber-800">
              {recommended.explanation}
            </span>
          </div>
        </div>

        {/* Retailer Comparison Grid */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Select Retailer to Stage into Cart:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((option) => {
              const isSelected = option.retailer === activeRetailer;
              const isAiPick = option.retailer === recommended.retailer;

              return (
                <div
                  key={option.retailer}
                  onClick={() => setSelectedRetailer(option.retailer)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-200' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {isAiPick && (
                    <span className="absolute -top-2.5 right-3 bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Best Match
                    </span>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                      option.retailer === 'walmart' ? 'bg-blue-100 text-blue-800' :
                      option.retailer === 'instacart' ? 'bg-emerald-100 text-emerald-800' :
                      option.retailer === 'amazon' ? 'bg-amber-100 text-amber-900' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {option.badge}
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      ${option.price.toFixed(2)}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">
                    {option.retailerName}
                  </h4>

                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{option.deliveryEstimate}</span>
                    </div>
                    {option.unitPriceComparison && (
                      <div className="text-[11px] text-slate-500">
                        {option.unitPriceComparison}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Safety & No Auto-Charge Guarantee */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600">
              <span className="font-bold text-slate-900 block">
                Human-in-the-Loop Safe Staging Guarantee:
              </span>
              The agent will only add this item into your <span className="font-semibold">{currentOption.retailerName}</span> shopping cart. It will <strong className="text-slate-900">never</strong> charge your credit card or submit payment without your personal final review.
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 hidden sm:block">
            Target: <strong className="text-slate-900">{currentOption.retailerName}</strong> ({currentOption.deliveryEstimate})
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors flex-1 sm:flex-initial"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleStageToCart(currentOption)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-colors flex-1 sm:flex-initial"
            >
              <Store className="w-4 h-4" />
              <span>Stage to {currentOption.retailerName} Cart</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
