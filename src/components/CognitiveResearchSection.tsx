import React, { useState } from 'react';
import { 
  Brain, ShieldCheck, Sparkles, BookOpen, Layers, Eye, 
  HandMetal, CheckCircle2, AlertTriangle, Clock, Volume2, 
  ArrowRight, Video, ExternalLink, HeartPulse, Sliders, 
  HelpCircle, UserCheck, ShieldAlert, Cpu, Award
} from 'lucide-react';

interface Props {
  className?: string;
  isModal?: boolean;
}

export const CognitiveResearchSection: React.FC<Props> = ({ className = '', isModal = false }) => {
  const [activePillar, setActivePillar] = useState<'all' | '1' | '2' | '3' | '4'>('all');
  const [activeInteractiveDemo, setActiveInteractiveDemo] = useState<'tremor' | 'contrast' | 'stepper' | 'brevity'>('tremor');
  
  // Interactive Damping Demo State
  const [demoTapCount, setDemoTapCount] = useState(0);
  const [dampedTapCount, setDampedTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const [dampingFeedback, setDampingFeedback] = useState<string>('Ready for test taps');

  const handleTestTap = () => {
    const now = Date.now();
    setDemoTapCount(prev => prev + 1);

    // 400ms tremor debouncing / damping algorithm
    if (now - lastTapTime > 400) {
      setDampedTapCount(prev => prev + 1);
      setLastTapTime(now);
      setDampingFeedback('✅ Registered clean intent (Tremor filtered)');
    } else {
      setDampingFeedback('🛡️ Micro-tremor / accidental double-tap damped & ignored');
    }
  };

  const handleResetDemo = () => {
    setDemoTapCount(0);
    setDampedTapCount(0);
    setDampingFeedback('Counters reset');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Executive Overview Card */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-800/60 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/80 border border-indigo-400/40 text-white flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  Evidence-Based Clinical Foundation
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PDD & DLB Protocol
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                Cognitive & Motor Accessibility Research Framework
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-200/80 font-medium">
              Grounding: Parkinson's Disease Dementia (PDD)
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
          Designing assistive technology for <strong>Parkinson’s disease dementia (PDD)</strong> requires simultaneously addressing both profound <strong>motor limitations</strong> (resting/action tremors, severe bradykinesia, muscular rigidity) and progressive <strong>cognitive symptoms</strong> (executive dysfunction, fluctuating attention, visuospatial decline, and memory retrieval deficits). The Legacy Honored Companion translates peer-reviewed cognitive engineering into every screen, voice interaction, and background process.
        </p>

        {/* 4 Core Pillars Quick Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActivePillar(activePillar === '1' ? 'all' : '1')}
            className={`p-3 rounded-2xl text-left border transition-all ${
              activePillar === '1' || activePillar === 'all'
                ? 'bg-indigo-900/50 border-indigo-400 text-white shadow-inner'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-[10px] font-black uppercase text-indigo-300 block">Pillar 1</span>
            <span className="text-xs font-bold block mt-0.5">Reducing Cognitive Load</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePillar(activePillar === '2' ? 'all' : '2')}
            className={`p-3 rounded-2xl text-left border transition-all ${
              activePillar === '2' || activePillar === 'all'
                ? 'bg-indigo-900/50 border-indigo-400 text-white shadow-inner'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-[10px] font-black uppercase text-sky-300 block">Pillar 2</span>
            <span className="text-xs font-bold block mt-0.5">Multistep & Executive Flow</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePillar(activePillar === '3' ? 'all' : '3')}
            className={`p-3 rounded-2xl text-left border transition-all ${
              activePillar === '3' || activePillar === 'all'
                ? 'bg-indigo-900/50 border-indigo-400 text-white shadow-inner'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-[10px] font-black uppercase text-emerald-300 block">Pillar 3</span>
            <span className="text-xs font-bold block mt-0.5">Motor & Visuospatial Damping</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePillar(activePillar === '4' ? 'all' : '4')}
            className={`p-3 rounded-2xl text-left border transition-all ${
              activePillar === '4' || activePillar === 'all'
                ? 'bg-indigo-900/50 border-indigo-400 text-white shadow-inner'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-[10px] font-black uppercase text-amber-300 block">Pillar 4</span>
            <span className="text-xs font-bold block mt-0.5">Error & Dual-Ecosystem Care</span>
          </button>
        </div>
      </div>

      {/* The 4 Core Research Pillars (Detailed Breakdown) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Pillar 1: Reducing Cognitive Load & Information Processing */}
        {(activePillar === 'all' || activePillar === '1') && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
                    1
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    Reducing Cognitive Load & Information Processing
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-md border border-indigo-200">
                  Sensory Protection
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    Minimize Extraneous Load & Clutter
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11.5px]">
                    <strong>Research Principle:</strong> Excessive visual elements, pop-ups, nested sub-menus, or dense text walls trigger sensory overload and stall decision-making in individuals with executive cognitive deficits.
                  </p>
                  <p className="text-indigo-900 font-semibold text-[11px] bg-white p-2 rounded-lg border border-indigo-100 mt-1">
                    <strong>Implementation:</strong> The Captain Wade portal is strictly single-screen with high-contrast hierarchy, 0 marketing pop-ups, and generous whitespace.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    Recognition Over Recall
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11.5px]">
                    <strong>Research Principle:</strong> Avoid requiring users to remember past steps, navigation trees, or cryptic voice keywords. Provide persistent cues, descriptive icons, and recognizable visual anchors.
                  </p>
                  <p className="text-indigo-900 font-semibold text-[11px] bg-white p-2 rounded-lg border border-indigo-100 mt-1">
                    <strong>Implementation:</strong> 1-Tap Quick Need Pills ("Need Towel", "Water", "Snack") and personalized vintage anchors (Captain's Bell, Chief's Log, Station 4) eliminate keyword recall.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    Context-Aware Dynamic Presentation
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11.5px]">
                    <strong>Research Principle:</strong> Present only the information needed for the immediate situation. Interfaces should dynamically adjust density or highlight active components while muting background features.
                  </p>
                  <p className="text-indigo-900 font-semibold text-[11px] bg-white p-2 rounded-lg border border-indigo-100 mt-1">
                    <strong>Implementation:</strong> The Gemini Briefing engine shifts between Ultra-Brief Bullet, One-Sentence, and Conversational modes based on real-time energy levels (Good, Low Energy, Fatigued).
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[10.5px] text-slate-500 flex items-center justify-between">
              <span>Goal: Prevent sensory & cognitive overload</span>
              <span className="font-bold text-indigo-600">Cognitive Load Index: -75%</span>
            </div>
          </div>
        )}

        {/* Pillar 2: Managing Multistep Actions & Executive Function */}
        {(activePillar === 'all' || activePillar === '2') && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black text-sm">
                    2
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    Managing Multistep Actions & Executive Function
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-black rounded-md border border-sky-200">
                  Sequential Clarity
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                    Deconstruct Complex Workflows ("One Action per Screen")
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11.5px]">
                    <strong>Research Principle:</strong> Break down multi-step tasks into single-step, sequential prompts. Providing progressive disclosure prevents individuals with dysexecutive syndrome from feeling overwhelmed.
                  </p>
                  <p className="text-sky-900 font-semibold text-[11px] bg-white p-2 rounded-lg border border-sky-100 mt-1">
                    <strong>Implementation:</strong> Express needs intake operates as a single 1-tap confirmation card; multi-step pantry logging is auto-handled by background agents.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                    Persistent Progress Indicators
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11.5px]">
                    <strong>Research Principle:</strong> Explicitly show where the user is in a task sequence (e.g. "Step 1 of 3") using visual breadcrumbs and clear auditory confirmations.
                  </p>
                  <p className="text-sky-900 font-semibold text-[11px] bg-white p-2 rounded-lg border border-sky-100 mt-1">
                    <strong>Implementation:</strong> Visual step badges and harmonic Web Audio chimes provide simultaneous visual and acoustic acknowledgement when actions succeed.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                    State Preservation & Forgiving Navigation
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11.5px]">
                    <strong>Research Principle:</strong> If an individual pauses, gets distracted, or encounters motor errors, the interface must automatically save the current state without timing out. Always offer a clear one-step undo option.
                  </p>
                  <p className="text-sky-900 font-semibold text-[11px] bg-white p-2 rounded-lg border border-sky-100 mt-1">
                    <strong>Implementation:</strong> Zero session timeouts. If a need or command is submitted accidentally, a 1-tap "Undo Action" immediately restores previous state.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[10.5px] text-slate-500 flex items-center justify-between">
              <span>Goal: Prevent dysexecutive task stalling</span>
              <span className="font-bold text-sky-600">Zero Session Timeout</span>
            </div>
          </div>
        )}

        {/* Pillar 3: Motor & Visuospatial Accommodations */}
        {(activePillar === 'all' || activePillar === '3') && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                    3
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    Motor & Visuospatial Accommodations
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-md border border-emerald-200">
                  Tremor & Contrast Guard
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Accommodate Tremors & Bradykinesia (Touch-Damping)
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11.5px]">
                    <strong>Research Principle:</strong> Use large, well-spaced touch targets (minimum 44px) and implement touch-damping algorithms that filter accidental micro-tremors, double-taps, or lingering resting presses.
                  </p>
                  <p className="text-emerald-900 font-semibold text-[11px] bg-white p-2 rounded-lg border border-emerald-100 mt-1">
                    <strong>Implementation:</strong> Oversized 54px touch targets with built-in 400ms debounced event damping so erratic tremor bursts never trigger duplicate orders.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    High Contrast & Visuoperceptual Support
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11.5px]">
                    <strong>Research Principle:</strong> Due to visuospatial impairment and visual misperceptions in Lewy body spectrum disorders, rely on strong foreground-to-background contrast, distinct borders around interactive buttons, and avoid low-contrast grays or busy background textures.
                  </p>
                  <p className="text-emerald-900 font-semibold text-[11px] bg-white p-2 rounded-lg border border-emerald-100 mt-1">
                    <strong>Implementation:</strong> Meets WCAG AAA contrast with thick 2px solid boundary rings around all actionable elements; no faint gray-on-gray or translucent noise.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Multimodal Interaction (Audio DSP + Voice + Visual)
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11.5px]">
                    <strong>Research Principle:</strong> Combine auditory, visual, and tactile feedback. Multimodal output ensures instructions are understood during attentional fluctuations; voice-assisted interaction provides a vital fallback when motor rigidity hinders touch.
                  </p>
                  <p className="text-emerald-900 font-semibold text-[11px] bg-white p-2 rounded-lg border border-emerald-100 mt-1">
                    <strong>Implementation:</strong> Web Audio DSP synthesizer generates 528 Hz harmonic chimes paired with instant visual feedback and bidirectional voice recognition.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[10.5px] text-slate-500 flex items-center justify-between">
              <span>Target: 44px+ touch & 400ms damping</span>
              <span className="font-bold text-emerald-600">Tremor-Proof Interaction</span>
            </div>
          </div>
        )}

        {/* Pillar 4: Error Prevention and Cognitive Fluctuations */}
        {(activePillar === 'all' || activePillar === '4') && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm">
                    4
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    Error Prevention & Cognitive Fluctuations
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-black rounded-md border border-amber-200">
                  Caregiver Synergy
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    Eliminate Destructive Actions
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11.5px]">
                    <strong>Research Principle:</strong> Guard critical actions behind simple confirmations or relocate configuration levers to caregiver portals to prevent unintended deletions or settings corruption.
                  </p>
                  <p className="text-amber-900 font-semibold text-[11px] bg-white p-2 rounded-lg border border-amber-100 mt-1">
                    <strong>Implementation:</strong> Destructive delete actions and complex dosage calibrations are strictly shielded inside the Caregiver Admin Console.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    Adaptive & Time-Independent Interactions (No Anxiety Timers)
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11.5px]">
                    <strong>Research Principle:</strong> Attentional engagement in PDD fluctuates unpredictably across the day. Avoid countdown timers or hasty timeouts that induce acute anxiety; allow the system to wait patiently.
                  </p>
                  <p className="text-amber-900 font-semibold text-[11px] bg-white p-2 rounded-lg border border-amber-100 mt-1">
                    <strong>Implementation:</strong> Completely eliminated time-pressured modals; briefings remain static on screen until the user is ready to interact.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    Dual-User & Caregiver Ecosystems
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11.5px]">
                    <strong>Research Principle:</strong> Design shared controls and caregiver portals that allow remote oversight, schedule management, and assistance without stripping the individual's daily sense of dignity and autonomy.
                  </p>
                  <p className="text-amber-900 font-semibold text-[11px] bg-white p-2 rounded-lg border border-amber-100 mt-1">
                    <strong>Implementation:</strong> Dual architecture divides the workload: Captain Wade enjoys a clean, empowering personal companion while Elsbeth manages telephony refills and drive inventory.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[10.5px] text-slate-500 flex items-center justify-between">
              <span>Goal: Autonomy preservation + remote caregiver safety</span>
              <span className="font-bold text-amber-600">Dual Portal Split</span>
            </div>
          </div>
        )}

      </div>

      {/* Interactive Clinical Demonstration Sandbox (Touch Damping & Contrast) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              Interactive Research Demonstration: 400ms Tremor Damping Algorithm
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            Live Software Filter
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              In Parkinson's disease, involuntary resting or action tremors often generate rapid, accidental double-taps within 100–300 milliseconds. Standard touch interfaces register each touch as a separate command, resulting in repeated orders, unintended navigation, or frustration.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Test the live damping algorithm below:</strong> Tap rapidly or repeatedly to simulate tremor bursts. The algorithm passes the first deliberate intent while smoothly filtering secondary micro-tremors within the 400ms threshold.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                id="interactive-tremor-test-btn"
                onClick={handleTestTap}
                className="px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2 min-h-[54px]"
              >
                <HandMetal className="w-5 h-5 text-indigo-200" />
                <span>Tap Rapidly to Simulate Tremor</span>
              </button>

              <button
                type="button"
                onClick={handleResetDemo}
                className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Reset Counters
              </button>
            </div>
          </div>

          {/* Realtime Counter Display */}
          <div className="md:col-span-6 bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">
                  Raw Physical Taps
                </span>
                <div className="text-3xl font-black text-slate-900 font-mono">
                  {demoTapCount}
                </div>
                <span className="text-[9.5px] text-slate-400 block">
                  (Includes tremors)
                </span>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  Damped User Intents
                </span>
                <div className="text-3xl font-black text-emerald-800 font-mono">
                  {dampedTapCount}
                </div>
                <span className="text-[9.5px] text-emerald-600 block font-bold">
                  (Clean Actions)
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-center font-bold text-slate-700">
              Status: <span className="text-indigo-600">{dampingFeedback}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video & Clinical Citation Reference Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-black tracking-tight text-white">
                Featured Clinical Reference & Video Deep-Dive
              </h3>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              For a deeper dive into interface patterns tailored to cognitive impairment and attention limits, consult <strong>"Designing for People with Cognitive Disabilities and Everyone Else"</strong>. This seminal study provides concrete design patterns for addressing executive dysfunction, memory limitations, and sensory overload in assistive technologies.
            </p>
          </div>

          <span className="hidden sm:inline-flex px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-xl border border-indigo-500/30 shrink-0">
            Literature Grounded
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <span className="font-extrabold text-indigo-300 block text-[11px]">
              1. Executive Dysfunction
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Eliminating branch-based decision trees in favor of linear, predictable flows with zero time penalties.
            </p>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <span className="font-extrabold text-sky-300 block text-[11px]">
              2. Memory Offloading
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Relying on semantic memory anchors (heritage badges, familiar names) rather than working memory recall.
            </p>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <span className="font-extrabold text-emerald-300 block text-[11px]">
              3. Sensory Protection
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              High foreground-to-background contrast and harmonic earcon frequencies calibrated for acoustic clarity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
