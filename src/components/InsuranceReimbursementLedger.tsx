import React, { useState } from 'react';
import { 
  FileText, CheckCircle, Clock, Sparkles, Copy, Printer, 
  Download, AlertCircle, Building, User, DollarSign, Shield, 
  MapPin, Check, Plus, ExternalLink, Filter, ChevronRight
} from 'lucide-react';
import { MobilityProposal, InsuranceReimbursementClaim } from '../types';

interface Props {
  proposals: MobilityProposal[];
  onSelectClaim: (claim: InsuranceReimbursementClaim) => void;
  onUpdateClaimStatus: (claimId: string, status: InsuranceReimbursementClaim['claimStatus']) => void;
  onAutoNotate: (proposal: MobilityProposal) => void;
}

export const InsuranceReimbursementLedger: React.FC<Props> = ({
  proposals,
  onSelectClaim,
  onUpdateClaimStatus,
  onAutoNotate
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [copiedAll, setCopiedAll] = useState(false);

  // Extract all claims from proposals
  const allClaims: InsuranceReimbursementClaim[] = proposals
    .map(p => p.insuranceClaim)
    .filter((c): c is InsuranceReimbursementClaim => Boolean(c));

  // Compute Metrics
  const totalAmount = allClaims.reduce((acc, c) => acc + (c.fareAmount || 0), 0);
  const readyToSubmitClaims = allClaims.filter(c => c.claimStatus === 'READY_TO_SUBMIT');
  const readyToSubmitAmount = readyToSubmitClaims.reduce((acc, c) => acc + (c.fareAmount || 0), 0);
  const submittedClaims = allClaims.filter(c => c.claimStatus === 'SUBMITTED');
  const reimbursedClaims = allClaims.filter(c => c.claimStatus === 'REIMBURSED');
  const reimbursedAmount = reimbursedClaims.reduce((acc, c) => acc + (c.reimbursedAmount || c.fareAmount || 0), 0);

  // Filtered Claims
  const filteredClaims = allClaims.filter(c => {
    if (filterStatus === 'ALL') return true;
    return c.claimStatus === filterStatus;
  });

  const handleDownloadCsv = () => {
    const headers = [
      'Claim ID',
      'Date of Service',
      'Patient Name',
      'Member ID',
      'Payer',
      'Doctor / Provider',
      'Clinic Facility',
      'Doctor NPI',
      'Primary Diagnosis (ICD-10)',
      'HCPCS Code',
      'Transit Mode',
      'Distance (Miles)',
      'Fare Amount',
      'Receipt #',
      'Claim Status',
      'Medical Necessity'
    ];

    const rows = allClaims.map(c => [
      `"${c.id}"`,
      `"${c.dateOfService}"`,
      `"Captain Wade Seymour"`,
      `"${c.memberId}"`,
      `"${c.payerName}"`,
      `"${c.doctorName}"`,
      `"${c.clinicName}"`,
      `"${c.doctorNpi || 'N/A'}"`,
      `"${c.primaryDiagnosisIcd10}"`,
      `"${c.hcpcsCode}"`,
      `"${c.transitMode}"`,
      c.distanceMiles,
      c.fareAmount,
      `"${c.receiptNumber}"`,
      `"${c.claimStatus}"`,
      `"${c.medicalNecessityStatement.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Wade_Seymour_NEMT_Insurance_Claims_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyAllSummary = () => {
    let summary = `=== CAPTAIN WADE SEYMOUR - NEMT INSURANCE REIMBURSEMENT LEDGER ===\n`;
    summary += `Total Claims: ${allClaims.length} | Total Value: $${totalAmount.toFixed(2)} | Reimbursed: $${reimbursedAmount.toFixed(2)}\n`;
    summary += `Primary Payer: Blue Shield of California (Medicare Advantage) | Member ID: BSC-99201482-W\n\n`;

    allClaims.forEach((c, idx) => {
      summary += `ITEM ${idx + 1}: ${c.appointmentTitle}\n`;
      summary += `• Date: ${c.dateOfService} | Fare: ${c.fareFormatted} | Receipt: ${c.receiptNumber}\n`;
      summary += `• Provider: ${c.doctorName} (NPI: ${c.doctorNpi || 'N/A'}) at ${c.clinicName}\n`;
      summary += `• ICD-10: ${c.primaryDiagnosisIcd10} | HCPCS: ${c.hcpcsCode} | Mode: ${c.transitMode}\n`;
      summary += `• Medical Necessity: ${c.medicalNecessityStatement}\n`;
      summary += `• Status: ${c.claimStatus}\n\n`;
    });

    navigator.clipboard.writeText(summary);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  return (
    <div id="insurance-reimbursement-ledger" className="space-y-6 animate-fade-in">
      {/* Financial Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
            Total Transit Expense
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-serif">
              ${totalAmount.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 font-semibold">({allClaims.length} trips)</span>
          </div>
          <span className="text-[11px] text-indigo-700 font-semibold mt-1 block">
            Uber Assist & Medical Appointments
          </span>
        </div>

        <div className="p-4 bg-amber-50/60 rounded-3xl border border-amber-200/80 shadow-xs">
          <span className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wider block mb-1">
            Ready to Submit
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-950 font-serif">
              ${readyToSubmitAmount.toFixed(2)}
            </span>
            <span className="text-xs text-amber-700 font-semibold">({readyToSubmitClaims.length} pending)</span>
          </div>
          <span className="text-[11px] text-amber-800 font-semibold mt-1 block">
            Notations & Receipts prepared
          </span>
        </div>

        <div className="p-4 bg-blue-50/60 rounded-3xl border border-blue-200/80 shadow-xs">
          <span className="text-[10px] text-blue-700 font-extrabold uppercase tracking-wider block mb-1">
            Submitted / Processing
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-950 font-serif">
              {submittedClaims.length}
            </span>
            <span className="text-xs text-blue-700 font-semibold">claims in review</span>
          </div>
          <span className="text-[11px] text-blue-800 font-semibold mt-1 block">
            With Blue Shield Medicare Adv.
          </span>
        </div>

        <div className="p-4 bg-emerald-50/60 rounded-3xl border border-emerald-200/80 shadow-xs">
          <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider block mb-1">
            Reimbursed to Date
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-950 font-serif">
              ${reimbursedAmount.toFixed(2)}
            </span>
            <span className="text-xs text-emerald-700 font-semibold">({reimbursedClaims.length} paid)</span>
          </div>
          <span className="text-[11px] text-emerald-800 font-semibold mt-1 block">
            Deposited to Caregiver Account
          </span>
        </div>
      </div>

      {/* Control Bar: Filters & Export Tools */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-bold uppercase text-[10px] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Filter:</span>
          </span>
          {[
            { label: 'All Claims', value: 'ALL', count: allClaims.length },
            { label: 'Ready to Submit', value: 'READY_TO_SUBMIT', count: readyToSubmitClaims.length },
            { label: 'Submitted', value: 'SUBMITTED', count: submittedClaims.length },
            { label: 'Reimbursed', value: 'REIMBURSED', count: reimbursedClaims.length }
          ].map(tab => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilterStatus(tab.value)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                filterStatus === tab.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                filterStatus === tab.value ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Export & Print Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyAllSummary}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200"
            title="Copy formatted claim details to clipboard for insurance portal or email"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
            <span>{copiedAll ? 'Copied Ledger!' : 'Copy Summary'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download NEMT CSV Ledger</span>
          </button>
        </div>
      </div>

      {/* Itemized Claims List */}
      <div className="space-y-3">
        {filteredClaims.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="font-bold text-slate-700">No insurance claims match this filter</div>
            <p className="text-xs text-slate-400 mt-1">Select "All Claims" or plan a new clinic ride to generate notations.</p>
          </div>
        ) : (
          filteredClaims.map((claim) => {
            const proposal = proposals.find(p => p.id === claim.proposalId);
            const isReimbursed = claim.claimStatus === 'REIMBURSED';
            const isSubmitted = claim.claimStatus === 'SUBMITTED';

            return (
              <div
                key={claim.id}
                className={`bg-white rounded-3xl border transition-all p-5 shadow-xs ${
                  isReimbursed
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : isSubmitted
                    ? 'border-blue-200 bg-blue-50/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-900 text-white rounded-md">
                        {claim.dateOfService}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        Claim #{claim.id}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        isReimbursed
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : isSubmitted
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {claim.claimStatus.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900">
                      {claim.appointmentTitle}
                    </h4>

                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{claim.clinicName} • {claim.doctorName} (NPI: {claim.doctorNpi || '1487291034'})</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Fare & Receipt</span>
                      <span className="text-base font-black text-emerald-700">{claim.fareFormatted}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{claim.receiptNumber}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectClaim(claim)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>View Claim Packet</span>
                    </button>
                  </div>
                </div>

                {/* Medical Coding & Clinical Justification */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                      ICD-10 & HCPCS Codes
                    </span>
                    <div className="font-bold text-slate-900 text-[11px]">{claim.primaryDiagnosisIcd10}</div>
                    <div className="text-slate-600 text-[10px] mt-0.5">{claim.hcpcsCode}</div>
                  </div>

                  <div className="md:col-span-2 p-3 bg-indigo-50/40 rounded-2xl border border-indigo-100/70">
                    <span className="text-[10px] text-indigo-900 font-extrabold uppercase block mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-indigo-600" />
                      <span>Clinical Medical Necessity Justification</span>
                    </span>
                    <p className="text-[11px] text-slate-700 italic leading-relaxed">
                      "{claim.medicalNecessityStatement}"
                    </p>
                  </div>
                </div>

                {/* Status Quick Updater */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <span className="font-semibold">Member ID:</span>
                    <span className="font-mono font-bold text-slate-800">{claim.memberId}</span>
                    <span>•</span>
                    <span className="font-semibold">Proof:</span>
                    <span className="text-emerald-700 font-bold">{claim.proofOfAttendance}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Update Status:</span>
                    <select
                      value={claim.claimStatus}
                      onChange={(e) => onUpdateClaimStatus(claim.id, e.target.value as any)}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 cursor-pointer"
                    >
                      <option value="READY_TO_SUBMIT">Ready to Submit</option>
                      <option value="SUBMITTED">Submitted to Insurance</option>
                      <option value="REIMBURSED">Reimbursed ($ Paid)</option>
                      <option value="PENDING_DOCUMENTATION">Pending Provider Sign-off</option>
                    </select>

                    {proposal && (
                      <button
                        type="button"
                        onClick={() => onAutoNotate(proposal)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg font-bold text-[11px] flex items-center gap-1 border border-indigo-200 transition-colors"
                        title="Re-run AI Medical Necessity Generation"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>AI Re-Notate</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
