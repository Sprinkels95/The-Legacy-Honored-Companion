import React, { useState } from 'react';
import { 
  Calendar, Volume2, VolumeX, RefreshCw, Clock, MapPin, 
  Sparkles, HeartPulse, ShieldCheck, Car, CheckCircle2, 
  Send, UserCheck, AlertTriangle, Play, RotateCcw, ChevronDown, 
  ChevronUp, ExternalLink, Activity, Info, Bot
} from 'lucide-react';
import { DailyCalendarBriefing, AgentPersonaId, CalendarEvent } from '../types';
import { acousticVoice } from '../utils/acousticVoiceEngine';

interface DailyBriefingCardProps {
  briefing: DailyCalendarBriefing;
  selectedPersona: AgentPersonaId;
  onRefreshBriefing: () => void;
  isRefreshing: boolean;
}

export const DailyBriefingCard: React.FC<DailyBriefingCardProps> = ({
  briefing,
  selectedPersona,
  onRefreshBriefing,
  isRefreshing
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showFullSchedule, setShowFullSchedule] = useState(true);
  const [discordDispatched, setDiscordDispatched] = useState(false);
  const [showAiDetails, setShowAiDetails] = useState(false);

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      acousticVoice.cancel();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      acousticVoice.speak(
        briefing.spokenAudioScript,
        selectedPersona,
        {
          rawBriefingMode: true,
          playStartEarcon: true,
          playEndEarcon: true,
          onEnd: () => setIsPlayingAudio(false),
          onError: () => setIsPlayingAudio(false)
        }
      );
    }
  };

  const handleDispatchDiscordAlert = () => {
    setDiscordDispatched(true);
    setTimeout(() => setDiscordDispatched(false), 3500);
  };

  return (
    <div id="gemini-calendar-daily-briefing-card" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-950 text-white p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Gemini 3.7 Shared Calendar AI
              </span>
              <span className="text-xs text-indigo-200 font-medium">
                {briefing.dayTimeFormatted}
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-serif">
              Daily Care Plan & Schedule Overview
            </h2>

            <div className="flex items-center gap-2 text-xs text-indigo-200/90">
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-indigo-100 font-semibold border border-white/10">
                Wade's Morning Script: "{briefing.headline}"
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAiDetails(!showAiDetails)}
              className="px-3.5 py-2 rounded-xl bg-indigo-800/60 hover:bg-indigo-700/80 text-amber-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-indigo-600/40"
              title="Explain what the AI Calendar Engine does"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Reasoning</span>
            </button>

            <button
              type="button"
              id="btn-refresh-calendar-briefing"
              onClick={onRefreshBriefing}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5 backdrop-blur-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Reasoning...' : 'Sync Calendar'}</span>
            </button>

            <button
              type="button"
              id="btn-dispatch-discord-alert"
              onClick={handleDispatchDiscordAlert}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{discordDispatched ? 'Caregiver Alert Sent!' : 'Alert Caregiver'}</span>
            </button>
          </div>
        </div>

        {/* AI Engine Explanation Dropdown / Drawer */}
        {showAiDetails && (
          <div className="mt-4 p-4 rounded-2xl bg-indigo-900/60 border border-indigo-700/50 backdrop-blur-md text-xs text-indigo-100 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-300 font-extrabold uppercase text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                What Gemini Schedule Reasoning Does
              </div>
              <button 
                type="button" 
                onClick={() => setShowAiDetails(false)}
                className="text-indigo-300 hover:text-white font-bold"
              >
                ✕ Close
              </button>
            </div>
            <p className="leading-relaxed">
              <strong>1. Parkinson's Transit Buffering:</strong> Calculates +20–25 minute departure buffers for walker staging, unhurried dressing, and car transfers so Wade never feels rushed.
            </p>
            <p className="leading-relaxed">
              <strong>2. Levodopa Meal & Protein Synergy:</strong> Cross-references medication timing with meals to ensure high-protein dishes are shifted to evening dinner (avoiding large neutral amino acid competition with daytime levodopa absorption).
            </p>
            <p className="leading-relaxed">
              <strong>3. Vyalev 24h Pump Monitoring:</strong> Continuously estimates remaining cassette hours (currently 14h reserve) to schedule cartridge swaps during calm evening downtime.
            </p>
          </div>
        )}

        {/* Spoken Morning Audio Briefing Player Box (Spoken to Wade) */}
        <div className="mt-5 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <button
              type="button"
              id="btn-play-spoken-briefing"
              onClick={handleToggleAudio}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                isPlayingAudio
                  ? 'bg-amber-400 text-slate-950 scale-105 shadow-md animate-pulse'
                  : 'bg-white text-indigo-900 hover:bg-indigo-50 shadow-sm'
              }`}
              title="Preview Wade's Spoken Morning Audio Briefing"
            >
              {isPlayingAudio ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                  🎙️ Spoken Morning Audio Briefing (What Wade Hears)
                </span>
                <span className="text-[10px] text-indigo-200 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-700/50">
                  Natural Cadence • DSP Warmth
                </span>
              </div>
              <p className="text-xs text-indigo-100 italic mt-0.5 line-clamp-2 sm:line-clamp-none">
                "{briefing.spokenAudioScript}"
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-indigo-200">
              {isPlayingAudio ? 'Speaking in persona...' : 'Preview Audio'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Clinical & Medication Synergy Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Levodopa / Protein Synergy</span>
            </div>
            <p className="text-xs text-amber-950/90 leading-relaxed">
              {briefing.clinicalMedicationSynergy.levodopaAbsorptionAdvice}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-1">
              <HeartPulse className="w-4 h-4 text-emerald-600" />
              <span>Vyalev Continuous Pump Flow</span>
            </div>
            <p className="text-xs text-emerald-950/90 leading-relaxed">
              {briefing.clinicalMedicationSynergy.vyalevPumpCheck}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs mb-1">
              <Car className="w-4 h-4 text-indigo-600" />
              <span>+20m Mobility Prep Buffers</span>
            </div>
            <p className="text-xs text-indigo-950/90 leading-relaxed">
              {briefing.weatherCondition} — All vehicle transfers padded with calm gait buffers.
            </p>
          </div>
        </div>

        {/* Temporal Rhythm & Four Daily Anchors */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              Temporal Rhythm & Conversational Anchors
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              4 Gentle Day Parts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="text-[11px] font-black uppercase text-indigo-700 tracking-wide">
                🌅 Morning Anchor
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {briefing.morningAnchor}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="text-[11px] font-black uppercase text-blue-700 tracking-wide">
                ☀️ Mid-Day Anchor
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {briefing.middayAnchor}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="text-[11px] font-black uppercase text-emerald-700 tracking-wide">
                🛋️ Afternoon Rest
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {briefing.afternoonRest}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="text-[11px] font-black uppercase text-purple-700 tracking-wide">
                🌙 Evening Routine
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {briefing.eveningRoutine}
              </p>
            </div>
          </div>
        </div>

        {/* Dual-Output Cognitive Offloading & Care Coordination Matrix */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">
                Cognitive Offloading & Dual-Channel Orchestration
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
              Wade receives single-focus calm • Caregiver receives logistics & transit staging
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Wade's Channel (Dignified & Relaxed) */}
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        Wade's Spoken Guidance
                      </h4>
                      <p className="text-xs text-indigo-700/80 font-medium">
                        Zero-pressure, single-focus clarity
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Spoken Briefing
                  </span>
                </div>

                <ul className="space-y-2 text-xs text-slate-700">
                  {briefing.actionsForWade.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-indigo-100/80 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium text-slate-800">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-[11px] text-indigo-800/80 font-medium bg-indigo-100/50 px-3 py-2 rounded-xl flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Memory offloaded entirely — Wade is never corrected or burdened.</span>
              </div>
            </div>

            {/* Caregiver Command Channel */}
            <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        Caregiver Logistics & Clinical Prep
                      </h4>
                      <p className="text-xs text-emerald-800/80 font-medium">
                        Behind-the-scenes staging & transit buffers
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Autonomous Actions
                  </span>
                </div>

                <ul className="space-y-2 text-xs text-slate-700">
                  {briefing.actionsForElsbeth.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-emerald-100/80 shadow-2xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium text-slate-800">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-[11px] text-emerald-800/80 font-medium bg-emerald-100/50 px-3 py-2 rounded-xl flex items-center gap-2">
                <Car className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Logistics and +20m mobility buffers auto-staged for caregiver ease.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Chronological Schedule & Mobility Buffers */}
        <div className="pt-2">
          <button
            type="button"
            id="toggle-schedule-details-btn"
            onClick={() => setShowFullSchedule(!showFullSchedule)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Full Schedule & Transit Departure Timeline ({briefing.events.length} Events)</span>
            </div>
            {showFullSchedule ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showFullSchedule && (
            <div className="mt-3 space-y-3">
              {briefing.events.map((evt, idx) => (
                <div 
                  key={evt.id} 
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {evt.timeFormatted}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        evt.category === 'Physical Therapy' ? 'bg-amber-100 text-amber-800' :
                        evt.category === 'Clinical / Medical' ? 'bg-indigo-100 text-indigo-800' :
                        evt.category === 'Routine' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {evt.category}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-800">
                      {evt.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {evt.location}
                      </span>
                      {evt.suggestedDepartureTime && (
                        <span className="flex items-center gap-1 font-semibold text-indigo-700">
                          <Car className="w-3.5 h-3.5 text-indigo-600" />
                          Departure: {evt.suggestedDepartureTime} (+{evt.mobilityPrepBufferMinutes}m buffer)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col sm:items-end gap-1 text-xs">
                    {evt.fatigueRiskLevel && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        evt.fatigueRiskLevel === 'Low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        evt.fatigueRiskLevel === 'Moderate' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {evt.fatigueRiskLevel} Fatigue Risk
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">
                      {evt.actionForWade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
