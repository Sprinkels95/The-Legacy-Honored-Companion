import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, Server, Cpu, Cloud, CheckCircle2, Code2, 
  Sparkles, Award, Layers, Globe, FileCode2, Brain, Zap,
  Activity, BookOpen, Clock, HeartPulse, DollarSign, TrendingDown,
  Video, Copy, Check, ExternalLink, HelpCircle, Terminal, Database
} from 'lucide-react';
import { TokenEfficiencySection } from './TokenEfficiencySection';
import { AgentMemoryHierarchySection } from './AgentMemoryHierarchySection';
import { SecurityArchitectureSection } from './SecurityArchitectureSection';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'overview' | 'security' | 'efficiency' | 'memory' | 'protocols';
  onOpenResearch?: () => void;
}

export const HackathonArchitectureModal: React.FC<Props> = ({ 
  isOpen, 
  onClose,
  initialTab = 'overview',
  onOpenResearch
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'efficiency' | 'memory'>(
    initialTab === 'protocols' || (initialTab as string) === 'research' ? 'overview' : (initialTab as any)
  );

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab === 'protocols' || (initialTab as string) === 'research' ? 'overview' : (initialTab as any));
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-4xl w-full shadow-2xl border border-slate-200 my-6 max-h-[92vh] flex flex-col justify-between">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500 text-white rounded-xl shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 font-serif">
                  Technical Specifications & System Architecture
                </h2>
                <p className="text-[11px] text-slate-500">
                  "The Legacy Honored Companion" — Multimodal Multi-Agent Architecture & Compute Infrastructure
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            id="close-hackathon-specs-modal"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher Header */}
        <div className="flex items-center justify-between py-2.5 border-b border-slate-100 gap-2 shrink-0">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Architecture & 10 Agents</span>
            </button>

            <button
              type="button"
              id="security-specs-tab-btn"
              onClick={() => setActiveTab('security')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'security'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>🛡️ HIPAA & Security</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('efficiency')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'efficiency'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>⚡ Token & Compute Efficiency</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('memory')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'memory'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 bg-purple-50/70 hover:bg-purple-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>🧠 4-Tier Memory Bank</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="space-y-6 my-4 text-xs text-slate-700 overflow-y-auto pr-1 flex-1">
          
          {/* TAB 1: OVERVIEW & ARCHITECTURE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Pitch & Hackathon Formula Spotlight */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-indigo-50 to-slate-50 border border-amber-200/80 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                    The Hackathon Formula: Specific Origin + Universal Architecture
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
                  <div className="p-3 bg-white rounded-xl border border-amber-100 space-y-1">
                    <span className="font-bold text-indigo-950 block text-[11px]">
                      1. The Hook: Captain Wade as Case Study #1 (Proof of Concept)
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Proves the system was built for a real human with nuanced needs (fire captain heritage, mid-century cultural anchors, zero-friction voice offloading) rather than an abstract persona.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-indigo-100 space-y-1">
                    <span className="font-bold text-indigo-950 block text-[11px]">
                      2. The Scale: The Legacy Honored Persona Engine
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      The underlying technology is a flexible personalization engine combining a <strong>Core Cognitive Offloading Engine</strong> with an <strong>Adaptive Layer</strong> that configures any life history in seconds (e.g. 1970s Motown, Retired Teacher).
                    </p>
                  </div>
                </div>
              </div>

              {/* Tech Stack Compliance Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    <span className="font-extrabold text-indigo-950">1. AI Model</span>
                  </div>
                  <p className="text-indigo-900 font-semibold">Gemini 3.7 Flash</p>
                  <p className="text-[11px] text-indigo-700 mt-0.5">Configured via @google/genai SDK on server-side</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold text-emerald-950">2. Agent Framework</span>
                  </div>
                  <p className="text-emerald-900 font-semibold">Google GenAI SDK</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Structured responseSchema & multi-agent prompt orchestration</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Cloud className="w-4 h-4 text-sky-600" />
                    <span className="font-extrabold text-sky-950">3. Google Cloud</span>
                  </div>
                  <p className="text-sky-900 font-semibold">Cloud Run Container</p>
                  <p className="text-[11px] text-sky-700 mt-0.5">Full-stack Express + Vite architecture on port 3000</p>
                </div>
              </div>

              {/* Comprehensive Agent Matrix (10 Autonomous Agents) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                      Autonomous Multi-Agent Systems & Subsystem Structures
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    10 Specialized Agents
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Agent 1 */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        1. Legacy Honored Persona Engine
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                        Adaptive Tone
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong>Trigger:</strong> User voice input or persona toggle.<br/>
                      <strong>Mechanism:</strong> Decouples core cognitive logic from custom persona prompts (Ward Cleaver, Dr. Evil / Mini-Me, Motown, Teacher). Enforces dignity guardrails (never corrects memory lapses).
                    </p>
                  </div>

                  {/* Agent 2 */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                        2. Vyalev Infusion Site Rotation & Reaction Tracker Agent
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-rose-50 text-rose-800 rounded-md border border-rose-200">
                        1" Navel Perimeter
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong>Trigger:</strong> Cannula change schedule (3-day cycle) or reaction observation.<br/>
                      <strong>Mechanism:</strong> Enforces exact 1-inch circular perimeter rotations around Captain Wade's belly button across 8 clock positions. Automatically excludes under-belly/belt positions (4:30, 6:00, 7:30) and quarantines erythema/redness spots.
                    </p>
                  </div>

                  {/* Agent 3 */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        3. Pharmacy Telephony & Refill Agent
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
                        Voice IVR
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong>Trigger:</strong> Prescription supply drops below safety threshold (&lt;5 days).<br/>
                      <strong>Mechanism:</strong> Simulates multi-turn IVR telephony calls, touch-tone DTMF negotiation, Rx ID / DOB recitation, and cold-chain courier dispatch for refrigerated Vyalev.
                    </p>
                  </div>

                  {/* Agent 4 */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                        4. Multi-Retailer Smart Cart Router & Deduplication Engine
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-sky-50 text-sky-800 rounded-md border border-sky-200">
                        Multi-Cart AI
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong>Trigger:</strong> Wade requests pantry treats or family reviews household needs.<br/>
                      <strong>Mechanism:</strong> Dynamically optimizes across <strong>Walmart+, Instacart+, Amazon Prime, and Costco</strong> memberships. Auto-selects fastest delivery slots for urgent needs and lowest bulk cost for routines, staging items into family carts with a 0-auto-charge guarantee.
                    </p>
                  </div>

                  {/* Agent 5 */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        5. Shared Google Calendar Reasoning Agent
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-indigo-50 text-indigo-800 rounded-md border border-indigo-200">
                        Dual Output
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong>Trigger:</strong> Morning briefing generation & schedule changes.<br/>
                      <strong>Mechanism:</strong> Translates raw calendar events into two tailored outputs: a calm single-focus script for Wade and an actionable logistics/staging matrix for the caregiver.
                    </p>
                  </div>

                  {/* Agent 6 */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                        6. Speech Acoustic Biomarker & Fatigue Tracker
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-violet-50 text-violet-800 rounded-md border border-violet-200">
                        Audio Cadence
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong>Trigger:</strong> Spoken audio stream from Wade.<br/>
                      <strong>Mechanism:</strong> Extracts vocal cadence (words/min), pauses, and hypophonia indicators to track motor fatigue and automatically throttle assistant responses to single-word brevity.
                    </p>
                  </div>

                  {/* Agent 7 */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        7. Clinical Synthesis & Neurologist Reporting Agent
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-rose-50 text-rose-800 rounded-md border border-rose-200">
                        MDS-UPDRS
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong>Trigger:</strong> Weekly clinical report generation or clinician export.<br/>
                      <strong>Mechanism:</strong> Ingests continuous Vyalev subcutaneous infusion rates, hourly motor ON/OFF diary logs, periumbilical infusion site reaction histories, and dietary protein timing into structured MDS-UPDRS summaries.
                    </p>
                  </div>

                  {/* Agent 8 */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                        8. Uber Assist & Health Mobility Dispatcher
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-teal-50 text-teal-800 rounded-md border border-teal-200">
                        Transit & Buffer
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong>Trigger:</strong> Clinic appointments & community outings requiring vehicular transit.<br/>
                      <strong>Mechanism:</strong> Autonomously plans and stages Uber Assist/WAV rides with +25–35 minute Parkinson's preparation buffers, transmits door-to-door mobility & quiet-ride protocols to certified drivers, and syncs live tracking with caregiver alerts.
                    </p>
                  </div>

                  {/* Agent 9 */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        9. Community Support & Search Grounding Agent
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-blue-50 text-blue-800 rounded-md border border-blue-200">
                        Search Grounding
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong>Trigger:</strong> Geographic location query or chapter discovery request.<br/>
                      <strong>Mechanism:</strong> Grounds live Google Search to discover localized, verified Parkinson's Foundation chapters, Rock Steady Boxing gyms, and respite circles tailored to caregiver needs.
                    </p>
                  </div>

                  {/* Agent 10 */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-violet-600 shrink-0"></span>
                        <span>10. Web Audio DSP Equalizer & Harmonic Earcon Engine</span>
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-violet-50 text-violet-800 rounded-md border border-violet-200 shrink-0">
                        Web Audio DSP
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong>Trigger:</strong> Voice playback and state confirmation chimes.<br/>
                      <strong>Mechanism:</strong> Multi-stage Web Audio DSP chain (+3.8dB @ 220Hz warmth, +2.0dB @ 1.8kHz clarity, 8kHz low-pass filter, 4:1 compressor) paired with gentle pure-tone C-E-G harmonic triads (528 Hz) to eliminate acoustic startle.
                    </p>
                  </div>
                </div>
              </div>

              {/* Architecture Flow */}
              <div className="p-4 bg-slate-900 rounded-2xl text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
                <p className="text-amber-400 font-bold mb-2"># Multimodal Architecture & Data Flow</p>
                <p className="text-slate-300">[Captain Wade / Caregiver Input] (Web Speech API / Quick-Tap / Touch UI)</p>
                <p className="text-indigo-400">      ↓ (POST /api/agent/* with secure server-side proxy)</p>
                <p className="text-slate-300">[Express Backend on Cloud Run] (server.ts)</p>
                <p className="text-indigo-400">      ↓ (Gemini 3.7 Flash with @google/genai)</p>
                <p className="text-slate-300">[Gemini Multi-Agent Orchestrator Engine]</p>
                <p className="text-emerald-400">      ├── Persona Tone Engine (Legacy Honored Archetypes)</p>
                <p className="text-emerald-400">      ├── Web Audio DSP Equalizer (+3.8dB Warmth, 8kHz High-Cut, 4:1 Compressor)</p>
                <p className="text-emerald-400">      ├── Harmonic Earcon Chime Synthesizer (528Hz pure-tone triads)</p>
                <p className="text-emerald-400">      ├── Cognitive Empathy & Dignity Engine (Zero memory correction)</p>
                <p className="text-emerald-400">      ├── Multi-Retailer Smart Cart Router (Walmart+, Instacart+, Prime, Costco)</p>
                <p className="text-emerald-400">      ├── Pantry Deduplication Agent (Silent Google Drive reconciliation)</p>
                <p className="text-emerald-400">      ├── Autonomous Pharmacy Telephony Agent (DTMF / IVR negotiation)</p>
                <p className="text-emerald-400">      ├── Adaptive Favorites Generator (Temporal frequency ranking)</p>
                <p className="text-emerald-400">      ├── Clinical Synthesis Engine (24h Vyalev pump + motor ON/OFF logs)</p>
                <p className="text-emerald-400">      ├── Mobility Logistics Agent (+20m Parkinson's departure buffers)</p>
                <p className="text-emerald-400">      └── Community Search Grounding (Live Google Search API)</p>
                <p className="text-indigo-400">      ↓</p>
                <p className="text-amber-300">[Action Execution: Warm Vocal Reassurance + Automated Refill Verification + Dual Output Calendar]</p>
              </div>

              {/* Track & Disclosure Statement */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Track Selection & Pre-existing Work Disclosure</span>
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  <strong>Track:</strong> <em>Collaborative Partner & Taskmaster</em> (Acts as an empathetic cognitive offloader for patient and medical co-pilot for caregivers).
                </p>
                <p className="text-slate-600 leading-relaxed">
                  <strong>Disclosure Statement:</strong> This agent was created during the active hackathon window to serve as the autonomous cognitive intelligence engine for the Parkinson's care workflow. All agent prompts, deduplication logic, Gemini 3.7 integrations, and Cloud Run server routes were built during the hackathon.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: HIPAA & SECURITY ARCHITECTURE */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <SecurityArchitectureSection />
            </div>
          )}

          {/* TAB 3: TOKEN & COMPUTE EFFICIENCY */}
          {activeTab === 'efficiency' && (
            <div className="space-y-4">
              <TokenEfficiencySection />
            </div>
          )}

          {/* TAB 4: AGENT MEMORY HIERARCHY (4 TIERS) */}
          {activeTab === 'memory' && (
            <div className="space-y-4">
              <AgentMemoryHierarchySection />
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Includes 10 Agents, Official Hackathon Rules, PDD Guidelines & Token Benchmarks</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Close Specifications
          </button>
        </div>

      </div>
    </div>
  );
};
