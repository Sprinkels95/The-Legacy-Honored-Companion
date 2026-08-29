import React from 'react';
import { 
  Activity, Mic, Zap, TrendingDown, Clock, ShieldCheck, AlertCircle, 
  Volume2, CheckCircle2, LineChart, Sparkles, BarChart2
} from 'lucide-react';
import { SpeechAcousticEvent, EnergyState, BrevityMode } from '../types';

interface SpeechAcousticTrackerProps {
  acousticEvents: SpeechAcousticEvent[];
  currentEnergyState: EnergyState;
  currentBrevityMode: BrevityMode;
  onSimulateEvent: (wpm: number, text: string) => void;
}

export const SpeechAcousticTracker: React.FC<SpeechAcousticTrackerProps> = ({
  acousticEvents,
  currentEnergyState,
  currentBrevityMode,
  onSimulateEvent
}) => {
  const avgWpm = acousticEvents.length 
    ? Math.round(acousticEvents.reduce((acc, curr) => acc + curr.detectedCadenceWpm, 0) / acousticEvents.length)
    : 110;

  const lowEnergyEventCount = acousticEvents.filter(e => e.energyClassification === 'LOW_ENERGY_OFF_STATE').length;

  return (
    <div className="space-y-6">
      {/* Header Overview Card */}
      <div 
        id="acoustic-tracker-header-card"
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Gemini Acoustic Biomarker AI
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-violet-100 text-violet-800 border border-violet-200">
                DSP Audio Cadence Engine
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Parkinson's Speech Adaptation & Fatigue Tracker
            </h3>
            <p className="text-sm text-slate-500">
              Continuously learns Captain Wade's vocal onset, detects hypophonic pitch drops & slurring, and automatically throttles agent responses to single words during off-state low points.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-400">Current Speech Mode</div>
              <div className={`text-sm font-black ${
                currentBrevityMode === 'ULTRA_CONCISE_SINGLE_WORD' ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {currentBrevityMode === 'ULTRA_CONCISE_SINGLE_WORD' ? 'Single-Word Mode' : '1-Sentence Mode'}
              </div>
            </div>
          </div>
        </div>

        {/* Live Acoustic Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Avg Vocal Cadence</span>
              <Activity className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {avgWpm} <span className="text-xs font-semibold text-slate-500">WPM</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Baseline: 110–135 WPM • Hypophonic cutoff: &lt;95 WPM
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Low-Point Off-States Logged</span>
              <TrendingDown className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2">
              {lowEnergyEventCount} <span className="text-xs font-semibold text-slate-500">Events</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Triggered automatic 1-word cognitive relief
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Acoustic Rule Engine</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2">
              Active
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Zero-friction dignity: Never repeats memory mistakes
            </div>
          </div>
        </div>

        {/* Quick Test Acoustic Simulation Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-600">Simulate Acoustic Intake:</span>
          <button
            type="button"
            id="sim-fluent-speech"
            onClick={() => onSimulateEvent(130, "Please grab some orange juice for breakfast")}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors"
          >
            + Simulate Morning Fluent (130 WPM)
          </button>
          <button
            type="button"
            id="sim-fatigued-speech"
            onClick={() => onSimulateEvent(48, "...juice... and water... please...")}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-colors"
          >
            + Simulate Slurred / Low Energy Off-State (48 WPM)
          </button>
        </div>
      </div>

      {/* Telemetry Timeline Log */}
      <div 
        id="acoustic-telemetry-log-table"
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-lg text-slate-900">
              Speech Acoustic Event History
            </h4>
            <p className="text-xs text-slate-500">
              Logged vocal telemetry with automatic brevity mode transitions
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {acousticEvents.length} Recorded Entries
          </span>
        </div>

        <div className="space-y-3">
          {acousticEvents.map((evt) => {
            const isLow = evt.energyClassification === 'LOW_ENERGY_OFF_STATE';
            return (
              <div 
                key={evt.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isLow 
                    ? 'bg-amber-50/50 border-amber-200 text-slate-900' 
                    : 'bg-slate-50/70 border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">{evt.timestamp}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      isLow 
                        ? 'bg-amber-200 text-amber-900 border border-amber-300' 
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {evt.pitchProfile}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Cadence: {evt.detectedCadenceWpm} WPM ({evt.durationSeconds}s)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Agent Spoke:</span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-xs">
                      "{evt.agentSpokenResponse}"
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-sm font-semibold text-slate-800">
                  Patient Spoke: <span className="font-normal italic text-slate-700">"{evt.rawInput}"</span>
                </div>

                <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{evt.notes}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
