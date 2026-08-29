import React, { useState } from 'react';
import { 
  Package, PhoneForwarded, Stethoscope, Car, Users, Activity, 
  Settings, Radio, Sparkles, Mic, FileText, CheckCircle2, ShieldCheck,
  Zap, HeartPulse, Calendar, Brain, BookOpen
} from 'lucide-react';
import { 
  AgentPersonaId, PantryItem, ShoppingItem, NeedsAuditLog, 
  MedicationRefillItem, PharmacyCallLog, SpeechAcousticEvent, 
  EnergyState, BrevityMode, DailyGeminiBriefing, DailyCalendarBriefing,
  AdaptiveVoiceOrderItem, InfusionSiteLog
} from '../types';
import { HouseholdPantryHub } from './HouseholdPantryHub';
import { PharmacyRefillCard } from './PharmacyRefillCard';
import { WeeklyBehaviorReportView } from './WeeklyBehaviorReportView';
import { MobilityLogisticsView } from './MobilityLogisticsView';
import { ParkinsonsEventsFinder } from './ParkinsonsEventsFinder';
import { SpeechAcousticTracker } from './SpeechAcousticTracker';
import { AcousticVoiceInspector } from './AcousticVoiceInspector';
import { DailyBriefingCard } from './DailyBriefingCard';
import { AgentPersonaSelector } from './AgentPersonaSelector';
import { WadeNeedsIntake } from './WadeNeedsIntake';
import { WadeFavoritesManager } from './WadeFavoritesManager';
import { InfusionSiteManager } from './InfusionSiteManager';
import { CognitiveResearchSection } from './CognitiveResearchSection';
import { TokenEfficiencySection } from './TokenEfficiencySection';
import { 
  INITIAL_MOTOR_LOGS, INITIAL_PUMP_CYCLES, INITIAL_ROUTINES 
} from '../data/initialData';

interface CaregiverAdminConsoleProps {
  selectedPersona: AgentPersonaId;
  onSelectPersona: (persona: AgentPersonaId) => void;
  pantryItems: PantryItem[];
  shoppingItems: ShoppingItem[];
  auditLogs: NeedsAuditLog[];
  medications: MedicationRefillItem[];
  pharmacyCalls: PharmacyCallLog[];
  speechAcoustics: SpeechAcousticEvent[];
  energyState: EnergyState;
  brevityMode: BrevityMode;
  dailyBriefing: DailyGeminiBriefing;
  calendarBriefing: DailyCalendarBriefing;
  onRefreshCalendarBriefing: () => void;
  isRefreshingBriefing: boolean;
  adaptiveOrders?: AdaptiveVoiceOrderItem[];
  infusionSites?: InfusionSiteLog[];
  onAddInfusionSite?: (site: InfusionSiteLog) => void;
  onUpdateSiteStatus?: (id: string, status: InfusionSiteLog['status']) => void;
  onUpdateAdaptiveOrders?: (orders: AdaptiveVoiceOrderItem[]) => void;
  onTriggerVoiceOrder?: (order: AdaptiveVoiceOrderItem) => void;
  onUpdatePantryQuantity: (id: string, newQty: number) => void;
  onToggleShoppingPurchased: (id: string) => void;
  onAddCustomPantryItem: (item: PantryItem) => void;
  onDeleteShoppingItem: (id: string) => void;
  onUpdateMedication: (updatedMed: MedicationRefillItem) => void;
  onAddPharmacyCall: (call: PharmacyCallLog) => void;
  onAddAuditLog: (log: NeedsAuditLog) => void;
  onAddShoppingItem: (item: ShoppingItem) => void;
  onSimulateAcousticEvent: (wpm: number, text: string) => void;
}

export const CaregiverAdminConsole: React.FC<CaregiverAdminConsoleProps> = ({
  selectedPersona,
  onSelectPersona,
  pantryItems,
  shoppingItems,
  auditLogs,
  medications,
  pharmacyCalls,
  speechAcoustics,
  energyState,
  brevityMode,
  dailyBriefing,
  calendarBriefing,
  onRefreshCalendarBriefing,
  isRefreshingBriefing,
  adaptiveOrders = [],
  infusionSites = [],
  onAddInfusionSite,
  onUpdateSiteStatus,
  onUpdateAdaptiveOrders,
  onTriggerVoiceOrder,
  onUpdatePantryQuantity,
  onToggleShoppingPurchased,
  onAddCustomPantryItem,
  onDeleteShoppingItem,
  onUpdateMedication,
  onAddPharmacyCall,
  onAddAuditLog,
  onAddShoppingItem,
  onSimulateAcousticEvent
}) => {
  const [adminTab, setAdminTab] = useState<'calendar' | 'infusionsite' | 'pantry' | 'favorites' | 'pharmacy' | 'speech' | 'clinical' | 'mobility' | 'community' | 'dsp' | 'research' | 'efficiency'>('calendar');

  const urgentRefillCount = medications.filter(m => m.daysRemaining <= m.refillThresholdDays).length;

  return (
    <div className="space-y-6">
      {/* Admin Panel Header */}
      <div 
        id="admin-console-header"
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-900 text-white flex items-center gap-1.5">
              <span>🌋</span>
              <span>Command Center</span>
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Caregiver Offload Hub • Full Schedule & Automation
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Secret Volcano Base Operations Console
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl">
            Where the full schedule, Gemini calendar reasoning, transit buffers, inventory deduplication, telephony pharmacy refills, speech acoustics tracking, and clinical reports are safely managed without burdening Wade.
          </p>
        </div>

        {/* Quick System Badge */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
            AI
          </div>
          <div className="text-left text-xs">
            <div className="font-bold text-slate-900">Gemini 3.7 Flash Agent</div>
            <div className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Autonomous & Synchronized
            </div>
          </div>
        </div>
      </div>

      {/* Active Persona / Vocal Tone Selector (Moved to Admin Panel for Uncluttered Wade Screen) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Active Persona & Vocal Tone Configuration
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Caregiver-managed tone & reassurance parameters
          </span>
        </div>
        <AgentPersonaSelector
          selectedPersona={selectedPersona}
          onSelectPersona={onSelectPersona}
        />
      </div>

      {/* Admin Navigation Sub-Tabs - Stacked Responsive Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Operations Console Subsystems (9 Autonomous Modules)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Select a module to view telemetry and controls
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 p-2 bg-slate-100/80 rounded-3xl border border-slate-200 shadow-2xs">
          {/* 1. Calendar Briefing */}
          <button
            type="button"
            id="admin-tab-calendar"
            onClick={() => setAdminTab('calendar')}
            className={`p-3 rounded-2xl text-left transition-all flex items-center gap-3 border ${
              adminTab === 'calendar'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-400/40'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              adminTab === 'calendar' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
            }`}>
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate">Calendar Daily Briefing</div>
              <div className={`text-[10px] truncate ${adminTab === 'calendar' ? 'text-indigo-100' : 'text-slate-400'}`}>
                +20m Buffers & Schedule Plan
              </div>
            </div>
          </button>

          {/* 2. Infusion Site Tracker (Vyalev 1-Inch Circle Rotation) */}
          <button
            type="button"
            id="admin-tab-infusionsite"
            onClick={() => setAdminTab('infusionsite')}
            className={`p-3 rounded-2xl text-left transition-all flex items-center gap-3 border ${
              adminTab === 'infusionsite'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-400/40'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              adminTab === 'infusionsite' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600'
            }`}>
              <HeartPulse className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold truncate">Infusion Site Tracker</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
                  adminTab === 'infusionsite' ? 'bg-rose-200 text-rose-950' : 'bg-rose-100 text-rose-800'
                }`}>
                  1" Circle
                </span>
              </div>
              <div className={`text-[10px] truncate ${adminTab === 'infusionsite' ? 'text-indigo-100' : 'text-slate-400'}`}>
                Vyalev Navel Rotation & Skin Log
              </div>
            </div>
          </button>

          {/* 3. Pantry & Deduplication */}
          <button
            type="button"
            id="admin-tab-pantry"
            onClick={() => setAdminTab('pantry')}
            className={`p-3 rounded-2xl text-left transition-all flex items-center gap-3 border ${
              adminTab === 'pantry'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-400/40'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              adminTab === 'pantry' ? 'bg-white/20 text-white' : 'bg-sky-50 text-sky-600'
            }`}>
              <Package className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate">Pantry, Shopping & Walmart Hub</div>
              <div className={`text-[10px] truncate ${adminTab === 'pantry' ? 'text-indigo-100' : 'text-slate-400'}`}>
                Walmart 1-Click, Docs & Pantry Sync
              </div>
            </div>
          </button>

          {/* 4. Favorites & Quick Orders */}
          <button
            type="button"
            id="admin-tab-favorites"
            onClick={() => setAdminTab('favorites')}
            className={`p-3 rounded-2xl text-left transition-all flex items-center gap-3 border ${
              adminTab === 'favorites'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-400/40'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              adminTab === 'favorites' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'
            }`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate">Wade's Favorites & Orders</div>
              <div className={`text-[10px] truncate ${adminTab === 'favorites' ? 'text-indigo-100' : 'text-slate-400'}`}>
                Dynamic Frequency Ranking
              </div>
            </div>
          </button>

          {/* 5. Pharmacy Voice Refills */}
          <button
            type="button"
            id="admin-tab-pharmacy"
            onClick={() => setAdminTab('pharmacy')}
            className={`p-3 rounded-2xl text-left transition-all flex items-center gap-3 border ${
              adminTab === 'pharmacy'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-400/40'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              adminTab === 'pharmacy' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <PhoneForwarded className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold truncate">Pharmacy Voice Refills</span>
                {urgentRefillCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                    adminTab === 'pharmacy' ? 'bg-amber-400 text-slate-950' : 'bg-amber-500 text-white animate-pulse'
                  }`}>
                    {urgentRefillCount} Due
                  </span>
                )}
              </div>
              <div className={`text-[10px] truncate ${adminTab === 'pharmacy' ? 'text-indigo-100' : 'text-slate-400'}`}>
                Autonomous Telephony Engine
              </div>
            </div>
          </button>

          {/* 5. Speech Acoustics & Fatigue Tracker */}
          <button
            type="button"
            id="admin-tab-speech"
            onClick={() => setAdminTab('speech')}
            className={`p-3 rounded-2xl text-left transition-all flex items-center gap-3 border ${
              adminTab === 'speech'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-400/40'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              adminTab === 'speech' ? 'bg-white/20 text-white' : 'bg-violet-50 text-violet-600'
            }`}>
              <Activity className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate">Speech Acoustics & Cadence</div>
              <div className={`text-[10px] truncate ${adminTab === 'speech' ? 'text-indigo-100' : 'text-slate-400'}`}>
                Biomarker & Fatigue Analysis
              </div>
            </div>
          </button>

          {/* 6. Clinical Synthesis */}
          <button
            type="button"
            id="admin-tab-clinical"
            onClick={() => setAdminTab('clinical')}
            className={`p-3 rounded-2xl text-left transition-all flex items-center gap-3 border ${
              adminTab === 'clinical'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-400/40'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              adminTab === 'clinical' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600'
            }`}>
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate">Clinical Synthesis Report</div>
              <div className={`text-[10px] truncate ${adminTab === 'clinical' ? 'text-indigo-100' : 'text-slate-400'}`}>
                MDS-UPDRS & Neurologist Export
              </div>
            </div>
          </button>

          {/* 7. Proactive Mobility */}
          <button
            type="button"
            id="admin-tab-mobility"
            onClick={() => setAdminTab('mobility')}
            className={`p-3 rounded-2xl text-left transition-all flex items-center gap-3 border ${
              adminTab === 'mobility'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-400/40'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              adminTab === 'mobility' ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-600'
            }`}>
              <Car className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate">Proactive Mobility Logistics</div>
              <div className={`text-[10px] truncate ${adminTab === 'mobility' ? 'text-indigo-100' : 'text-slate-400'}`}>
                +20m Buffer & Transit Staging
              </div>
            </div>
          </button>

          {/* 8. Community Grounding */}
          <button
            type="button"
            id="admin-tab-community"
            onClick={() => setAdminTab('community')}
            className={`p-3 rounded-2xl text-left transition-all flex items-center gap-3 border ${
              adminTab === 'community'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-400/40'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              adminTab === 'community' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
            }`}>
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate">Community Grounding</div>
              <div className={`text-[10px] truncate ${adminTab === 'community' ? 'text-indigo-100' : 'text-slate-400'}`}>
                Rock Steady & Support Circles
              </div>
            </div>
          </button>

          {/* 9. Web Audio DSP Equalizer */}
          <button
            type="button"
            id="admin-tab-dsp"
            onClick={() => setAdminTab('dsp')}
            className={`p-3 rounded-2xl text-left transition-all flex items-center gap-3 border ${
              adminTab === 'dsp'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-400/40'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              adminTab === 'dsp' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              <Radio className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate">Web Audio DSP Equalizer</div>
              <div className={`text-[10px] truncate ${adminTab === 'dsp' ? 'text-indigo-100' : 'text-slate-400'}`}>
                Parametric Filters & Warmth
              </div>
            </div>
          </button>

          {/* 10. Cognitive Research & PDD Specs */}
          <button
            type="button"
            id="admin-tab-research"
            onClick={() => setAdminTab('research')}
            className={`p-3 rounded-2xl text-left transition-all flex items-center gap-3 border sm:col-span-2 lg:col-span-2 ${
              adminTab === 'research'
                ? 'bg-gradient-to-r from-indigo-900 to-slate-900 text-white border-indigo-500 shadow-sm ring-2 ring-indigo-400/40'
                : 'bg-gradient-to-r from-indigo-50/70 to-slate-50 text-indigo-950 border-indigo-200 hover:border-indigo-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              adminTab === 'research' ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white'
            }`}>
              <Brain className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black truncate">Cognitive Research (PDD)</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                  adminTab === 'research' ? 'bg-indigo-400/30 text-indigo-200 border border-indigo-300/30' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  Evidence-Based
                </span>
              </div>
              <div className={`text-[10px] truncate ${adminTab === 'research' ? 'text-indigo-200' : 'text-slate-500'}`}>
                Visuospatial Support & Tremor Damping Filter
              </div>
            </div>
          </button>

          {/* 11. Token & Architecture Efficiency */}
          <button
            type="button"
            id="admin-tab-efficiency"
            onClick={() => setAdminTab('efficiency')}
            className={`p-3 rounded-2xl text-left transition-all flex items-center gap-3 border sm:col-span-2 lg:col-span-1 ${
              adminTab === 'efficiency'
                ? 'bg-emerald-950 text-white border-emerald-500 shadow-sm ring-2 ring-emerald-400/40'
                : 'bg-emerald-50/70 text-emerald-950 border-emerald-200 hover:border-emerald-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              adminTab === 'efficiency' ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-600 text-white'
            }`}>
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black truncate">⚡ Token Efficiency</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                  adminTab === 'efficiency' ? 'bg-emerald-400/30 text-emerald-200 border border-emerald-300/30' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  -78% Cost
                </span>
              </div>
              <div className={`text-[10px] truncate ${adminTab === 'efficiency' ? 'text-emerald-200' : 'text-slate-500'}`}>
                Benchmarking & Zero-Token DSP
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Subsystem Views */}
      {adminTab === 'calendar' && (
        <DailyBriefingCard
          briefing={calendarBriefing}
          selectedPersona={selectedPersona}
          onRefreshBriefing={onRefreshCalendarBriefing}
          isRefreshing={isRefreshingBriefing}
        />
      )}

      {adminTab === 'infusionsite' && (
        <InfusionSiteManager
          sites={infusionSites}
          onAddSiteLog={(newSite) => {
            if (onAddInfusionSite) {
              onAddInfusionSite(newSite);
            }
          }}
          onUpdateSiteStatus={(id, status) => {
            if (onUpdateSiteStatus) {
              onUpdateSiteStatus(id, status);
            }
          }}
        />
      )}

      {adminTab === 'pantry' && (
        <HouseholdPantryHub
          pantryItems={pantryItems}
          shoppingItems={shoppingItems}
          auditLogs={auditLogs}
          onUpdatePantryQuantity={onUpdatePantryQuantity}
          onToggleShoppingPurchased={onToggleShoppingPurchased}
          onAddCustomPantryItem={onAddCustomPantryItem}
          onDeleteShoppingItem={onDeleteShoppingItem}
        />
      )}

      {adminTab === 'favorites' && (
        <WadeFavoritesManager
          orders={adaptiveOrders}
          onUpdateOrders={(updated) => {
            if (onUpdateAdaptiveOrders) {
              onUpdateAdaptiveOrders(updated);
            }
          }}
          onSimulateOrder={(order) => {
            if (onTriggerVoiceOrder) {
              onTriggerVoiceOrder(order);
            }
          }}
        />
      )}

      {adminTab === 'pharmacy' && (
        <PharmacyRefillCard
          selectedPersona={selectedPersona}
          medications={medications}
          callLogs={pharmacyCalls}
          onUpdateMedication={onUpdateMedication}
          onAddCallLog={onAddPharmacyCall}
        />
      )}

      {adminTab === 'speech' && (
        <SpeechAcousticTracker
          acousticEvents={speechAcoustics}
          currentEnergyState={energyState}
          currentBrevityMode={brevityMode}
          onSimulateEvent={onSimulateAcousticEvent}
        />
      )}

      {adminTab === 'clinical' && (
        <WeeklyBehaviorReportView
          motorLogs={INITIAL_MOTOR_LOGS}
          pumpCycles={INITIAL_PUMP_CYCLES}
          routineLogs={INITIAL_ROUTINES}
          infusionSites={infusionSites}
        />
      )}

      {adminTab === 'mobility' && (
        <MobilityLogisticsView />
      )}

      {adminTab === 'community' && (
        <ParkinsonsEventsFinder />
      )}

      {adminTab === 'dsp' && (
        <AcousticVoiceInspector
          selectedPersona={selectedPersona}
        />
      )}

      {adminTab === 'research' && (
        <CognitiveResearchSection />
      )}

      {adminTab === 'efficiency' && (
        <TokenEfficiencySection />
      )}
    </div>
  );
};
