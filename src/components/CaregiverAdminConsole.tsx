import React, { useState } from 'react';
import { 
  Package, PhoneForwarded, Stethoscope, Car, Users, Activity, 
  Settings, Radio, Sparkles, Mic, FileText, CheckCircle2, ShieldCheck,
  Zap, HeartPulse, Calendar, Brain, BookOpen, ShoppingBag, Layers,
  Clock, Volume2, ArrowRight, Database, MessageSquare
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
import { CaregiverSettingsModal } from './CaregiverSettingsModal';
import { WadeFavoritesManager } from './WadeFavoritesManager';
import { InfusionSiteManager } from './InfusionSiteManager';
import { CaregiverAlertsOpsSection } from './CaregiverAlertsOpsSection';
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
  onOpenDiscordModal?: () => void;
}

export type MainHubId = 'household' | 'clinical' | 'mobility' | 'reports';

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
  onSimulateAcousticEvent,
  onOpenDiscordModal
}) => {
  // Main Consolidated 4 Pillars
  const [mainHub, setMainHub] = useState<MainHubId>('clinical');

  // Sub-tabs for each Hub
  const [clinicalSubTab, setClinicalSubTab] = useState<'infusion' | 'pharmacy' | 'acoustics' | 'dsp'>('infusion');
  const [householdSubTab, setHouseholdSubTab] = useState<'pantry' | 'favorites'>('pantry');
  const [mobilitySubTab, setMobilitySubTab] = useState<'briefing' | 'transit'>('briefing');
  const [reportsSubTab, setReportsSubTab] = useState<'synthesis' | 'community' | 'alerts'>('synthesis');

  // Persona & Engine Settings Modal State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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
              <span>Operations Command</span>
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

        {/* Quick System Badge & Top-Right Settings Cog */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
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

          <button
            type="button"
            id="caregiver-settings-cog-btn"
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-3 bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 border border-slate-200 rounded-2xl flex items-center gap-2.5 text-slate-700 hover:text-slate-900 transition-all shadow-xs cursor-pointer group"
            title="Persona, Voice & Audio Settings"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors shadow-2xs">
              <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div className="text-left text-xs hidden sm:block pr-1">
              <div className="font-extrabold text-slate-900 flex items-center gap-1">
                <span>Persona Settings</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Voice & Tone Engine</div>
            </div>
          </button>
        </div>
      </div>

      {/* Grouped Operations Command Centers (Clean 4-Hub Hierarchy) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Operational Command Hubs (4 Core Pillars)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Streamlined for rapid caregiver access
          </span>
        </div>

        {/* 4 CORE MASTER HUBS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* PILLAR 1: CLINICAL & MEDICAL COMMAND */}
          <button
            type="button"
            id="hub-tab-clinical"
            onClick={() => setMainHub('clinical')}
            className={`p-4 rounded-2xl text-left transition-all border relative flex flex-col justify-between cursor-pointer ${
              mainHub === 'clinical'
                ? 'bg-rose-950 text-white border-rose-500 shadow-md ring-2 ring-rose-400/40'
                : 'bg-white text-slate-800 border-slate-200 hover:border-rose-300 hover:bg-rose-50/30 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2.5">
              <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
                mainHub === 'clinical' ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-600'
              }`}>
                <HeartPulse className="w-5 h-5" />
              </div>
              {urgentRefillCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 animate-pulse">
                  {urgentRefillCount} Refill Due
                </span>
              ) : (
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                  mainHub === 'clinical' ? 'bg-rose-500/30 text-rose-200' : 'bg-rose-50 text-rose-700'
                }`}>
                  Agents 2, 3, 6, 10
                </span>
              )}
            </div>

            <div>
              <span className="text-sm font-black tracking-tight block">Clinical & Medical</span>
              <p className={`text-xs mt-1 leading-snug ${mainHub === 'clinical' ? 'text-rose-200' : 'text-slate-500'}`}>
                Vyalev Pump, Rx Refills, Voice Acoustics & DSP
              </p>
            </div>
          </button>

          {/* PILLAR 2: HOUSEHOLD & NUTRITION */}
          <button
            type="button"
            id="hub-tab-household"
            onClick={() => setMainHub('household')}
            className={`p-4 rounded-2xl text-left transition-all border relative flex flex-col justify-between cursor-pointer ${
              mainHub === 'household'
                ? 'bg-sky-950 text-white border-sky-500 shadow-md ring-2 ring-sky-400/40'
                : 'bg-white text-slate-800 border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2.5">
              <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
                mainHub === 'household' ? 'bg-sky-500 text-white' : 'bg-sky-50 text-sky-600'
              }`}>
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                mainHub === 'household' ? 'bg-sky-500/30 text-sky-200' : 'bg-sky-50 text-sky-700'
              }`}>
                Agent 4 + Ranker
              </span>
            </div>

            <div>
              <span className="text-sm font-black tracking-tight block">Household & Nutrition</span>
              <p className={`text-xs mt-1 leading-snug ${mainHub === 'household' ? 'text-sky-200' : 'text-slate-500'}`}>
                Pantry Deduplication & Wade's Voice Favorites
              </p>
            </div>
          </button>

          {/* PILLAR 3: SCHEDULE, MOBILITY & 2026 INSURANCE */}
          <button
            type="button"
            id="hub-tab-mobility"
            onClick={() => {
              setMainHub('mobility');
              setMobilitySubTab('briefing');
            }}
            className={`p-4 rounded-2xl text-left transition-all border relative flex flex-col justify-between cursor-pointer ${
              mainHub === 'mobility'
                ? 'bg-indigo-950 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400/40'
                : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2.5">
              <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
                mainHub === 'mobility' ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600'
              }`}>
                <Calendar className="w-5 h-5" />
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                mainHub === 'mobility' ? 'bg-indigo-500/30 text-indigo-200' : 'bg-indigo-50 text-indigo-700'
              }`}>
                Agents 5, 8 (10 Rides/Yr)
              </span>
            </div>

            <div>
              <span className="text-sm font-black tracking-tight block">Calendar & 2026 Transit</span>
              <p className={`text-xs mt-1 leading-snug ${mainHub === 'mobility' ? 'text-indigo-200' : 'text-slate-500'}`}>
                7-Day Calendar Horizon, Daily Briefing & Uber Staging
              </p>
            </div>
          </button>

          {/* PILLAR 4: DOCTOR SYNTHESIS & COMMUNITY */}
          <button
            type="button"
            id="hub-tab-reports"
            onClick={() => setMainHub('reports')}
            className={`p-4 rounded-2xl text-left transition-all border relative flex flex-col justify-between cursor-pointer ${
              mainHub === 'reports'
                ? 'bg-slate-900 text-white border-slate-500 shadow-md ring-2 ring-slate-400/40'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50/30 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2.5">
              <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
                mainHub === 'reports' ? 'bg-amber-500 text-slate-950' : 'bg-amber-50 text-amber-600'
              }`}>
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                mainHub === 'reports' ? 'bg-slate-800 text-amber-300' : 'bg-amber-50 text-amber-700'
              }`}>
                Agents 7, 9 & Alerts
              </span>
            </div>

            <div>
              <span className="text-sm font-black tracking-tight block">Reports & Community</span>
              <p className={`text-xs mt-1 leading-snug ${mainHub === 'reports' ? 'text-slate-300' : 'text-slate-500'}`}>
                Neurologist Synthesis, Rock Steady Boxing & Alerts
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
            HUB 1: CLINICAL & MEDICAL COMMAND (Agents 2, 3, 6, 10)
        ------------------------------------------------------------------------ */}
        {mainHub === 'clinical' && (
          <div className="space-y-4">
            {/* Sub-tab Navigation */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 px-2">
                <span className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
                  <HeartPulse className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Clinical & Medical Command</span>
                  <span className="text-[10px] text-slate-500">Autonomous Agents #2, #3, #6, and #10</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  id="subtab-infusion"
                  onClick={() => setClinicalSubTab('infusion')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    clinicalSubTab === 'infusion'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>💉 1" Site Rotation & Pump</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-black/20 rounded-md">Agent 2</span>
                </button>

                <button
                  type="button"
                  id="subtab-pharmacy"
                  onClick={() => setClinicalSubTab('pharmacy')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    clinicalSubTab === 'pharmacy'
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
                  id="subtab-acoustics"
                  onClick={() => setClinicalSubTab('acoustics')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    clinicalSubTab === 'acoustics'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Activity className="w-3 h-3" />
                  <span>Speech Fatigue Telemetry</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-black/20 rounded-md">Agent 6</span>
                </button>

                <button
                  type="button"
                  id="subtab-dsp"
                  onClick={() => setClinicalSubTab('dsp')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    clinicalSubTab === 'dsp'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Radio className="w-3 h-3" />
                  <span>Audio DSP Studio</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-black/20 rounded-md">Agent 10</span>
                </button>
              </div>
            </div>

            {clinicalSubTab === 'infusion' && (
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

            {clinicalSubTab === 'pharmacy' && (
              <PharmacyRefillCard
                selectedPersona={selectedPersona}
                medications={medications}
                callLogs={pharmacyCalls}
                onUpdateMedication={onUpdateMedication}
                onAddCallLog={onAddPharmacyCall}
              />
            )}

            {clinicalSubTab === 'acoustics' && (
              <SpeechAcousticTracker
                acousticEvents={speechAcoustics}
                currentEnergyState={energyState}
                currentBrevityMode={brevityMode}
                onSimulateEvent={onSimulateAcousticEvent}
                onOpenDiscordModal={onOpenDiscordModal}
              />
            )}

            {clinicalSubTab === 'dsp' && (
              <AcousticVoiceInspector
                selectedPersona={selectedPersona}
              />
            )}
          </div>
        )}

        {/* -----------------------------------------------------------------------
            HUB 2: HOUSEHOLD & NUTRITION (Agent 4 + Adaptive Ranker)
        ------------------------------------------------------------------------ */}
        {mainHub === 'household' && (
          <div className="space-y-4">
            {/* Sub-tab Navigation */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 px-2">
                <span className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
                  <ShoppingBag className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Household & Nutrition Hub</span>
                  <span className="text-[10px] text-slate-500">Autonomous Agent #4 + Adaptive Frequency Ranking</span>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  id="subtab-pantry"
                  onClick={() => setHouseholdSubTab('pantry')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    householdSubTab === 'pantry'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Package className="w-3 h-3" />
                  <span>Pantry & Shopping Queue</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-black/20 rounded-md">Agent 4</span>
                </button>

                <button
                  type="button"
                  id="subtab-favorites"
                  onClick={() => setHouseholdSubTab('favorites')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    householdSubTab === 'favorites'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Wade's Favorites & Quick Orders</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-black/20 rounded-md">Ranker</span>
                </button>
              </div>
            </div>

            {/* Sub-view Rendering */}
            {householdSubTab === 'pantry' && (
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

            {householdSubTab === 'favorites' && (
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
            HUB 3: SCHEDULE, MOBILITY & 2026 INSURANCE (Agents 5 & 8)
        ------------------------------------------------------------------------ */}
        {mainHub === 'mobility' && (
          <div className="space-y-4">
            {/* Sub-tab Navigation */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 px-2">
                <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Calendar className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Calendar Horizon, Briefings & Transit Logistics</span>
                  <span className="text-[10px] text-slate-500">Autonomous Agents #5 (7-Day Schedule) and #8 (Uber Staging & Insurance)</span>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  id="subtab-briefing"
                  onClick={() => setMobilitySubTab('briefing')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    mobilitySubTab === 'briefing'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>Calendar</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-black/20 rounded-md">Agent 5</span>
                </button>

                <button
                  type="button"
                  id="subtab-mobility-transit"
                  onClick={() => setMobilitySubTab('transit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    mobilitySubTab === 'transit'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Car className="w-3 h-3" />
                  <span>Uber Staging</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-black/20 rounded-md">Agent 8</span>
                </button>
              </div>
            </div>

            {/* Sub-view Rendering */}
            {mobilitySubTab === 'transit' && (
              <MobilityLogisticsView onOpenDiscordModal={onOpenDiscordModal} />
            )}

            {mobilitySubTab === 'briefing' && (
              <DailyBriefingCard
                briefing={calendarBriefing}
                selectedPersona={selectedPersona}
                onRefreshBriefing={onRefreshCalendarBriefing}
                isRefreshing={isRefreshingBriefing}
                onOpenDiscordModal={onOpenDiscordModal}
              />
            )}
          </div>
        )}

        {/* -----------------------------------------------------------------------
            HUB 4: DOCTOR SYNTHESIS & COMMUNITY (Agents 7, 9 & Alerts)
        ------------------------------------------------------------------------ */}
        {mainHub === 'reports' && (
          <div className="space-y-4">
            {/* Sub-tab Navigation */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 px-2">
                <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                  <Stethoscope className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Neurologist Synthesis & Community Circles</span>
                  <span className="text-[10px] text-slate-500">Autonomous Agents #7, #9 and Emergency Alerts</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  id="subtab-synthesis"
                  onClick={() => setReportsSubTab('synthesis')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    reportsSubTab === 'synthesis'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Stethoscope className="w-3 h-3" />
                  <span>Neurologist Report & Google Docs</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-black/20 rounded-md">Agent 7</span>
                </button>

                <button
                  type="button"
                  id="subtab-community"
                  onClick={() => setReportsSubTab('community')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    reportsSubTab === 'community'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3 h-3" />
                  <span>Support Groups & Boxing</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-black/20 rounded-md">Agent 9</span>
                </button>

                <button
                  type="button"
                  id="subtab-alerts"
                  onClick={() => setReportsSubTab('alerts')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    reportsSubTab === 'alerts'
                      ? 'bg-[#5865F2] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Caregiver Alerts & Discord</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-black/20 rounded-md">Relay</span>
                </button>
              </div>
            </div>

            {/* Sub-view Rendering */}
            {reportsSubTab === 'synthesis' && (
              <WeeklyBehaviorReportView
                motorLogs={INITIAL_MOTOR_LOGS}
                pumpCycles={pumpCycles}
                routineLogs={INITIAL_ROUTINES}
                infusionSites={infusionSites}
              />
            )}

            {reportsSubTab === 'community' && (
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

            {reportsSubTab === 'alerts' && (
              <CaregiverAlertsOpsSection onOpenDiscordModal={onOpenDiscordModal} />
            )}
          </div>
        )}

      </div>

      {/* Caregiver Persona & Vocal Tone Settings Modal */}
      <CaregiverSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        selectedPersona={selectedPersona}
        onSelectPersona={onSelectPersona}
      />
    </div>
  );
};
