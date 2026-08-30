import React from 'react';
import { X, BookOpen, Flame, Sparkles } from 'lucide-react';
import { ResearchAndEducationView } from './ResearchAndEducationView';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchAndEducationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="research-modal-title"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative shrink-0 border-b border-indigo-900/50">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close research modal"
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-rose-400" />
              <span>Clinical & Occupational Research</span>
            </span>
            <span className="text-xs text-slate-300 hidden sm:inline font-medium">
              Evidence Base, Occupational Firefighter Exposure & Problem-Solution Matrix
            </span>
          </div>

          <h2 id="research-modal-title" className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Clinical Research, Occupational Exposures & Parkinson's Matrix
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Peer-reviewed scientific foundation, firefighter neurotoxic occupational timeline, and the 10 physiological and cognitive obstacles solved by Legacy Honored.
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 bg-slate-50">
          <ResearchAndEducationView />
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-700">Legacy Honored Clinical & Occupational Research Library</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors cursor-pointer"
          >
            Close Research Portal
          </button>
        </div>
      </div>
    </div>
  );
};
