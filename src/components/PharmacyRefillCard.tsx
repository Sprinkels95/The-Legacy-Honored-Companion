import React, { useState } from 'react';
import { 
  PhoneCall, PhoneForwarded, Pill, AlertTriangle, CheckCircle2, 
  Clock, ShieldAlert, Sparkles, Volume2, VolumeX, ChevronDown, 
  ChevronUp, Truck, Snowflake, Building2, RefreshCw, Send, Radio,
  FileText, ShieldCheck, Check, Play, Pause, BellRing, Info,
  Hash, MessageSquare, HelpCircle, UserCheck, MapPin, Package, ThermometerSnowflake
} from 'lucide-react';
import { MedicationRefillItem, PharmacyCallLog, AgentPersonaId, RefillStatus, PharmacyCallDialogueStep } from '../types';
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
  const [currentToneDisplay, setCurrentToneDisplay] = useState<string | null>(null);
  const [liveCallLog, setLiveCallLog] = useState<PharmacyCallLog | null>(null);
  const [personaReassurance, setPersonaReassurance] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(callLogs[0]?.id || null);
  const [filterType, setFilterType] = useState<'ALL' | 'URGENT' | 'SPECIALTY' | 'TOUCH_TONE'>('ALL');
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [activePlayingStepIdx, setActivePlayingStepIdx] = useState<number | null>(null);
  const [deliveryPreference, setDeliveryPreference] = useState<'Refrigerated Cold-Chain Courier' | 'Pharmacy Counter Pickup' | 'Standard Priority Mail'>('Refrigerated Cold-Chain Courier');
  const [urgencyMode, setUrgencyMode] = useState<'STANDARD' | 'EXPEDITED_OVERNIGHT'>('EXPEDITED_OVERNIGHT');

  // Interactive Live Pharmacy Q&A Test state
  const [customPharmacyQuestion, setCustomPharmacyQuestion] = useState('');
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [testedQuestionResult, setTestedQuestionResult] = useState<{
    question: string;
    answer: string;
    category: string;
  } | null>(null);

  const urgentMeds = medications.filter(m => m.daysRemaining <= m.refillThresholdDays);

  const filteredMeds = medications.filter(m => {
    if (filterType === 'URGENT') return m.daysRemaining <= m.refillThresholdDays;
    if (filterType === 'SPECIALTY') return m.refillCallType === 'SPECIALTY_LIVE_VERIFICATION' || m.deliveryMethod.includes('Subcutaneous') || m.name.includes('Vyalev');
    if (filterType === 'TOUCH_TONE') return m.refillCallType === 'RETAIL_TOUCH_TONE_PROMPT' || !m.name.includes('Vyalev');
    return true;
  });

  const speakDialogueStep = (step: PharmacyCallDialogueStep, index: number) => {
    if (activePlayingStepIdx === index) {
      acousticVoice.cancel();
      setActivePlayingStepIdx(null);
      return;
    }

    acousticVoice.cancel();
    setActivePlayingStepIdx(index);

    if (step.dtmfTone) {
      acousticVoice.playDtmfSequence(step.dtmfTone);
      setTimeout(() => setActivePlayingStepIdx(null), 1200);
      return;
    }

    acousticVoice.speakRole(step.text, step.speaker, selectedPersona, {
      onStart: () => setActivePlayingStepIdx(index),
      onEnd: () => setActivePlayingStepIdx(null),
      onError: () => setActivePlayingStepIdx(null)
    });
  };

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

  const handleTestPharmacyQuestion = async (presetQuestion?: string) => {
    const q = presetQuestion || customPharmacyQuestion;
    if (!q.trim()) return;

    setIsAskingQuestion(true);
    try {
      const res = await fetch('/api/agent/pharmacy-ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          medicationName: 'Vyalev 24-hour continuous subcutaneous infusion',
          currentVialCount: 4,
          personaId: selectedPersona
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestedQuestionResult({
          question: q,
          answer: data.answer,
          category: data.category
        });
        acousticVoice.speakRole(data.answer, 'AGENT', selectedPersona);
      }
    } catch (e) {
      console.error('Error asking pharmacy question:', e);
    } finally {
      setIsAskingQuestion(false);
      if (!presetQuestion) setCustomPharmacyQuestion('');
    }
  };

  const handleTriggerCall = async (med: MedicationRefillItem) => {
    setSelectedMed(med);
    setIsCalling(true);
    setActiveCallStep(1);
    setCurrentToneDisplay(null);
    setLiveCallLog(null);
    setPersonaReassurance(null);

    const isTouchTone = med.refillCallType === 'RETAIL_TOUCH_TONE_PROMPT';

    // Play dial tone / start earcon
    acousticVoice.playEarcon('dial-tone');

    // Optimistic status update
    onUpdateMedication({
      ...med,
      refillStatus: 'CALL_IN_PROGRESS'
    });

    try {
      // Trigger background telephony webhook
      fetch('/api/telephony/dispatch-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: '+19494410137',
          callType: isTouchTone ? 'pharmacy-touch-tone' : 'pharmacy-refill-specialty',
          medicationName: `${med.name} (${med.deliveryMethod})`,
          rxNumber: med.rxNumber,
          patientName: 'Wade Seymour',
          refillCallType: med.refillCallType || (med.name.includes('Vyalev') ? 'SPECIALTY_LIVE_VERIFICATION' : 'RETAIL_TOUCH_TONE_PROMPT')
        })
      }).catch(err => console.log('[Pharmacy Telephony dispatch]', err));

      if (isTouchTone) {
        // Play touch tone DTMF sequence in audio
        setTimeout(() => {
          setActiveCallStep(2);
          setCurrentToneDisplay('1');
          acousticVoice.playDtmfTone('1', 180);
        }, 800);

        setTimeout(() => {
          setActiveCallStep(3);
          const rxNum = med.rxNumber.replace(/[^0-9]/g, '') || '884210';
          setCurrentToneDisplay(`${rxNum}#`);
          acousticVoice.playDtmfSequence(`${rxNum}#`);
        }, 1800);

        setTimeout(() => {
          setActiveCallStep(4);
          setCurrentToneDisplay('03141952#');
          acousticVoice.playDtmfSequence('03141952#');
        }, 3000);
      } else {
        // Specialty live step simulation
        setTimeout(() => setActiveCallStep(2), 800);
        setTimeout(() => setActiveCallStep(3), 1800);
        setTimeout(() => setActiveCallStep(4), 2800);
      }

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
        await new Promise(r => setTimeout(r, 600));

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
                Autonomously places outbound pharmacy calls, answering specialty identity questions (Name, DOB, Address, 4 vials left) and sending DTMF touch-tone prompts for blood pressure pills.
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

        {/* Dual Mode Feature Strip: Specialty Q&A vs Touch-Tone Prompts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200/70 text-xs text-sky-950 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-sky-200/80 text-sky-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <Snowflake className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-extrabold text-sky-950 block">Specialty Live Clinical Verification (Vyalev Vials)</span>
              <p className="text-sky-900 mt-0.5 text-[11px] leading-relaxed">
                Answers pharmacist verification questions: <strong>Name &amp; DOB</strong> (Wade Seymour, 03/14/1952), <strong>Address</strong> (1635 Divisadero St), <strong>Remaining Vials</strong> (4 vials left in fridge), and books cold-chain 2°C-8°C courier.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200/70 text-xs text-purple-950 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-purple-200/80 text-purple-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <Hash className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-extrabold text-purple-950 block">Retail Touch-Tone Prompt Line (Blood Pressure &amp; Pills)</span>
              <p className="text-purple-900 mt-0.5 text-[11px] leading-relaxed">
                Sends automated DTMF touch tones: <strong>1</strong> (Refills) &rarr; <strong>Rx# 884210#</strong> &rarr; <strong>DOB 03141952#</strong> &rarr; <strong>1</strong> (Confirm Counter Pickup).
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Pharmacy Question Tester Bar */}
        <div className="mt-4 p-3.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Interactive Test: What will the AI answer if the pharmacy asks a live question?
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Grounded in Captain Wade's Verified Chart</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            <span className="text-[11px] text-slate-400 mr-1">Quick Presets:</span>
            <button
              type="button"
              onClick={() => handleTestPharmacyQuestion("What is the patient full legal name and date of birth?")}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors border border-slate-700 flex items-center gap-1"
            >
              <UserCheck className="w-3 h-3 text-sky-400" />
              Name &amp; DOB
            </button>
            <button
              type="button"
              onClick={() => handleTestPharmacyQuestion("Can you verify the residential delivery address?")}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors border border-slate-700 flex items-center gap-1"
            >
              <MapPin className="w-3 h-3 text-emerald-400" />
              Address
            </button>
            <button
              type="button"
              onClick={() => handleTestPharmacyQuestion("How many vials or cassettes does Captain Wade currently have left in the refrigerator?")}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors border border-slate-700 flex items-center gap-1"
            >
              <Package className="w-3 h-3 text-amber-400" />
              How many vials left? (4 left)
            </button>
            <button
              type="button"
              onClick={() => handleTestPharmacyQuestion("Do you need cold-chain refrigerated delivery?")}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors border border-slate-700 flex items-center gap-1"
            >
              <ThermometerSnowflake className="w-3 h-3 text-cyan-400" />
              Cold Chain 2°C-8°C
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTestPharmacyQuestion();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={customPharmacyQuestion}
              onChange={(e) => setCustomPharmacyQuestion(e.target.value)}
              placeholder="Type any question a pharmacist might ask (e.g. 'Who is the neurologist?', 'Any allergies?')..."
              className="flex-1 bg-slate-800 text-xs text-slate-100 placeholder-slate-500 rounded-lg px-3 py-2 border border-slate-700 focus:outline-hidden focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isAskingQuestion || !customPharmacyQuestion.trim()}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shrink-0 transition-colors"
            >
              {isAskingQuestion ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Test Answer</span>
            </button>
          </form>

          {testedQuestionResult && (
            <div className="mt-3 p-3 bg-emerald-950/40 rounded-lg border border-emerald-500/30 text-xs space-y-1 animate-fadeIn">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Q: "{testedQuestionResult.question}"</span>
                <span className="text-emerald-400 font-bold uppercase">{testedQuestionResult.category}</span>
              </div>
              <p className="text-emerald-200 font-medium leading-relaxed">
                AI Agent Spoken Answer: "{testedQuestionResult.answer}"
              </p>
            </div>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 flex-wrap">
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
            <span>Urgent Refills ({urgentMeds.length})</span>
          </button>
          <button
            type="button"
            id="filter-specialty-meds-btn"
            onClick={() => setFilterType('SPECIALTY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'SPECIALTY'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5 text-sky-500" />
            <span>Specialty Vials (Vyalev)</span>
          </button>
          <button
            type="button"
            id="filter-touchtone-meds-btn"
            onClick={() => setFilterType('TOUCH_TONE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'TOUCH_TONE'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <Hash className="w-3.5 h-3.5 text-purple-500" />
            <span>Touch-Tone Prompts (BP &amp; Oral Pills)</span>
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
              <span>Prescription Stock &amp; Dosing Schedule</span>
            </h3>
            <span className="text-xs text-slate-500">Autonomous Refill Threshold: &le; 7 Days</span>
          </div>

          <div className="space-y-3.5">
            {filteredMeds.map((med) => {
              const isUrgent = med.daysRemaining <= med.refillThresholdDays;
              const isSpecialty = med.refillCallType === 'SPECIALTY_LIVE_VERIFICATION' || med.deliveryMethod.includes('Subcutaneous') || med.isRefrigerated;

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
                        {isSpecialty ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1">
                            <Snowflake className="w-3 h-3 text-sky-600" />
                            Specialty Q&amp;A (Cold Chain)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                            <Hash className="w-3 h-3 text-purple-600" />
                            Touch-Tone DTMF Prompt
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
                          Refill Needed
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
                        Remaining Supply: <strong className={isUrgent ? 'text-amber-600 font-bold' : 'text-slate-900'}>{med.daysRemaining} days</strong> ({med.currentPillCountOrVials} {isSpecialty ? 'vials' : 'pills'} left)
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

                  {/* Call Mode Guidance Badge */}
                  <div className="mt-3 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 text-[11px] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700">
                      {isSpecialty ? (
                        <>
                          <Snowflake className="w-4 h-4 text-sky-600 shrink-0" />
                          <span>Specialty Verification: Answers Name, DOB, Address &amp; <strong>4 vials left</strong></span>
                        </>
                      ) : (
                        <>
                          <Hash className="w-4 h-4 text-purple-600 shrink-0" />
                          <span>Tone Prompt: Automated DTMF key tones (<strong>1 &rarr; {med.rxNumber.replace(/[^0-9]/g, '')}# &rarr; DOB#</strong>)</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Pharmacy Details & Action Button */}
                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
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
                      <span>{isCalling && selectedMed?.id === med.id ? 'Calling Pharmacy...' : isSpecialty ? 'Call Specialty Pharmacy' : 'Call Tone-Prompt Line'}</span>
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

        {/* Right Column: Live Call Terminal & Audited Telephony Transcripts */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active Call Simulation Terminal */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  {isCalling ? 'Active Telephony Call in Progress' : 'Voice Dispatch Terminal'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Twilio SIP • DTMF • Acoustic AI
              </span>
            </div>

            {isCalling ? (
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                  <span>Target: {selectedMed?.pharmacyName}</span>
                  <span className="text-emerald-400 font-bold animate-pulse">00:{activeCallStep * 12}s</span>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 font-mono text-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-sky-300">
                    <Radio className="w-3.5 h-3.5 animate-spin" />
                    <span>Connected to {selectedMed?.pharmacyPhone}...</span>
                  </div>

                  {selectedMed?.refillCallType === 'RETAIL_TOUCH_TONE_PROMPT' ? (
                    <>
                      {activeCallStep >= 2 && (
                        <div className="text-purple-300 pl-3 border-l-2 border-purple-500 flex items-center justify-between">
                          <span>&gt; Keying DTMF Tone: <strong>[ 1 ]</strong> (Refill Menu)</span>
                          <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px]">697Hz/1209Hz</span>
                        </div>
                      )}
                      {activeCallStep >= 3 && (
                        <div className="text-purple-300 pl-3 border-l-2 border-purple-500 flex items-center justify-between">
                          <span>&gt; Keying Rx#: <strong>[ {selectedMed.rxNumber.replace(/[^0-9]/g, '')}# ]</strong></span>
                          <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px]">DTMF String</span>
                        </div>
                      )}
                      {activeCallStep >= 4 && (
                        <div className="text-purple-300 pl-3 border-l-2 border-purple-500 flex items-center justify-between">
                          <span>&gt; Keying Patient DOB: <strong>[ 03141952# ]</strong> &rarr; Confirm <strong>[ 1 ]</strong></span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px]">Accepted</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {activeCallStep >= 2 && (
                        <div className="text-sky-300 pl-3 border-l-2 border-sky-500">
                          &gt; Q1: Verified Patient Name &amp; DOB: <strong>Wade Seymour, 03/14/1952</strong>
                        </div>
                      )}
                      {activeCallStep >= 3 && (
                        <div className="text-amber-300 pl-3 border-l-2 border-amber-500">
                          &gt; Q2: Verified Address: <strong>1635 Divisadero St, SF</strong>
                        </div>
                      )}
                      {activeCallStep >= 4 && (
                        <div className="text-emerald-300 pl-3 border-l-2 border-emerald-500">
                          &gt; Q3: Remaining Vials: <strong>4 vials left in fridge</strong> &rarr; Cold-Chain Courier Booked
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-mono">
                  <div className="w-1.5 h-4 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-6 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-8 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <div className="w-1.5 h-5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                  <span className="ml-2">
                    {selectedMed?.refillCallType === 'RETAIL_TOUCH_TONE_PROMPT' ? 'Generating DTMF touch-tones...' : 'Synthesizing voice response to pharmacist...'}
                  </span>
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
                    <span>Alert Channel: <strong className="text-sky-400">{liveCallLog.alertChannel}</strong></span>
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
                  Ready to dispatch autonomous telephony calls. Click "Call Specialty Pharmacy" or "Call Tone-Prompt Line" to start.
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
                          {log.fulfillmentType.includes('Cold-Chain') ? 'Cold-Chain Courier' : 'Counter Pickup'}
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

                        {/* Step by step dialogue with audio playback */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <strong className="text-slate-700 block text-[11px] uppercase tracking-wider">Multi-Turn Dialogue &amp; Tone Steps:</strong>
                            <span className="text-[10px] text-slate-400">Click speaker icon to hear audio</span>
                          </div>
                          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                            {log.dialogueScript.map((step, idx) => {
                              const isPlayingThis = activePlayingStepIdx === idx;
                              return (
                                <div
                                  key={idx}
                                  className={`p-2.5 rounded-xl text-[11px] transition-all ${
                                    step.speaker === 'AGENT'
                                      ? step.dtmfTone
                                        ? 'bg-purple-50 text-purple-950 ml-3 border border-purple-200'
                                        : 'bg-indigo-50/90 text-indigo-950 ml-3 border border-indigo-200'
                                      : 'bg-slate-100 text-slate-800 mr-3 border border-slate-200/70'
                                  }`}
                                >
                                  <div className="flex items-center justify-between font-mono text-[9px] text-slate-500 mb-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold uppercase">
                                        {step.speaker === 'AGENT' ? 'AI Voice Agent' : step.speaker === 'PHARMACIST' ? 'Staff Pharmacist' : 'Pharmacy IVR Line'}
                                      </span>
                                      {step.questionCategory && (
                                        <span className="px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200 font-mono text-[8px]">
                                          {step.questionCategory}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span>{step.timeOffset}</span>
                                      <button
                                        type="button"
                                        onClick={() => speakDialogueStep(step, idx)}
                                        className="p-1 rounded bg-white hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
                                        title="Listen to this dialogue line"
                                      >
                                        {isPlayingThis ? <Pause className="w-3 h-3 text-emerald-600 animate-pulse" /> : <Play className="w-3 h-3" />}
                                      </button>
                                    </div>
                                  </div>
                                  <p className="leading-snug font-normal">{step.text}</p>
                                </div>
                              );
                            })}
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
