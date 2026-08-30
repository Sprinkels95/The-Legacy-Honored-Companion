import React, { useState } from 'react';
import { 
  Settings, X, Sparkles, Volume2, VolumeX, CheckCircle2, 
  Heart, Stethoscope, Compass, Sliders, ShieldCheck, Check
} from 'lucide-react';
import { AgentPersona, AgentPersonaId } from '../types';
import { AGENT_PERSONAS } from '../data/initialData';
import { acousticVoice } from '../utils/acousticVoiceEngine';

interface CaregiverSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPersona: AgentPersonaId;
  onSelectPersona: (persona: AgentPersonaId) => void;
}

export const CaregiverSettingsModal: React.FC<CaregiverSettingsModalProps> = ({
  isOpen,
  onClose,
  selectedPersona,
  onSelectPersona
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [showAiInfo, setShowAiInfo] = useState(false);

  if (!isOpen) return null;

  const activePersona = AGENT_PERSONAS.find(p => p.id === selectedPersona) || AGENT_PERSONAS[0];

  const playVoiceSample = (persona: AgentPersona, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (isPlayingAudio === persona.id) {
      acousticVoice.cancel();
      setIsPlayingAudio(null);
      return;
    }

    setIsPlayingAudio(persona.id);

    acousticVoice.speak(persona.sampleReassurance, persona.id, {
      onStart: () => setIsPlayingAudio(persona.id),
      onEnd: () => setIsPlayingAudio(null),
      onError: () => setIsPlayingAudio(null)
    });
  };

  const getPersonaIcon = (id: string, isSelected: boolean) => {
    switch (id) {
      case 'ward-cleaver':
        return <Heart className={`w-5 h-5 ${isSelected ? 'text-rose-500' : 'text-rose-400'}`} />;
      case 'dr-evil':
        return <span className="text-xl select-none">😈</span>;
      case 'clinical-copilot':
        return <Stethoscope className={`w-5 h-5 ${isSelected ? 'text-cyan-500' : 'text-cyan-400'}`} />;
      case 'first-mate':
      default:
        return <Compass className={`w-5 h-5 ${isSelected ? 'text-amber-500' : 'text-amber-400'}`} />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
              <Settings className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                  Agent 1 Settings
                </span>
                <span className="text-xs text-indigo-200 font-semibold">
                  Legacy Persona Engine
                </span>
              </div>
              <h2 id="settings-modal-title" className="text-lg sm:text-xl font-black text-white tracking-tight">
                Vocal Persona & Tone Configuration
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close settings dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Active Persona Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 border border-indigo-100 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-200 flex items-center justify-center shadow-xs text-indigo-700 shrink-0">
                {getPersonaIcon(activePersona.id, true)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Currently Active Persona:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white shadow-2xs">
                    {activePersona.name}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 mt-0.5">
                  {activePersona.subtitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Voice Style: <strong>{activePersona.voiceStyle}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => playVoiceSample(activePersona)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs w-full sm:w-auto justify-center cursor-pointer ${
                  isPlayingAudio === activePersona.id
                    ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isPlayingAudio === activePersona.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isPlayingAudio === activePersona.id ? 'Playing Voice...' : 'Test Active Voice'}</span>
              </button>
            </div>
          </div>

          {/* Persona Selection Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Select Care Voice Persona ({AGENT_PERSONAS.length} Available)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Configures vocal warmth, cadence, and cultural anchors for Captain Wade
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAiInfo(!showAiInfo)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{showAiInfo ? 'Hide AI Details' : 'AI Engine Details'}</span>
              </button>
            </div>

            {/* AI Info Card */}
            {showAiInfo && (
              <div className="p-4 bg-slate-900 text-white rounded-2xl text-xs space-y-2 border border-slate-800 animate-in fade-in">
                <div className="font-extrabold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dual Architecture: Core Cognitive Engine vs Adaptive Personalization</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11.5px]">
                  <strong>1. Core Cognitive Engine:</strong> Eliminates memory anxiety and offloads complex logistics. Never corrects memory lapses, preserves dignity, and routes tasks silently to background agents.
                </p>
                <p className="text-slate-300 leading-relaxed text-[11.5px]">
                  <strong>2. Adaptive Personalization Layer:</strong> Demonstrated through Captain Wade (Station Captain & 1950s/1960s cultural anchors). Any family member can configure custom archetypes in seconds (e.g. "1970s Motown Fan" or "Retired Elementary Teacher").
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AGENT_PERSONAS.map((persona) => {
                const isSelected = selectedPersona === persona.id;
                const isPlaying = isPlayingAudio === persona.id;

                return (
                  <div
                    key={persona.id}
                    onClick={() => onSelectPersona(persona.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-indigo-50/50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {getPersonaIcon(persona.id, isSelected)}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm">
                              {persona.name}
                            </h4>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">
                              {persona.tag}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-black text-[10px] flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {persona.description}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 italic truncate max-w-[150px]">
                        "{persona.sampleReassurance.slice(0, 26)}..."
                      </span>

                      <button
                        type="button"
                        onClick={(e) => playVoiceSample(persona, e)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                          isPlaying
                            ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isPlaying ? 'Playing' : 'Listen'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DSP Warmth & Acoustic Filtering Specs */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Acoustic Warmth DSP Signal Chain</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              All generated speech output passes through our browser Web Audio API DSP pipeline: <strong>+3.8 dB low-mid boost (250–500 Hz)</strong> for soothing vocal warmth, and <strong>-4.2 dB high-shelf cut (5 kHz+)</strong> to filter sibilance and harsh frequencies that provoke agitation.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Changes save and apply immediately
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            Done & Save Settings
          </button>
        </div>

      </div>
    </div>
  );
};
