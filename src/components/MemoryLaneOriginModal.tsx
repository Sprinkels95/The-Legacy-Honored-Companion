import React, { useState } from 'react';
import { 
  Heart, Flame, Compass, ShieldCheck, Sparkles, X, 
  ArrowRight, BookOpen, Quote, Clock, CheckCircle2, User, Award,
  Truck, ShieldAlert, Zap, AlertTriangle, HeartPulse
} from 'lucide-react';
import { CAPTAIN_WADE_CAREER_MILESTONES } from '../data/initialData';
import { ResearchAndEducationView } from './ResearchAndEducationView';

interface MemoryLaneOriginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreResearch?: () => void;
}

export const MemoryLaneOriginModal: React.FC<MemoryLaneOriginModalProps> = ({
  isOpen,
  onClose,
  onExploreResearch
}) => {
  const [activeEssay, setActiveEssay] = useState<'part1' | 'philosophy' | 'research'>('part1');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className={`relative w-full ${activeEssay === 'research' ? 'max-w-6xl' : 'max-w-4xl'} bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] transition-all duration-200`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="origin-modal-title"
      >
        {/* Header with Sunrise Gradient */}
        <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-900 text-white p-6 sm:p-7 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-amber-200 border border-white/20 backdrop-blur-xs flex items-center gap-1.5">
              <span>🌅</span> The Founding Story & Research
            </span>
            <span className="text-xs text-rose-100 font-medium hidden sm:inline">
              Written by Elsbeth for Captain Wade
            </span>
          </div>

          <h2 id="origin-modal-title" className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Legacy Honored: Story & Clinical Foundations
          </h2>

          {/* Switcher Tabs */}
          <div className="flex flex-wrap gap-2 mt-5 pt-3 border-t border-white/20">
            <button
              type="button"
              onClick={() => setActiveEssay('part1')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeEssay === 'part1'
                  ? 'bg-white text-slate-900 shadow-md font-extrabold'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <span>🌅 Why I built this</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveEssay('philosophy')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeEssay === 'philosophy'
                  ? 'bg-white text-slate-900 shadow-md font-extrabold'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <span>✨ 4 Foundational Pillars</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveEssay('research')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeEssay === 'research'
                  ? 'bg-white text-slate-900 shadow-md font-extrabold'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <span>📚 Research & Evidence Base</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 flex-1 leading-relaxed">
          
          {/* WHY I BUILT THIS (2-3 Paragraph Summary) */}
          {activeEssay === 'part1' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm">
                    ES
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Elsbeth</h3>
                    <p className="text-[11px] text-slate-500">Written with love for Captain Wade</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 font-bold">
                  The Genesis of Legacy Honored
                </span>
              </div>

              {/* Quote Highlight */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border-l-4 border-amber-500 text-slate-800 space-y-2">
                <Quote className="w-5 h-5 text-amber-600" />
                <p className="font-semibold text-sm sm:text-base text-amber-950 italic">
                  “True accessibility isn't just about providing equipment; it's about the cognitive and physical toll required to use it.”
                </p>
              </div>

              <div className="prose prose-slate max-w-none text-xs sm:text-sm space-y-4 text-slate-700 leading-relaxed">
                <p>
                  When someone you love starts forgetting what day it is or missing a dose of medication, it is easy to brush it off—especially when he is your dad, a 32-year LA County Fire Captain and the strongest person you know. Drawing on my background caring for family elders with Alzheimer’s and years as a special education teacher, I set out to build something that meets him where he is, softens the mornings, and honors the person underneath.
                </p>

                <p>
                  <strong>Legacy Honored</strong> is an adaptive, dignity-first cockpit designed to keep disabled individuals in the driver’s seat. We built intuitive Good Day, Medium Day, and Difficult Day interfaces with Parkinson’s tremor damping, sub-second natural voice ordering with silent autonomous deduplication, 24-hour continuous subcutaneous Vyalev infusion tracking with 1-inch cannula site rotation, and ambient grounding anchors. Caregivers stay seamlessly coordinated through family sync and Discord alerts without ever turning the experience into invasive surveillance.
                </p>

                <p>
                  Above all, this system is built to hold onto the people we love a little longer. It transforms complex clinical regimens, fluctuating motor states, and memory lapses into effortless, reassuring routines—reminding my dad every single morning of his incredible legacy, his strength, and who loves him.
                </p>
              </div>
            </div>
          )}

          {/* PHILOSOPHY SUMMARY TAB */}
          {activeEssay === 'philosophy' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    The 4 Foundational Pillars of Legacy Honored
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    How Elsbeth's lived caregiving principles became software architecture
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-lg border border-indigo-200 font-bold">
                  Core Architecture
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Pillar 1 */}
                <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-950 font-black text-sm">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
                    <span>Disabled Users Always in the Driver's Seat</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Wade is the Captain. The primary screen is strictly for him: oversized high-contrast touch targets, voice-first commands, zero-judgment reassurance, and personalized favorites. Caregiver features are supportive guardrails, never invasive surveillance.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2 text-amber-950 font-black text-sm">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs">2</span>
                    <span>Silent Autonomous Deduplication</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    When short-term memory causes him to ask for root beer or chocolate pudding 4 times in 20 minutes, the agent affirms his request warmly every time, while deduplicating in the background so 4 cases aren't ordered. Dignity preserved, zero friction.
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                  <div className="flex items-center gap-2 text-rose-950 font-black text-sm">
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs">3</span>
                    <span>Honoring the Fire Station Heritage</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    32 years of firefighting heroism, Malibu brush fires, and LA Riots defined Dad's selfless career. The application honors him as Captain Wade, pairing with his favorite humorous mastermind persona (Dr. Evil) and warm paternal anchors.
                  </p>
                </div>

                {/* Pillar 4 */}
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">4</span>
                    <span>Holding Onto Them Longer</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    By automating cold-chain Vyalev specialty pharmacy reorders, 1-inch cannula site rotation, and Discord caregiver alerts, family caregivers regain peace of mind and can focus on pure connection and shared love.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* RESEARCH & EVIDENCE BASE TAB */}
          {activeEssay === 'research' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <ResearchAndEducationView />
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Legacy Honored: Lived Experience × Clinical Rigor</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs w-full sm:w-auto"
          >
            Close Story & Foundations
          </button>
        </div>

      </div>
    </div>
  );
};
