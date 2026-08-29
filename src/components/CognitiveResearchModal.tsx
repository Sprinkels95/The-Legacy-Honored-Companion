import React from 'react';
import { X, Brain, BookOpen, Sparkles } from 'lucide-react';
import { CognitiveResearchSection } from './CognitiveResearchSection';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CognitiveResearchModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl border border-slate-200 my-8 max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 font-serif">
                  Clinical Research & PDD Accessibility Foundation
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Neurology & Cognitive Design
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Evidence-based design principles for Parkinson's Disease Dementia (PDD), Motor Tremor Damping, and Cognitive Offloading
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-cognitive-research-modal"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 pr-1 flex-1">
          <CognitiveResearchSection isModal={true} />
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Includes 4 core clinical pillars & interactive tremor damping filter</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            Close Research Panel
          </button>
        </div>

      </div>
    </div>
  );
};
