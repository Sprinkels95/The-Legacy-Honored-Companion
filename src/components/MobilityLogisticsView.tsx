import React, { useState } from 'react';
import { 
  Car, Navigation, Clock, Calendar, CheckCircle2, ShieldAlert, 
  MapPin, UserCheck, AlertCircle, Plus, Check
} from 'lucide-react';
import { MobilityProposal } from '../types';
import { INITIAL_MOBILITY_PROPOSALS } from '../data/initialData';

export const MobilityLogisticsView: React.FC = () => {
  const [proposals, setProposals] = useState<MobilityProposal[]>(INITIAL_MOBILITY_PROPOSALS);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleApproveProposal = (id: string) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p));
  };

  const handleGenerateNewProposal = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/agent/mobility-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentTitle: "Physical Therapy & Balance Assessment",
          clinicName: "UCSF Neuro-Rehabilitation Center",
          appointmentTime: "Friday, Sept 4 at 11:00 AM"
        })
      });
      const data = await res.json();
      if (data.proposal) {
        setProposals(prev => [data.proposal, ...prev]);
      }
    } catch (err) {
      console.error("Error creating mobility proposal:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="mobility-logistics-container" className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                <Car className="w-5 h-5" />
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-serif">
                Proactive Mobility & Ride Proposal Agent
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Autonomous transit planning with Parkinson's preparation buffers, wheelchair staging logistics, and fatigue-risk mitigation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
              <Navigation className="w-3.5 h-3.5 text-amber-700" />
              Gemini Mobility AI (+20m Buffer)
            </span>
            <button
              type="button"
              id="plan-new-ride-btn"
              onClick={handleGenerateNewProposal}
              disabled={isGenerating}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isGenerating ? 'Analyzing Transit...' : 'Plan Next Clinic Transit'}</span>
            </button>
          </div>
        </div>

        {/* AI Role Explanation Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-indigo-900">What the Mobility AI Does: </span>
              <span className="text-indigo-800">
                Calculates realistic departure times by automatically adding 20–25 minute Parkinson's gait/dressing buffers to Google Maps routing, coordinates wheelchair ramp vehicle requirements, and dispatches driver staging notifications.
              </span>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 flex items-start gap-3 text-xs text-indigo-950">
          <Clock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Parkinson's Mobility Buffer Protocol</span>
            <p className="text-indigo-900 leading-relaxed">
              The agent automatically injects a <strong>25–35 minute pre-departure buffer</strong> for shoes, ambulatory gait stabilization, and pump telemetry check prior to scheduled transit arrival.
            </p>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.map((proposal) => (
          <div
            key={proposal.id}
            id={`mobility-proposal-card-${proposal.id}`}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-indigo-200 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                  {proposal.appointmentTime}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {proposal.appointmentTitle}
                </h3>
                <p className="text-xs text-slate-500">{proposal.clinicName} • {proposal.doctorName}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                  proposal.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {proposal.status === 'APPROVED' ? 'Ride Staged & Approved' : 'Action Required: Review Proposal'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">
                  Suggested Departure
                </span>
                <span className="text-sm font-extrabold text-indigo-900 block">
                  {proposal.suggestedDepartureTime}
                </span>
                <span className="text-[11px] text-slate-500">
                  Includes {proposal.mobilityPreparationBufferMinutes}m prep buffer
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">
                  Assisted Transit
                </span>
                <span className="text-sm font-extrabold text-slate-900 block">
                  {proposal.transitServiceType}
                </span>
                <span className="text-[11px] text-slate-500">
                  {proposal.fareEstimate} • {proposal.distanceMiles} miles
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">
                  Fatigue Risk Window
                </span>
                <span className={`text-xs font-bold block ${
                  proposal.fatigueRiskLevel === 'Low' ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {proposal.fatigueRiskLevel} Risk Window
                </span>
                <span className="text-[11px] text-slate-500">
                  Midday ON window verified
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">
                  Destination
                </span>
                <span className="text-xs font-medium text-slate-700 block truncate" title={proposal.destinationAddress}>
                  {proposal.destinationAddress}
                </span>
                <span className="text-[11px] text-indigo-600 font-semibold cursor-pointer">
                  View in Google Maps
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              {proposal.status !== 'APPROVED' ? (
                <button
                  type="button"
                  onClick={() => handleApproveProposal(proposal.id)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Pre-Stage Uber Assist</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Departure buffer active. Reminder set for Captain Wade.</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
