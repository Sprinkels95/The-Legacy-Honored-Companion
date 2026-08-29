import React, { useState } from 'react';
import { 
  Package, PhoneForwarded, Stethoscope, Car, Users, Activity, 
  Settings, Radio, Sparkles, Mic, FileText, CheckCircle2, ShieldCheck,
  Zap, HeartPulse, Calendar, Brain, BookOpen, ShoppingBag, Layers,
  Clock, Volume2, ArrowRight
} from 'lucide-react';
import { 
  AgentPersonaId, PantryItem, ShoppingItem, NeedsAuditLog, 
  MedicationRefillItem, PharmacyCallLog, SpeechAcousticEvent, 
  EnergyState, BrevityMode, DailyGeminiBriefing, DailyCalendarBriefing,
  AdaptiveVoiceOrderItem, InfusionSiteLog, SyringeRefillLog, VyalevPumpCycle
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
  syringeRefills?: SyringeRefillLog[];
  pumpCycles?: VyalevPumpCycle[];
  onOpenQuickRefill?: () => void;
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

export type MainHubId = 'medical' | 'schedule' | 'shopping' | 'audio' | 'community' | 'specs';

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
  syringeRefills = [],
  pumpCycles = INITIAL_PUMP_CYCLES,
  onOpenQuickRefill,
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
  // Main Consolidated Hubs
  const [mainHub, setMainHub] = useState<MainHubId>('medical');

  // Sub-tabs for each Hub
  const [medicalSubTab, setMedicalSubTab] = useState<'infusion' | 'pharmacy' | 'clinical'>('infusion');
  const [scheduleSubTab, setScheduleSubTab] = useState<'briefing' | 'mobility'>('briefing');
  const [shoppingSubTab, setShoppingSubTab] = useState<'pantry' | 'favorites'>('pantry');
  const [audioSubTab, setAudioSubTab] = useState<'acoustics' | 'dsp'>('acoustics');
  const [specsSubTab, setSpecsSubTab] = useState<'research' | 'efficiency'>('research');

  const urgentRefillCount = medications.filter(m => m.daysRemaining <= m.refillThresholdDays).length;

  return (
    <div className="space-y-6">
      {/* Admin Panel Header */}
      <div 
        id="admin-console-header"
        className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-900 text-white flex items-center gap-1.5">
              <span>🌋</span>
              <span>Command Center</span>
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Caregiver Offload Hub • 10 Synchronized Autonomous Agents
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif">
            Secret Volcano Base Operations Console
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Consolidated operational control: medical infusion telemetry, pharmacy voice automation, calendar reasoning, inventory deduplication, and acoustic voice DSP.
          </p>
        </div>

        {/* Quick System Badge */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
            10
          </div>
          <div className="text-left text-xs">
            <div className="font-extrabold text-slate-900">Autonomous Agents</div>
            <div className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
            </div>
          </div>
        </div>
      </div>

      {/* Active Persona / Vocal Tone Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Active Persona & Vocal Tone Configuration
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md">
              Agent 1: Legacy Persona Engine
            </span>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Configures vocal warmth, cadence, and cultural anchors
          </span>
        </div>
        <AgentPersonaSelector
          selectedPersona={selectedPersona}
          onSelectPersona={onSelectPersona}
        />
      </div>

      {/* Grouped Operations Command Centers (Clean 5-Hub Hierarchy) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Operational Command Centers
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Daily Essentials at top • Grouped by workflow
          </span>
        </div>

        {/* TIER 1 & TIER 2 HUBS GRID (Streamlined, Compact Design) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          
          {/* HUB 1: MEDICAL & CLINICAL HUB (Top Daily Priority) */}
          <button
            type="button"
            id="hub-tab-medical"
            onClick={() => setMainHub('medical')}
            className={`p-3 rounded-2xl text-left transition-all border relative flex flex-col justify-between ${
              mainHub === 'medical'
                ? 'bg-rose-950 text-white border-rose-500 shadow-sm ring-2 ring-rose-400/40'
                : 'bg-white text-slate-800 border-slate-200 hover:border-rose-300 hover:bg-rose-50/30'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <div className={`p-1.5 rounded-xl flex items-center justify-center shrink-0 ${
                mainHub === 'medical' ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-600'
              }`}>
                <HeartPulse className="w-4 h-4" />
              </div>
              {urgentRefillCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-slate-950 animate-pulse">
                  {urgentRefillCount} Refill
                </span>
              ) : (
                <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                  mainHub === 'medical' ? 'bg-rose-500/30 text-rose-200' : 'bg-rose-50 text-rose-700'
                }`}>
                  Daily
                </span>
              )}
            </div>

            <div>
              <span className="text-xs font-black tracking-tight block">Medical & Clinical</span>
              <p className={`text-[10px] mt-0.5 truncate ${mainHub === 'medical' ? 'text-rose-200' : 'text-slate-500'}`}>
                Infusion, Rx & Neurologist
              </p>
            </div>
          </button>

          {/* HUB 2: DAILY RHYTHM & MOBILITY LOGISTICS (Top Daily Priority) */}
          <button
            type="button"
            id="hub-tab-schedule"
            onClick={() => setMainHub('schedule')}
            className={`p-3 rounded-2xl text-left transition-all border relative flex flex-col justify-between ${
              mainHub === 'schedule'
                ? 'bg-indigo-950 text-white border-indigo-500 shadow-sm ring-2 ring-indigo-400/40'
                : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <div className={`p-1.5 rounded-xl flex items-center justify-center shrink-0 ${
                mainHub === 'schedule' ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600'
              }`}>
                <Calendar className="w-4 h-4" />
              </div>
              <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                mainHub === 'schedule' ? 'bg-indigo-500/30 text-indigo-200' : 'bg-indigo-50 text-indigo-700'
              }`}>
                Daily
              </span>
            </div>

            <div>
              <span className="text-xs font-black tracking-tight block">Schedule & Transit</span>
              <p className={`text-[10px] mt-0.5 truncate ${mainHub === 'schedule' ? 'text-indigo-200' : 'text-slate-500'}`}>
                Briefing & +20m Buffers
              </p>
            </div>
          </button>

          {/* HUB 3: SHOPPING, PANTRY & WADE'S FAVORITES */}
          <button
            type="button"
            id="hub-tab-shopping"
            onClick={() => setMainHub('shopping')}
            className={`p-3 rounded-2xl text-left transition-all border relative flex flex-col justify-between ${
              mainHub === 'shopping'
                ? 'bg-sky-950 text-white border-sky-500 shadow-sm ring-2 ring-sky-400/40'
                : 'bg-white text-slate-800 border-slate-200 hover:border-sky-300 hover:bg-sky-50/30'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <div className={`p-1.5 rounded-xl flex items-center justify-center shrink-0 ${
                mainHub === 'shopping' ? 'bg-sky-500 text-white' : 'bg-sky-50 text-sky-600'
              }`}>
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                mainHub === 'shopping' ? 'bg-sky-500/30 text-sky-200' : 'bg-sky-50 text-sky-700'
              }`}>
                Pantry
              </span>
            </div>

            <div>
              <span className="text-xs font-black tracking-tight block">Shopping & Pantry</span>
              <p className={`text-[10px] mt-0.5 truncate ${mainHub === 'shopping' ? 'text-sky-200' : 'text-slate-500'}`}>
                Drive Excel & Walmart
              </p>
            </div>
          </button>

          {/* HUB 4: VOICE ACOUSTICS & AUDIO DSP STUDIO */}
          <button
            type="button"
            id="hub-tab-audio"
            onClick={() => setMainHub('audio')}
            className={`p-3 rounded-2xl text-left transition-all border relative flex flex-col justify-between ${
              mainHub === 'audio'
                ? 'bg-violet-950 text-white border-violet-500 shadow-sm ring-2 ring-violet-400/40'
                : 'bg-white text-slate-800 border-slate-200 hover:border-violet-300 hover:bg-violet-50/30'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <div className={`p-1.5 rounded-xl flex items-center justify-center shrink-0 ${
                mainHub === 'audio' ? 'bg-violet-500 text-white' : 'bg-violet-50 text-violet-600'
              }`}>
                <Volume2 className="w-4 h-4" />
              </div>
              <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                mainHub === 'audio' ? 'bg-violet-500/30 text-violet-200' : 'bg-violet-50 text-violet-700'
              }`}>
                DSP
              </span>
            </div>

            <div>
              <span className="text-xs font-black tracking-tight block">Voice & Audio DSP</span>
              <p className={`text-[10px] mt-0.5 truncate ${mainHub === 'audio' ? 'text-violet-200' : 'text-slate-500'}`}>
                Cadence & Warm EQ
              </p>
            </div>
          </button>

          {/* HUB 5: COMMUNITY & CHAPTERS */}
          <button
            type="button"
            id="hub-tab-community"
            onClick={() => setMainHub('community')}
            className={`p-3 rounded-2xl text-left transition-all border relative flex flex-col justify-between ${
              mainHub === 'community'
                ? 'bg-blue-950 text-white border-blue-500 shadow-sm ring-2 ring-blue-400/40'
                : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <div className={`p-1.5 rounded-xl flex items-center justify-center shrink-0 ${
                mainHub === 'community' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600'
              }`}>
                <Users className="w-4 h-4" />
              </div>
              <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                mainHub === 'community' ? 'bg-blue-500/30 text-blue-200' : 'bg-blue-50 text-blue-700'
              }`}>
                Search
              </span>
            </div>

            <div>
              <span className="text-xs font-black tracking-tight block">Community Circles</span>
              <p className={`text-[10px] mt-0.5 truncate ${mainHub === 'community' ? 'text-blue-200' : 'text-slate-500'}`}>
                Support & Chapters
              </p>
            </div>
          </button>

          {/* HUB 6: PDD RESEARCH & TOKEN BENCHMARKS */}
          <button
            type="button"
            id="hub-tab-specs"
            onClick={() => setMainHub('specs')}
            className={`p-3 rounded-2xl text-left transition-all border relative flex flex-col justify-between ${
              mainHub === 'specs'
                ? 'bg-emerald-950 text-white border-emerald-500 shadow-sm ring-2 ring-emerald-400/40'
                : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <div className={`p-1.5 rounded-xl flex items-center justify-center shrink-0 ${
                mainHub === 'specs' ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-50 text-emerald-700'
              }`}>
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                mainHub === 'specs' ? 'bg-emerald-500/30 text-emerald-200' : 'bg-emerald-50 text-emerald-700'
              }`}>
                -78%
              </span>
            </div>

            <div>
              <span className="text-xs font-black tracking-tight block">Research & Tokens</span>
              <p className={`text-[10px] mt-0.5 truncate ${mainHub === 'specs' ? 'text-emerald-200' : 'text-slate-500'}`}>
                PDD & Benchmarks
              </p>
            </div>
          </button>

        </div>
      </div>

      {/* =========================================================================
          ACTIVE HUB CONTENT & SUB-TABS CONTAINER
      ========================================================================== */}
      <div className="pt-2">

        {/* -----------------------------------------------------------------------
            HUB 1: MEDICAL & CLINICAL HUB (Agents 2, 3, 7)
        ------------------------------------------------------------------------ */}
        {mainHub === 'medical' && (
          <div className="space-y-4">
            {/* Sub-tab Navigation */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 px-2">
                <span className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
                  <HeartPulse className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Medical & Clinical Hub</span>
                  <span className="text-[10px] text-slate-500">Autonomous Agents #2, #3, and #7</span>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  id="subtab-infusion"
                  onClick={() => setMedicalSubTab('infusion')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    medicalSubTab === 'infusion'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>💉 1" Infusion Site Rotation</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-black/20 rounded-md">Agent 2</span>
                </button>

                <button
                  type="button"
                  id="subtab-pharmacy"
                  onClick={() => setMedicalSubTab('pharmacy')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    medicalSubTab === 'pharmacy'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PhoneForwarded className="w-3 h-3" />
                  <span>Pharmacy Voice Refills</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-black/20 rounded-md">Agent 3</span>
                  {urgentRefillCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  )}
                </button>

                <button
                  type="button"
                  id="subtab-clinical"
                  onClick={() => setMedicalSubTab('clinical')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    medicalSubTab === 'clinical'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Stethoscope className="w-3 h-3" />
                  <span>Neurologist Report & Pump Logs</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-black/20 rounded-md">Agent 7</span>
                </button>
              </div>
            </div>

            {/* Sub-view Rendering */}
            {/* Quick Refill Prominent Card in Medical Hub */}
            <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-rose-800/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/30 border border-rose-400/40 flex items-center justify-center text-rose-200 shrink-0">
                  <HeartPulse className="w-5 h-5 text-rose-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/30 text-rose-200 border border-rose-400/20">
                      Daily Caregiver Action
                    </span>
                    <span className="text-xs text-rose-200">
                      Last logged: <strong>{syringeRefills[0]?.timestamp || 'Today at 07:30 AM'}</strong>
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    Manual Syringe Refill & Cannula Site Logger
                  </h4>
                  <p className="text-xs text-rose-200/80">
                    Input fresh syringe swap (10/20 mL) and 2-day cannula rotation — automatically updates pump reserve hours and neurologist telemetry.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenQuickRefill}
                className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0 w-full sm:w-auto justify-center"
              >
                <span>➕ Log Syringe Refill</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {medicalSubTab === 'infusion' && (
              <InfusionSiteManager
                sites={infusionSites}
                onOpenQuickRefill={onOpenQuickRefill}
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

            {medicalSubTab === 'pharmacy' && (
              <PharmacyRefillCard
                selectedPersona={selectedPersona}
                medications={medications}
                callLogs={pharmacyCalls}
                onUpdateMedication={onUpdateMedication}
                onAddCallLog={onAddPharmacyCall}
              />
            )}

            {medicalSubTab === 'clinical' && (
              <WeeklyBehaviorReportView
                motorLogs={INITIAL_MOTOR_LOGS}
                pumpCycles={pumpCycles}
                routineLogs={INITIAL_ROUTINES}
                infusionSites={infusionSites}
              />
            )}
          </div>
        )}

        {/* -----------------------------------------------------------------------
            HUB 2: DAILY RHYTHM & MOBILITY LOGISTICS (Agents 5 & 8)
        ------------------------------------------------------------------------ */}
        {mainHub === 'schedule' && (
          <div className="space-y-4">
            {/* Sub-tab Navigation */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 px-2">
                <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Calendar className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Daily Rhythm & Mobility Hub</span>
                  <span className="text-[10px] text-slate-500">Autonomous Agents #5 and #8</span>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  id="subtab-briefing"
                  onClick={() => setScheduleSubTab('briefing')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    scheduleSubTab === 'briefing'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>Calendar Dual Briefing</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-black/20 rounded-md">Agent 5</span>
                </button>

                <button
                  type="button"
                  id="subtab-mobility"
                  onClick={() => setScheduleSubTab('mobility')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    scheduleSubTab === 'mobility'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Car className="w-3 h-3" />
                  <span>+20m Mobility Transit Staging</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-black/20 rounded-md">Agent 8</span>
                </button>
              </div>
            </div>

            {/* Sub-view Rendering */}
            {scheduleSubTab === 'briefing' && (
              <DailyBriefingCard
                briefing={calendarBriefing}
                selectedPersona={selectedPersona}
                onRefreshBriefing={onRefreshCalendarBriefing}
                isRefreshing={isRefreshingBriefing}
              />
            )}

            {scheduleSubTab === 'mobility' && (
              <MobilityLogisticsView />
            )}
          </div>
        )}

        {/* -----------------------------------------------------------------------
            HUB 3: SHOPPING, PANTRY & WADE'S FAVORITES (Agent 4 + Adaptive Ranker)
        ------------------------------------------------------------------------ */}
        {mainHub === 'shopping' && (
          <div className="space-y-4">
            {/* Sub-tab Navigation */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 px-2">
                <span className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
                  <ShoppingBag className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Shopping & Pantry Hub</span>
                  <span className="text-[10px] text-slate-500">Autonomous Agent #4 + Adaptive Frequency Ranking</span>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  id="subtab-pantry"
                  onClick={() => setShoppingSubTab('pantry')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    shoppingSubTab === 'pantry'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Package className="w-3 h-3" />
                  <span>Shared Drive Pantry & Walmart Cart</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-black/20 rounded-md">Agent 4</span>
                </button>

                <button
                  type="button"
                  id="subtab-favorites"
                  onClick={() => setShoppingSubTab('favorites')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    shoppingSubTab === 'favorites'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Wade's Mid-Century Favorites</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-black/20 rounded-md">Ranker</span>
                </button>
              </div>
            </div>

            {/* Sub-view Rendering */}
            {shoppingSubTab === 'pantry' && (
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

            {shoppingSubTab === 'favorites' && (
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
          </div>
        )}

        {/* -----------------------------------------------------------------------
            HUB 4: VOICE ACOUSTICS & AUDIO DSP (Agents 6 & 10)
        ------------------------------------------------------------------------ */}
        {mainHub === 'audio' && (
          <div className="space-y-4">
            {/* Sub-tab Navigation */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 px-2">
                <span className="p-1.5 bg-violet-100 text-violet-700 rounded-lg">
                  <Volume2 className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Voice Acoustics & Audio DSP Studio</span>
                  <span className="text-[10px] text-slate-500">Autonomous Agents #6 and #10</span>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  id="subtab-acoustics"
                  onClick={() => setAudioSubTab('acoustics')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    audioSubTab === 'acoustics'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Activity className="w-3 h-3" />
                  <span>Speech Cadence & Fatigue Biomarkers</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-black/20 rounded-md">Agent 6</span>
                </button>

                <button
                  type="button"
                  id="subtab-dsp"
                  onClick={() => setAudioSubTab('dsp')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    audioSubTab === 'dsp'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Radio className="w-3 h-3" />
                  <span>Web Audio DSP Warmth Filter & Chimes</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-black/20 rounded-md">Agent 10</span>
                </button>
              </div>
            </div>

            {/* Sub-view Rendering */}
            {audioSubTab === 'acoustics' && (
              <SpeechAcousticTracker
                acousticEvents={speechAcoustics}
                currentEnergyState={energyState}
                currentBrevityMode={brevityMode}
                onSimulateEvent={onSimulateAcousticEvent}
              />
            )}

            {audioSubTab === 'dsp' && (
              <AcousticVoiceInspector
                selectedPersona={selectedPersona}
              />
            )}
          </div>
        )}

        {/* -----------------------------------------------------------------------
            HUB 5: COMMUNITY & SUPPORT (Agent 9)
        ------------------------------------------------------------------------ */}
        {mainHub === 'community' && (
          <div className="space-y-4">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                  <Users className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Community & Support Circles</span>
                  <span className="text-[10px] text-slate-500">Autonomous Agent #9: Grounded Google Search Discovery</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                Live Grounded Search
              </span>
            </div>

            <ParkinsonsEventsFinder />
          </div>
        )}

        {/* -----------------------------------------------------------------------
            HUB 6: CLINICAL RESEARCH & TOKEN BENCHMARKS
        ------------------------------------------------------------------------ */}
        {mainHub === 'specs' && (
          <div className="space-y-4">
            {/* Sub-tab Navigation */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 px-2">
                <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Brain className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Clinical Guidelines & Compute Benchmarks</span>
                  <span className="text-[10px] text-slate-500">PDD Scientific Framework & 78% Cost Reduction</span>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  id="subtab-research"
                  onClick={() => setSpecsSubTab('research')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    specsSubTab === 'research'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Brain className="w-3 h-3" />
                  <span>🧠 PDD Clinical Research Framework</span>
                </button>

                <button
                  type="button"
                  id="subtab-efficiency"
                  onClick={() => setSpecsSubTab('efficiency')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    specsSubTab === 'efficiency'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-3 h-3 fill-current" />
                  <span>⚡ Token & Compute Benchmarks</span>
                </button>
              </div>
            </div>

            {/* Sub-view Rendering */}
            {specsSubTab === 'research' && (
              <CognitiveResearchSection />
            )}

            {specsSubTab === 'efficiency' && (
              <TokenEfficiencySection />
            )}
          </div>
        )}

      </div>
    </div>
  );
};
