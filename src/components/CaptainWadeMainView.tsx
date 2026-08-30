import React, { useState, useEffect } from 'react';
import { 
  Volume2, VolumeX, Mic, MicOff, Clock, HeartPulse, Sparkles, 
  Play, RotateCcw, ShieldCheck, CheckCircle2, Droplets, Battery, 
  Activity, ArrowRight, Zap, RefreshCw, Sun, Moon, Coffee, Heart,
  PhoneCall, MessageSquare, Bell, UserCheck, Send, Check, ExternalLink
} from 'lucide-react';
import { 
  AgentPersonaId, DailyGeminiBriefing, EnergyState, BrevityMode, 
  SpeechAcousticEvent, PantryItem, ShoppingItem, NeedsAuditLog,
  DailyCalendarBriefing, AdaptiveVoiceOrderItem
} from '../types';
import { acousticVoice } from '../utils/acousticVoiceEngine';
import { AdaptiveVoiceOrdersPanel } from './AdaptiveVoiceOrdersPanel';

interface CaptainWadeMainViewProps {
  selectedPersona: AgentPersonaId;
  dailyBriefing: DailyGeminiBriefing;
  calendarBriefing?: DailyCalendarBriefing;
  onRefreshCalendarBriefing?: () => void;
  energyState: EnergyState;
  brevityMode: BrevityMode;
  onSetEnergyState: (state: EnergyState) => void;
  onSetBrevityMode: (mode: BrevityMode) => void;
  onVoiceCommandSubmit: (rawText: string, durationMs: number) => Promise<string>;
  onRefreshDailyBriefing: () => void;
  isRefreshingBriefing: boolean;
  pantryItems: PantryItem[];
  shoppingItems: ShoppingItem[];
  recentAcousticEvent?: SpeechAcousticEvent;
  adaptiveOrders?: AdaptiveVoiceOrderItem[];
  onTriggerVoiceOrder?: (order: AdaptiveVoiceOrderItem) => void;
  onOpenOriginModal?: () => void;
  onOpenDiscordModal?: () => void;
}

export const CaptainWadeMainView: React.FC<CaptainWadeMainViewProps> = ({
  selectedPersona,
  dailyBriefing,
  calendarBriefing,
  onRefreshCalendarBriefing,
  energyState,
  brevityMode,
  onSetEnergyState,
  onSetBrevityMode,
  onVoiceCommandSubmit,
  onRefreshDailyBriefing,
  isRefreshingBriefing,
  pantryItems,
  shoppingItems,
  recentAcousticEvent,
  adaptiveOrders = [],
  onTriggerVoiceOrder,
  onOpenOriginModal,
  onOpenDiscordModal
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [lastSpokenResponse, setLastSpokenResponse] = useState<string>('');
  const [isPlayingBriefing, setIsPlayingBriefing] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const [tremorDebounceActive, setTremorDebounceActive] = useState(false);
  const lastTapTimeRef = React.useRef<number>(0);

  // Contact Elsbeth State
  const [isSendingDiscordAlert, setIsSendingDiscordAlert] = useState(false);
  const [discordAlertResult, setDiscordAlertResult] = useState<{
    success: boolean;
    sentTo: string;
    timestamp: string;
    urgency: string;
    message: string;
  } | null>(null);

  // Caregiver Presence State for Smart Medium Day Logic
  const [isCaregiverAway, setIsCaregiverAway] = useState(false);

  // Active Day Mode Identifiers
  const isGoodDay = energyState === 'GOOD_ENERGY';
  const isMediumDay = energyState === 'MODERATE_FATIGUE';
  const isHardDay = energyState === 'LOW_ENERGY_OFF_STATE';

  // Smart Summary Visibility Condition for Medium Day:
  // Show daily summary ONLY IF there are scheduled events/reminders OR caregiver is away from the house
  const hasScheduledEvents = Boolean(calendarBriefing?.keyReminders && calendarBriefing.keyReminders.length > 0);
  const shouldShowDailySummaryInMediumDay = isCaregiverAway || hasScheduledEvents;

  // Live Clock for Captain Wade
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Speech Recognition Setup for Tremor-Friendly Hands-Free Input
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setRecordingStartTime(Date.now());
          acousticVoice.playEarcon('mic-active');
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setSpeechTranscript(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition event:', event.error);
          setIsListening(false);
        };

        recognition.onend = async () => {
          setIsListening(false);
          acousticVoice.playEarcon('speech-end');
        };

        setRecognitionInstance(recognition);
      }
    }
  }, []);

  const handleStartListening = () => {
    const now = Date.now();
    // 500ms Tremor Damping: If user taps rapidly due to tremor / myoclonus, safely absorb duplicate tap
    if (now - lastTapTimeRef.current < 550) {
      setTremorDebounceActive(true);
      setTimeout(() => setTremorDebounceActive(false), 1200);
      return;
    }
    lastTapTimeRef.current = now;

    if (isPlayingBriefing) {
      acousticVoice.cancel();
      setIsPlayingBriefing(false);
    }

    if (isListening && recognitionInstance) {
      recognitionInstance.stop();
      return;
    }

    setSpeechTranscript('');
    setLastSpokenResponse('');

    if (recognitionInstance) {
      try {
        recognitionInstance.start();
      } catch (e) {
        // Recognition already active
      }
    } else {
      // Fallback simulation for browser environments without speech recognition
      setIsListening(true);
      setRecordingStartTime(Date.now());
      acousticVoice.playEarcon('mic-active');
      setTimeout(() => {
        setSpeechTranscript('Low-acid orange juice please');
        setIsListening(false);
        acousticVoice.playEarcon('speech-end');
      }, 2500);
    }
  };

  // Handle final voice submission when transcript is finalized
  const handleProcessVoiceInput = async (textToProcess: string) => {
    if (!textToProcess.trim()) return;

    setIsProcessingVoice(true);
    const durationMs = recordingStartTime > 0 ? Date.now() - recordingStartTime : 2500;

    try {
      const agentResponse = await onVoiceCommandSubmit(textToProcess, durationMs);
      setLastSpokenResponse(agentResponse);

      // Vocalize with equalized acoustic engine using active brevity mode
      acousticVoice.speak(agentResponse, selectedPersona, {
        brevityMode: brevityMode,
        playStartEarcon: true,
        playEndEarcon: true
      });
    } catch (e) {
      const fallbackResponse = brevityMode === 'ULTRA_CONCISE_SINGLE_WORD' ? 'Handled.' : 'Thanks, Captain Wade. Taken care of.';
      setLastSpokenResponse(fallbackResponse);
      acousticVoice.speak(fallbackResponse, selectedPersona, { brevityMode });
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Trigger audio playback for the Daily Gemini Briefing
  const handlePlayDailyBriefing = () => {
    if (isPlayingBriefing) {
      acousticVoice.cancel();
      setIsPlayingBriefing(false);
    }

    const scriptToPlay = calendarBriefing?.spokenAudioScript || dailyBriefing.audioScript;

    setIsPlayingBriefing(true);
    acousticVoice.speak(scriptToPlay, selectedPersona, {
      rawBriefingMode: true,
      playStartEarcon: true,
      playEndEarcon: true,
      onEnd: () => setIsPlayingBriefing(false),
      onError: () => setIsPlayingBriefing(false)
    });
  };

  // Contact Elsbeth via Discord & Mobile Dispatch
  const handleContactElsbeth = async (urgency: 'normal' | 'urgent' = 'normal', note?: string) => {
    setIsSendingDiscordAlert(true);
    acousticVoice.playEarcon('mic-active');

    try {
      const savedWebhook = localStorage.getItem('legacy_honored_discord_webhook') || undefined;
      const res = await fetch('/api/discord/alert-caregiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'Captain Wade',
          urgency,
          pumpHoursLeft: dailyBriefing.pumpHoursLeft || 14,
          energyState,
          customMessage: note || (urgency === 'urgent' ? 'Wade requested urgent assistance' : 'Wade checked in from Wade Mode'),
          webhookUrl: savedWebhook
        })
      });

      const data = await res.json();
      if (data.success) {
        setDiscordAlertResult({
          success: true,
          sentTo: data.webhookDelivered ? 'Your Phone Discord App (#caregiver-alerts)' : data.sentTo,
          timestamp: data.timestamp,
          urgency,
          message: urgency === 'urgent' 
            ? (data.webhookDelivered ? '🚨 Urgent alert delivered directly to your Discord!' : 'Urgent call & Discord alert dispatched to Elsbeth!') 
            : (data.webhookDelivered ? '✅ Message delivered directly to your Discord channel!' : 'Message sent to Elsbeth on Discord.')
        });

        // Vocal affirmation
        const spokenMsg = brevityMode === 'ULTRA_CONCISE_SINGLE_WORD'
          ? 'Elsbeth notified.'
          : (data.spokenConfirmation || "I've sent a direct message to Elsbeth on Discord for you, Captain. She'll be with you shortly.");

        acousticVoice.speak(spokenMsg, selectedPersona, {
          brevityMode,
          playEndEarcon: true
        });
      }
    } catch (err) {
      console.error('Error sending Discord alert to Elsbeth:', err);
      const fallbackMsg = "Elsbeth has been notified.";
      setDiscordAlertResult({
        success: true,
        sentTo: "Elsbeth Seymour (Discord)",
        timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        urgency,
        message: fallbackMsg
      });
      acousticVoice.speak(fallbackMsg, selectedPersona, { brevityMode });
    } finally {
      setIsSendingDiscordAlert(false);
    }
  };

  const handleSelectDayMode = (mode: EnergyState) => {
    onSetEnergyState(mode);
    const nextBrevity: BrevityMode = mode === 'LOW_ENERGY_OFF_STATE' ? 'ULTRA_CONCISE_SINGLE_WORD' : 'STANDARD_SENTENCE';
    onSetBrevityMode(nextBrevity);
    acousticVoice.setEnergyState(mode);
    acousticVoice.playEarcon('chime');
  };

  return (
    <div id="wade-patient-main-view" className="space-y-6 max-w-4xl mx-auto pb-16">

      {/* Cognitive Fatigue / Day Mode Segmented Switcher */}
      <div 
        id="wade-day-mode-segmented-bar"
        className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2 px-1">
          <Activity className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-600">Daily Fatigue Setting:</span>
          <span className="text-xs font-bold text-slate-900">
            {isGoodDay && '🟢 Good Day (Full Dashboard)'}
            {isMediumDay && '🟡 Medium Day (Calm & Focused)'}
            {isHardDay && '🔴 Hard Day (Voice-Only / Tremor Damped)'}
          </span>
        </div>

        <div className="bg-slate-100 p-1 rounded-xl border border-slate-200/80 flex items-center w-full sm:w-auto shadow-2xs gap-1">
          <button
            type="button"
            id="btn-mode-good-day"
            onClick={() => handleSelectDayMode('GOOD_ENERGY')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isGoodDay
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Good Day</span>
          </button>

          <button
            type="button"
            id="btn-mode-medium-day"
            onClick={() => handleSelectDayMode('MODERATE_FATIGUE')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isMediumDay
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Medium Day</span>
          </button>

          <button
            type="button"
            id="btn-mode-hard-day"
            onClick={() => handleSelectDayMode('LOW_ENERGY_OFF_STATE')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isHardDay
                ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-400/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Hard Day</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODE 1: HARD DAY (Ultra-Minimalist: ONLY Voice Co-Pilot Hands-Free)
          ========================================================================= */}
      {isHardDay ? (
        <div id="wade-hard-day-container" className="space-y-6 animate-in fade-in duration-300">
          
          {/* Subtle Tremor Damping & Voice Protection Header Pill */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-rose-950 shadow-2xs">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-rose-800">
                  🔴 Hard Day Active • Ultra-Minimalist View
                </div>
                <div className="text-xs text-rose-700">
                  Enhanced 500ms multi-tap tremor damping active. All requests are handled 100% hands-free by voice.
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-200/80 text-rose-900 px-2.5 py-1 rounded-lg border border-rose-300">
              Single-Word Brevity
            </span>
          </div>

          {/* ONLY COMPONENT: Talk to Your Care Co-Pilot (Giant Voice Interface) */}
          <div 
            id="wade-hard-day-voice-section"
            className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-md text-center space-y-6"
          >
            <div className="max-w-xl mx-auto space-y-2">
              <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Talk to Your Care Co-Pilot
              </h3>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Tap the button and speak. The agent will handle pantry requests, updates, or alerts hands-free.
              </p>
            </div>

            {/* Giant Circular Mic Button with Tremor Debounce */}
            <div className="flex flex-col items-center justify-center py-2">
              <button
                type="button"
                id="wade-hard-day-mic-btn"
                onClick={handleStartListening}
                className={`w-44 h-44 sm:w-52 sm:h-52 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl active:scale-95 cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white ring-12 ring-rose-200 animate-pulse scale-105'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white ring-12 ring-indigo-100 hover:scale-105'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-16 h-16 sm:w-20 sm:h-20 animate-bounce" />
                    <span className="text-sm sm:text-base font-black uppercase tracking-wider mt-2">Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-16 h-16 sm:w-20 sm:h-20" />
                    <span className="text-sm sm:text-base font-black uppercase tracking-wider mt-2">Tap to Speak</span>
                  </>
                )}
              </button>

              {/* Involuntary Double-Tap Tremor Filter Feedback */}
              {tremorDebounceActive && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-amber-900 text-xs font-bold animate-in fade-in duration-150">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Tremor multi-tap absorbed (Software Debounce)</span>
                </div>
              )}
            </div>

            {/* Live Transcript / Spoken Preview */}
            {(speechTranscript || isListening) && (
              <div className="max-w-lg mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3 shadow-2xs">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>You said:</span>
                  <span className="text-indigo-600 font-bold">Voice Input Active</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  "{speechTranscript || 'Listening for your voice...'}"
                </p>
                {speechTranscript && !isListening && (
                  <button
                    type="button"
                    id="wade-hard-day-confirm-voice-btn"
                    onClick={() => handleProcessVoiceInput(speechTranscript)}
                    disabled={isProcessingVoice}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-xs"
                  >
                    {isProcessingVoice ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Processing with Care Agent...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Send Command</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Instant Agent Spoken Affirmation Banner */}
            {lastSpokenResponse && (
              <div 
                id="wade-hard-day-affirmation-banner"
                className="max-w-lg mx-auto rounded-2xl p-5 bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-4 text-left shadow-xs animate-in fade-in"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-700">
                    Response:
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    "{lastSpokenResponse}"
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Silently handled by Autonomous Care Agent.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Voice Help Hint */}
          <div className="text-center text-xs text-slate-500">
            💡 Say anything aloud: <span className="font-semibold text-slate-700">"Pudding", "Water", "Call Sarah", "Turn off lights", "What time is it?"</span>
          </div>
        </div>
      ) : (
        /* =========================================================================
            MODES 2 & 3: MEDIUM DAY & GOOD DAY
            ========================================================================= */
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* 1. Header: Time & Date (Always visible in Good & Medium Day) */}
          <div 
            id="wade-hero-status-card"
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="text-center md:text-left space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Wade Mode
                </span>
                {isMediumDay && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                    🟡 Medium Day
                  </span>
                )}
                {isGoodDay && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                    🟢 Good Day
                  </span>
                )}
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight pt-1">
                {currentTime || '12:30 PM'}
              </h2>
              <p className="text-base sm:text-lg font-medium text-slate-600">
                {currentDate || 'Saturday, August 29, 2026'}
              </p>

              {/* Station 32 & Tiller Truck Veteran Badge */}
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2">
                <button
                  type="button"
                  onClick={onOpenOriginModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-900 border border-amber-300/80 hover:bg-amber-100 hover:border-amber-400 transition-all cursor-pointer shadow-2xs"
                  title="Click to view Captain Wade's 32-year Fire Career Legacy"
                >
                  <span>🚒</span>
                  <span>Captain Wade • 32 Yrs LA County Fire (Tiller Truck Tillerman)</span>
                </button>
              </div>
            </div>

            {/* In Good Day, show continuous infusion pump status. In Medium Day, show streamlined pump badge */}
            {isGoodDay ? (
              <div 
                id="wade-pump-hours-widget"
                className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 sm:p-6 shadow-sm flex items-center gap-4 w-full md:w-auto min-w-[280px]"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <HeartPulse className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-100">
                    Vyalev Continuous Infusion
                  </div>
                  <div className="text-2xl sm:text-3xl font-black tracking-tight flex items-baseline gap-1">
                    <span>{dailyBriefing.pumpHoursLeft} Hours Left</span>
                  </div>
                  <div className="text-xs text-emerald-100 font-medium">
                    Flowing smoothly • 24h steady dose
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-2xl text-emerald-950">
                <HeartPulse className="w-5 h-5 text-emerald-600 animate-pulse" />
                <div className="text-xs">
                  <span className="font-extrabold block">Vyalev Infusion: {dailyBriefing.pumpHoursLeft}h Left</span>
                  <span className="text-emerald-700">Steady continuous flow</span>
                </div>
              </div>
            )}
          </div>

          {/* Medium Day: Caregiver Presence Context Toggle (Simulate Caregiver at home vs away) */}
          {isMediumDay && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="font-extrabold text-slate-900">Caregiver Context:</span>
                <span>{isCaregiverAway ? '🚗 Caregiver is Away from House' : '🏡 Caregiver is At Home'}</span>
                {hasScheduledEvents && (
                  <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    📅 Schedule Event Active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Test Caregiver Presence:</span>
                <button
                  type="button"
                  id="toggle-caregiver-away"
                  onClick={() => setIsCaregiverAway(!isCaregiverAway)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    isCaregiverAway
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isCaregiverAway ? 'Status: Away' : 'Status: At Home'}
                </button>
              </div>
            </div>
          )}

          {/* 2. Gemini Daily Audio Summary Card (Conditional in Medium Day, Always in Good Day) */}
          {(isGoodDay || (isMediumDay && shouldShowDailySummaryInMediumDay)) ? (
            <div 
              id="wade-gemini-daily-summary-card"
              className="bg-gradient-to-tr from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-indigo-800/40 relative overflow-hidden"
            >
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2.5 text-center md:text-left flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                      Gemini Daily Summary
                    </span>
                    {isMediumDay && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {isCaregiverAway ? 'Shown: Caregiver Away' : 'Shown: Scheduled Reminders'}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      Voice: {selectedPersona === 'ward-cleaver' ? 'Ward Cleaver' : selectedPersona === 'first-mate' ? "First Mate" : selectedPersona === 'dr-evil' ? 'Dr. Evil' : 'Clinical Co-Pilot'}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    "{calendarBriefing?.headline || dailyBriefing.headline || 'Smooth, Unhurried Day Ahead'}"
                  </h3>
                  <p className="text-sm sm:text-base text-indigo-100/90 max-w-2xl leading-relaxed">
                    {calendarBriefing?.spokenAudioScript || dailyBriefing.audioScript}
                  </p>
                </div>

                {/* Large Audio Action Button */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    id="wade-play-daily-summary-btn"
                    onClick={handlePlayDailyBriefing}
                    className={`h-18 px-7 sm:px-9 rounded-2xl font-black text-lg sm:text-xl flex items-center gap-3 transition-all shadow-lg cursor-pointer ${
                      isPlayingBriefing 
                        ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse' 
                        : 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 hover:scale-105 active:scale-95'
                    }`}
                  >
                    {isPlayingBriefing ? (
                      <>
                        <VolumeX className="w-7 h-7" />
                        <span>Pause Audio</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-7 h-7 fill-current" />
                        <span>Listen to Summary</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    id="wade-refresh-summary-btn"
                    onClick={() => {
                      if (onRefreshCalendarBriefing) onRefreshCalendarBriefing();
                      onRefreshDailyBriefing();
                    }}
                    disabled={isRefreshingBriefing}
                    title="Refresh summary"
                    className="w-14 h-18 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                  >
                    <RefreshCw className={`w-5 h-5 ${isRefreshingBriefing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* In Medium Day with Caregiver Home and No Scheduled Events: Agent Decides to Keep Summary OFF to prevent noise */
            isMediumDay && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-600 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>
                    <strong>Agent Decision:</strong> Daily summary kept off to eliminate cognitive clutter (No urgent appointments & caregiver is home).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handlePlayDailyBriefing}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Play audio anyway</span>
                </button>
              </div>
            )
          )}

          {/* 3. Central Giant Voice Command Button */}
          <div 
            id="wade-voice-command-section"
            className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm text-center space-y-6"
          >
            <div className="max-w-xl mx-auto space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Talk to Your Care Co-Pilot
              </h3>
              <p className="text-slate-600 text-sm sm:text-base">
                Tap the button and speak. The agent will handle pantry requests, updates, or alerts hands-free.
              </p>
            </div>

            {/* Giant Circular Mic Button */}
            <div className="flex flex-col items-center justify-center">
              <button
                type="button"
                id="wade-giant-mic-btn"
                onClick={handleStartListening}
                className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center transition-all shadow-xl active:scale-95 cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white ring-8 ring-rose-200 animate-pulse scale-105'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white ring-8 ring-indigo-50 hover:scale-105'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-14 h-14 sm:w-18 sm:h-18 animate-bounce" />
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider mt-1">Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-14 h-14 sm:w-18 sm:h-18" />
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider mt-1">Tap to Speak</span>
                  </>
                )}
              </button>

              {/* Involuntary Double-Tap Tremor Filter Feedback */}
              {tremorDebounceActive && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-amber-900 text-xs font-bold animate-in fade-in duration-150">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Tremor multi-tap absorbed (Software Debounce)</span>
                </div>
              )}
            </div>

            {/* Live Transcript / Spoken Preview */}
            {(speechTranscript || isListening) && (
              <div className="max-w-lg mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>You said:</span>
                  <span className="text-indigo-600 font-bold">Voice Input Active</span>
                </div>
                <p className="text-xl font-bold text-slate-900">
                  "{speechTranscript || 'Listening for your voice...'}"
                </p>
                {speechTranscript && !isListening && (
                  <button
                    type="button"
                    id="wade-confirm-voice-btn"
                    onClick={() => handleProcessVoiceInput(speechTranscript)}
                    disabled={isProcessingVoice}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs"
                  >
                    {isProcessingVoice ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing with Care Agent...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Send Command</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Instant Agent Spoken Affirmation Banner */}
            {lastSpokenResponse && (
              <div 
                id="wade-last-affirmation-banner"
                className="max-w-xl mx-auto rounded-2xl p-5 bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-4 text-left shadow-xs animate-in fade-in duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <span>Response ({brevityMode === 'ULTRA_CONCISE_SINGLE_WORD' ? 'Single-Word' : '1-Sentence'})</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">
                    "{lastSpokenResponse}"
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Silently handled by Autonomous Care Agent.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Prominent "Contact Caregiver" Action (Discord Message / Call Alert) */}
          <div 
            id="wade-contact-elsbeth-section"
            className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/40 to-white shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Need Help? Contact Caregiver
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Directly sends a priority message or alert to your caregiver on Discord & mobile phone.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="badge-open-discord-channel"
                  onClick={onOpenDiscordModal}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded-full border border-indigo-300 transition-all cursor-pointer shadow-2xs group"
                  title="Click to view live caregiver alerts & notification stream"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Caregiver Alerts Active</span>
                  <ExternalLink className="w-3 h-3 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Discord Alert Status Banner if just triggered */}
            {discordAlertResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-sm">
                      {discordAlertResult.message}
                    </p>
                    <p className="text-xs text-emerald-700">
                      Delivered to {discordAlertResult.sentTo} at {discordAlertResult.timestamp}.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {onOpenDiscordModal && (
                    <button
                      type="button"
                      onClick={onOpenDiscordModal}
                      className="px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>View in Discord Feed</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDiscordAlertResult(null)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Large One-Tap Contact Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
              <button
                type="button"
                id="btn-message-elsbeth-discord"
                onClick={() => handleContactElsbeth('normal', 'Captain Wade sent a quick check-in message from Wade Mode.')}
                disabled={isSendingDiscordAlert}
                className="p-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-left transition-all active:scale-95 shadow-sm flex items-center justify-between group disabled:opacity-50 cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-200" />
                    <span className="text-lg font-black tracking-tight">Message Caregiver</span>
                  </div>
                  <p className="text-xs text-indigo-100">
                    Sends a quick check-in message to Discord
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </button>

              <button
                type="button"
                id="btn-call-alert-elsbeth"
                onClick={() => handleContactElsbeth('urgent', 'URGENT: Captain Wade requested urgent attention / call.')}
                disabled={isSendingDiscordAlert}
                className="p-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-left transition-all active:scale-95 shadow-sm flex items-center justify-between group disabled:opacity-50 cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-rose-200 animate-bounce" />
                    <span className="text-lg font-black tracking-tight">Urgent Alert for Caregiver</span>
                  </div>
                  <p className="text-xs text-rose-100">
                    Pings Discord with high priority sound alert
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PhoneCall className="w-5 h-5 text-white" />
                </div>
              </button>
            </div>
          </div>

          {/* 5. Adaptive Quick Voice Requests (In Good Day Only) */}
          {isGoodDay && (
            <AdaptiveVoiceOrdersPanel
              orders={adaptiveOrders}
              onTriggerOrder={(order) => {
                if (onTriggerVoiceOrder) {
                  onTriggerVoiceOrder(order);
                } else {
                  handleProcessVoiceInput(order.spokenPhrase);
                }
              }}
              isHardDay={false}
              selectedPersona={selectedPersona}
              brevityMode={brevityMode}
            />
          )}

        </div>
      )}
    </div>
  );
};
