import React, { useState } from 'react';
import { 
  Brain, ShieldCheck, Flame, AlertTriangle, Clock, Activity, 
  BookOpen, CheckCircle2, TrendingUp, Users, HeartPulse, 
  FileText, ShieldAlert, Award, ArrowRight, Zap, 
  Sliders, HandMetal, Sparkles, UserCheck, Stethoscope,
  Syringe, Calendar, Check, Heart, Compass, Truck,
  CalendarDays, Car
} from 'lucide-react';
import { CAPTAIN_WADE_CAREER_MILESTONES } from '../data/initialData';

export const ResearchAndEducationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'occupational' | 'matrix' | 'weekly-prep' | 'protocols' | 'sandbox'>('occupational');

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
      setDampingFeedback('Registered clean intentional tap (Tremor filtered)');
    } else {
      setDampingFeedback('Micro-tremor / accidental double-tap damped & ignored');
    }
  };

  const handleResetDemo = () => {
    setDemoTapCount(0);
    setDampedTapCount(0);
    setDampingFeedback('Counters reset');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Modern, Harmonized Navigation Bar matching the app's slate/indigo palette */}
      <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('occupational')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'occupational'
                ? 'bg-slate-900 text-white shadow-xs font-extrabold ring-1 ring-slate-700'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Firefighter Risk & Toxicology</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-slate-900 text-white shadow-xs font-extrabold ring-1 ring-slate-700'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Clinical Problem Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('weekly-prep')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'weekly-prep'
                ? 'bg-slate-900 text-white shadow-xs font-extrabold ring-1 ring-slate-700'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-emerald-400" />
            <span>7-Day Staging Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('protocols')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'protocols'
                ? 'bg-slate-900 text-white shadow-xs font-extrabold ring-1 ring-slate-700'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-rose-400" />
            <span>Vyalev & UX Protocols</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sandbox')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sandbox'
                ? 'bg-slate-900 text-white shadow-xs font-extrabold ring-1 ring-slate-700'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-teal-400" />
            <span>Tremor Filter Sandbox</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium pr-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>MDS-UPDRS Evidence Base</span>
        </div>
      </div>

      {/* SECTION 1: FIREFIGHTER OCCUPATIONAL NEUROTOXIC RISK */}
      {activeTab === 'occupational' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Key Stat Callout Cards in unified styling */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 block">
                Epidemiological Finding
              </span>
              <div className="text-3xl sm:text-4xl font-black text-rose-400">
                8x to 10x
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Full-time career firefighters are <strong>8 to 10 times more likely</strong> to develop Parkinson’s disease than the general public.
              </p>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                Diagnosis Prevalence
              </span>
              <div className="text-3xl sm:text-4xl font-black text-amber-300">
                30 / 1,000
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                While the general population rate is ~<strong>3 in 1,000</strong>, the rate rises to <strong>30 in 1,000</strong> for career firefighters.
              </p>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 block">
                20-Year Career Milestone
              </span>
              <div className="text-3xl sm:text-4xl font-black text-indigo-300">
                30x Slowed Gait
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                After 20 years on the job, firefighters are <strong>30 times more likely</strong> to experience slowed walking pace and <strong>5x more likely</strong> to have micrographia.
              </p>
            </div>
          </div>

          {/* Why is the Risk So High? (3 Core Contributing Factors) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Flame className="w-5 h-5 text-amber-600" />
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Why is the Neurological Risk So Drastically High?
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The heightened risk is driven by continuous on-the-job exposure to neurotoxic chemical combustion byproducts, extreme heat, and repetitive physical trauma during structural firefighting and wildland operations:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              {/* Factor 1 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                  <span className="p-1 bg-rose-100 text-rose-800 rounded-md text-xs">🧪</span>
                  <span>Toxic Chemical Cocktails</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11.5px]">
                  Modern structural fires burn heavy synthetic polymers and flame retardants. Firefighters routinely inhale and transdermally absorb neurotoxins that cross the blood-brain barrier:
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {['Manganese', 'Lead', 'Toluene', 'Carbon Monoxide', 'Chlorinated Solvents'].map(toxin => (
                    <span key={toxin} className="px-2 py-0.5 bg-white text-slate-700 font-bold rounded-md border border-slate-200 text-[10px]">
                      {toxin}
                    </span>
                  ))}
                </div>
              </div>

              {/* Factor 2 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                  <span className="p-1 bg-amber-100 text-amber-800 rounded-md text-xs">🌾</span>
                  <span>Pesticides & Herbicides</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11.5px]">
                  Wildland firefighting and interface operations frequently expose crews to agricultural chemical runoff, paraquat residues, and burning commercial herbicides that damage mitochondrial function in the substantia nigra.
                </p>
              </div>

              {/* Factor 3 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                  <span className="p-1 bg-indigo-100 text-indigo-800 rounded-md text-xs">💥</span>
                  <span>Repeated Head Trauma</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11.5px]">
                  Structural collapses, falling debris, forced-entry breaching, and heavy equipment operation cause repeated blast overpressures and micro-concussions, accelerating neuro-inflammatory cascades and alpha-synuclein aggregation.
                </p>
              </div>

            </div>
          </div>

          {/* Captain Wade 32-Year Service Record & Line-of-Duty Milestones Case Study */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xs">
                  <Truck className="w-3.5 h-3.5" />
                  <span>32 Years LA County Fire</span>
                </span>
                <span className="text-xs text-amber-300 font-black uppercase tracking-wider">
                  Captain Wade's Service Record & Operational Case Study
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                “I still smile every time I see a tiller truck drive by, knowing my dad was the crazy one in the back.”
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
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
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-1.5 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
                          {milestone.icon}
                        </span>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
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
                      <div className="text-[11px] text-slate-800 font-bold bg-slate-50 p-2 rounded-xl border border-slate-200">
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
          </div>

        </div>
      )}

      {/* SECTION 2: COMBINED USER STORIES & CLINICAL PROBLEM-SOLUTION MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* 3 Streamlined User Stories */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 inline-block mb-1">
                  Human-Centered Personas
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  Grounded User Stories: Patient, Family Caregiver & Neurologist
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Why Dignified AI Outperforms Generic Assistants
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Story 1: Captain Wade */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white text-indigo-700 px-2.5 py-1 rounded-full border border-slate-200">
                      User Persona: The Patient
                    </span>
                    <span className="text-xs font-bold text-slate-500">Age 74</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-xs">
                      👨‍🚒
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">Captain Wade</h4>
                      <p className="text-xs text-slate-500">32 Yrs Service • PDD & Motor Freezing</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                    <span className="font-extrabold text-slate-900 block">The Daily Struggle:</span>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      "I ask for pudding 4 times because my memory slips. When people say 'Dad, you already asked that', I feel small. On bad tremor days, my hands shake too much for small apps."
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                    <span className="font-extrabold text-indigo-900 block">How the Agent Restores Dignity:</span>
                    <ul className="space-y-1 text-slate-700 text-[11px]">
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Silent Deduplication:</strong> Warmly affirms every request without duplicate orders or correction.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Tremor-Debounced Voice:</strong> Giant circular microphone ignores involuntary tremor taps.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Story 2: Sarah (Caregiver) */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white text-rose-700 px-2.5 py-1 rounded-full border border-slate-200">
                      User Persona: Family Caregiver
                    </span>
                    <span className="text-xs font-bold text-slate-500">Daughter</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-lg shadow-xs">
                      👩‍💼
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">Sarah (Elsbeth)</h4>
                      <p className="text-xs text-slate-500">Solo Primary Caregiver • High Burnout</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                    <span className="font-extrabold text-slate-900 block">The Daily Struggle:</span>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      "I was drowning in invisible logistics: keeping track of cold-chain Vyalev vials, rotating cannula sites, and calling the specialty pharmacy during working hours."
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                    <span className="font-extrabold text-rose-900 block">How the Agent Eliminates Caregiver Load:</span>
                    <ul className="space-y-1 text-slate-700 text-[11px]">
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Autonomous Pharmacy Agent:</strong> AI calls CVS Specialty automatically with DTMF tone navigation.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Site Rotation Engine:</strong> Enforces 1-inch radial margin and waistband exclusion.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Story 3: Dr. Kessel */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white text-indigo-700 px-2.5 py-1 rounded-full border border-slate-200">
                      User Persona: Neurologist
                    </span>
                    <span className="text-xs font-bold text-slate-500">MDS Specialist</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-black text-lg shadow-xs">
                      🩺
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">Dr. Elena Kessel, MD</h4>
                      <p className="text-xs text-slate-500">Movement Disorder Neurologist</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                    <span className="font-extrabold text-slate-900 block">The Daily Struggle:</span>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      "In 15-minute clinic visits every 6 months, patients struggle to remember when 'OFF' episodes occurred. Retrospective recall in dementia is notoriously inaccurate."
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                    <span className="font-extrabold text-slate-900 block">How the Agent Empowers Clinical Care:</span>
                    <ul className="space-y-1 text-slate-700 text-[11px]">
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Objective Acoustic Biomarkers:</strong> Analyzes speech cadence, pause latency, and vocal amplitude.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>1-Click Clinical EMR Dossier:</strong> Generates longitudinal MDS-UPDRS summaries.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Problem ➔ Solution Mapping Grid */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 inline-block mb-1">
                  Evidence-Based Translation Matrix
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  How Clinical & Occupational Obstacles Were Engineered
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                8 Core Parkinson's Challenges ➔ 8 Built Features
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Mapping 1 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                    Bradykinesia & Micrographia
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-white text-slate-700 border border-slate-200">Motor Loss</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Small, cramped handwriting makes typing or writing lists impossible; slowed movement creates interface fatigue.
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>App Feature Solution:</span>
                  </div>
                  <p className="text-slate-700 text-[11.5px] leading-relaxed">
                    <strong>Zero-Typing Spoken Ledger:</strong> Wade speaks casually ("We're out of pudding"). Agent 5 updates pantry balances and stages 1-click reorders with zero typing required.
                  </p>
                </div>
              </div>

              {/* Mapping 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                    Resting & Action Tremors (4-6 Hz)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-white text-slate-700 border border-slate-200">Spasm</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Involuntary tremors cause rapid unintended double-taps, accidental purchases, or wrong medicine selection.
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>App Feature Solution:</span>
                  </div>
                  <p className="text-slate-700 text-[11.5px] leading-relaxed">
                    <strong>400ms Software Tremor Damping:</strong> All controls feature debounce filters that absorb spasms; touch targets are oversized with tactile high-contrast borders.
                  </p>
                </div>
              </div>

              {/* Mapping 3 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                    Hypophonia & Vocal Fatigue
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-white text-slate-700 border border-slate-200">Vocal Loss</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Quiet, breathy vocal production causes standard voice assistants to drop commands or create auditory frustration.
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>App Feature Solution:</span>
                  </div>
                  <p className="text-slate-700 text-[11.5px] leading-relaxed">
                    <strong>Acoustic Telemetry & Warmth DSP:</strong> Measures speaking WPM, logs fatigue, and passes AI audio through +3.8 dB low-mid boost and -4.2 dB high-cut filter for soothing playback.
                  </p>
                </div>
              </div>

              {/* Mapping 4 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                    Short-Term Memory Loss & Repetitive Queries
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-white text-slate-700 border border-slate-200">Cognitive</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dementia causes patients to repeatedly ask for items (e.g. coffee, pudding) or query the day's schedule repeatedly.
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>App Feature Solution:</span>
                  </div>
                  <p className="text-slate-700 text-[11.5px] leading-relaxed">
                    <strong>Dignity Guardrails & 4-Tier Memory:</strong> Agent never scolds or says "you already asked that". It warmly affirms each request and maintains session state silently.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: 7-DAY PREPARATION MATRIX */}
      {activeTab === 'weekly-prep' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-400/30">
                Proactive Clinical Logistics
              </span>
              <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Ahead-of-Time Preparedness
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              7-Day Clinical & Logistics Preparation Matrix
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              Parkinson's care requires anticipatory staging rather than reactive scrambling. This 7-day matrix coordinates cold-chain pharmaceutical supplies, transit departure buffers, protein-levodopa diet timing, and multi-family communication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
                <HeartPulse className="w-5 h-5 text-amber-600" />
              </div>
              <h4 className="text-sm font-black text-slate-900">Vyalev 24h Cold-Chain Cassettes</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                7 cassettes staged in dedicated 2°C–8°C chiller. Mandatory cassette rotation and cannula swap scheduled for Friday at 8:30 PM.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                <Car className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="text-sm font-black text-slate-900">+135 Total Transit Mobility Buffers</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Out-of-house medical and therapy departures padded with +25m unhurried transfer buffers to eliminate time-pressure gait freezing.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <h4 className="text-sm font-black text-slate-900">Levodopa / Protein Timing Spacing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                High-protein meals strictly reserved for 6:00 PM dinner on therapy days to prevent large neutral amino acids from blocking levodopa uptake.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* SECTION 4: CLINICAL PROTOCOLS */}
      {activeTab === 'protocols' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                The 4 Pillars of Parkinson's Disease Dementia Software Engineering
              </h3>
              <p className="text-xs text-slate-500">
                Cognitive Damping & Zero-Frustration Safeguards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Pillar 1 */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">1</span>
                  <h4 className="font-black text-slate-900 text-sm">Reducing Cognitive Load & Noise</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Excessive visual elements, pop-ups, nested sub-menus, or dense text walls trigger sensory overload and stall decision-making.
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700">
                  <strong>App Implementation:</strong> Single-screen design with high-contrast hierarchy, 0 marketing pop-ups, and generous negative space.
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">2</span>
                  <h4 className="font-black text-slate-900 text-sm">Managing Multistep Executive Flow</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Break down multi-step tasks into single-step, progressive disclosures to avoid overwhelming dysexecutive syndromes.
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700">
                  <strong>App Implementation:</strong> Express intake operates as a single 1-tap confirmation card; multi-step pantry logging is auto-handled in the background.
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">3</span>
                  <h4 className="font-black text-slate-900 text-sm">Motor & Visuospatial Damping</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Parkinson’s tremors (4–6 Hz) cause unintended double-clicks. Bradykinesia demands generous target touch zones (44px+).
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700">
                  <strong>App Implementation:</strong> Built-in 400ms software damping filters double-taps; touch targets are oversized with tactile borders.
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">4</span>
                  <h4 className="font-black text-slate-900 text-sm">Error Tolerance & Dignity Guardrails</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Repetitive requests for pudding or coffee must never prompt correcting statements like "You already asked that". 
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700">
                  <strong>App Implementation:</strong> Spoken input receives immediate warm affirmation while silently updating pantry inventory.
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* SECTION 5: INTERACTIVE ACCESSIBILITY SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Interactive Motor Tremor Damping Simulator (400ms Filter)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
              Live Software Filter
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
                className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <HandMetal className="w-4 h-4" />
                <span>Tap Rapidly (Simulate Tremor)</span>
              </button>

              <p className="text-[11.5px] font-mono text-slate-600">
                Status: <strong className="text-slate-900">{dampingFeedback}</strong>
              </p>

              <button
                type="button"
                onClick={handleResetDemo}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Reset Counters
              </button>
            </div>

            {/* Live Metrics Display */}
            <div className="space-y-3">
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-rose-800 uppercase block">Raw Physical Taps (With Spasms)</span>
                  <span className="text-2xl font-black text-rose-950">{demoTapCount}</span>
                </div>
                <span className="text-xs font-semibold text-rose-700">Unfiltered</span>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Damped Intentional Actions</span>
                  <span className="text-2xl font-black text-emerald-950">{dampedTapCount}</span>
                </div>
                <span className="text-xs font-semibold text-emerald-700">400ms Filter</span>
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
