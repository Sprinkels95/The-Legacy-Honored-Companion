import React, { useState } from 'react';
import { 
  Brain, ShieldCheck, Flame, AlertTriangle, Clock, Activity, 
  BookOpen, Layers, CheckCircle2, TrendingUp, Users, HeartPulse, 
  FileText, ShieldAlert, Award, ArrowRight, ExternalLink, Zap, 
  HelpCircle, Sliders, HandMetal, Sparkles, UserCheck, Stethoscope,
  MessageSquare, PhoneCall, Syringe, Calendar, Check, Heart, Quote, Compass, Truck,
  CalendarDays, Car
} from 'lucide-react';
import { CAPTAIN_WADE_CAREER_MILESTONES } from '../data/initialData';

export const ResearchAndEducationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'occupational' | 'user-stories-matrix' | 'weekly-prep-matrix' | 'protocols-pillars' | 'interactive-sandbox'>('occupational');

  // Interactive Tremor Damping Demo State
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
      setDampingFeedback('✅ Registered clean intentional tap (Tremor filtered)');
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
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      
      {/* Sticky Static Navigation Bar */}
      <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md py-2.5 mb-2 border-b border-slate-200 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            id="tab-occupational-research"
            onClick={() => setActiveTab('occupational')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'occupational'
                ? 'bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-400/40 font-black'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-600" />
            <span>🧑‍🚒 Firefighter Risk & Toxicology</span>
          </button>

          <button
            type="button"
            id="tab-user-stories-matrix"
            onClick={() => setActiveTab('user-stories-matrix')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'user-stories-matrix'
                ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400/40 font-black'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>📖 User Stories & Problem-Feature Matrix</span>
          </button>

          <button
            type="button"
            id="tab-weekly-prep-matrix"
            onClick={() => setActiveTab('weekly-prep-matrix')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'weekly-prep-matrix'
                ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-400/40 font-black'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-indigo-500" />
            <span>🗓️ 7-Day Weekly Prep Matrix</span>
          </button>

          <button
            type="button"
            id="tab-protocols-pillars"
            onClick={() => setActiveTab('protocols-pillars')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'protocols-pillars'
                ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-400/40 font-black'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-purple-300" />
            <span>💉 Clinical Protocols & 4 Pillars</span>
          </button>

          <button
            type="button"
            id="tab-interactive-sandbox"
            onClick={() => setActiveTab('interactive-sandbox')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'interactive-sandbox'
                ? 'bg-teal-600 text-white shadow-xs ring-2 ring-teal-400/40 font-black'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-teal-300" />
            <span>⚡ Interactive Sandbox</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium pr-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>MDS-UPDRS Evidence Base</span>
        </div>
      </div>

      {/* SECTION 1: FIREFIGHTER OCCUPATIONAL NEUROTOXIC RISK */}
      {activeTab === 'occupational' && (
        <div className="space-y-6">
          
          {/* Key Stat Callout Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-rose-900 to-slate-900 text-white p-5 rounded-2xl border border-rose-700/60 shadow-md space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 block">
                Epidemiological Finding
              </span>
              <div className="text-3xl sm:text-4xl font-black text-rose-400">
                8x to 10x
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Full-time career firefighters are <strong>8 to 10 times more likely</strong> to develop Parkinson’s disease than the general public.
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-900 to-slate-900 text-white p-5 rounded-2xl border border-amber-700/60 shadow-md space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                Diagnosis Prevalence
              </span>
              <div className="text-3xl sm:text-4xl font-black text-amber-300">
                30 / 1,000
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                While the general population rate is ~<strong>3 in 1,000</strong>, the rate skyrockets to <strong>30 in 1,000</strong> for career firefighters.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl border border-indigo-700/60 shadow-md space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 block">
                20-Year Career Milestone
              </span>
              <div className="text-3xl sm:text-4xl font-black text-indigo-300">
                30x Slowed Gait
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                After 20 years on the job, firefighters are <strong>30 times more likely</strong> to have slowed walking pace and <strong>5x more likely</strong> to have micrographia.
              </p>
            </div>
          </div>

          {/* Why is the Risk So High? (3 Core Contributing Factors) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Flame className="w-5 h-5 text-rose-600" />
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                🧠 Why is the Neurological Risk So Drastically High?
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The drastically heightened risk is primarily driven by continuous on-the-job exposure to neurotoxic chemical compounds, prolonged heat, and repetitive physical trauma during structural firefighting and wildland operations:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              {/* Factor 1 */}
              <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm">
                  <span className="p-1.5 bg-rose-200 text-rose-800 rounded-lg">🧪</span>
                  <span>Toxic Chemical Cocktails</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11.5px]">
                  Modern structural fires burn heavy synthetic polymers, flame retardants, and plastics. Firefighters routinely inhale and transdermally absorb potent neurotoxins that cross the blood-brain barrier:
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {['Manganese', 'Lead', 'Toluene', 'Carbon Monoxide', 'Chlorinated Solvents'].map(toxin => (
                    <span key={toxin} className="px-2 py-0.5 bg-white text-rose-800 font-bold rounded-md border border-rose-200 text-[10px]">
                      {toxin}
                    </span>
                  ))}
                </div>
              </div>

              {/* Factor 2 */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                  <span className="p-1.5 bg-amber-200 text-amber-800 rounded-lg">🌾</span>
                  <span>Pesticides & Herbicides</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11.5px]">
                  Wildland firefighting and interface operations frequently expose crews to agricultural chemical runoff, paraquat residues, organophosphates, and burning commercial herbicides that directly damage mitochondrial function in the substantia nigra.
                </p>
              </div>

              {/* Factor 3 */}
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm">
                  <span className="p-1.5 bg-indigo-200 text-indigo-800 rounded-lg">💥</span>
                  <span>Repeated Head Trauma</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11.5px]">
                  Structural collapses, falling debris, forceful forced-entry breaching, and heavy equipment operation cause repeated blast overpressures and micro-concussions. These cumulative impacts accelerate neuro-inflammatory cascades and tau/alpha-synuclein aggregation.
                </p>
              </div>

            </div>
          </div>

          {/* Career Length Scaling Matrix */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  ⏱️ The Compounding Impact of Career Length
                </h2>
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                Longitudinal Biomarker Tracking
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Research tracking early motor and cognitive indicators of Parkinson’s demonstrates that disease probability scales aggressively with cumulative operational years:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-black text-slate-900 text-sm block">
                  🚒 10 Years on Job
                </span>
                <ul className="space-y-1.5 text-slate-700 text-[11.5px]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span><strong>5x more likely</strong> to exhibit slowed walking pace (early bradykinesia).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Initial subtle sleep fragmentation (REM sleep behavior disorder).</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
                <span className="font-black text-amber-950 text-sm block">
                  🚒 20 Years on Job
                </span>
                <ul className="space-y-1.5 text-slate-800 text-[11.5px]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    <span><strong>30x more likely</strong> to suffer significant walking slowing and gait freezing.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    <span><strong>5x more likely</strong> to experience micrographia (shrunken handwriting).</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2">
                <span className="font-black text-rose-950 text-sm block">
                  🚒 32 Years on Job (Captain Wade's Service Record)
                </span>
                <ul className="space-y-1.5 text-slate-800 text-[11.5px]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-700 font-bold">•</span>
                    <span><strong>Pre-PPE Era:</strong> Started as paramedic before protective medical gloves were standard; bare-handed chemical/soot exposure.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-700 font-bold">•</span>
                    <span><strong>Heavy Metro & Wildland:</strong> Tiller truck rear-steer driver, Hazmat specialist, Helitack air drops, Fireboat operator, Forest Service brush mitigation, and LA Riots frontline attack.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-700 font-bold">•</span>
                    <span><strong>Trauma & Toxin Burden:</strong> Fell through burning roofs, survived acute smoke flashovers; cumulative organophosphate/solvent exposures.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-700 font-bold">•</span>
                    <span><strong>Clinical Outcome:</strong> Parkinson's Disease Dementia (PDD) managed with 24h continuous Vyalev subcutaneous infusion and dignity-first voice AI.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Captain Wade 32-Year Service Record & Line-of-Duty Milestones Case Study */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="bg-gradient-to-br from-amber-500/15 via-rose-500/15 to-slate-900/10 p-5 sm:p-6 rounded-3xl border border-amber-300/80 space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xs">
                  <Truck className="w-4 h-4" />
                  <span>32 Years LA County Fire</span>
                </span>
                <span className="text-xs text-amber-950 font-black uppercase tracking-wider">
                  Captain Wade's Heroic Service Record & Operational Case Study
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                “I still smile every time I see a tiller truck drive by, knowing my dad was the crazy one in the back.”
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Decades of exposure to toxic combustion byproducts, heavy structural flashovers, roof collapses, and chemical exposures without modern PPE place long-tenured firefighters at acute risk for neurodegeneration. Below is the operational career timeline connecting line-of-duty exposures to clinical brain health research.
              </p>
            </div>

            {/* Career Badges & Milestones Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Service Milestones & Line-of-Duty Badges
                </h4>
                <span className="text-xs text-slate-500 font-semibold">
                  7 Historic Operational Domains
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {CAPTAIN_WADE_CAREER_MILESTONES.map((milestone) => (
                  <div 
                    key={milestone.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-amber-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-1.5 bg-amber-50 rounded-xl border border-amber-100 shrink-0">
                          {milestone.icon}
                        </span>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                            {milestone.years}
                          </div>
                          <h5 className="font-extrabold text-sm text-slate-900 leading-tight">
                            {milestone.role}
                          </h5>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md shrink-0">
                        {milestone.badgeCode}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {milestone.description}
                    </p>

                    <div className="pt-1.5 border-t border-slate-100 space-y-1">
                      <div className="text-[11px] text-amber-950 font-bold bg-amber-50/70 p-2 rounded-xl border border-amber-200/50">
                        ❤️ {milestone.memories}
                      </div>
                      {milestone.exposureContext && (
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 pl-1 pt-0.5">
                          <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                          <span><strong>Occupational Exposure:</strong> {milestone.exposureContext}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Synthesis Note */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-amber-400 font-black">
                <ShieldCheck className="w-4 h-4" />
                <span>Translating Occupational Research into Software Dignity</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">
                <strong>Legacy Honored</strong> bridges clinical neuroscience and assistive technology: providing 24-hour continuous subcutaneous Vyalev infusion tracking, 1-inch cannula site rotation, adaptive Good/Medium/Difficult Day motor profiles, and sub-second hands-free voice AI with silent autonomous deduplication—ensuring our heroes maintain the dignity, autonomy, and identity they spent their lifetimes protecting.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* SECTION 2: COMBINED USER STORIES & CLINICAL PROBLEM-SOLUTION MATRIX */}
      {activeTab === 'user-stories-matrix' && (
        <div className="space-y-6">
          {/* Part A: 3 Deep User Stories */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 inline-block mb-1">
                  Part 1: Human-Centered Grounding & Real-World Personas
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  📖 Grounded User Stories: Patient, Family Caregiver & Neurologist
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Why Dignified AI Outperforms Generic Assistants
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              In neurodegenerative illnesses like Parkinson's Disease Dementia (PDD), traditional smart home and assistant technologies fail because they assume linear memory, pristine motor control, and limitless caregiver energy. These user stories detail the exact real-world friction and how our system restores dignity and peace of mind.
            </p>

            {/* 3 Comprehensive User Story Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Story 1: Captain Wade (The Patient) */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-50/70 to-white border-2 border-indigo-200 space-y-3.5 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full border border-indigo-200">
                      User Persona: The Patient
                    </span>
                    <span className="text-xs font-bold text-slate-500">Age 74 • Retired Station Captain</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
                      👨‍🚒
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Captain Wade</h3>
                      <p className="text-xs text-slate-500">Fire Captain (32 Yrs Service) • PDD & Motor Freezing</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-indigo-100 space-y-1 text-xs">
                    <span className="font-extrabold text-rose-900 block">The Daily Struggle:</span>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      "I ask for chocolate pudding 4 times in 20 minutes because my short-term memory slips. When people snap at me with <em>'Dad, you already asked that'</em>, I feel like a child who lost his command. On bad tremor days, my hands shake too much to type or use small apps."
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 text-xs">
                    <span className="font-extrabold text-emerald-950 block">How the Agent Restores Dignity:</span>
                    <ul className="space-y-1 text-emerald-900 text-[11px]">
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Silent Memory Deduplication:</strong> The agent validates his request warmly every time without ever ordering 4 surplus puddings or correcting him.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Tremor-Debounced Voice:</strong> Giant circular microphone ignores involuntary tremor double-taps and allows 100% hands-free voice control.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Honoring Identity:</strong> Responds in respectful, steady first-responder cadence ("Understood, Captain").</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-indigo-100 text-[11px] text-slate-500 font-medium italic">
                  "I don't feel broken anymore. I just press the button, talk to my co-pilot, and everything is handled."
                </div>
              </div>

              {/* Story 2: Sarah (The Family Caregiver & Daughter) */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-rose-50/70 to-white border-2 border-rose-200 space-y-3.5 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full border border-rose-200">
                      User Persona: Family Caregiver
                    </span>
                    <span className="text-xs font-bold text-slate-500">Daughter & Working Mom</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
                      👩‍💼
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Sarah (Elsbeth)</h3>
                      <p className="text-xs text-slate-500">Solo Primary Caregiver • High Burnout & Invisible Load</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-rose-100 space-y-1 text-xs">
                    <span className="font-extrabold text-rose-900 block">The Daily Struggle:</span>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      "I was drowning in invisible logistics: keeping track of cold-chain Vyalev vial shipments, rotating his subcutaneous cannula sites to avoid skin nodules, calling the specialty pharmacy during work hours, and dreading grocery bills from duplicate orders."
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 text-xs">
                    <span className="font-extrabold text-emerald-950 block">How the Agent Eliminates Caregiver Load:</span>
                    <ul className="space-y-1 text-emerald-900 text-[11px]">
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Autonomous IVR Pharmacy Agent:</strong> AI calls CVS Specialty automatically with simulated DTMF keypresses to refill 24h pump cartridges.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Discord Real-Time Webhooks:</strong> Clean alerts dispatched to `#caregiver-alerts` when Wade needs help or supplies drop below 3 days.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>1-Inch Cannula Rotation:</strong> Interactive anatomical map tracks rotating infusion sites across abdomen and thighs.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-rose-100 text-[11px] text-slate-500 font-medium italic">
                  "The app gave me my life back. I can finally be his loving daughter again rather than an exhausted triage nurse."
                </div>
              </div>

              {/* Story 3: Dr. Kessel (Movement Disorder Neurologist) */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-50/70 to-white border-2 border-purple-200 space-y-3.5 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full border border-purple-200">
                      User Persona: Neurologist / Clinician
                    </span>
                    <span className="text-xs font-bold text-slate-500">MDS-UPDRS Specialist</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
                      🩺
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Dr. Elena Kessel, MD</h3>
                      <p className="text-xs text-slate-500">Movement Disorder Neurologist • Stanford Health</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-purple-100 space-y-1 text-xs">
                    <span className="font-extrabold text-purple-950 block">The Daily Struggle:</span>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      "In 15-minute clinic visits every 6 months, patients struggle to remember when 'OFF' episodes occurred or if dyskinesia worsened after protein intake. Retrospective recall in dementia is notoriously inaccurate."
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 text-xs">
                    <span className="font-extrabold text-emerald-950 block">How the Agent Empowers Clinical Care:</span>
                    <ul className="space-y-1 text-emerald-900 text-[11px]">
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Objective Acoustic Biomarkers:</strong> Analyzes speech cadence, pause latency, and vocal amplitude degradation across daily voice interactions.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Circadian Motor Fluctuation Tracking:</strong> Correlates meal protein timing with pump telemetry to optimize levodopa bioavailability.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>1-Click Clinical EMR Dossier:</strong> Generates longitudinal MDS-UPDRS Part II/III PDF briefings for clinic consultations.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-purple-100 text-[11px] text-slate-500 font-medium italic">
                  "Having longitudinal acoustic and motor biomarker logs changes treatment from guesswork into precision neurotherapeutics."
                </div>
              </div>

            </div>
          </div>

          {/* Part B: Problem ➔ Feature Mapping Matrix */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-600 bg-cyan-50 px-2.5 py-0.5 rounded-md border border-cyan-200 inline-block mb-1">
                  Part 2: Evidence-Based Translation Matrix
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  🎯 How We Solved Real Clinical & Occupational Symptoms With Specific Features
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                8 Core Parkinson's Challenges ➔ 8 Built Architectures
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Rather than generic AI chatbots, every single capability in <strong>The Legacy Honored Companion</strong> was engineered to directly neutralize a specific physiological, cognitive, or caregiver obstacle identified in Parkinson's disease research:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Mapping 1 */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs">🔴 Clinical Problem</span>
                    <span className="text-xs font-black text-slate-900">Bradykinesia & Micrographia</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700">Motor Loss</span>
                </div>
                <p className="text-xs text-slate-600">
                  Small, cramped handwriting makes writing notes, checks, or grocery lists impossible; slowed movement creates interface fatigue.
                </p>
                <div className="p-3 bg-cyan-50/70 rounded-xl border border-cyan-200 text-xs space-y-1">
                  <div className="font-extrabold text-cyan-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                    <span>App Feature Solution:</span>
                  </div>
                  <p className="text-cyan-900 text-[11.5px] leading-relaxed">
                    <strong>Zero-Typing Spoken Ledger:</strong> Wade speaks casually ("We're out of pudding"). Autonomous Agent 5 detects intent, updates Google Drive Sheets pantry balance, and stages 1-click Walmart reorders without Wade ever picking up a pen or typing.
                  </p>
                </div>
              </div>

              {/* Mapping 2 */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs">🔴 Clinical Problem</span>
                    <span className="text-xs font-black text-slate-900">Resting & Action Tremors (4-6 Hz)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700">Physical Spasm</span>
                </div>
                <p className="text-xs text-slate-600">
                  Involuntary finger tremors cause rapid unintended double-taps, accidental purchases, or wrong medicine selection.
                </p>
                <div className="p-3 bg-cyan-50/70 rounded-xl border border-cyan-200 text-xs space-y-1">
                  <div className="font-extrabold text-cyan-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                    <span>App Feature Solution:</span>
                  </div>
                  <p className="text-cyan-900 text-[11.5px] leading-relaxed">
                    <strong>400ms Software Tremor Damping & 44px+ Targets:</strong> All interactive components feature debounce filters that absorb spasms; touch targets are oversized with tactile borders and high-contrast color bounding.
                  </p>
                </div>
              </div>

              {/* Mapping 3 */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs">🔴 Clinical Problem</span>
                    <span className="text-xs font-black text-slate-900">Hypophonia & Monotone Dysarthria</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700">Vocal Cord Fatigue</span>
                </div>
                <p className="text-xs text-slate-600">
                  Quiet, breathy vocal production causes standard STT (Speech-to-Text) to miss commands; harsh digital AI voices cause sensory irritation.
                </p>
                <div className="p-3 bg-cyan-50/70 rounded-xl border border-cyan-200 text-xs space-y-1">
                  <div className="font-extrabold text-cyan-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                    <span>App Feature Solution:</span>
                  </div>
                  <p className="text-cyan-900 text-[11.5px] leading-relaxed">
                    <strong>Acoustic Cadence Tracker & Web Audio Warmth DSP:</strong> Dynamically measures speaking WPM, logs motor events, and passes AI audio through a +3.8 dB low-mid boost (220 Hz) and -4.2 dB high-cut filter (8 kHz) to prevent acoustic distress.
                  </p>
                </div>
              </div>

              {/* Mapping 4 */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs">🔴 Clinical Problem</span>
                    <span className="text-xs font-black text-slate-900">Short-Term Memory Loss & Repetitive Queries</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700">PDD Cognitive Deficit</span>
                </div>
                <p className="text-xs text-slate-600">
                  Dementia causes patients to repeatedly ask for items (e.g. coffee, pudding) or query the day's schedule 10+ times an hour.
                </p>
                <div className="p-3 bg-cyan-50/70 rounded-xl border border-cyan-200 text-xs space-y-1">
                  <div className="font-extrabold text-cyan-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                    <span>App Feature Solution:</span>
                  </div>
                  <p className="text-cyan-900 text-[11.5px] leading-relaxed">
                    <strong>Dignity Guardrails & 4-Tier Memory Bank:</strong> Agent never scolds or says "you already asked that". It warmly affirms each request, maintains session context, and updates pantry state in Tier 3 Managed Cloud Memory.
                  </p>
                </div>
              </div>

              {/* Mapping 5 */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs">🔴 Clinical Problem</span>
                    <span className="text-xs font-black text-slate-900">Subcutaneous Infusion Lipohypertrophy Risk</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700">Vyalev 24h Pump</span>
                </div>
                <p className="text-xs text-slate-600">
                  Continuous foslevodopa/foscarbidopa infusion requires strict 3-day site rotations across abdomen quadrants to prevent severe tissue necrosis.
                </p>
                <div className="p-3 bg-cyan-50/70 rounded-xl border border-cyan-200 text-xs space-y-1">
                  <div className="font-extrabold text-cyan-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                    <span>App Feature Solution:</span>
                  </div>
                  <p className="text-cyan-900 text-[11.5px] leading-relaxed">
                    <strong>8-Position Radial Site Rotation Engine (Agent 7):</strong> Visualizes next insertion sector, tracks exact 72-hour countdowns, logs skin condition ratings (Grade 0–3), and alerts caregiver Sarah when reservoir is below 2 hours.
                  </p>
                </div>
              </div>

              {/* Mapping 6 */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs">🔴 Clinical Problem</span>
                    <span className="text-xs font-black text-slate-900">Gait Freezing & Unpredictable 'OFF' Periods</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700">Mobility Crisis</span>
                </div>
                <p className="text-xs text-slate-600">
                  Sudden motor freeze episodes cause dangerous falls, missed medical appointments, and intense caregiver panic during transit.
                </p>
                <div className="p-3 bg-cyan-50/70 rounded-xl border border-cyan-200 text-xs space-y-1">
                  <div className="font-extrabold text-cyan-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                    <span>App Feature Solution:</span>
                  </div>
                  <p className="text-cyan-900 text-[11.5px] leading-relaxed">
                    <strong>Automated +20-Minute Mobility Transit Buffers (Agent 4):</strong> Synchronizes with Google Maps Platform and Calendar to auto-inject 20m freeze buffers into all appointment travel itineraries.
                  </p>
                </div>
              </div>

              {/* Mapping 7 */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs">🔴 Clinical Problem</span>
                    <span className="text-xs font-black text-slate-900">Caregiver Phone Fatigue & Pharmacy Hold Times</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700">Caregiver Burnout</span>
                </div>
                <p className="text-xs text-slate-600">
                  Daughter Sarah works full-time while spending 45+ minutes on hold with Walgreens or clinics managing critical levodopa refills.
                </p>
                <div className="p-3 bg-cyan-50/70 rounded-xl border border-cyan-200 text-xs space-y-1">
                  <div className="font-extrabold text-cyan-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                    <span>App Feature Solution:</span>
                  </div>
                  <p className="text-cyan-900 text-[11.5px] leading-relaxed">
                    <strong>Autonomous IVR Pharmacy Telephony Agent (Agent 3):</strong> Navigates automated phone trees, speaks Rx numbers, confirms refill readiness, and sends instant push/SMS status updates to Sarah.
                  </p>
                </div>
              </div>

              {/* Mapping 8 */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs">🔴 Clinical Problem</span>
                    <span className="text-xs font-black text-slate-900">Loss of First Responder Identity & Purpose</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700">Psychological Wellness</span>
                </div>
                <p className="text-xs text-slate-600">
                  Retiring from the fire service with a neuro-degenerative illness often induces severe depression and feeling of disempowerment.
                </p>
                <div className="p-3 bg-cyan-50/70 rounded-xl border border-cyan-200 text-xs space-y-1">
                  <div className="font-extrabold text-cyan-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                    <span>App Feature Solution:</span>
                  </div>
                  <p className="text-cyan-900 text-[11.5px] leading-relaxed">
                    <strong>Firehouse Persona Engine & Dispatch Briefings:</strong> Wade is addressed with his true honorary rank ("Captain Wade"), daily briefings emulate morning fire station roll calls, and custom personas (e.g. Dr. Evil) infuse daily joy and laughter.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SECTION: 7-DAY CLINICAL & LOGISTICS PREPARATION MATRIX */}
      {activeTab === 'weekly-prep-matrix' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-700/60 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-400/30">
                    Proactive Clinical Logistics
                  </span>
                  <span className="text-xs text-indigo-300 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Ahead-of-Time Preparedness
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-serif">
                  🗓️ 7-Day Ahead-of-Time Clinical & Logistics Preparation Matrix
                </h2>
              </div>
              <span className="text-xs text-slate-300 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0">
                Synchronized with Google Calendar
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Parkinson's Disease Dementia care requires anticipatory staging rather than reactive scrambling. This 7-day matrix coordinates cold-chain pharmaceutical supplies, transit departure buffers, protein-levodopa diet timing, and multi-family communication.
            </p>
          </div>

          {/* 3 Core Pillar Cards for Weekly Logistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cold-Chain Cartridges */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
                <HeartPulse className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase text-amber-800 tracking-wider block">
                  Cold-Chain Syringes & Cassettes
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Vyalev Continuous Infusion
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>7 Cassettes Staged:</strong> Refrigerated cold-chain supply verified. Mandatory cassette rotation and cannula swap scheduled for <strong>Friday, Sep 4 at 8:30 PM</strong>.
              </p>
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-[11px] text-amber-950 font-semibold space-y-1">
                <div>• Storage: 2°C – 8°C in dedicated medical chiller</div>
                <div>• Next Pharmacy Reorder: Thursday morning</div>
              </div>
            </div>

            {/* Transit Departure Buffers Staged */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                <Car className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wider block">
                  Parkinson's Mobility Buffers
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  +135 Total Minutes Staged
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Out-of-house medical and therapy departures padded with +25m unhurried transfer buffers to eliminate time-pressure gait freezing and tremor spikes.
              </p>
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-950 font-semibold space-y-1">
                <div>• Sat: +25m for Rock Steady Boxing</div>
                <div>• Mon/Tue/Thu: +25m for PT & Speech</div>
                <div>• Fri: +30m for UCSF Movement Clinic</div>
              </div>
            </div>

            {/* Levodopa Protein Spacing */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase text-blue-800 tracking-wider block">
                  Nutritional Pharmacokinetics
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Protein / Levodopa Strategy
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                High-protein meals strictly reserved for 6:00 PM dinner on therapy days to prevent large neutral amino acids from blocking levodopa blood-brain barrier uptake.
              </p>
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 text-[11px] text-blue-950 font-semibold space-y-1">
                <div>• Morning: Low-protein toast & fruit</div>
                <div>• Midday: Light hydration & gentle carbs</div>
                <div>• Evening: Rich protein recovery meal</div>
              </div>
            </div>
          </div>

          {/* 7-Day Day-by-Day Preparedness Schedule Grid */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Day-by-Day Ahead-of-Time Clinical Staging Timeline
                </h3>
                <p className="text-xs text-slate-500">
                  Anticipatory action items organized for Captain Wade and family caregivers
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                Saturday Aug 29 – Friday Sep 4
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
              {/* SATURDAY */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-900">Sat, Aug 29</span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-indigo-600 text-white rounded">Today</span>
                </div>
                <span className="text-[11px] font-extrabold text-indigo-700 block">Boxing & Family</span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  • 10:00 AM Rock Steady Boxing (+25m buffer)<br/>
                  • Little Wade soccer (Dad rests at home)<br/>
                  • 6:00 PM Family dinner
                </p>
              </div>

              {/* SUNDAY */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-black text-slate-800 block">Sun, Aug 30</span>
                <span className="text-[11px] font-extrabold text-emerald-700 block">Rest & Peer Telehealth</span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  • Zero transit required<br/>
                  • 2:00 PM Peer Support Zoom<br/>
                  • Afternoon porch relaxation
                </p>
              </div>

              {/* MONDAY */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-black text-slate-800 block">Mon, Aug 31</span>
                <span className="text-[11px] font-extrabold text-blue-700 block">PT & Hydration</span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  • 10:30 AM Physical Therapy (+25m buffer)<br/>
                  • Hydration check: 64oz water goal<br/>
                  • 3:00 PM Rest period
                </p>
              </div>

              {/* TUESDAY */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-black text-slate-800 block">Tue, Sep 1</span>
                <span className="text-[11px] font-extrabold text-teal-700 block">PT & Speech Therapy</span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  • 10:30 AM PT Sutter Health<br/>
                  • 02:00 PM LSVT LOUD Virtual<br/>
                  • Math pickup (Dad rests at home)
                </p>
              </div>

              {/* WEDNESDAY */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-black text-slate-800 block">Wed, Sep 2</span>
                <span className="text-[11px] font-extrabold text-purple-700 block">LA Trip & Backup Nurse</span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  • Elsbeth LA work flight<br/>
                  • Nurse Maria on-duty at home<br/>
                  • 11:00 AM Garden coffee circle
                </p>
              </div>

              {/* THURSDAY */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-black text-slate-800 block">Thu, Sep 3</span>
                <span className="text-[11px] font-extrabold text-amber-700 block">OT & Cartridge Order</span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  • 11:00 AM Occupational Therapy<br/>
                  • Acaria Health refill dispatch<br/>
                  • Pre-neurologist dossier review
                </p>
              </div>

              {/* FRIDAY */}
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                <span className="text-xs font-black text-rose-900 block">Fri, Sep 4</span>
                <span className="text-[11px] font-extrabold text-rose-700 block">Neurologist & Swap</span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  • 1:30 PM Dr. Henderson UCSF (+30m buffer)<br/>
                  • EMR Dossier hand-off<br/>
                  • 8:30 PM Sterile Cassette Swap
                </p>
              </div>
            </div>
          </div>

          {/* Caregiver Contingency & Offloading Protocol */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h3 className="text-base sm:text-lg font-black text-white">
                Emergency & Caregiver Offloading Safeguards
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <span className="font-extrabold text-amber-300 block">Discord #caregiver-alerts Bot</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Real-time webhook pushes automated alerts if pump reserve drops below 14h, pharmacy refill encounters delay, or Dad triggers express assistance.
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <span className="font-extrabold text-emerald-300 block">1-Click Clinical EMR Dossier</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Compiles pump adherence, tremor logs, and infusion site rotation logs into a structured PDF ready for the movement disorder neurologist.
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <span className="font-extrabold text-sky-300 block">Zero-Frustration Voice Intake</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Semantic deduplication agent checks pantry inventory instantly to prevent duplicate purchases when Dad requests favorite comfort snacks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: COMBINED CLINICAL PROTOCOLS & 4 PILLARS OF PDD ENGINEERING */}
      {activeTab === 'protocols-pillars' && (
        <div className="space-y-6">
          {/* Part A: Clinical Protocols & Infusion Architecture */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-700/60 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-md border border-purple-400/30 inline-block mb-1">
                  Part 1: Pharmacological Grounding & Infusion Mechanics
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  💉 Clinical Protocols, Subcutaneous Infusion & Temporal Anchors
                </h2>
              </div>
              <span className="text-xs text-indigo-300 font-medium">
                Continuous Dopaminergic Delivery & MDS-UPDRS Telemetry
              </span>
            </div>

            {/* Core Pharmacological Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/15 space-y-2">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-emerald-400" />
                  <span className="font-black text-emerald-300 text-sm">
                    Vyalev Continuous Infusion
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed text-[11.5px]">
                  Subcutaneous foslevodopa/foscarbidopa continuous 24h pump telemetry maintains steady plasma levodopa concentrations. This bypasses erratic gastric emptying and eliminates the sharp motor peaks and motor freezes common with oral pills.
                </p>
                <div className="text-[10.5px] text-emerald-200 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  Target: 24h uninterrupted flow • Minimum 14h reserve before refill alert
                </div>
              </div>

              <div className="p-4 bg-white/10 rounded-2xl border border-white/15 space-y-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-amber-400" />
                  <span className="font-black text-amber-300 text-sm">
                    Levodopa / Protein Competition
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed text-[11.5px]">
                  Large neutral amino acids in high-protein foods compete directly with levodopa for transport across the blood-brain barrier. The Care Co-Pilot guides light carbohydrate breakfasts and schedules heavy dietary protein strictly for the 6:00 PM evening window.
                </p>
                <div className="text-[10.5px] text-amber-200 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  Breakfast: Low-protein toast/fruit • Dinner: Lean protein after clinic hours
                </div>
              </div>

              <div className="p-4 bg-white/10 rounded-2xl border border-white/15 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span className="font-black text-sky-300 text-sm">
                    +20m Parkinson's Transit Buffers
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed text-[11.5px]">
                  Rushing creates acute noradrenergic surges that freeze Parkinsonian gait. All clinic and community departures (e.g. 10:30 AM PT) automatically stage vehicle readiness 20–35 minutes early (9:55 AM) to allow unhurried wheelchair and walking frame transitions.
                </p>
                <div className="text-[10.5px] text-sky-200 bg-sky-500/10 p-2 rounded-lg border border-sky-500/20">
                  Zero-anxiety staging • Embedded cognitive de-escalation
                </div>
              </div>
            </div>

            {/* 4 Temporal Anchors of the Day */}
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <span className="font-black text-indigo-200 block text-xs uppercase tracking-wider">
                Temporal Rhythm & Conversational Anchors (4 Gentle Day Parts)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌅</span>
                    <span className="font-bold text-amber-300">Morning Anchor</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Light fruit breakfast, pump site inspection, and quiet orientation until 9:55 AM departure.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">☀️</span>
                    <span className="font-bold text-amber-200">Mid-Day Anchor</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Physical therapy recovery, light soup/tea, and quiet armchair downtime (1:30–3:00 PM).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🛋️</span>
                    <span className="font-bold text-indigo-300">Afternoon Rest</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Scheduled motor rest to preserve neuromuscular fluidity and prevent late-day sun-downing.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌙</span>
                    <span className="font-bold text-purple-300">Evening Routine</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Caregiver check-in at 3:30 PM, family dinner at 6:00 PM, and 24h pump vial inspection.
                  </p>
                </div>
              </div>
            </div>

            {/* Cannula Site Rotation Protocol */}
            <div className="p-4 bg-purple-950/60 rounded-2xl border border-purple-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Syringe className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-black text-purple-200 block text-xs">
                    Subcutaneous Cannula Site Rotation Protocol (1-Inch Rule)
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    To prevent subcutaneous nodule formation and lipohypertrophy, each 3-day infusion set change rotates cannula insertion at least 1 inch (2.5 cm) away from previous sites across upper quadrants.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-purple-200 bg-purple-500/20 px-3 py-1.5 rounded-xl border border-purple-400/30 shrink-0">
                Logged in Caregiver Admin
              </span>
            </div>

            {/* Cognitive Offloading & Dual-Channel Orchestration Matrix */}
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-black text-white text-xs uppercase tracking-wider">
                    Cognitive Offloading & Dual-Channel Orchestration Matrix
                  </span>
                </div>
                <span className="text-[10.5px] text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-700/50">
                  Wade Receives Single-Focus Calm • Caregiver Receives Staging Logistics
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Wade Channel */}
                <div className="p-4 rounded-xl bg-black/40 border border-indigo-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-indigo-400" />
                      Captain Wade's Spoken Guidance Channel
                    </span>
                    <span className="text-[10px] uppercase font-bold text-indigo-200 bg-indigo-900/60 px-2 py-0.5 rounded">
                      Zero-Anxiety
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Stripped of all logistical stress, dates, packing lists, and departure alarms. He is spoken to in gentle, warm conversational cadence ("Enjoy your breakfast at your own pace; physical therapy is ready when you are"). Memory is fully offloaded so he is never corrected or rushed.
                  </p>
                </div>

                {/* Caregiver Channel */}
                <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Caregiver Logistics & Clinical Channel
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-200 bg-emerald-900/60 px-2 py-0.5 rounded">
                      Actionable Staging
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Receives exact actionable staging: vehicle departures padded with +20m mobility buffers, walker placement alerts at front entry, hydration prep, Vyalev pump cassette checks, and MDS-UPDRS clinical summary reports ready for the neurologist.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Part B: The 4 Pillars of PDD Software Engineering */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 inline-block mb-1">
                  Part 2: Cognitive & Neurological UX Architecture
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  🧠 The 4 Pillars of Parkinson's Disease Dementia Software Engineering
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Cognitive Damping & Zero-Frustration Safeguards
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Pillar 1 */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">1</span>
                    <h3 className="font-black text-slate-900 text-base">Reducing Cognitive Load & Extraneous Noise</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-md border border-indigo-200">
                    Sensory Protection
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Excessive visual elements, pop-ups, nested sub-menus, or dense text walls trigger sensory overload and stall decision-making in individuals with executive cognitive deficits.
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                  <span className="font-bold text-slate-900">App Implementation:</span>
                  <p className="text-slate-700 text-[11.5px]">
                    Captain Wade portal is strictly single-screen with high-contrast hierarchy, 0 marketing pop-ups, and generous whitespace.
                  </p>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black text-sm">2</span>
                    <h3 className="font-black text-slate-900 text-base">Managing Multistep Actions & Executive Flow</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-black rounded-md border border-sky-200">
                    Sequential Clarity
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Break down multi-step tasks into single-step, progressive disclosures. Deconstruct complex workflows to avoid overwhelming dysexecutive syndromes.
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                  <span className="font-bold text-slate-900">App Implementation:</span>
                  <p className="text-slate-700 text-[11.5px]">
                    Express intake operates as a single 1-tap confirmation card; multi-step pantry logging is auto-handled by autonomous background agents.
                  </p>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">3</span>
                    <h3 className="font-black text-slate-900 text-base">Motor & Visuospatial Damping</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-md border border-emerald-200">
                    Tremor Filtering
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Parkinson’s tremors (4–6 Hz) cause unintended double-clicks and mis-taps. Bradykinesia demands generous target touch zones (44px+).
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                  <span className="font-bold text-slate-900">App Implementation:</span>
                  <p className="text-slate-700 text-[11.5px]">
                    Built-in 400ms software damping filters double-taps; touch targets are oversized with tactile borders and high-contrast labels.
                  </p>
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm">4</span>
                    <h3 className="font-black text-slate-900 text-base">Error Tolerance & Dignity Guardrails</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-black rounded-md border border-amber-200">
                    Zero Scolding
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Repetitive requests for pudding or coffee must never prompt correcting statements like "You already asked that". 
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                  <span className="font-bold text-slate-900">App Implementation:</span>
                  <p className="text-slate-700 text-[11.5px]">
                    Every spoken input receives immediate, warm affirmation while silently updating Google Drive pantry inventory in the background.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: INTERACTIVE ACCESSIBILITY SANDBOX */}
      {activeTab === 'interactive-sandbox' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Interactive Motor Tremor Damping Simulator (400ms Filter)
              </h2>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Live Software Algorithm
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Test the algorithmic tremor debouncing filter in real-time. Rapidly double or triple tap the button below to simulate an involuntary 4–6 Hz Parkinsonian hand tremor. Notice how the raw hardware captures every spasm, while our damped algorithm preserves the patient’s single true intent:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Interactive Button */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4 flex flex-col justify-center items-center">
              <button
                type="button"
                onClick={handleTestTap}
                className="w-full max-w-xs py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <HandMetal className="w-5 h-5" />
                <span>Tap Rapidly (Simulate Tremor)</span>
              </button>

              <p className="text-[11.5px] font-mono text-slate-600">
                Status: <strong className="text-slate-900">{dampingFeedback}</strong>
              </p>

              <button
                type="button"
                onClick={handleResetDemo}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline"
              >
                Reset Counters
              </button>
            </div>

            {/* Live Metrics Display */}
            <div className="space-y-3">
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-rose-800 uppercase block">Raw Physical Taps (With Tremor Spasms)</span>
                  <span className="text-2xl font-black text-rose-950">{demoTapCount}</span>
                </div>
                <span className="text-xs font-semibold text-rose-700">Unfiltered Hardware</span>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Damped Intentional Actions (Clean)</span>
                  <span className="text-2xl font-black text-emerald-950">{dampedTapCount}</span>
                </div>
                <span className="text-xs font-semibold text-emerald-700">400ms Window Filter</span>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-700">
                <strong>Spasms Filtered:</strong> {Math.max(0, demoTapCount - dampedTapCount)} accidental double-clicks prevented from corrupting medication or pantry orders.
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
