import React, { useState } from 'react';
import { 
  Building2, CheckCircle2, ShieldCheck, RefreshCw, Key, 
  ExternalLink, Lock, Check, Store, ShoppingBag, Zap, DollarSign, X, HelpCircle
} from 'lucide-react';

interface RetailerAccountConfig {
  id: 'walmart' | 'instacart' | 'amazon' | 'costco';
  name: string;
  badge: 'WALMART+' | 'INSTACART+' | 'PRIME' | 'COSTCO';
  connected: boolean;
  memberId: string;
  deliveryAddress: string;
  preferredStore: string;
  lastSynced: string;
  defaultPaymentMode: 'MANUAL_APPROVAL_ONLY';
}

interface RetailerSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshLivePricing: () => void;
}

export const RetailerAccountsSyncModal: React.FC<RetailerSyncModalProps> = ({
  isOpen,
  onClose,
  onRefreshLivePricing
}) => {
  const [accounts, setAccounts] = useState<RetailerAccountConfig[]>([
    {
      id: 'walmart',
      name: 'Walmart+ Membership',
      badge: 'WALMART+',
      connected: true,
      memberId: 'WPLUS-8849204-CAPTAIN',
      deliveryAddress: '742 Evergreen Terrace (Station #4 Residence)',
      preferredStore: 'Walmart Supercenter #2084 (San Jose, CA)',
      lastSynced: '2 mins ago',
      defaultPaymentMode: 'MANUAL_APPROVAL_ONLY'
    },
    {
      id: 'instacart',
      name: 'Instacart+ Family Pass',
      badge: 'INSTACART+',
      connected: true,
      memberId: 'INSTA-PLUS-90412-FAMILY',
      deliveryAddress: '742 Evergreen Terrace (Station #4 Residence)',
      preferredStore: 'Safeway & Sprouts Farmers Market (Priority 1-hr)',
      lastSynced: 'Just now',
      defaultPaymentMode: 'MANUAL_APPROVAL_ONLY'
    },
    {
      id: 'amazon',
      name: 'Amazon Prime Household',
      badge: 'PRIME',
      connected: true,
      memberId: 'AMZ-PRIME-77402-WADE',
      deliveryAddress: '742 Evergreen Terrace (Station #4 Residence)',
      preferredStore: 'Amazon Same-Day / 1-Day Fulfillment Center',
      lastSynced: '5 mins ago',
      defaultPaymentMode: 'MANUAL_APPROVAL_ONLY'
    },
    {
      id: 'costco',
      name: 'Costco Wholesale (Executive + Instacart)',
      badge: 'COSTCO',
      connected: true,
      memberId: 'COSTCO-EXEC-11094829',
      deliveryAddress: '742 Evergreen Terrace (Station #4 Residence)',
      preferredStore: 'Costco Warehouse #129 (Bulk Pantry Reserve)',
      lastSynced: '10 mins ago',
      defaultPaymentMode: 'MANUAL_APPROVAL_ONLY'
    }
  ]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusToast, setSyncStatusToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTriggerLiveSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatusToast('Successfully refreshed live pricing & delivery windows across all 4 store memberships!');
      onRefreshLivePricing();
      setTimeout(() => setSyncStatusToast(null), 4000);
    }, 1200);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-400/30">
                  4 Active Memberships
                </span>
                <span className="text-xs text-indigo-200 font-semibold">
                  Zero-Auto-Charge Safe Stage
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Retailer Accounts & Live Pricing Sync
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sync Status Banner / Toast */}
        {syncStatusToast && (
          <div className="bg-emerald-500 text-slate-950 font-bold px-6 py-2.5 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{syncStatusToast}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Top Explainer */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-950">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-indigo-950 block">Connected Family Accounts & Cart Staging:</span>
                <span className="text-indigo-800 leading-relaxed">
                  Your accounts are connected for real-time inventory queries, membership member pricing, and 1-click cart staging. The AI stages items into your active logged-in browser cart and <strong>never executes checkout automatically</strong>.
                </span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleTriggerLiveSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Refreshing Real Prices...' : 'Refresh Live Pricing'}</span>
            </button>
          </div>

          {/* Connected Accounts Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {accounts.map(acc => (
              <div 
                key={acc.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      acc.id === 'walmart' ? 'bg-blue-100 text-blue-800' :
                      acc.id === 'instacart' ? 'bg-emerald-100 text-emerald-800' :
                      acc.id === 'amazon' ? 'bg-amber-100 text-amber-900' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {acc.badge}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900">{acc.name}</h3>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Connected
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Member ID:</span>
                    <span className="font-mono font-bold text-slate-800">{acc.memberId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Fulfillment Store:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[160px] text-right">{acc.preferredStore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Security Guard:</span>
                    <span className="font-bold text-indigo-700 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Manual Checkout Review
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Last synced: {acc.lastSynced}</span>
                  <span className="text-emerald-600 font-bold">Live API Ready</span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            All 4 accounts are active and linked to the multi-cart router engine.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
