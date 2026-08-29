import React, { useState, useEffect } from 'react';
import { 
  Heart, Mic, Package, Stethoscope, Car, Users, Sparkles, 
  Activity, Radio, PhoneForwarded, Settings, UserCheck, ShieldCheck, 
  Clock, Volume2, RefreshCw
} from 'lucide-react';
import { 
  AgentPersonaId, PantryItem, ShoppingItem, NeedsAuditLog, 
  MedicationRefillItem, PharmacyCallLog, SpeechAcousticEvent, 
  EnergyState, BrevityMode, DailyGeminiBriefing, DailyCalendarBriefing,
  AdaptiveVoiceOrderItem, InfusionSiteLog
} from './types';
import { 
  INITIAL_PANTRY, INITIAL_SHOPPING_LIST, INITIAL_AUDIT_LOGS, 
  INITIAL_MEDICATIONS, INITIAL_PHARMACY_CALLS, INITIAL_SPEECH_ACOUSTICS,
  INITIAL_DAILY_BRIEFING, INITIAL_DAILY_CALENDAR_BRIEFING,
  INITIAL_ADAPTIVE_VOICE_ORDERS, INITIAL_INFUSION_SITES
} from './data/initialData';
import { AgentPersonaSelector } from './components/AgentPersonaSelector';
import { CaptainWadeMainView } from './components/CaptainWadeMainView';
import { CaregiverAdminConsole } from './components/CaregiverAdminConsole';
import { HackathonArchitectureModal } from './components/HackathonArchitectureModal';
import { CognitiveResearchModal } from './components/CognitiveResearchModal';
import { TokenEfficiencyModal } from './components/TokenEfficiencyModal';
import { AcousticVoiceInspector } from './components/AcousticVoiceInspector';
import { acousticVoice } from './utils/acousticVoiceEngine';
import { Brain, Zap } from 'lucide-react';

export default function App() {
  const [selectedPersona, setSelectedPersona] = useState<AgentPersonaId>('dr-evil');
  const [currentViewMode, setCurrentViewMode] = useState<'captain-wade' | 'caregiver-admin'>('captain-wade');
  const [showAcousticInspector, setShowAcousticInspector] = useState(false);
  
  // Shared Live State
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(INITIAL_PANTRY);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(INITIAL_SHOPPING_LIST);
  const [auditLogs, setAuditLogs] = useState<NeedsAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [medications, setMedications] = useState<MedicationRefillItem[]>(INITIAL_MEDICATIONS);
  const [pharmacyCalls, setPharmacyCalls] = useState<PharmacyCallLog[]>(INITIAL_PHARMACY_CALLS);
  const [speechAcoustics, setSpeechAcoustics] = useState<SpeechAcousticEvent[]>(INITIAL_SPEECH_ACOUSTICS);
  const [dailyBriefing, setDailyBriefing] = useState<DailyGeminiBriefing>(INITIAL_DAILY_BRIEFING);
  const [calendarBriefing, setCalendarBriefing] = useState<DailyCalendarBriefing>(INITIAL_DAILY_CALENDAR_BRIEFING);
  const [adaptiveVoiceOrders, setAdaptiveVoiceOrders] = useState<AdaptiveVoiceOrderItem[]>(INITIAL_ADAPTIVE_VOICE_ORDERS);
  const [infusionSites, setInfusionSites] = useState<InfusionSiteLog[]>(INITIAL_INFUSION_SITES);
  
  // Adaptive Brevity & Energy State
  const [energyState, setEnergyState] = useState<EnergyState>('GOOD_ENERGY');
  const [brevityMode, setBrevityMode] = useState<BrevityMode>('STANDARD_SENTENCE');
  const [isRefreshingBriefing, setIsRefreshingBriefing] = useState(false);
  
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);
  const [isTokenEfficiencyModalOpen, setIsTokenEfficiencyModalOpen] = useState(false);

  const urgentRefillCount = medications.filter(m => m.daysRemaining <= m.refillThresholdDays).length;

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
      {/* Top Accessible Navigation Bar */}
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

            {/* Mode Switcher: Wade (Patient) vs Elsbeth (Admin) */}
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center">
                <button
                  type="button"
                  id="view-toggle-captain-wade"
                  onClick={() => setCurrentViewMode('captain-wade')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    currentViewMode === 'captain-wade'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Wade (Patient)</span>
                </button>

                <button
                  type="button"
                  id="view-toggle-caregiver-admin"
                  onClick={() => setCurrentViewMode('caregiver-admin')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    currentViewMode === 'caregiver-admin'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Operations Console (Admin)</span>
                  {urgentRefillCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  )}
                </button>
              </div>

              {/* Token & Architecture Efficiency Button */}
              <button
                type="button"
                id="open-token-efficiency-btn"
                onClick={() => setIsTokenEfficiencyModalOpen(true)}
                className="hidden lg:flex px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black items-center gap-1.5 border border-emerald-300 transition-colors shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
                <span>⚡ Token Efficiency</span>
              </button>

              {/* Clinical Research & PDD Specs Button */}
              <button
                type="button"
                id="open-cognitive-research-btn"
                onClick={() => setIsResearchModalOpen(true)}
                className="hidden md:flex px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold items-center gap-1.5 border border-purple-200 transition-colors"
              >
                <Brain className="w-3.5 h-3.5 text-purple-600" />
                <span>PDD Research</span>
              </button>

              {/* Hackathon Specs Button */}
              <button
                type="button"
                id="open-hackathon-specs-btn"
                onClick={() => setIsArchitectureModalOpen(true)}
                className="hidden sm:flex px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold items-center gap-1.5 border border-indigo-200 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Hackathon Specs</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6 w-full">
        {/* 1. Primary User Window: Captain Wade Mode (Uncluttered, High Contrast, Voice Accessible) */}
        {currentViewMode === 'captain-wade' ? (
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
          />
        ) : (
          /* 2. Admin Panel: Caregiver Operations Console (Pantry Hub, Pharmacy Telephony, Speech Analytics, Persona Config, Calendar, Clinical, Favorites Engine, Infusion Sites) */
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

      {/* Architecture Modal */}
      <HackathonArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      {/* Clinical Research & PDD Modal */}
      <CognitiveResearchModal
        isOpen={isResearchModalOpen}
        onClose={() => setIsResearchModalOpen(false)}
      />

      {/* Token & Architecture Efficiency Modal */}
      <TokenEfficiencyModal
        isOpen={isTokenEfficiencyModalOpen}
        onClose={() => setIsTokenEfficiencyModalOpen(false)}
      />
    </div>
  );
}
