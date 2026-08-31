import React, { useState } from 'react';
import { 
  Heart, Stethoscope, Compass, Volume2, Sparkles, CheckCircle2, 
  ShieldCheck, Settings, ChevronDown, ChevronUp, Sliders, Play, 
  VolumeX, Skull, Info
} from 'lucide-react';
import { AgentPersona, AgentPersonaId } from '../types';
import { AGENT_PERSONAS } from '../data/initialData';
import { acousticVoice } from '../utils/acousticVoiceEngine';

interface Props {
  selectedPersona: AgentPersonaId;
  onSelectPersona: (id: AgentPersonaId) => void;
  compact?: boolean;
}

export const AgentPersonaSelector: React.FC<Props> = ({ 
  selectedPersona, 
  onSelectPersona,
  compact = true 
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAiInfo, setShowAiInfo] = useState(false);

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
      case 'dr-evil':
        return <span className="text-base select-none">😈</span>;
      case 'clinical-copilot':
      default:
        return <Stethoscope className={`w-4 h-4 ${isSelected ? 'text-cyan-500' : 'text-cyan-400'}`} />;
    }
  };

  return (
    <div id="persona-selector-container" className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all">
      {/* Compact Top Bar */}
      <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-3">
          {/* Active Persona Mini Avatar */}
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 shadow-2xs">
            {getPersonaIcon(activePersona.id, true)}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 tracking-tight">
                Active Vocal Persona:
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                {activePersona.name}
              </span>
              <span className="text-[11px] text-slate-500 font-medium hidden md:inline">
                ({activePersona.tag})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
              {activePersona.subtitle} • {activePersona.voiceStyle}
            </p>
          </div>
        </div>

        {/* Quick Actions & Switcher */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setShowAiInfo(!showAiInfo)}
            title="What does the AI Persona Engine do?"
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-bold">AI Role</span>
          </button>

          <button
            type="button"
            id={`play-voice-btn-compact`}
            onClick={() => playVoiceSample(activePersona)}
            title="Listen to active voice tone sample"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
              isPlayingAudio === activePersona.id
                ? 'bg-amber-500 text-slate-950 animate-pulse font-black'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
            }`}
          >
            {isPlayingAudio === activePersona.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isPlayingAudio === activePersona.id ? 'Playing...' : 'Test Voice'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors border border-slate-200"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isExpanded ? 'Hide Personas' : 'Switch Persona'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* AI Explanation Banner (What the AI does) */}
      {showAiInfo && (
        <div className="px-4 py-3.5 bg-indigo-950 text-white border-t border-indigo-800 text-xs animate-in fade-in space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-300 font-black tracking-wide uppercase text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              The Legacy Honored Persona Engine (Core Engine + Adaptive Layer)
            </div>
            <button
              type="button"
              onClick={() => setShowAiInfo(false)}
              className="text-indigo-300 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
          <p className="text-indigo-100 leading-relaxed text-[11px]">
            <strong>Core Cognitive Engine:</strong> Eliminates memory anxiety and offloads complex daily logistics. Never corrects memory lapses, preserves dignity, and routes tasks silently to background agents.
          </p>
          <p className="text-indigo-200 leading-relaxed text-[11px]">
            <strong>Adaptive Personalization Layer:</strong> Demonstrated through Captain Wade (Station Captain & 1950s/1960s cultural anchors). Any family member can configure custom archetypes in seconds — such as a <em>"1970s Motown Fan"</em> or a <em>"Retired Elementary School Teacher"</em> — by selecting favorite eras, cadence, and reassurance style.
          </p>
        </div>
      )}

      {/* Expanded Persona Selection Tray (Shrunk & Crisp) */}
      {isExpanded && (
        <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 animate-in fade-in space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Select Wade's Care Voice Persona ({AGENT_PERSONAS.length} Configured)
            </span>
            <span className="text-[11px] text-slate-400">
              Changes apply instantly to voice synthesizer
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {AGENT_PERSONAS.map((persona) => {
              const isSelected = selectedPersona === persona.id;
              const isPlaying = isPlayingAudio === persona.id;

              return (
                <div
                  key={persona.id}
                  id={`persona-card-${persona.id}`}
                  onClick={() => onSelectPersona(persona.id)}
                  className={`relative cursor-pointer rounded-xl p-3.5 transition-all border text-left flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-white/70 hover:bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {getPersonaIcon(persona.id, isSelected)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">
                            {persona.name}
                          </h4>
                          <span className="text-[10px] font-semibold text-slate-400 block leading-tight">
                            {persona.tag}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug mb-2.5">
                      {persona.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <span className="text-[10px] text-slate-400 italic truncate max-w-[120px]">
                      "{persona.sampleReassurance.slice(0, 22)}..."
                    </span>

                    <button
                      type="button"
                      id={`play-voice-btn-${persona.id}`}
                      onClick={(e) => playVoiceSample(persona, e)}
                      title={`Listen to ${persona.name} voice sample`}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                        isPlaying
                          ? 'bg-amber-500 text-slate-950 animate-pulse'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{isPlaying ? 'Playing' : 'Listen'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

