import React, { useState } from 'react';
import { 
  Package, ShoppingCart, ShieldCheck, AlertTriangle, Plus, Check, 
  Trash2, Filter, Search, Cloud, RefreshCw, FileText, ArrowUpDown,
  Sparkles, ExternalLink, Copy, Download, Printer, Store, CheckCircle2,
  Layers, ArrowRight, Table, Folder, FileSpreadsheet, Share2, UploadCloud
} from 'lucide-react';
import { PantryItem, ShoppingItem, NeedsAuditLog } from '../types';

interface Props {
  pantryItems: PantryItem[];
  shoppingItems: ShoppingItem[];
  auditLogs: NeedsAuditLog[];
  onUpdatePantryQuantity: (id: string, newQty: number) => void;
  onToggleShoppingPurchased: (id: string) => void;
  onAddCustomPantryItem: (item: PantryItem) => void;
  onDeleteShoppingItem: (id: string) => void;
}

export const HouseholdPantryHub: React.FC<Props> = ({
  pantryItems,
  shoppingItems,
  auditLogs,
  onUpdatePantryQuantity,
  onToggleShoppingPurchased,
  onAddCustomPantryItem,
  onDeleteShoppingItem
}) => {
  const [activeTab, setActiveTab] = useState<'shopping' | 'spreadsheet' | 'crosscheck' | 'pantry' | 'audit'>('spreadsheet');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [copiedCsvSuccess, setCopiedCsvSuccess] = useState(false);
  const [restockedToast, setRestockedToast] = useState<string | null>(null);

  // Static shared items / editable cell state
  const [staticItems, setStaticItems] = useState<Array<{
    id: string;
    item: string;
    category: string;
    qty: string;
    aisle: string;
    walmartSku: string;
    notes: string;
    pantryCheck: string;
    checked: boolean;
  }>>([
    { id: '1', item: 'Tropicana Orange Juice (No Pulp)', category: 'Beverages', qty: '2 bottles (52 oz)', aisle: 'Aisle A4 (Dairy & Chilled)', walmartSku: 'WAL-OJ-5201', notes: 'Wade favorite (Smooth texture, high hydration)', pantryCheck: '2 in Kitchen Fridge', checked: false },
    { id: '2', item: 'A&W Root Beer (Caffeine Free)', category: 'Beverages', qty: '1 x 12-Pack Cans', aisle: 'Aisle A8 (Soda & Beverages)', walmartSku: 'WAL-RB-1204', notes: 'Wade staple for evening treats', pantryCheck: '6 cans in Pantry', checked: false },
    { id: '3', item: 'Vanilla Instant Pudding Cups (Snack Pack)', category: 'Dessert / Swallowing', qty: '2 x 4-Packs', aisle: 'Aisle B2 (Pudding / Snacks)', walmartSku: 'WAL-PUD-402', notes: 'Dysphagia safe, easy swallowing aid', pantryCheck: '1 cup remaining (LOW)', checked: false },
    { id: '4', item: 'Organic Whole Milk', category: 'Dairy', qty: '1 Gallon', aisle: 'Aisle A1 (Dairy Wall)', walmartSku: 'WAL-MLK-100', notes: 'Calorie support and morning breakfast', pantryCheck: '0 in stock (DEPLETED)', checked: false },
    { id: '5', item: 'Unsweetened Applesauce Pouches', category: 'Pantry Snack', qty: '1 x 12-Pack Box', aisle: 'Aisle B6 (Canned Fruit / Pouches)', walmartSku: 'WAL-APP-120', notes: 'Medication administration vehicle', pantryCheck: '4 pouches in cabinet', checked: false },
    { id: '6', item: 'Bounty Quick-Size Paper Towels', category: 'Household', qty: '1 x 6-Double Roll', aisle: 'Aisle H3 (Paper Goods)', walmartSku: 'WAL-PAP-600', notes: 'Sanitation & pump change area', pantryCheck: '2 rolls in linen closet', checked: false },
    { id: '7', item: 'Electrolyte Hydration Drink Mix (Liquid I.V.)', category: 'Health / Hydration', qty: '1 x 16-Stick Bag', aisle: 'Aisle G2 (Pharmacy / Wellness)', walmartSku: 'WAL-LIV-16', notes: 'Electrolyte balance to prevent dyskinesia fatigue', pantryCheck: '3 sticks left (REORDER)', checked: false },
    { id: '8', item: 'Alcohol Prep Sterile Pads (70% IPA)', category: 'Medical Supplies', qty: '2 x 100-ct Boxes', aisle: 'Aisle G5 (First Aid / Diabetes)', walmartSku: 'WAL-MED-200', notes: 'Continuous subcutaneous infusion site prep', pantryCheck: '1 box in medical cabinet', checked: false },
  ]);

  const [spreadsheetFolder, setSpreadsheetFolder] = useState('Google Drive > Wade Caregiver Shared Folder > Household Logistics');
  const [activeSheetTab, setActiveSheetTab] = useState<'sheet1' | 'inventory_master'>('sheet1');

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<PantryItem['category']>('Groceries');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('pack');
  const [newItemLocation, setNewItemLocation] = useState<PantryItem['location']>('Kitchen Pantry');

  const filteredPantry = pantryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredShopping = shoppingItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const unpurchasedItems = shoppingItems.filter(s => !s.purchased);

  // Helper to generate Walmart.com direct search / add URL
  const getWalmartSearchUrl = (query: string) => {
    return `https://www.walmart.com/search?q=${encodeURIComponent(query)}`;
  };

  // Helper to find corresponding pantry match
  const findPantryMatch = (itemName: string) => {
    const lower = itemName.toLowerCase();
    return pantryItems.find(p => 
      p.name.toLowerCase().includes(lower) || 
      lower.includes(p.name.toLowerCase()) ||
      (lower.includes('root beer') && p.name.toLowerCase().includes('root beer')) ||
      (lower.includes('pudding') && p.name.toLowerCase().includes('pudding')) ||
      (lower.includes('juice') && p.name.toLowerCase().includes('juice')) ||
      (lower.includes('ice cream') && p.name.toLowerCase().includes('ice cream'))
    );
  };

  // 1-Click Restock from Shopping List into Pantry
  const handleRestockToPantry = (shoppingItem: ShoppingItem) => {
    const match = findPantryMatch(shoppingItem.name);
    if (match) {
      onUpdatePantryQuantity(match.id, match.quantity + shoppingItem.quantity);
      if (!shoppingItem.purchased) {
        onToggleShoppingPurchased(shoppingItem.id);
      }
      setRestockedToast(`Restocked ${shoppingItem.name} (+${shoppingItem.quantity} ${shoppingItem.unit}) to ${match.location}!`);
    } else {
      // Create new pantry item
      onAddCustomPantryItem({
        id: `p-${Date.now()}`,
        name: shoppingItem.name,
        category: shoppingItem.category,
        quantity: shoppingItem.quantity,
        unit: shoppingItem.unit,
        location: 'Kitchen Pantry',
        inStock: true,
        minThreshold: 1,
        lastUpdated: 'Just now'
      });
      if (!shoppingItem.purchased) {
        onToggleShoppingPurchased(shoppingItem.id);
      }
      setRestockedToast(`Added and restocked ${shoppingItem.name} to Kitchen Pantry!`);
    }
    setTimeout(() => setRestockedToast(null), 3500);
  };

  const handleCopyCsvSpreadsheet = () => {
    let csv = `Item Name,Category,Quantity / Size,Store Aisle / Department,Walmart SKU / Search,Pantry Stock Match,Notes\n`;
    staticItems.forEach(row => {
      csv += `"${row.item}","${row.category}","${row.qty}","${row.aisle}","${row.walmartSku}","${row.pantryCheck}","${row.notes}"\n`;
    });
    navigator.clipboard.writeText(csv);
    setCopiedCsvSuccess(true);
    setTimeout(() => setCopiedCsvSuccess(false), 3000);
  };

  const handleDownloadCsv = () => {
    let csv = `Item Name,Category,Quantity / Size,Store Aisle / Department,Walmart SKU / Search,Pantry Stock Match,Notes\n`;
    staticItems.forEach(row => {
      csv += `"${row.item}","${row.category}","${row.qty}","${row.aisle}","${row.walmartSku}","${row.pantryCheck}","${row.notes}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Household-Shopping-Master-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreatePantryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    onAddCustomPantryItem({
      id: `p-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: newItemQty,
      unit: newItemUnit,
      location: newItemLocation,
      inStock: newItemQty > 0,
      minThreshold: 1,
      lastUpdated: 'Just now'
    });

    setNewItemName('');
    setNewItemQty(1);
    setShowAddItemModal(false);
  };

  const suppressedCount = auditLogs.filter(l => l.status === 'SUPPRESSED_DUPLICATE').length;

  return (
    <div id="household-pantry-hub-container" className="space-y-6">
      {/* Toast notification */}
      {restockedToast && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>{restockedToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setRestockedToast(null)}
            className="text-xs text-emerald-100 hover:text-white underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Cloud Sync Telemetry */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Package className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-serif">
                Household Inventory, Shopping & Pantry Hub
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Synchronized household pantry levels, 1-click Walmart.com shopping lists, Google Doc exports, and Gemini deduplication audit trails.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Gemini Deduplication AI</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full border border-sky-200">
              <Cloud className="w-3.5 h-3.5" />
              <span>Drive / Cloud Synced</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{suppressedCount} Duplicate Orders Prevented</span>
            </div>
          </div>
        </div>

        {/* AI Role Explanation Banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-indigo-900">What the Pantry AI Does: </span>
              <span className="text-indigo-800">
                When Wade asks for items (e.g. orange juice, root beer, pudding), Gemini cross-references household stock in real time. If already stocked, it reassures Wade warmly while suppressing duplicate purchases. If low or missing, it automatically updates your shared shopping list and master inventory spreadsheet.
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            id="tab-spreadsheet-btn"
            onClick={() => setActiveTab('spreadsheet')}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'spreadsheet'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Shared Excel Sheet</span>
          </button>

          <button
            type="button"
            id="tab-shopping-queue-btn"
            onClick={() => setActiveTab('shopping')}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'shopping'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Shopping List ({unpurchasedItems.length})</span>
          </button>

          <button
            type="button"
            id="tab-crosscheck-btn"
            onClick={() => setActiveTab('crosscheck')}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'crosscheck'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Pantry Cross-Check</span>
          </button>

          <button
            type="button"
            id="tab-pantry-inventory-btn"
            onClick={() => setActiveTab('pantry')}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'pantry'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Pantry Stock ({pantryItems.length})</span>
          </button>

          <button
            type="button"
            id="tab-dedup-audit-btn"
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}

      {/* 0. SHARED EXCEL SPREADSHEET IN FOLDER VIEW */}
      {activeTab === 'spreadsheet' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Top Folder Breadcrumb & Cloud Sync Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <Folder className="w-3.5 h-3.5 text-amber-400" />
                  <span>{spreadsheetFolder}</span>
                </div>
                <h3 className="text-sm md:text-base font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                  <span>Wade_Household_Shopping_Master.xlsx</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Live Shared Cloud File
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCsvSpreadsheet}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
                title="Copy spreadsheet table as CSV"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>{copiedCsvSuccess ? 'Copied CSV!' : 'Copy Table'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCsv}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                title="Download as Excel-compatible .csv"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .xlsx / .csv</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    setRestockedToast('Shareable link copied to clipboard!');
                    setTimeout(() => setRestockedToast(null), 3000);
                  }
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Link</span>
              </button>
            </div>
          </div>

          {/* Spreadsheet Header / Info Callout */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-emerald-950 block">Static Shared Shopping Sheet with Real-Time Pantry Cross-Referencing:</span>
                <span className="text-emerald-800">
                  This workbook resides in your shared Caregiver Drive folder. Anyone with access (family members, visiting nurses, grocery shoppers) can check off items, view store aisles, cross-check pantry reserves, and tap direct Walmart search links.
                </span>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="px-2.5 py-1 bg-white rounded-lg border border-emerald-200 text-[11px] font-bold text-emerald-800">
                {staticItems.filter(i => !i.checked).length} items remaining
              </span>
            </div>
          </div>

          {/* Excel Workbook Grid */}
          <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-xs bg-white">
            {/* Excel Formula & Sheet Bar */}
            <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs text-slate-600 font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-300">fx</span>
                <span className="text-slate-500 truncate max-w-md">
                  =VLOOKUP(Item_Name, Wade_Pantry_Inventory!A:D, 3, FALSE)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Auto-saved to Drive</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px] tracking-wider select-none">
                    <th className="py-2.5 px-3 border-r border-slate-200 w-12 text-center">Row</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 w-10 text-center">Done</th>
                    <th className="py-2.5 px-4 border-r border-slate-200 min-w-[200px]">A: Item Description</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 min-w-[120px]">B: Category</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 min-w-[130px]">C: Quantity / Size</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 min-w-[170px]">D: Store Aisle / Dept</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 min-w-[160px]">E: Pantry Status Match</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 min-w-[140px]">F: Walmart Direct</th>
                    <th className="py-2.5 px-4 min-w-[220px]">G: Caregiver Clinical Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {staticItems.map((row, idx) => (
                    <tr 
                      key={row.id} 
                      className={`hover:bg-amber-50/40 transition-colors ${
                        row.checked ? 'bg-slate-50 opacity-60' : (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30')
                      }`}
                    >
                      {/* Row Number */}
                      <td className="py-2.5 px-3 border-r border-slate-200 text-center text-slate-400 select-none bg-slate-50/70 font-semibold">
                        {idx + 1}
                      </td>

                      {/* Done Checkbox */}
                      <td className="py-2.5 px-3 border-r border-slate-200 text-center">
                        <input
                          type="checkbox"
                          checked={row.checked}
                          onChange={() => {
                            setStaticItems(prev => prev.map(item => 
                              item.id === row.id ? { ...item, checked: !item.checked } : item
                            ));
                          }}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* Item Name */}
                      <td className="py-2.5 px-4 border-r border-slate-200 font-sans font-bold text-slate-900">
                        <span className={row.checked ? 'line-through text-slate-400' : ''}>
                          {row.item}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3 border-r border-slate-200 font-sans">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {row.category}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="py-2.5 px-3 border-r border-slate-200 text-slate-900 font-semibold">
                        {row.qty}
                      </td>

                      {/* Aisle */}
                      <td className="py-2.5 px-3 border-r border-slate-200 text-slate-600 font-sans">
                        <span className="font-semibold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-100">
                          {row.aisle}
                        </span>
                      </td>

                      {/* Pantry Status Match */}
                      <td className="py-2.5 px-3 border-r border-slate-200 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          row.pantryCheck.includes('DEPLETED') || row.pantryCheck.includes('0')
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : row.pantryCheck.includes('LOW') || row.pantryCheck.includes('REORDER')
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {row.pantryCheck}
                        </span>
                      </td>

                      {/* Walmart Direct Link */}
                      <td className="py-2.5 px-3 border-r border-slate-200 font-sans">
                        <a
                          href={getWalmartSearchUrl(row.item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-[10px] inline-flex items-center gap-1 border border-blue-200 transition-colors"
                        >
                          <Store className="w-3 h-3 text-blue-600" />
                          <span>Walmart Link</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </td>

                      {/* Clinical Notes */}
                      <td className="py-2.5 px-4 font-sans text-slate-600 text-[11px]">
                        {row.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Excel Sheet Tabs at Bottom */}
            <div className="bg-slate-100 border-t border-slate-300 px-3 py-1.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveSheetTab('sheet1')}
                  className={`px-3 py-1 rounded-t font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                    activeSheetTab === 'sheet1'
                      ? 'bg-white text-emerald-900 border-t-2 border-emerald-600 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Master Shopping List (Static)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSheetTab('inventory_master')}
                  className={`px-3 py-1 rounded-t font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                    activeSheetTab === 'inventory_master'
                      ? 'bg-white text-emerald-900 border-t-2 border-emerald-600 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Pantry Threshold Matrix</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-mono">
                Sheet 1 of 2 • 8 rows loaded
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. SHOPPING LIST TAB */}
      {activeTab === 'shopping' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-black text-slate-900">Master Caregiver Shopping Queue</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Items automatically routed here when Wade requests unstocked staples, or added by caregiver.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">
                {unpurchasedItems.length} Items Queued
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredShopping.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No items currently queued for purchase.
              </div>
            ) : (
              filteredShopping.map((item) => {
                const match = findPantryMatch(item.name);
                return (
                  <div
                    key={item.id}
                    id={`shopping-item-${item.id}`}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      item.purchased
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200/90 hover:border-indigo-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onToggleShoppingPurchased(item.id)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
                          item.purchased
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white hover:border-slate-400 text-transparent'
                        }`}
                        title="Mark purchased"
                      >
                        {item.purchased && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold ${item.purchased ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {item.name}
                          </h4>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            item.urgency === 'High' || item.urgency === 'Immediate'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {item.urgency}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <span className="font-bold text-slate-700">{item.quantity} {item.unit}</span>
                          <span>•</span>
                          <span>{item.category}</span>
                          <span>•</span>
                          {match ? (
                            <span className="text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              Pantry: {match.quantity} {match.unit} ({match.location})
                            </span>
                          ) : (
                            <span className="text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                              Pantry: 0 in stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {/* Direct Walmart Link */}
                      <a
                        href={getWalmartSearchUrl(item.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors"
                        title="Find on Walmart.com"
                      >
                        <Store className="w-3.5 h-3.5 text-blue-600" />
                        <span>Walmart.com</span>
                        <ExternalLink className="w-3 h-3 text-blue-500" />
                      </a>

                      {/* 1-Click Restock to Pantry */}
                      <button
                        type="button"
                        onClick={() => handleRestockToPantry(item)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-colors"
                        title="Restock this item directly into pantry inventory"
                      >
                        <Package className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Restock</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteShoppingItem(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 2. PANTRY CROSS-CHECK TAB */}
      {activeTab === 'crosscheck' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-black text-slate-900">
                  Pantry Inventory vs Shopping List Cross-Check
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically compares what you plan to buy against actual pantry quantities to avoid over-purchasing and reconcile inventory.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-indigo-50 text-indigo-800 rounded-xl text-xs font-bold border border-indigo-200">
                Live Inventory Reconciled
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 rounded-l-xl">Item Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Shopping Queue</th>
                  <th className="py-3 px-3">Pantry Stock</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Walmart Direct</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shoppingItems.map((item) => {
                  const match = findPantryMatch(item.name);
                  const isStocked = match && match.quantity > 0;
                  const isLow = match && match.quantity <= match.minThreshold;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-indigo-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3.5 px-3">
                        {match ? (
                          <div>
                            <span className="font-bold text-slate-900">{match.quantity} {match.unit}</span>
                            <span className="text-[10px] text-slate-400 block">{match.location}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not in pantry</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {!isStocked ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                            Out of Stock (0)
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                            Low ({match?.quantity})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Stocked ({match?.quantity})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <a
                          href={getWalmartSearchUrl(item.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 text-[11px]"
                        >
                          <span>Walmart Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleRestockToPantry(item)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          <Package className="w-3 h-3" />
                          <span>Restock Pantry</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PANTRY STOCK INVENTORY TAB */}
      {activeTab === 'pantry' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search pantry items or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Categories</option>
                <option value="Groceries">Groceries</option>
                <option value="Hydration">Hydration</option>
                <option value="Medical/Pump Supplies">Medical/Pump Supplies</option>
                <option value="Household">Household</option>
                <option value="Personal Care">Personal Care</option>
              </select>

              <button
                type="button"
                onClick={() => setShowAddItemModal(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Pantry Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPantry.map((item) => (
              <div
                key={item.id}
                id={`pantry-card-${item.id}`}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {item.location}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1">{item.name}</h3>
                  {item.notes && (
                    <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
                      {item.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900">
                      {item.quantity} {item.unit}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Min: {item.minThreshold}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={getWalmartSearchUrl(item.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Search on Walmart.com"
                    >
                      <Store className="w-4 h-4" />
                    </a>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onUpdatePantryQuantity(item.id, Math.max(0, item.quantity - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-sm flex items-center justify-center"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdatePantryQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-sm flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. AUDIT LOG TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="mb-2">
            <h3 className="text-base font-bold text-slate-900">Agent Deduplication Audit Logs</h3>
            <p className="text-xs text-slate-500">
              Live telemetry tracking verbal inputs, duplicate item suppression, and persona vocal feedback.
            </p>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                id={`audit-entry-${log.id}`}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 transition-all text-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{log.extractedItemName}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      log.status === 'SUPPRESSED_DUPLICATE'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {log.status}
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-slate-400">{log.timestamp}</span>
                </div>

                <div className="space-y-1.5 text-slate-600">
                  <p><strong className="text-slate-700">Raw Input:</strong> "{log.rawInput}"</p>
                  <p><strong className="text-slate-700">Reasoning:</strong> {log.reasoning}</p>
                  <p className="italic text-indigo-900 bg-indigo-50/60 p-2 rounded-lg border border-indigo-100">
                    <strong>Persona Vocal Response:</strong> "{log.reassuranceText}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simple Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Item to Pantry</h3>
            <form onSubmit={handleCreatePantryItem} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Boost Glucose Control Shakes"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e: any) => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Hydration">Hydration</option>
                    <option value="Medical/Pump Supplies">Medical/Pump Supplies</option>
                    <option value="Household">Household</option>
                    <option value="Personal Care">Personal Care</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Location</label>
                  <select
                    value={newItemLocation}
                    onChange={(e: any) => setNewItemLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="Kitchen Pantry">Kitchen Pantry</option>
                    <option value="Refrigerator">Refrigerator</option>
                    <option value="Medicine Cabinet">Medicine Cabinet</option>
                    <option value="Supply Closet">Supply Closet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  >
                  </input>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Unit</label>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="cartons, pads, packs"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

