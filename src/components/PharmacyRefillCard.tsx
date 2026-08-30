import React, { useState } from 'react';
import { 
  PhoneCall, PhoneForwarded, Pill, AlertTriangle, CheckCircle2, 
  Clock, ShieldAlert, Sparkles, Volume2, VolumeX, ChevronDown, 
  ChevronUp, Truck, Snowflake, Building2, RefreshCw, Send, Radio,
  FileText, ShieldCheck, Check, Play, Pause, BellRing, Info
} from 'lucide-react';
import { MedicationRefillItem, PharmacyCallLog, AgentPersonaId, RefillStatus } from '../types';
import { acousticVoice } from '../utils/acousticVoiceEngine';

interface PharmacyRefillCardProps {
  selectedPersona: AgentPersonaId;
  medications: MedicationRefillItem[];
  callLogs: PharmacyCallLog[];
  onUpdateMedication: (updated: MedicationRefillItem) => void;
  onAddCallLog: (log: PharmacyCallLog) => void;
}

export function PharmacyRefillCard({
  selectedPersona,
  medications,
  callLogs,
  onUpdateMedication,
  onAddCallLog
}: PharmacyRefillCardProps) {
  const [selectedMed, setSelectedMed] = useState<MedicationRefillItem | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [activeCallStep, setActiveCallStep] = useState<number>(0);
  const [liveCallLog, setLiveCallLog] = useState<PharmacyCallLog | null>(null);
  const [personaReassurance, setPersonaReassurance] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(callLogs[0]?.id || null);
  const [filterType, setFilterType] = useState<'ALL' | 'URGENT' | 'CONTINUOUS_PUMP'>('ALL');
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [deliveryPreference, setDeliveryPreference] = useState<'Refrigerated Cold-Chain Courier' | 'Pharmacy Counter Pickup' | 'Standard Priority Mail'>('Refrigerated Cold-Chain Courier');
  const [urgencyMode, setUrgencyMode] = useState<'STANDARD' | 'EXPEDITED_OVERNIGHT'>('EXPEDITED_OVERNIGHT');

  const urgentMeds = medications.filter(m => m.daysRemaining <= m.refillThresholdDays);

  const filteredMeds = medications.filter(m => {
    if (filterType === 'URGENT') return m.daysRemaining <= m.refillThresholdDays;
    if (filterType === 'CONTINUOUS_PUMP') return m.deliveryMethod.includes('Subcutaneous') || m.name.includes('Vyalev');
    return true;
  });

  const speakText = (text: string) => {
    if (isSpeakingAudio) {
      acousticVoice.cancel();
      setIsSpeakingAudio(false);
      return;
    }

    setIsSpeakingAudio(true);
    acousticVoice.speak(text, selectedPersona, {
      onStart: () => setIsSpeakingAudio(true),
      onEnd: () => setIsSpeakingAudio(false),
      onError: () => setIsSpeakingAudio(false)
    });
  };

  const handleTriggerCall = async (med: MedicationRefillItem) => {
    setSelectedMed(med);
    setIsCalling(true);
    setActiveCallStep(1);
    setLiveCallLog(null);
    setPersonaReassurance(null);

    // Play soft cue for active telephony session
    acousticVoice.playEarcon('mic-active');

    // Optimistic status update
    onUpdateMedication({
      ...med,
      refillStatus: 'CALL_IN_PROGRESS'
    });

    try {
      // Trigger live Twilio voice call in background if telephony configured
      fetch('/api/telephony/dispatch-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: '+19494410137',
          callType: 'pharmacy-refill',
          medicationName: `${med.name} (${med.deliveryMethod})`,
          rxNumber: med.rxNumber,
          patientName: 'Wade Seymour'
        })
      }).catch(err => console.log('[Pharmacy Telephony call trigger]', err));

      const response = await fetch('/api/agent/call-pharmacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medication: med,
          personaId: selectedPersona,
          deliveryPreference: med.isRefrigerated || med.deliveryMethod.includes('Subcutaneous') 
            ? 'Refrigerated Cold-Chain Courier' 
            : deliveryPreference,
          urgency: urgencyMode,
          customNotes: `Care Navigator auto-refill for Captain Wade. Rx ${med.rxNumber}`
        })
      });

      const data = await response.json();

      if (data.success && data.callLog) {
        // Stepwise call simulation for UI fidelity
        setActiveCallStep(2);
        await new Promise(r => setTimeout(r, 600));
        setActiveCallStep(3);
        await new Promise(r => setTimeout(r, 700));
        setActiveCallStep(4);

        // Play soothing major triad chime upon confirmed refill order
        acousticVoice.playEarcon('refill-confirmed');

        setLiveCallLog(data.callLog);
        setPersonaReassurance(data.spokenPersonaReassurance);
        onAddCallLog(data.callLog);
        setExpandedLogId(data.callLog.id);

        // Update med status
        onUpdateMedication({
          ...med,
          refillStatus: 'REFILL_CONFIRMED',
          daysRemaining: data.newDaysRemaining || 30,
          currentPillCountOrVials: med.totalPrescriptionQuantity,
          lastRefillDate: 'Today'
        });

        if (data.spokenPersonaReassurance) {
          speakText(data.spokenPersonaReassurance);
        }
      }
    } catch (err) {
      console.error("Error triggering autonomous pharmacy call:", err);
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Autonomous Telephony Agent Overview */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <PhoneForwarded className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Autonomous Pharmacy Refill & Voice Agent
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Gemini Telephony AI
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-600 animate-ping" />
                  Telephony Engine Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Monitors prescription reserves, navigates pharmacy telephone IVR menus, verifies insurance prior-authorizations, and books refrigerated cold-chain deliveries without caregiver hold times.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 self-start md:self-auto">
            <div className="text-center px-3 border-r border-slate-200">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Urgent Refills</span>
              <span className={`text-lg font-black ${urgentMeds.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {urgentMeds.length}
              </span>
            </div>
            <div className="text-center px-3 border-r border-slate-200">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Calls</span>
              <span className="text-lg font-black text-slate-800">
                {callLogs.length}
              </span>
            </div>
            <div className="text-center px-2">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Cold Chain</span>
              <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">Active</span>
            </div>
          </div>
        </div>

        {/* AI Role Explanation Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-emerald-950">What the Telephony AI Does: </span>
              <span className="text-emerald-900">
                Autonomously dials pharmacies, responds to automated touch-tone IVRs, recites Rx IDs and date of birth, requests cold-chain couriers for refrigerated items (Vyalev), and logs confirmation numbers without human waiting on hold.
              </span>
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Filter Inventory:</span>
          <button
            type="button"
            id="filter-all-meds-btn"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Medications ({medications.length})
          </button>
          <button
            type="button"
            id="filter-urgent-meds-btn"
            onClick={() => setFilterType('URGENT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'URGENT'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Urgent Refill Needed ({urgentMeds.length})</span>
          </button>
          <button
            type="button"
            id="filter-pump-meds-btn"
            onClick={() => setFilterType('CONTINUOUS_PUMP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'CONTINUOUS_PUMP'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5 text-indigo-500" />
            <span>Vyalev Continuous Infusion</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left is Medication Cards, Right is Live Call Terminal & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Medication Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-indigo-600" />
              <span>Prescription Stock & Dosing Schedule</span>
            </h3>
            <span className="text-xs text-slate-500">Autonomous Refill Threshold: &le; 7 Days</span>
          </div>

          <div className="space-y-3.5">
            {filteredMeds.map((med) => {
              const isUrgent = med.daysRemaining <= med.refillThresholdDays;
              const isPump = med.deliveryMethod.includes('Subcutaneous') || med.isRefrigerated;

              return (
                <div
                  key={med.id}
                  id={`med-card-${med.id}`}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all ${
                    isUrgent 
                      ? 'border-amber-300 shadow-xs ring-1 ring-amber-200/50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-base text-slate-900 tracking-tight">
                          {med.name}
                        </h4>
                        {isPump && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1">
                            <Snowflake className="w-3 h-3 text-sky-600" />
                            Cold Chain (2°C-8°C)
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          {med.deliveryMethod}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {med.dosage} • {med.frequency}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {med.refillStatus === 'CALL_IN_PROGRESS' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 animate-pulse flex items-center gap-1">
                          <PhoneCall className="w-3.5 h-3.5 animate-spin" />
                          Calling IVR...
                        </span>
                      )}
                      {med.refillStatus === 'REFILL_CONFIRMED' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Refill Confirmed
                        </span>
                      )}
                      {med.refillStatus === 'REFILL_NEEDED' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1 border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Refill Window Open
                        </span>
                      )}
                      {med.refillStatus === 'OK' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-slate-500" />
                          Sufficient Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Supply Level Progress Bar */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Remaining Supply: <strong className={isUrgent ? 'text-amber-600 font-bold' : 'text-slate-900'}>{med.daysRemaining} days</strong> ({med.currentPillCountOrVials} units left)
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">Rx #{med.rxNumber}</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          med.daysRemaining <= 3 
                            ? 'bg-rose-500' 
                            : med.daysRemaining <= 7 
                            ? 'bg-amber-500' 
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (med.daysRemaining / 30) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Pharmacy Details & Action Button */}
                  <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
                    <div className="text-xs text-slate-600">
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{med.pharmacyName}</span>
                      </div>
                      <span className="text-slate-500 text-[11px]">Phone: {med.pharmacyPhone} • Dr: {med.prescribingDoctor}</span>
                    </div>

                    {/* Trigger Call Button */}
                    <button
                      type="button"
                      id={`call-refill-btn-${med.id}`}
                      disabled={isCalling}
                      onClick={() => handleTriggerCall(med)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 ${
                        isUrgent 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      } ${isCalling ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <PhoneForwarded className="w-3.5 h-3.5" />
                      <span>{isCalling && selectedMed?.id === med.id ? 'Calling Pharmacy...' : 'Call & Refill with AI'}</span>
                    </button>
                  </div>

                  {med.notes && (
                    <p className="text-[11px] text-slate-500 italic mt-2 flex items-center gap-1">
                      <Info className="w-3 h-3 text-slate-400 shrink-0" />
                      {med.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Call Simulator & Audited Telephony Transcripts */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active Call Simulation Terminal */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  {isCalling ? 'Active Telephony Session' : 'Voice Dispatch Center'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Twilio SIP • ElevenLabs Voice
              </span>
            </div>

            {isCalling ? (
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                  <span>Target: {selectedMed?.pharmacyName}</span>
                  <span className="text-emerald-400 font-bold animate-pulse">00:{activeCallStep * 12}s</span>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 font-mono text-xs space-y-2">
                  <div className="flex items-center gap-2 text-sky-300">
                    <Radio className="w-3.5 h-3.5 animate-spin" />
                    <span>Dialing {selectedMed?.pharmacyPhone}...</span>
                  </div>
                  {activeCallStep >= 2 && (
                    <div className="text-emerald-300 pl-4 border-l border-emerald-500/40">
                      &gt; IVR Refill Tree Detected: Selecting Option 1 (Prescription Refill)
                    </div>
                  )}
                  {activeCallStep >= 3 && (
                    <div className="text-amber-300 pl-4 border-l border-amber-500/40">
                      &gt; Submitting Rx#{selectedMed?.rxNumber} &amp; Patient DOB (03/14/1952)
                    </div>
                  )}
                  {activeCallStep >= 4 && (
                    <div className="text-purple-300 pl-4 border-l border-purple-500/40">
                      &gt; Prior Authorization Verified. Cold-Chain Delivery Confirmed.
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-mono">
                  <div className="w-1.5 h-4 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-6 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-8 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <div className="w-1.5 h-5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                  <span className="ml-2">Synthesizing vocal response to IVR...</span>
                </div>
              </div>
            ) : liveCallLog ? (
              <div className="space-y-3.5">
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 text-xs space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Refill Order Confirmed
                    </span>
                    <span className="font-mono text-emerald-300">{liveCallLog.confirmationNumber}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {liveCallLog.fulfillmentType} scheduled for arrival on <strong>{liveCallLog.estimatedReadyDate}</strong> at <strong>{liveCallLog.estimatedReadyTime}</strong>.
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-emerald-500/20">
                    <span>Prior Auth: <strong className="text-emerald-400">ACTIVE &amp; VALID</strong></span>
                    <span>Webhook Alert: <strong className="text-sky-400">{liveCallLog.alertChannel}</strong></span>
                  </div>
                </div>

                {personaReassurance && (
                  <div className="bg-slate-800/90 rounded-xl p-3.5 border border-slate-700 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Spoken Reassurance ({selectedPersona})
                      </span>
                      <button
                        type="button"
                        onClick={() => speakText(personaReassurance)}
                        className="p-1 rounded-md bg-indigo-900/60 hover:bg-indigo-800 text-indigo-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        {isSpeakingAudio ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3" />}
                        <span>{isSpeakingAudio ? 'Mute' : 'Play Voice'}</span>
                      </button>
                    </div>
                    <p className="text-slate-200 text-xs leading-relaxed italic">
                      "{personaReassurance}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <PhoneCall className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  Ready to dispatch autonomous telephony calls. Select any medication to trigger AI IVR navigation.
                </p>
              </div>
            )}
          </div>

          {/* Audited Call Logs History */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Audited Telephony Transcripts ({callLogs.length})</span>
              </h4>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">HIPAA Compliant Log</span>
            </div>

            <div className="space-y-3">
              {callLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div
                    key={log.id}
                    className="border border-slate-200 rounded-xl overflow-hidden text-xs transition-all hover:border-slate-300"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="w-full p-3 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{log.medicationName.split('(')[0]}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                            {log.confirmationNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {log.pharmacyName} • {log.timestamp} • Duration: {log.callDurationSeconds}s
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {log.fulfillmentType.includes('Cold-Chain') ? 'Cold-Chain' : 'Pickup'}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-3.5 bg-white border-t border-slate-200 space-y-3">
                        <div className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <strong className="text-slate-800 block text-[11px] uppercase tracking-wider mb-1">Narrative Summary:</strong>
                          {log.fullTranscript}
                        </div>

                        {/* Step by step dialogue */}
                        <div className="space-y-2">
                          <strong className="text-slate-700 block text-[11px] uppercase tracking-wider">Multi-Turn IVR Dialogue:</strong>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {log.dialogueScript.map((step, idx) => (
                              <div
                                key={idx}
                                className={`p-2 rounded-lg text-[11px] ${
                                  step.speaker === 'AGENT'
                                    ? 'bg-indigo-50/80 text-indigo-950 ml-4 border border-indigo-100'
                                    : 'bg-slate-100 text-slate-800 mr-4 border border-slate-200/60'
                                }`}
                              >
                                <div className="flex items-center justify-between font-mono text-[9px] text-slate-500 mb-0.5">
                                  <span className="font-bold">{step.speaker === 'AGENT' ? 'AI Voice Agent' : 'Pharmacy IVR'}</span>
                                  <span>{step.timeOffset}</span>
                                </div>
                                <p className="leading-snug">{step.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                          <span>Prior Auth: <strong className="text-emerald-700 font-bold">{log.priorAuthStatus}</strong></span>
                          <span>Caregiver Alert: <strong className="text-slate-700">{log.alertChannel}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
