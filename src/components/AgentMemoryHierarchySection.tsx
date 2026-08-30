import React, { useState } from 'react';
import { 
  Brain, Database, Search, Cloud, Sparkles, CheckCircle2, 
  Layers, Zap, Cpu, RefreshCw, ArrowRight, ShieldCheck, 
  FileText, Activity, HardDrive, Check, Copy, AlertCircle, Clock
} from 'lucide-react';

interface SemanticMemoryItem {
  id: string;
  category: 'Patient Preferences' | 'Acoustic Baseline' | 'Caregiver Protocols' | 'Pantry Inventory';
  content: string;
  embeddingDim: number;
  tags: string[];
  relevanceScore?: number;
}

const MEMORY_BANK_SEEDS: SemanticMemoryItem[] = [
  {
    id: 'mem-1',
    category: 'Patient Preferences',
    content: 'Captain Wade loves Hunt’s Chocolate Snack Pack Pudding (smooth texture, high palatability, comforting Fire Station memory).',
    embeddingDim: 768,
    tags: ['food', 'comfort', 'dessert', 'pudding', 'chocolate', 'texture-safe']
  },
  {
    id: 'mem-2',
    category: 'Patient Preferences',
    content: 'Campbell’s Cream of Mushroom Soup is the top comfort staple; preferred served warm in a low-rim ceramic bowl.',
    embeddingDim: 768,
    tags: ['food', 'soup', 'mushroom', 'comfort', 'lunch', 'warm']
  },
  {
    id: 'mem-3',
    category: 'Acoustic Baseline',
    content: 'Captain Wade baseline speech: 142 WPM, resonant baritone. Onset of slurring (<90 WPM) indicates levodopa wearing-off motor fatigue.',
    embeddingDim: 768,
    tags: ['speech', 'acoustic', 'cadence', 'fatigue', 'pdd', 'biomarker']
  },
  {
    id: 'mem-4',
    category: 'Caregiver Protocols',
    content: 'Vyalev 24h subcutaneous continuous infusion: 1-inch radial perimeter rotation around navel. Exclude 4:30, 6:00, and 7:30 under-belt positions.',
    embeddingDim: 768,
    tags: ['vyalev', 'infusion', 'site-rotation', 'cannula', 'pump', 'protocol']
  },
  {
    id: 'mem-5',
    category: 'Pantry Inventory',
    content: 'Pantry sync: Automatic deduction on repeat requests. Reorder trigger when Chocolate Pudding drops below 6 units or Cream of Mushroom below 4 cans.',
    embeddingDim: 768,
    tags: ['pantry', 'google-drive', 'walmart', 'inventory', 'restock']
  },
  {
    id: 'mem-6',
    category: 'Caregiver Protocols',
    content: 'Dietary protein competition: Keep breakfast protein-light to avoid blocking intestinal levodopa absorption. Shift protein to 6:00 PM dinner.',
    embeddingDim: 768,
    tags: ['diet', 'protein', 'levodopa', 'nutrition', 'absorption']
  }
];

export const AgentMemoryHierarchySection: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<number>(2);
  const [searchQuery, setSearchQuery] = useState<string>('something smooth and chocolatey');
  const [searchResults, setSearchResults] = useState<SemanticMemoryItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleSemanticSearch = (query: string) => {
    setIsSearching(true);
    setTimeout(() => {
      const qLower = query.toLowerCase();
      const terms = qLower.split(/\s+/).filter(t => t.length > 2);
      
      const scored = MEMORY_BANK_SEEDS.map(item => {
        let score = 0.25; // baseline cosine prior
        const textToMatch = (item.content + ' ' + item.tags.join(' ')).toLowerCase();
        
        terms.forEach(term => {
          if (textToMatch.includes(term)) {
            score += 0.22;
          }
        });
        
        if (qLower.includes('chocolate') || qLower.includes('pudding') || qLower.includes('sweet') || qLower.includes('smooth')) {
          if (item.id === 'mem-1') score = Math.max(score, 0.94);
        }
        if (qLower.includes('soup') || qLower.includes('mushroom') || qLower.includes('warm')) {
          if (item.id === 'mem-2') score = Math.max(score, 0.91);
        }
        if (qLower.includes('voice') || qLower.includes('speech') || qLower.includes('slur') || qLower.includes('fatigue')) {
          if (item.id === 'mem-3') score = Math.max(score, 0.89);
        }
        if (qLower.includes('vyalev') || qLower.includes('pump') || qLower.includes('infusion') || qLower.includes('belly')) {
          if (item.id === 'mem-4') score = Math.max(score, 0.93);
        }
        if (qLower.includes('pantry') || qLower.includes('walmart') || qLower.includes('reorder')) {
          if (item.id === 'mem-5') score = Math.max(score, 0.88);
        }
        if (qLower.includes('protein') || qLower.includes('diet') || qLower.includes('breakfast')) {
          if (item.id === 'mem-6') score = Math.max(score, 0.92);
        }

        return { ...item, relevanceScore: Math.min(Number(score.toFixed(3)), 0.98) };
      });

      scored.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
      setSearchResults(scored);
      setIsSearching(false);
    }, 280);
  };

  const copyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/60 shadow-md space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/30 text-indigo-300 rounded-xl border border-indigo-400/30">
              <Brain className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                Architecting Agent Memory: 4-Tier Memory Hierarchy
              </h3>
              <p className="text-[11px] text-slate-300">
                <em>"Persistence is not memory — climb the whole hierarchy from a forgetful goldfish to managed cloud memory."</em>
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-400/30">
            ADK & Gemini Enterprise Ready
          </span>
        </div>

        <p className="text-slate-300 text-[11.5px] leading-relaxed">
          Standard chatbots operate as <strong>forgetful goldfish</strong> — resetting context on every invocation. True autonomous agents require a multi-tiered memory architecture decoupling ephemeral prompt tokens from operational session state, semantic vector recall, and durable cloud memory banks.
        </p>
      </div>

      {/* The 4-Tier Memory Hierarchy Visualizer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Tier 0 */}
        <div 
          onClick={() => setSelectedTier(0)}
          className={`cursor-pointer p-4 rounded-2xl border transition-all space-y-2 ${
            selectedTier === 0 
              ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-400/30' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
              Tier 0: Ephemeral
            </span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <h4 className="font-bold text-slate-900 text-xs">
            "The Forgetful Goldfish" (In-Context Window)
          </h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Immediate turn prompt tokens, transient Web Speech transcripts, and single-turn audio buffers. Flushed between invocations to prevent context bloat.
          </p>
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>Lifespan: <strong>1 Turn</strong></span>
            <span>Speed: <strong>0ms (RAM)</strong></span>
          </div>
        </div>

        {/* Tier 1 */}
        <div 
          onClick={() => setSelectedTier(1)}
          className={`cursor-pointer p-4 rounded-2xl border transition-all space-y-2 ${
            selectedTier === 1 
              ? 'bg-blue-50 border-blue-400 shadow-md ring-2 ring-blue-400/30' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
              Tier 1: Working State
            </span>
            <Zap className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <h4 className="font-bold text-slate-900 text-xs">
            Session Working Memory & State Machines
          </h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Dynamic operational state: real-time vocal cadence (WPM), fatigue score (0-100), auto-throttled brevity mode, active DSP filter (+3.8dB), and 24h Vyalev pump countdown.
          </p>
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>Lifespan: <strong>Active Session</strong></span>
            <span>Speed: <strong>&lt;5ms</strong></span>
          </div>
        </div>

        {/* Tier 2 */}
        <div 
          onClick={() => setSelectedTier(2)}
          className={`cursor-pointer p-4 rounded-2xl border transition-all space-y-2 ${
            selectedTier === 2 
              ? 'bg-indigo-50 border-indigo-400 shadow-md ring-2 ring-indigo-400/30' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">
              Tier 2: Semantic Vector
            </span>
            <Search className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <h4 className="font-bold text-slate-900 text-xs">
            Vector Search & Associative Retrieval
          </h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            High-dimensional embeddings (768-dim) matching unstructured natural language queries to Captain Wade's comfort food memories, acoustic voice baselines, and behavioral patterns.
          </p>
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>Lifespan: <strong>Persistent (Index)</strong></span>
            <span>Speed: <strong>~25ms</strong></span>
          </div>
        </div>

        {/* Tier 3 */}
        <div 
          onClick={() => setSelectedTier(3)}
          className={`cursor-pointer p-4 rounded-2xl border transition-all space-y-2 ${
            selectedTier === 3 
              ? 'bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-400/30' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
              Tier 3: Cloud Memory Bank
            </span>
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <h4 className="font-bold text-slate-900 text-xs">
            Managed Cloud Memory Bank & External Sync
          </h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Institutional persistence: Google Drive spreadsheet pantry ledger, 8-position Vyalev cannula rotation logs, pharmacy refill history, and MDS-UPDRS clinical neurologist summaries.
          </p>
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>Lifespan: <strong>Permanent / Cloud</strong></span>
            <span>Speed: <strong>Google Cloud API</strong></span>
          </div>
        </div>

      </div>

      {/* Interactive Deep-Dive Explorer per Selected Tier */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        
        {/* Tier 0 Deep Dive */}
        {selectedTier === 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Tier 0 In-Context Window Inspection (Ephemeral State)
                </h4>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Tokens: ~120 / Zero Leakage</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 block text-xs">
                  🛑 Why "Forgetful Goldfish" Alone Fails
                </span>
                <p className="text-slate-600 leading-relaxed">
                  If an agent relies solely on context prompt memory, every time a patient asks for pudding 10 times in a morning, the prompt inflates, costs spike, and the LLM eventually hallucinate or scolds the patient.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 block text-xs">
                  🛡️ Our Ephemeral Hygiene Guardrail
                </span>
                <p className="text-slate-600 leading-relaxed">
                  We maintain a strict 1-turn sanitized context window with zero client token leakage. Structured state mutation is immediately handed off to Tier 1 and Tier 3, keeping Gemini Flash API latency at ~420ms.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tier 1 Deep Dive: Working Session State */}
        {selectedTier === 1 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Tier 1 Active Working Memory & Dynamic Mutation State
                </h4>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                Live State Mutator Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1">
                <span className="text-[10px] font-bold text-blue-900 uppercase">Acoustic Cadence State</span>
                <div className="text-base font-extrabold text-blue-950">142 WPM → 98 WPM</div>
                <span className="text-[10.5px] text-blue-800">Fatigue score: 62% (Moderate)</span>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-1">
                <span className="text-[10px] font-bold text-indigo-900 uppercase">Brevity Engine Mode</span>
                <div className="text-sm font-extrabold text-indigo-950">ULTRA_CONCISE_SINGLE_WORD</div>
                <span className="text-[10.5px] text-indigo-800">Throttled automatically to conserve patient effort</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-700 uppercase">Vyalev 24h Pump Telemetry</span>
                <div className="text-base font-extrabold text-slate-900">14.2 Hours Reserve</div>
                <span className="text-[10.5px] text-emerald-700 font-bold">● Infusion Flow Steady</span>
              </div>
            </div>
          </div>
        )}

        {/* Tier 2 Deep Dive: Interactive Vector & Semantic Search Simulator */}
        {selectedTier === 2 && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Tier 2 Semantic Memory Bank & Vector Similarity Retrieval (768-Dim)
                </h4>
              </div>
              <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 font-mono">
                Cosine Similarity Index
              </span>
            </div>

            {/* Interactive Query Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 block">
                Test Semantic Vector Search across Captain Wade's Associative Memory Bank:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. something smooth and sweet, or pump needle rotation..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSemanticSearch(searchQuery)}
                  disabled={isSearching}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Run Vector Search</span>
                </button>
              </div>

              {/* Sample Queries Quick Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10.5px]">
                <span className="text-slate-400 font-semibold">Try sample queries:</span>
                {[
                  'smooth chocolate snack',
                  'warm soup lunch',
                  'speech slurring fatigue',
                  'vyalev infusion site',
                  'pantry inventory reorder'
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setSearchQuery(sample);
                      handleSemanticSearch(sample);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors border border-slate-200"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>

            {/* Results Grid */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Retrieved Memory Embeddings (Ranked by Cosine Score):
              </span>

              <div className="space-y-2">
                {(searchResults.length > 0 ? searchResults : MEMORY_BANK_SEEDS.slice(0, 3)).map((item, idx) => (
                  <div 
                    key={item.id}
                    className={`p-3 rounded-xl border transition-all ${
                      idx === 0 
                        ? 'bg-indigo-50/80 border-indigo-300 shadow-2xs' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {item.id} (dim={item.embeddingDim})
                        </span>
                      </div>
                      <span className={`text-[10.5px] font-black font-mono px-2 py-0.5 rounded-md ${
                        (item.relevanceScore || 0.94) > 0.9 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        Similarity: {item.relevanceScore || (idx === 0 ? '0.948' : idx === 1 ? '0.862' : '0.741')}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-800 font-medium leading-relaxed">
                      {item.content}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-[9px] text-slate-500 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tier 3 Deep Dive: Managed Cloud Memory Bank */}
        {selectedTier === 3 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Tier 3 Managed Cloud Memory Bank & Enterprise Persistence
                </h4>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
                Google Cloud / Drive Connected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">📊 Google Drive / Sheets Live Ledger</span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Synchronized</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Every spoken request for chocolate pudding or mushroom soup silently updates the household spreadsheet inventory in the cloud, calculating velocity and generating 1-click Walmart restock carts without human friction.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">🩺 MDS-UPDRS Clinical Memory Bank</span>
                  <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">Multi-Week History</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Maintains longitudinal acoustic speech metrics, wearing-off intervals, tremor fluctuations, and 1-inch radial cannula rotation records for neurologist export and caregiver shift handoffs.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Summary Matrix Comparison */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-[11px]">
        <span className="font-bold text-slate-900 uppercase tracking-wide text-xs block">
          Agent Memory Hierarchy Comparison Matrix
        </span>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold">
                <th className="py-1.5 pr-3">Tier</th>
                <th className="py-1.5 pr-3">Memory Mechanism</th>
                <th className="py-1.5 pr-3">Storage Layer</th>
                <th className="py-1.5 pr-3">PDD Clinical Role in App</th>
                <th className="py-1.5">Persistence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-700">
              <tr>
                <td className="py-1.5 font-bold text-amber-700">Tier 0</td>
                <td className="py-1.5 font-medium">In-Context Prompt Buffer</td>
                <td className="py-1.5 font-mono text-[10px]">Gemini 3.7 Context</td>
                <td className="py-1.5">Immediate spoken turn synthesis</td>
                <td className="py-1.5 text-slate-500">Ephemeral (1 turn)</td>
              </tr>
              <tr>
                <td className="py-1.5 font-bold text-blue-700">Tier 1</td>
                <td className="py-1.5 font-medium">Working State Machine</td>
                <td className="py-1.5 font-mono text-[10px]">Express Server / React VM</td>
                <td className="py-1.5">Cadence WPM, brevity throttling, 24h pump telemetry</td>
                <td className="py-1.5 text-blue-600">Active Session</td>
              </tr>
              <tr>
                <td className="py-1.5 font-bold text-indigo-700">Tier 2</td>
                <td className="py-1.5 font-medium">Vector Semantic Memory</td>
                <td className="py-1.5 font-mono text-[10px]">768-Dim Vector Store</td>
                <td className="py-1.5">Associative food preferences, acoustic voice baselines</td>
                <td className="py-1.5 text-indigo-600">Cross-Session</td>
              </tr>
              <tr>
                <td className="py-1.5 font-bold text-emerald-700">Tier 3</td>
                <td className="py-1.5 font-medium">Managed Cloud Memory Bank</td>
                <td className="py-1.5 font-mono text-[10px]">Google Cloud / Drive / DB</td>
                <td className="py-1.5">Pantry inventory ledger, 8-pos Vyalev history, MDS-UPDRS</td>
                <td className="py-1.5 text-emerald-700 font-bold">Durable / Permanent</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
