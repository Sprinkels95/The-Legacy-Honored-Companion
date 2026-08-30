import React, { useState, useEffect } from 'react';
import { 
  Heart, Mic, Package, Stethoscope, Car, Users, Sparkles, 
  Activity, Radio, PhoneForwarded, Settings, UserCheck, ShieldCheck, 
  Clock, Volume2, RefreshCw, Database
} from 'lucide-react';
import { 
  AgentPersonaId, PantryItem, ShoppingItem, NeedsAuditLog, 
  MedicationRefillItem, PharmacyCallLog, SpeechAcousticEvent, 
  EnergyState, BrevityMode, DailyGeminiBriefing, DailyCalendarBriefing,
  AdaptiveVoiceOrderItem, InfusionSiteLog, SyringeRefillLog, VyalevPumpCycle
} from './types';
import { 
  INITIAL_PANTRY, INITIAL_SHOPPING_LIST, INITIAL_AUDIT_LOGS, 
  INITIAL_MEDICATIONS, INITIAL_PHARMACY_CALLS, INITIAL_SPEECH_ACOUSTICS,
  INITIAL_DAILY_BRIEFING, INITIAL_DAILY_CALENDAR_BRIEFING,
  INITIAL_ADAPTIVE_VOICE_ORDERS, INITIAL_INFUSION_SITES, INITIAL_SYRINGE_REFILLS,
  INITIAL_PUMP_CYCLES
} from './data/initialData';
import { loadStoredState, saveStoredState } from './utils/persistence';
import { AgentPersonaSelector } from './components/AgentPersonaSelector';
import { CaptainWadeMainView } from './components/CaptainWadeMainView';
import { CaregiverAdminConsole } from './components/CaregiverAdminConsole';
import { QuickSyringeRefillModal } from './components/QuickSyringeRefillModal';
import { HackathonArchitectureModal } from './components/HackathonArchitectureModal';
import { MemoryLaneOriginModal } from './components/MemoryLaneOriginModal';
import { DiscordCaregiverModal } from './components/DiscordCaregiverModal';
import { acousticVoice } from './utils/acousticVoiceEngine';
import { Brain, Zap, Syringe, Flame, BookOpen, MessageSquare } from 'lucide-react';

export default function App() {
  const [selectedPersona, setSelectedPersona] = useState<AgentPersonaId>(() => 
    loadStoredState('SELECTED_PERSONA', 'dr-evil')
  );
  const [currentViewMode, setCurrentViewMode] = useState<'captain-wade' | 'caregiver-admin'>('captain-wade');
  const [showAcousticInspector, setShowAcousticInspector] = useState(false);
  
  // Shared Live State with persistent memory across refreshes
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => 
    loadStoredState('PANTRY', INITIAL_PANTRY)
  );
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => 
    loadStoredState('SHOPPING', INITIAL_SHOPPING_LIST)
  );
  const [auditLogs, setAuditLogs] = useState<NeedsAuditLog[]>(() => 
    loadStoredState('AUDIT_LOGS', INITIAL_AUDIT_LOGS)
  );
  const [medications, setMedications] = useState<MedicationRefillItem[]>(() => 
    loadStoredState('MEDICATIONS', INITIAL_MEDICATIONS)
  );
  const [pharmacyCalls, setPharmacyCalls] = useState<PharmacyCallLog[]>(() => 
    loadStoredState('PHARMACY_CALLS', INITIAL_PHARMACY_CALLS)
  );
  const [speechAcoustics, setSpeechAcoustics] = useState<SpeechAcousticEvent[]>(() => 
    loadStoredState('SPEECH_ACOUSTICS', INITIAL_SPEECH_ACOUSTICS)
  );
  const [dailyBriefing, setDailyBriefing] = useState<DailyGeminiBriefing>(() => 
    loadStoredState('DAILY_BRIEFING', INITIAL_DAILY_BRIEFING)
  );
  const [calendarBriefing, setCalendarBriefing] = useState<DailyCalendarBriefing>(() => 
    loadStoredState('CALENDAR_BRIEFING', INITIAL_DAILY_CALENDAR_BRIEFING)
  );
  const [adaptiveVoiceOrders, setAdaptiveVoiceOrders] = useState<AdaptiveVoiceOrderItem[]>(() => 
    loadStoredState('ADAPTIVE_VOICE_ORDERS', INITIAL_ADAPTIVE_VOICE_ORDERS)
  );
  const [infusionSites, setInfusionSites] = useState<InfusionSiteLog[]>(() => 
    loadStoredState('INFUSION_SITES', INITIAL_INFUSION_SITES)
  );
  const [syringeRefills, setSyringeRefills] = useState<SyringeRefillLog[]>(() => 
    loadStoredState('SYRINGE_REFILLS', INITIAL_SYRINGE_REFILLS)
  );
  const [pumpCycles, setPumpCycles] = useState<VyalevPumpCycle[]>(() => 
    loadStoredState('PUMP_CYCLES', INITIAL_PUMP_CYCLES)
  );
  const [isQuickRefillModalOpen, setIsQuickRefillModalOpen] = useState<boolean>(false);
  
  // Adaptive Brevity & Energy State
  const [energyState, setEnergyState] = useState<EnergyState>(() => 
    loadStoredState('ENERGY_STATE', 'GOOD_ENERGY')
  );
  const [brevityMode, setBrevityMode] = useState<BrevityMode>(() => 
    loadStoredState('BREVITY_MODE', 'STANDARD_SENTENCE')
  );
  const [isRefreshingBriefing, setIsRefreshingBriefing] = useState(false);

  // Sync to local storage on any state changes
  useEffect(() => {
    saveStoredState('PANTRY', pantryItems);
  }, [pantryItems]);

  useEffect(() => {
    saveStoredState('SHOPPING', shoppingItems);
  }, [shoppingItems]);

  useEffect(() => {
    saveStoredState('AUDIT_LOGS', auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    saveStoredState('MEDICATIONS', medications);
  }, [medications]);

  useEffect(() => {
    saveStoredState('PHARMACY_CALLS', pharmacyCalls);
  }, [pharmacyCalls]);

  useEffect(() => {
    saveStoredState('SPEECH_ACOUSTICS', speechAcoustics);
  }, [speechAcoustics]);

  useEffect(() => {
    saveStoredState('DAILY_BRIEFING', dailyBriefing);
  }, [dailyBriefing]);

  useEffect(() => {
    saveStoredState('CALENDAR_BRIEFING', calendarBriefing);
  }, [calendarBriefing]);

  useEffect(() => {
    saveStoredState('ADAPTIVE_VOICE_ORDERS', adaptiveVoiceOrders);
  }, [adaptiveVoiceOrders]);

  useEffect(() => {
    saveStoredState('INFUSION_SITES', infusionSites);
  }, [infusionSites]);

  useEffect(() => {
    saveStoredState('SYRINGE_REFILLS', syringeRefills);
  }, [syringeRefills]);

  useEffect(() => {
    saveStoredState('PUMP_CYCLES', pumpCycles);
  }, [pumpCycles]);

  useEffect(() => {
    saveStoredState('SELECTED_PERSONA', selectedPersona);
  }, [selectedPersona]);

  useEffect(() => {
    saveStoredState('ENERGY_STATE', energyState);
  }, [energyState]);

  useEffect(() => {
    saveStoredState('BREVITY_MODE', brevityMode);
  }, [brevityMode]);
  
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [hackathonInitialTab, setHackathonInitialTab] = useState<'overview' | 'security' | 'efficiency' | 'memory' | 'protocols'>('overview');
  const [isOriginModalOpen, setIsOriginModalOpen] = useState(false);
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState(false);

  const openHackathonModalWithTab = (tab: 'overview' | 'security' | 'efficiency' | 'memory' | 'protocols') => {
    setHackathonInitialTab(tab);
    setIsArchitectureModalOpen(true);
  };

  const urgentRefillCount = medications.filter(m => m.daysRemaining <= m.refillThresholdDays).length;

  // Master handler: Save syringe refill and auto-feed all pump metrics
  const handleSaveSyringeRefill = ({
    refillLog,
    updatedPumpCycle,
    updatedSiteLog,
    pumpHoursCalculated
  }: {
    refillLog: SyringeRefillLog;
    updatedPumpCycle: VyalevPumpCycle;
    updatedSiteLog?: InfusionSiteLog;
    pumpHoursCalculated: number;
  }) => {
    // 1. Prepend to syringe refill history
    setSyringeRefills(prev => [refillLog, ...prev]);

    // 2. Prepend / update active pump cycle
    setPumpCycles(prev => [updatedPumpCycle, ...prev]);

    // 3. Update Wade Mode daily briefings with fresh calculated pump hours remaining
    setDailyBriefing(prev => ({
      ...prev,
      pumpHoursLeft: pumpHoursCalculated,
      audioScript: prev.audioScript.replace(/\d+\s+hours\s+remaining/i, `${pumpHoursCalculated} hours remaining`)
    }));

    setCalendarBriefing(prev => ({
      ...prev,
      pumpHoursLeft: pumpHoursCalculated,
      spokenAudioScript: prev.spokenAudioScript.replace(/\d+\s+hours\s+remaining/i, `${pumpHoursCalculated} hours remaining`)
    }));

    // 4. If cannula site changed, update 1-inch radial site rotation logs
    if (updatedSiteLog) {
      handleAddInfusionSite(updatedSiteLog);
    }

    // 5. Play soothing confirmation chime
    acousticVoice.playEarcon('chime');
  };

  const handleAddInfusionSite = (newSite: InfusionSiteLog) => {
    // If marked active, ensure previous active sites become HEALING or RESTED_READY
    if (newSite.status === 'ACTIVE_INFUSING') {
      setInfusionSites(prev => [
        newSite,
        ...prev.filter(s => s.clockPosition !== newSite.clockPosition).map(s => 
          s.status === 'ACTIVE_INFUSING' ? { ...s, status: 'HEALING' as const } : s
        )
      ]);
    } else {
      setInfusionSites(prev => [
        newSite,
        ...prev.filter(s => s.clockPosition !== newSite.clockPosition)
      ]);
    }
  };

  const handleUpdateSiteStatus = (id: string, status: InfusionSiteLog['status']) => {
    setInfusionSites(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleAddAuditLog = (log: NeedsAuditLog) => {
    setAuditLogs(prev => [log, ...prev]);
  };

  const handleAddShoppingItem = (item: ShoppingItem) => {
    setShoppingItems(prev => [item, ...prev]);
  };

  const handleUpdatePantryQuantity = (id: string, newQty: number) => {
    setPantryItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: newQty, inStock: newQty > 0, lastUpdated: 'Just now' } : item
    ));
  };

  const handleToggleShoppingPurchased = (id: string) => {
    setShoppingItems(prev => prev.map(item =>
      item.id === id ? { ...item, purchased: !item.purchased } : item
    ));
  };

  const handleAddCustomPantryItem = (item: PantryItem) => {
    setPantryItems(prev => [item, ...prev]);
  };

  const handleDeleteShoppingItem = (id: string) => {
    setShoppingItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateMedication = (updatedMed: MedicationRefillItem) => {
    setMedications(prev => prev.map(m => m.id === updatedMed.id ? updatedMed : m));
  };

  const handleAddPharmacyCall = (call: PharmacyCallLog) => {
    setPharmacyCalls(prev => [call, ...prev]);
  };

  // Generate fresh Gemini Audio Briefing
  const handleRefreshDailyBriefing = async () => {
    setIsRefreshingBriefing(true);
    try {
      const response = await fetch('/api/agent/daily-gemini-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: selectedPersona,
          pumpHoursLeft: dailyBriefing.pumpHoursLeft || 14
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.briefing) {
          setDailyBriefing(data.briefing);
        }
      }
    } catch (e) {
      console.warn('Error fetching daily briefing:', e);
    } finally {
      setIsRefreshingBriefing(false);
    }
  };

  // Generate fresh Google Calendar Contextual Daily Briefing
  const handleRefreshCalendarBriefing = async () => {
    setIsRefreshingBriefing(true);
    try {
      const response = await fetch('/api/gemini/daily-calendar-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: selectedPersona,
          pumpHoursRemaining: dailyBriefing.pumpHoursLeft || 14
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.briefing) {
          setCalendarBriefing(data.briefing);
        }
      }
    } catch (e) {
      console.warn('Error fetching calendar daily briefing:', e);
    } finally {
      setIsRefreshingBriefing(false);
    }
  };

  // Process verbal voice command for Captain Wade
  const handleVoiceCommandSubmit = async (rawText: string, durationMs: number): Promise<string> => {
    // Dynamically match and increment frequency for known or new favorites
    const lower = rawText.toLowerCase();
    setAdaptiveVoiceOrders(prev => {
      let matched = false;
      const updated = prev.map(item => {
        const itemNameLower = item.name.toLowerCase();
        if (lower.includes(itemNameLower) || 
            (itemNameLower.includes('pudding') && lower.includes('pudding')) ||
            (itemNameLower.includes('root beer') && (lower.includes('root beer') || lower.includes('beer'))) ||
            (itemNameLower.includes('ice cream') && (lower.includes('ice cream') || lower.includes('mint'))) ||
            (itemNameLower.includes('juice') && lower.includes('juice')) ||
            (itemNameLower.includes('water') && lower.includes('water')) ||
            (itemNameLower.includes('pads') && (lower.includes('pads') || lower.includes('prep') || lower.includes('wipe'))) ||
            (itemNameLower.includes('rest') && (lower.includes('rest') || lower.includes('nap') || lower.includes('quiet'))) ||
            (itemNameLower.includes('oatmeal') && lower.includes('oatmeal'))) {
          matched = true;
          return {
            ...item,
            orderCount: item.orderCount + 1,
            lastOrderedAt: 'Just now'
          };
        }
        return item;
      });

      return updated;
    });

    // 1. Analyze voice acoustics & detect fatigue / slurring / hypophonia
    let acousticEvt: SpeechAcousticEvent;
    try {
      const acousticRes = await fetch('/api/agent/analyze-speech-acoustics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: rawText,
          durationMs,
          personaId: selectedPersona
        })
      });

      if (acousticRes.ok) {
        const data = await acousticRes.json();
        acousticEvt = data.acousticEvent;
      } else {
        acousticEvt = acousticVoice.analyzeVoiceAcoustics(rawText, durationMs);
      }
    } catch {
      acousticEvt = acousticVoice.analyzeVoiceAcoustics(rawText, durationMs);
    }

    // Append to speech acoustic history and update energy state
    setSpeechAcoustics(prev => [acousticEvt, ...prev]);
    setEnergyState(acousticEvt.energyClassification);
    setBrevityMode(acousticEvt.brevityModeApplied);
    acousticVoice.setEnergyState(acousticEvt.energyClassification);

    // 2. Pass request to autonomous needs intake engine (Pantry deduplication & offload)
    try {
      const intakeRes = await fetch('/api/agent/needs-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: rawText,
          personaId: selectedPersona,
          currentPantry: pantryItems,
          currentShoppingList: shoppingItems
        })
      });

      if (intakeRes.ok) {
        const data = await intakeRes.json();
        
        // Log audit event
        if (data.auditLog) {
          handleAddAuditLog(data.auditLog);
        }

        // Add to shopping list if new item
        if (data.createdShoppingItem) {
          handleAddShoppingItem(data.createdShoppingItem);
        }

        // If in ultra-concise single-word mode, compress the spoken reassurance
        if (acousticEvt.brevityModeApplied === 'ULTRA_CONCISE_SINGLE_WORD') {
          return acousticVoice.adaptResponseForBrevity('', selectedPersona, 'ULTRA_CONCISE_SINGLE_WORD');
        }

        return data.reassuranceText || acousticVoice.adaptResponseForBrevity('', selectedPersona, 'STANDARD_SENTENCE');
      }
    } catch (e) {
      console.warn('Intake error:', e);
    }

    // Fallback response based on detected brevity mode
    if (acousticEvt.brevityModeApplied === 'ULTRA_CONCISE_SINGLE_WORD') {
      return acousticVoice.adaptResponseForBrevity('', selectedPersona, 'ULTRA_CONCISE_SINGLE_WORD');
    }
    return "Thanks, Captain Wade. Everything is taken care of.";
  };

  // Trigger one-tap adaptive voice order directly
  const handleTriggerAdaptiveVoiceOrder = (order: AdaptiveVoiceOrderItem) => {
    setAdaptiveVoiceOrders(prev => prev.map(item => 
      item.id === order.id 
        ? { ...item, orderCount: item.orderCount + 1, lastOrderedAt: 'Just now' }
        : item
    ));
    handleVoiceCommandSubmit(order.spokenPhrase, 1600);
  };

  // Simulate acoustic telemetry event from admin tracker
  const handleSimulateAcousticEvent = (wpm: number, text: string) => {
    const durationMs = Math.max(1000, Math.round((text.split(/\s+/).length / (wpm / 60)) * 1000));
    const evt = acousticVoice.analyzeVoiceAcoustics(text, durationMs);
    setSpeechAcoustics(prev => [evt, ...prev]);
    setEnergyState(evt.energyClassification);
    setBrevityMode(evt.brevityModeApplied);
    acousticVoice.setEnergyState(evt.energyClassification);
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans">
      {/* Top Accessible Navigation Bar (Clean Header for Judges & Architecture Specs) */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-xs">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                    The Legacy Honored Companion
                  </h1>
                  <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                    Adaptive Cognitive Co-Pilot
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden md:block">
                  Adaptive, Voice-Led Cognitive Co-Pilot Tailored to an Individual’s Life History (Demonstrated via Captain Wade)
                </p>
              </div>
            </div>

            {/* Top Bar for Reviewers: Founding Story & Research Foundations, and System Architecture & Benchmarks */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* 1. The Founding Story & Research Foundations */}
              <button
                type="button"
                id="header-origin-story-btn"
                onClick={() => setIsOriginModalOpen(true)}
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white text-xs font-black items-center gap-1.5 transition-all flex shadow-xs hover:opacity-95 cursor-pointer ring-2 ring-amber-300/40"
                title="The Founding Story & Research Foundations: Written by Elsbeth for Captain Wade"
              >
                <span>🌅</span>
                <span className="font-extrabold hidden sm:inline">The Founding Story & Research</span>
                <span className="font-extrabold sm:hidden">Story & Research</span>
              </button>

              {/* 2. System Architecture & Benchmarks */}
              <button
                type="button"
                id="open-hackathon-specs-btn"
                onClick={() => openHackathonModalWithTab('overview')}
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold items-center gap-1.5 transition-colors flex shadow-xs cursor-pointer ring-1 ring-slate-700"
                title="Open Technical Specifications: 10 Autonomous Agents, Token Benchmarks, 4-Tier Memory & Architecture"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-extrabold hidden sm:inline">⚙️ System Architecture & Benchmarks</span>
                <span className="font-extrabold sm:hidden">⚙️ Architecture</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6 w-full">
        
        {/* App Mode Switcher Sub-Header Bar (Patient vs Ops Console) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 sm:p-2.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Active Viewport:</span>
            <span className="text-xs font-bold text-slate-900">
              {currentViewMode === 'captain-wade' ? '🧑‍🚒 Captain Wade (Patient Interface)' : '🌋 Secret Volcano Base Ops Console (Caregiver Admin)'}
            </span>
          </div>

          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200/80 flex items-center w-full sm:w-auto shadow-2xs gap-1">
            <button
              type="button"
              id="view-toggle-captain-wade"
              onClick={() => setCurrentViewMode('captain-wade')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                currentViewMode === 'captain-wade'
                  ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-400/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Captain Wade</span>
            </button>

            <button
              type="button"
              id="view-toggle-caregiver-admin"
              onClick={() => setCurrentViewMode('caregiver-admin')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                currentViewMode === 'caregiver-admin'
                  ? 'bg-slate-900 text-white shadow-xs ring-2 ring-slate-400/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Volcano Ops Console</span>
              {urgentRefillCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              )}
            </button>
          </div>
        </div>

        {/* 1. Primary User Window: Captain Wade Mode */}
        {currentViewMode === 'captain-wade' && (
          <CaptainWadeMainView
            selectedPersona={selectedPersona}
            dailyBriefing={dailyBriefing}
            calendarBriefing={calendarBriefing}
            onRefreshCalendarBriefing={handleRefreshCalendarBriefing}
            energyState={energyState}
            brevityMode={brevityMode}
            onSetEnergyState={setEnergyState}
            onSetBrevityMode={setBrevityMode}
            onVoiceCommandSubmit={handleVoiceCommandSubmit}
            onRefreshDailyBriefing={handleRefreshDailyBriefing}
            isRefreshingBriefing={isRefreshingBriefing}
            pantryItems={pantryItems}
            shoppingItems={shoppingItems}
            recentAcousticEvent={speechAcoustics[0]}
            adaptiveOrders={adaptiveVoiceOrders}
            onTriggerVoiceOrder={handleTriggerAdaptiveVoiceOrder}
            onOpenOriginModal={() => setIsOriginModalOpen(true)}
            onOpenDiscordModal={() => setIsDiscordModalOpen(true)}
          />
        )}

        {/* 2. Admin Panel: Caregiver Operations Console */}
        {currentViewMode === 'caregiver-admin' && (
          <CaregiverAdminConsole
            selectedPersona={selectedPersona}
            onSelectPersona={setSelectedPersona}
            pantryItems={pantryItems}
            shoppingItems={shoppingItems}
            auditLogs={auditLogs}
            medications={medications}
            pharmacyCalls={pharmacyCalls}
            speechAcoustics={speechAcoustics}
            energyState={energyState}
            brevityMode={brevityMode}
            dailyBriefing={dailyBriefing}
            calendarBriefing={calendarBriefing}
            onRefreshCalendarBriefing={handleRefreshCalendarBriefing}
            isRefreshingBriefing={isRefreshingBriefing}
            adaptiveOrders={adaptiveVoiceOrders}
            infusionSites={infusionSites}
            syringeRefills={syringeRefills}
            pumpCycles={pumpCycles}
            onOpenQuickRefill={() => setIsQuickRefillModalOpen(true)}
            onAddInfusionSite={handleAddInfusionSite}
            onUpdateSiteStatus={handleUpdateSiteStatus}
            onUpdateAdaptiveOrders={setAdaptiveVoiceOrders}
            onTriggerVoiceOrder={handleTriggerAdaptiveVoiceOrder}
            onUpdatePantryQuantity={handleUpdatePantryQuantity}
            onToggleShoppingPurchased={handleToggleShoppingPurchased}
            onAddCustomPantryItem={handleAddCustomPantryItem}
            onDeleteShoppingItem={handleDeleteShoppingItem}
            onUpdateMedication={handleUpdateMedication}
            onAddPharmacyCall={handleAddPharmacyCall}
            onAddAuditLog={handleAddAuditLog}
            onAddShoppingItem={handleAddShoppingItem}
            onSimulateAcousticEvent={handleSimulateAcousticEvent}
            onOpenDiscordModal={() => setIsDiscordModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">The Legacy Honored Companion</span>
            <span>•</span>
            <span>Google AI Agent Hackathon</span>
          </div>
          <p className="text-slate-400">
            Powered by Gemini 3.7 Flash & @google/genai SDK on Google Cloud Run
          </p>
        </div>
      </footer>

      {/* Discord #caregiver-alerts Live Feed & Webhook Modal */}
      <DiscordCaregiverModal
        isOpen={isDiscordModalOpen}
        onClose={() => setIsDiscordModalOpen(false)}
      />

      {/* Quick Syringe Refill & Cannula Site Logger Modal */}
      <QuickSyringeRefillModal
        isOpen={isQuickRefillModalOpen}
        onClose={() => setIsQuickRefillModalOpen(false)}
        infusionSites={infusionSites}
        onSaveRefill={handleSaveSyringeRefill}
        lastRefill={syringeRefills[0]}
        currentActiveSite={infusionSites.find(s => s.status === 'ACTIVE_INFUSING')}
        currentPumpCycle={pumpCycles[0]}
      />

      {/* Architecture & Clinical Specs Modal */}
      <HackathonArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
        initialTab={hackathonInitialTab as any}
      />

      {/* The Founding Story & Clinical Research Modal */}
      <MemoryLaneOriginModal
        isOpen={isOriginModalOpen}
        onClose={() => setIsOriginModalOpen(false)}
      />
    </div>
  );
}
