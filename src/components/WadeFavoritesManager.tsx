import React, { useState } from 'react';
import { 
  Sparkles, Flame, Plus, RefreshCw, Trash2, Edit3, Heart, 
  Droplets, Utensils, CheckCircle2, TrendingUp, Award, Clock, 
  ArrowUpDown, Zap, Store, ExternalLink, ShoppingCart
} from 'lucide-react';
import { AdaptiveVoiceOrderItem, AgentPersonaId, ShoppingItem } from '../types';
import { SmartShoppingDispatcherModal } from './SmartShoppingDispatcherModal';

interface WadeFavoritesManagerProps {
  orders: AdaptiveVoiceOrderItem[];
  onUpdateOrders: (orders: AdaptiveVoiceOrderItem[]) => void;
  onSimulateOrder: (order: AdaptiveVoiceOrderItem) => void;
}

export const WadeFavoritesManager: React.FC<WadeFavoritesManagerProps> = ({
  orders,
  onUpdateOrders,
  onSimulateOrder
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemPhrase, setNewItemPhrase] = useState('');
  const [newItemSubtitle, setNewItemSubtitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'Treats/Dessert' | 'Hydration' | 'Groceries' | 'Medical/Pump Supplies' | 'Rest/Comfort'>('Treats/Dessert');
  const [newItemIcon, setNewItemIcon] = useState<'pudding' | 'rootbeer' | 'icecream' | 'juice' | 'water' | 'pads' | 'rest' | 'snack'>('snack');
  const [newItemColor, setNewItemColor] = useState<'amber' | 'orange' | 'emerald' | 'sky' | 'rose' | 'purple' | 'indigo'>('amber');
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [smartCartModalItem, setSmartCartModalItem] = useState<ShoppingItem | null>(null);

  const sortedOrders = [...orders].sort((a, b) => b.orderCount - a.orderCount);

  const handleIncrement = (id: string, delta: number) => {
    const updated = orders.map(o => {
      if (o.id === id) {
        return {
          ...o,
          orderCount: Math.max(0, o.orderCount + delta),
          lastOrderedAt: delta > 0 ? 'Just now' : o.lastOrderedAt
        };
      }
      return o;
    });
    onUpdateOrders(updated);
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: AdaptiveVoiceOrderItem = {
      id: `vo-custom-${Date.now()}`,
      name: newItemName.trim(),
      spokenPhrase: newItemPhrase.trim() || `${newItemName.trim()} please`,
      subtitle: newItemSubtitle.trim() || 'Added by Elsbeth',
      category: newItemCategory,
      iconType: newItemIcon,
      colorTheme: newItemColor,
      orderCount: 1,
      lastOrderedAt: 'Just added',
      isCustom: true
    };

    onUpdateOrders([...orders, newItem]);
    setNewItemName('');
    setNewItemPhrase('');
    setNewItemSubtitle('');
    setShowAddForm(false);
    setSuccessMessage(`Added "${newItem.name}" to Wade's adaptive favorites!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDeleteItem = (id: string) => {
    onUpdateOrders(orders.filter(o => o.id !== id));
  };

  const renderIconEmoji = (type: string) => {
    switch (type) {
      case 'pudding': return '🍮';
      case 'rootbeer': return '🍺';
      case 'icecream': return '🍨';
      case 'juice': return '🍊';
      case 'water': return '💧';
      case 'pads': return '🩹';
      case 'rest': return '🌙';
      case 'snack': default: return '🥣';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              Gemini Adaptive Learning AI
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Auto-ranks Wade's Tap Targets
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Wade's Most Frequent Orders & Favorites
          </h3>
          <p className="text-sm text-slate-600 max-w-2xl">
            This list powers the quick large tap targets on Wade's patient view. His #1 favorite is <strong>Pudding</strong>, followed by <strong>Root Beer</strong> and <strong>Mint Chocolate Chip Ice Cream</strong>. Whenever he speaks an order or taps an item, its frequency rank dynamically updates!
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center gap-2 shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'Add New Favorite'}</span>
        </button>
      </div>

      {/* AI Role Explanation Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-amber-950">What the Adaptive AI Does: </span>
            <span className="text-amber-900">
              Passively observes every time Wade asks for or taps an item. It recalculates his highest-frequency desires and arranges his large-button tap targets in real time, keeping his top treats (Pudding, Root Beer, Mint Chip Ice Cream) front and center without requiring manual reordering.
            </span>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-2 font-bold text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Add New Custom Favorite Form */}
      {showAddForm && (
        <form onSubmit={handleAddNewItem} className="bg-slate-50 border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 animate-in fade-in">
          <h4 className="font-black text-lg text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" />
            Add a New Quick Favorite for Wade
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Item Name (Display on Card)
              </label>
              <input
                type="text"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                placeholder="e.g. Chocolate Chip Cookie"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Spoken Phrase (Voice Affirmation)
              </label>
              <input
                type="text"
                value={newItemPhrase}
                onChange={e => setNewItemPhrase(e.target.value)}
                placeholder="e.g. Can I have a warm cookie please?"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Subtitle Note
              </label>
              <input
                type="text"
                value={newItemSubtitle}
                onChange={e => setNewItemSubtitle(e.target.value)}
                placeholder="e.g. Fresh baked snack"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Category
              </label>
              <select
                value={newItemCategory}
                onChange={e => setNewItemCategory(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Treats/Dessert">Treats & Desserts</option>
                <option value="Hydration">Hydration & Drinks</option>
                <option value="Groceries">Groceries & Food</option>
                <option value="Medical/Pump Supplies">Medical / Pump Supplies</option>
                <option value="Rest/Comfort">Rest & Comfort</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Icon Type
              </label>
              <select
                value={newItemIcon}
                onChange={e => setNewItemIcon(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="pudding">🍮 Pudding</option>
                <option value="rootbeer">🍺 Root Beer</option>
                <option value="icecream">🍨 Ice Cream</option>
                <option value="juice">🍊 Low-Acid Juice</option>
                <option value="water">💧 Water / Electrolytes</option>
                <option value="pads">🩹 Pump Prep Pads</option>
                <option value="rest">🌙 Rest / Quiet</option>
                <option value="snack">🥣 General Snack / Food</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Color Theme
              </label>
              <select
                value={newItemColor}
                onChange={e => setNewItemColor(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="amber">Warm Amber</option>
                <option value="orange">Bright Orange</option>
                <option value="emerald">Mint Emerald</option>
                <option value="sky">Sky Blue</option>
                <option value="rose">Soft Rose</option>
                <option value="purple">Royal Purple</option>
                <option value="indigo">Classic Indigo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs"
            >
              Save Favorite
            </button>
          </div>
        </form>
      )}

      {/* Ranked Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h4 className="font-black text-lg text-slate-900">
              Live Frequency Rankings ({sortedOrders.length} Items)
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            Top 4 shown prominently in Wade Mode
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {sortedOrders.map((order, idx) => {
            const isTop3 = idx < 3;
            return (
              <div 
                key={order.id}
                className={`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                  idx < 4 ? 'bg-indigo-50/20' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank badge */}
                  <div className="flex flex-col items-center justify-center w-9 h-9 rounded-2xl bg-slate-100 font-black text-slate-700 text-sm shrink-0 border border-slate-200">
                    {idx + 1}
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                    {renderIconEmoji(order.iconType)}
                  </div>

                  {/* Info */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-slate-900">
                        {order.name}
                      </span>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                          🔥 #1 Top Favorite
                        </span>
                      )}
                      {idx === 1 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-100 text-orange-900 border border-orange-300">
                          ⭐ #2 Most Requested
                        </span>
                      )}
                      {idx === 2 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                          💚 #3 Favorite
                        </span>
                      )}
                      {idx < 4 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          Visible in Wade Top 4
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      "{order.spokenPhrase}"
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Category: {order.category}</span>
                      <span>•</span>
                      <span>Last Ordered: {order.lastOrderedAt || 'Never'}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Frequency Controls & Test Button */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      title="Decrease frequency count"
                      onClick={() => handleIncrement(order.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center shadow-2xs"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-black text-slate-900 min-w-[60px] text-center">
                      {order.orderCount} reqs
                    </span>
                    <button
                      type="button"
                      title="Increase frequency count"
                      onClick={() => handleIncrement(order.id, 1)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center shadow-2xs"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSmartCartModalItem({
                      id: `fav-${order.id}`,
                      name: order.name,
                      category: 'Groceries',
                      quantity: 1,
                      unit: 'pack',
                      urgency: 'Medium',
                      addedBy: 'Wade Favorites Tap',
                      dateAdded: 'Today',
                      purchased: false
                    })}
                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                    title="Compare pricing across Walmart+, Instacart+, Amazon Prime & Costco and stage to cart"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-amber-300" />
                    <span>Stage Cart</span>
                  </button>

                  <a
                    href={`https://www.walmart.com/search?q=${encodeURIComponent(order.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors flex items-center gap-1"
                    title={`Find ${order.name} on Walmart.com`}
                  >
                    <Store className="w-3.5 h-3.5 text-blue-600" />
                    <span className="hidden md:inline">Walmart+</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => onSimulateOrder(order)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                  >
                    Simulate Voice
                  </button>

                  {order.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(order.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete custom favorite"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Shopping Multi-Retailer Cart Modal */}
      <SmartShoppingDispatcherModal
        isOpen={!!smartCartModalItem}
        item={smartCartModalItem}
        onClose={() => setSmartCartModalItem(null)}
        onConfirmStaged={(itemId, retailer, cartUrl) => {
          setSuccessMessage(`Staged into ${retailer.toUpperCase()} Cart!`);
          setTimeout(() => setSuccessMessage(null), 3500);
        }}
      />
    </div>
  );
};
