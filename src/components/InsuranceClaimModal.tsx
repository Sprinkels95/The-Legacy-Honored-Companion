import React, { useState } from 'react';
import { 
  X, FileText, CheckCircle, Clock, Sparkles, Copy, Printer, 
  Download, AlertCircle, Building, User, DollarSign, Shield, MapPin, Check
} from 'lucide-react';
import { InsuranceReimbursementClaim } from '../types';

interface Props {
  claim: InsuranceReimbursementClaim;
  isOpen: boolean;
  onClose: () => void;
  onUpdateClaim: (updatedClaim: InsuranceReimbursementClaim) => void;
  onRegenerateNotation: (claim: InsuranceReimbursementClaim) => Promise<void>;
}

export const InsuranceClaimModal: React.FC<Props> = ({
  claim,
  isOpen,
  onClose,
  onUpdateClaim,
  onRegenerateNotation
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'printable'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<InsuranceReimbursementClaim>({ ...claim });

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateClaim(formData);
    setIsEditing(false);
  };

  const handleCopyClaimSummary = () => {
    const text = `
=== MEDICAL TRANSPORTATION REIMBURSEMENT CLAIM ===
PATIENT: Captain Wade Seymour (DOB: 03/14/1952)
MEMBER ID: ${formData.memberId} | GROUP: ${formData.groupNumber || 'N/A'}
PAYER: ${formData.payerName}
CLAIM REFERENCE: ${formData.id} | RECEIPT: ${formData.receiptNumber}

DATE OF SERVICE: ${formData.dateOfService}
ATTENDING PHYSICIAN / CLINIC: ${formData.doctorName} (NPI: ${formData.doctorNpi || 'N/A'}) - ${formData.clinicName}
APPOINTMENT: ${formData.appointmentTitle}

PRIMARY DIAGNOSIS (ICD-10): ${formData.primaryDiagnosisIcd10}
SECONDARY DIAGNOSIS (ICD-10): ${formData.secondaryDiagnosisIcd10 || 'R26.81 (Gait instability)'}
HCPCS BILLING CODE: ${formData.hcpcsCode}
TRANSIT MODE: ${formData.transitMode} (Door-to-door assisted ambulatory transit)

ORIGIN: ${formData.originAddress}
DESTINATION: ${formData.destinationAddress}
TOTAL MILEAGE: ${formData.distanceMiles} miles
FARE PAID: ${formData.fareFormatted}

MEDICAL NECESSITY JUSTIFICATION:
${formData.medicalNecessityStatement}

PROOF OF ATTENDANCE: ${formData.proofOfAttendance}
CLAIM STATUS: ${formData.claimStatus}
PREPARED BY: ${formData.generatedByAgent}
==================================================
`.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-900 text-white flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  Medical Transit Reimbursement Packet
                </h3>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  formData.claimStatus === 'REIMBURSED'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : formData.claimStatus === 'SUBMITTED'
                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {formData.claimStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Claim ID: <span className="font-mono font-bold text-slate-700">{formData.id}</span> • Member: {formData.memberId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-4 pb-2 border-b border-slate-100 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'details'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Claim Details & Notations
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('printable')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'printable'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📄 Printable Travel Voucher
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyClaimSummary}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center gap-1.5 transition-colors text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copied ? 'Copied Claim Text!' : 'Copy Summary'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center gap-1.5 transition-colors text-[11px]"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {activeTab === 'details' ? (
          <div className="mt-4 space-y-4 text-xs">
            {/* Status & Payer Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Insurance Payer</span>
                <span className="font-bold text-slate-900">{formData.payerName}</span>
                <span className="text-[10px] text-slate-500 block">Member ID: {formData.memberId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Receipt & Fare</span>
                <span className="font-bold text-emerald-700 text-sm">{formData.fareFormatted}</span>
                <span className="text-[10px] text-slate-500 block font-mono">{formData.receiptNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Claim Status</span>
                <select
                  value={formData.claimStatus}
                  onChange={e => {
                    const newStatus = e.target.value as any;
                    setFormData({ ...formData, claimStatus: newStatus });
                    onUpdateClaim({ ...formData, claimStatus: newStatus });
                  }}
                  className="mt-0.5 px-2 py-1 bg-white border border-slate-300 rounded-lg font-bold text-xs text-slate-900 w-full"
                >
                  <option value="READY_TO_SUBMIT">Ready to Submit</option>
                  <option value="SUBMITTED">Submitted to Insurance</option>
                  <option value="REIMBURSED">Reimbursed ($ Claim Paid)</option>
                  <option value="PENDING_DOCUMENTATION">Pending Provider Sign-off</option>
                </select>
              </div>
            </div>

            {/* Medical Coding Grid */}
            <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-indigo-950 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Clinical Diagnosis & Medical Coding</span>
                </span>
                <span className="text-[10px] text-indigo-700 font-bold bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                  NEMT Compliant
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                  <span className="text-[10px] text-slate-400 font-bold block">PRIMARY DIAGNOSIS</span>
                  <span className="font-bold text-slate-900">{formData.primaryDiagnosisIcd10}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                  <span className="text-[10px] text-slate-400 font-bold block">BILLING HCPCS / PROCEDURE</span>
                  <span className="font-bold text-slate-900">{formData.hcpcsCode}</span>
                </div>
              </div>
            </div>

            {/* Medical Necessity Statement */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI Clinical Medical Necessity Justification</span>
                </span>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={async () => {
                    setIsGenerating(true);
                    await onRegenerateNotation(formData);
                    setIsGenerating(false);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>{isGenerating ? 'Synthesizing...' : 'Regenerate Justification'}</span>
                </button>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px] bg-white p-3 rounded-xl border border-slate-200 font-sans">
                {formData.medicalNecessityStatement}
              </p>
            </div>

            {/* Route & Provider Details */}
            <div className="space-y-2">
              <span className="font-black text-slate-900 uppercase text-[10px] tracking-wider">
                Appointment & Route Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">PROVIDER / FACILITY</span>
                  <span className="font-bold text-slate-900 block">{formData.doctorName}</span>
                  <span className="text-slate-600 text-[10px] block">{formData.clinicName} (NPI: {formData.doctorNpi})</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">DATE OF SERVICE & MILES</span>
                  <span className="font-bold text-slate-900 block">{formData.dateOfService}</span>
                  <span className="text-slate-600 text-[10px] block">{formData.distanceMiles} miles • {formData.transitMode}</span>
                </div>
              </div>
            </div>

            {/* Proof of Attendance & Check Information */}
            {formData.claimStatus === 'REIMBURSED' && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 text-xs block">Reimbursement Check Disbursed</span>
                  <span className="text-[11px] text-emerald-700">Check / EFT Reference: {formData.reimbursementCheckNumber || 'EFT-BSC-884102'}</span>
                </div>
                <span className="text-sm font-black text-emerald-900">{formData.fareFormatted}</span>
              </div>
            )}
          </div>
        ) : (
          /* Printable Travel Voucher View */
          <div className="mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-300 space-y-4 text-xs font-serif print:p-0 print:border-none">
            <div className="text-center pb-3 border-b-2 border-slate-900">
              <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
                Non-Emergency Medical Transportation (NEMT) Travel Voucher
              </h2>
              <p className="text-[11px] font-sans text-slate-600">
                Itemized Insurance Reimbursement & Prior Authorization Attendance Form
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 font-sans text-[11px]">
              <div>
                <span className="font-bold text-slate-900 block">PATIENT DEMOGRAPHICS:</span>
                <div>Name: Captain Wade Seymour</div>
                <div>DOB: March 14, 1952</div>
                <div>Member ID: {formData.memberId}</div>
                <div>Payer: {formData.payerName}</div>
              </div>
              <div>
                <span className="font-bold text-slate-900 block">PROVIDER & FACILITY:</span>
                <div>Doctor: {formData.doctorName}</div>
                <div>Clinic: {formData.clinicName}</div>
                <div>Doctor NPI: {formData.doctorNpi}</div>
                <div>Date of Service: {formData.dateOfService}</div>
              </div>
            </div>

            <div className="font-sans text-[11px] p-3 bg-white rounded-xl border border-slate-300">
              <span className="font-bold text-slate-900 block mb-1">CLINICAL CODING & MEDICAL NECESSITY:</span>
              <div>• ICD-10 Diagnosis: {formData.primaryDiagnosisIcd10}</div>
              <div>• HCPCS Billing Code: {formData.hcpcsCode}</div>
              <div>• Transit Tier: {formData.transitMode} (Door-to-door assisted)</div>
              <div className="mt-1 text-slate-700 italic">"{formData.medicalNecessityStatement}"</div>
            </div>

            <div className="font-sans text-[11px] grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-slate-300">
              <div>
                <span className="font-bold block">Distance:</span>
                <span>{formData.distanceMiles} Miles</span>
              </div>
              <div>
                <span className="font-bold block">Fare Paid:</span>
                <span className="font-bold text-slate-900">{formData.fareFormatted}</span>
              </div>
              <div>
                <span className="font-bold block">Receipt #:</span>
                <span className="font-mono">{formData.receiptNumber}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-slate-400 font-sans text-[10px] space-y-2">
              <div className="flex justify-between">
                <div>Caregiver / Patient Attestation: ________________________</div>
                <div>Date: ____________</div>
              </div>
              <div className="flex justify-between">
                <div>Attending Clinic Staff Sign-off: ________________________</div>
                <div>Date: ____________</div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs ml-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
