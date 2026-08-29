import React, { useState, useEffect } from 'react';
import { 
  Volume2, Sliders, Sparkles, Activity, Radio, CheckCircle2, 
  Layers, Play, Pause, BellRing, RefreshCw, AudioWaveform as Waveform, ShieldCheck
} from 'lucide-react';
import { AgentPersonaId } from '../types';
import { acousticVoice } from '../utils/acousticVoiceEngine';

interface AcousticVoiceInspectorProps {
  selectedPersona: AgentPersonaId;
}

export const AcousticVoiceInspector: React.FC<AcousticVoiceInspectorProps> = ({ selectedPersona }) => {
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [activeEarcon, setActiveEarcon] = useState<string | null>(null);
  const [voiceSummary, setVoiceSummary] = useState(acousticVoice.getVoiceSettingsSummary(selectedPersona));

  useEffect(() => {
    setVoiceSummary(acousticVoice.getVoiceSettingsSummary(selectedPersona));
  }, [selectedPersona]);

  const handleTestEarcon = (type: 'speech-start' | 'refill-confirmed' | 'mic-active' | 'speech-end') => {
    setActiveEarcon(type);
    acousticVoice.playEarcon(type === 'speech-end' ? 'speech-end' : type);
    setTimeout(() => setActiveEarcon(null), 600);
  };

  const handleTestSpokenVoice = (sampleType: 'warmth' | 'clinical' | 'pharmacy') => {
    if (isPlayingTest) {
      acousticVoice.cancel();
      setIsPlayingTest(false);
      return;
    }

    let text = '';
    if (sampleType === 'warmth') {
      if (selectedPersona === 'dr-evil') {
        text = "Riiight... Thanks, Captain Wade! Consider your supplies protected in our secret command lair. My top henchmen have handled it immediately!";
      } else {
        text = "Thanks, Captain Wade. Everything is taken care of, so you can sit back and relax.";
      }
    } else if (sampleType === 'pharmacy') {
      if (selectedPersona === 'dr-evil') {
        text = "Autonomous refill secured for your twenty-four hour Vyalev continuous infusion cassettes! Protected like one million dollars. Courier dispatch inbound tomorrow at ten-thirty in the morning.";
      } else {
        text = "Autonomous refill confirmed for your twenty-four hour Vyalev subcutaneous infusion cassettes. Cold-chain courier delivery is scheduled for tomorrow at ten-thirty in the morning.";
      }
    } else {
      if (selectedPersona === 'dr-evil') {
        text = "Clinical motor log updated for the Captain! Neurological stability is rock-solid with continuous infusion telemetry flowing smoothly.";
      } else {
        text = "Clinical motor log updated. Your afternoon On-state is stable with twenty-four hour continuous infusion rate at standard titration.";
      }
    }

    setIsPlayingTest(true);
    acousticVoice.speak(text, selectedPersona, {
      onStart: () => setIsPlayingTest(true),
      onEnd: () => setIsPlayingTest(false),
      onError: () => setIsPlayingTest(false)
    });
  };

  return (
    <div id="acoustic-voice-inspector" className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Acoustic Voice & Equalization Architecture
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-indigo-600 animate-pulse" />
                Web Audio DSP
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Master equalization chain, neural voice waterfall matching, and pure-tone harmonic cues for comforting vocal clarity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Active Voice Engine:</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono text-[11px] font-bold border border-slate-200 truncate max-w-[200px]">
            {voiceSummary.voiceName}
          </span>
        </div>
      </div>

      {/* DSP Equalizer Chain Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {/* 1. Low Shelf */}
        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span>Low-Shelf Warmth</span>
            <span className="text-rose-600 font-mono text-[11px]">+3.8 dB</span>
          </div>
          <p className="text-[11px] text-slate-500">
            220 Hz low-shelf boost for comforting baritone resonance and radio-style vocal depth.
          </p>
        </div>

        {/* 2. Mid Presence */}
        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span>Mid Presence Peaking</span>
            <span className="text-indigo-600 font-mono text-[11px]">+2.0 dB</span>
          </div>
          <p className="text-[11px] text-slate-500">
            1.8 kHz peaking filter (Q: 1.2) for high consonant clarity and age-friendly speech comprehension.
          </p>
        </div>

        {/* 3. High Cut */}
        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span>Anti-Sibilance High Cut</span>
            <span className="text-emerald-600 font-mono text-[11px]">8.0 kHz</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Lowpass filter roll-off that strips digital tinniness and harsh browser synthesis hiss.
          </p>
        </div>

        {/* 4. Dynamics Compressor */}
        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span>Dynamics Leveler</span>
            <span className="text-amber-600 font-mono text-[11px]">-24 dB</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Soft-knee 4:1 compression preventing harsh volume spikes with smooth broadcast leveling.
          </p>
        </div>
      </div>

      {/* Interactive Earcons & Spoken Preview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {/* Earcons buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mr-1">
            Harmonic Earcons:
          </span>
          <button
            type="button"
            id="test-earcon-start-btn"
            onClick={() => handleTestEarcon('speech-start')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              activeEarcon === 'speech-start'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <BellRing className="w-3.5 h-3.5 text-indigo-500" />
            <span>Start Cue (440Hz/659Hz)</span>
          </button>
          <button
            type="button"
            id="test-earcon-refill-btn"
            onClick={() => handleTestEarcon('refill-confirmed')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              activeEarcon === 'refill-confirmed'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Refill Chime (Major Triad)</span>
          </button>
          <button
            type="button"
            id="test-earcon-mic-btn"
            onClick={() => handleTestEarcon('mic-active')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              activeEarcon === 'mic-active'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            <span>Mic Cue (880Hz)</span>
          </button>
        </div>

        {/* Audition Voice Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="audition-warmth-voice-btn"
            onClick={() => handleTestSpokenVoice('warmth')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              isPlayingTest
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isPlayingTest ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlayingTest ? 'Stop Voice' : 'Audition Equalized Voice'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
