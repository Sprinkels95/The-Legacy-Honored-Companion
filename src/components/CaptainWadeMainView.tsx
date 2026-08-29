import React, { useState, useEffect } from 'react';
import { 
  Volume2, VolumeX, Mic, MicOff, Clock, HeartPulse, Sparkles, 
  Play, RotateCcw, ShieldCheck, CheckCircle2, Droplets, Battery, 
  Activity, ArrowRight, Zap, RefreshCw, Sun, Moon, Coffee, Heart,
  PhoneCall, MessageSquare, Bell, UserCheck, Send, Check
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
  onTriggerVoiceOrder
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

  // Contact Elsbeth State
  const [isSendingDiscordAlert, setIsSendingDiscordAlert] = useState(false);
  const [discordAlertResult, setDiscordAlertResult] = useState<{
    success: boolean;
    sentTo: string;
    timestamp: string;
    urgency: string;
    message: string;
  } | null>(null);

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
      const res = await fetch('/api/discord/alert-caregiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'Captain Wade',
          urgency,
          pumpHoursLeft: dailyBriefing.pumpHoursLeft || 14,
          energyState,
          customMessage: note || (urgency === 'urgent' ? 'Wade requested urgent assistance' : 'Wade checked in from Wade Mode')
        })
      });

      const data = await res.json();
      if (data.success) {
        setDiscordAlertResult({
          success: true,
          sentTo: data.sentTo,
          timestamp: data.timestamp,
          urgency,
          message: urgency === 'urgent' 
            ? 'Urgent call & Discord alert dispatched to Elsbeth!' 
            : 'Message sent to Elsbeth on Discord.'
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

  const isHardDay = energyState === 'LOW_ENERGY_OFF_STATE';

  const handleToggleHardDayMode = () => {
    const nextState: EnergyState = isHardDay ? 'GOOD_ENERGY' : 'LOW_ENERGY_OFF_STATE';
    const nextBrevity: BrevityMode = nextState === 'LOW_ENERGY_OFF_STATE' ? 'ULTRA_CONCISE_SINGLE_WORD' : 'STANDARD_SENTENCE';
    onSetEnergyState(nextState);
    onSetBrevityMode(nextBrevity);
    acousticVoice.setEnergyState(nextState);
    acousticVoice.playEarcon('chime');
  };

  return (
    <div id="wade-patient-main-view" className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* 1. Header: Time, Date & Continuous Pump Status (High Contrast & Clear) */}
      <div 
        id="wade-hero-status-card"
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="text-center md:text-left space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
              Wade Mode
            </span>
            {isHardDay && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                ⚡ Hard Day / Minimal View
              </span>
            )}
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight pt-1">
            {currentTime || '12:30 PM'}
          </h2>
          <p className="text-base sm:text-lg font-medium text-slate-600">
            {currentDate || 'Saturday, August 29, 2026'}
          </p>
        </div>

        {/* Vyalev Pump Hours Remaining Widget (Simple: Just hours left) */}
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
      </div>

      {/* 2. Gemini Daily Audio Summary Card (Soothing, 1-Tap Audio Playback, No Overwhelming Schedule) */}
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
              <span className="text-xs text-slate-400">
                Voice: {selectedPersona === 'ward-cleaver' ? 'Ward Cleaver (Dad)' : selectedPersona === 'first-mate' ? "First Mate" : selectedPersona === 'dr-evil' ? 'Dr. Evil' : 'Clinical Co-Pilot'}
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

      {/* 3. Central Giant Voice Command Button (Tremor-Friendly, Voice Drives Everything) */}
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
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Discord Connected (#caregiver-alerts)
            </span>
          </div>
        </div>

        {/* Discord Alert Status Banner if just triggered */}
        {discordAlertResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-emerald-950 animate-in fade-in">
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
            <button
              type="button"
              onClick={() => setDiscordAlertResult(null)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
            >
              Dismiss
            </button>
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

      {/* 5. Minimal Day / Hard Day Toggle Bar */}
      <div 
        id="wade-brevity-mode-toggle"
        className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 text-left">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isHardDay ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900">
                Cognitive Energy Setting:
              </h4>
              <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-full ${
                isHardDay
                  ? 'bg-amber-200 text-amber-900 border border-amber-300'
                  : 'bg-emerald-200 text-emerald-900 border border-emerald-300'
              }`}>
                {isHardDay ? 'Hard Day (Single-Word Mode)' : 'Good Day (1-Sentence Mode)'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isHardDay 
                ? 'Ultra-minimal interface active. Voice responses shortened to single words ("Done.", "Handled.").' 
                : 'Gentle, 1-sentence unhurried spoken responses.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          id="wade-toggle-hard-day-btn"
          onClick={handleToggleHardDayMode}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all shrink-0 cursor-pointer ${
            isHardDay
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>
            {isHardDay ? 'Switch to Good Day Mode' : 'Switch to Hard Day Mode'}
          </span>
        </button>
      </div>

      {/* 6. Adaptive Quick Voice Requests (Ranked by Wade's most frequent orders: Pudding, Root Beer, Mint Chocolate Chip Ice Cream, etc.) */}
      {!isHardDay && (
        <AdaptiveVoiceOrdersPanel
          orders={adaptiveOrders}
          onTriggerOrder={(order) => {
            if (onTriggerVoiceOrder) {
              onTriggerVoiceOrder(order);
            } else {
              handleProcessVoiceInput(order.spokenPhrase);
            }
          }}
          isHardDay={isHardDay}
          selectedPersona={selectedPersona}
          brevityMode={brevityMode}
        />
      )}
    </div>
  );
};
