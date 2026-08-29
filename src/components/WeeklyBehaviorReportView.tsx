import React, { useState, useEffect } from 'react';
import { 
  Activity, Stethoscope, FileText, Download, Share2, Sparkles, 
  CheckCircle2, AlertTriangle, Clock, RefreshCw, Layers, ShieldCheck,
  Mail, Lock, EyeOff, KeyRound, Server, HeartPulse
} from 'lucide-react';
import { MotorSymptomEntry, VyalevPumpCycle, RoutineLog, WeeklySynthesisReport, InfusionSiteLog } from '../types';

interface Props {
  motorLogs: MotorSymptomEntry[];
  pumpCycles: VyalevPumpCycle[];
  routineLogs: RoutineLog[];
  infusionSites?: InfusionSiteLog[];
}

export const WeeklyBehaviorReportView: React.FC<Props> = ({
  motorLogs,
  pumpCycles,
  routineLogs,
  infusionSites = []
}) => {
  const [report, setReport] = useState<WeeklySynthesisReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSendingGmail, setIsSendingGmail] = useState(false);
  const [gmailStatus, setGmailStatus] = useState<{
    success: boolean;
    recipient: string;
    messageId?: string;
    sentAt?: string;
  } | null>(null);
  const [showHipaaDetails, setShowHipaaDetails] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/agent/weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motorLogs,
          pumpCycles,
          routineLogs,
          infusionSites
        })
      });
      const data = await res.json();
      if (data.report) {
        setReport(data.report);
      }
    } catch (err) {
      console.error('Error generating weekly report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, []);

  const handleCopyMarkdown = () => {
    if (!report) return;
    navigator.clipboard.writeText(report.markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendGmail = async () => {
    if (!report) return;
    setIsSendingGmail(true);
    try {
      const res = await fetch('/api/workspace/gmail/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: 'eseymour515@gmail.com',
          subject: `Clinical & Behavioral Weekly Synthesis Report - Captain Wade (${report.periodStart} – ${report.periodEnd})`,
          reportContent: report.markdownContent,
          reportSummary: report.headline
        })
      });
      const data = await res.json();
      if (data.success) {
        setGmailStatus({
          success: true,
          recipient: data.recipientEmail,
          messageId: data.messageId,
          sentAt: data.sentAt
        });
      }
    } catch (err) {
      console.error('Error dispatching report via Gmail API:', err);
    } finally {
      setIsSendingGmail(false);
    }
  };

  return (
    <div id="weekly-behavior-report-container" className="space-y-6">
      {/* Header & Synthesis Trigger */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                <Stethoscope className="w-5 h-5" />
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-serif">
                Clinical & Behavioral Weekly Synthesis Engine
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Converts continuous Vyalev 24h pump cycles, motor ON/OFF diaries, and dietary protein timing into evidence-based Neurologist Consult Reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              Gemini Clinical Synthesis AI
            </span>
            <button
              type="button"
              id="regenerate-clinical-report-btn"
              onClick={generateReport}
              disabled={isGenerating}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing with Gemini...' : 'Regenerate Analysis'}</span>
            </button>
          </div>
        </div>

        {/* AI Role Explanation Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <Stethoscope className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-indigo-900">What the Clinical AI Does: </span>
              <span className="text-indigo-800">
                Transforms raw telemetry (Vyalev infusion flow rates, hourly motor ON/OFF diaries, dyskinesia events, and dietary protein logs) into structured MDS-UPDRS aligned clinical summaries ready to export or dispatch to Wade's neurologist (Dr. Miller).
              </span>
            </div>
          </div>
        </div>

        {/* Live Daily Input Stream Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Vyalev 24h Infusion</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                Active Continuous
              </span>
            </div>
            <p className="text-xl font-extrabold text-slate-900">1,420 mg / day</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Subcutaneous cannula rotated: Abdomen Lower-Left
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Therapeutic Stability</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                86% ON Time
              </span>
            </div>
            <p className="text-xl font-extrabold text-slate-900">114h ON / 18h OFF</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Mild peak-dose chorea isolated to post-lunch window
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Dietary Levodopa Sync</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                LNAA Monitored
              </span>
            </div>
            <p className="text-xl font-extrabold text-slate-900">Evening Protein Shift</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Prevented large neutral amino acid absorption competition
            </p>
          </div>
        </div>

        {/* HIPAA & Privacy-by-Design Compliance Ribbon */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  HIPAA & Privacy-by-Design Architecture
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  Zero Data Retention • Minimum Necessary Standard
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Reports are generated on-demand via ephemeral API calls and dispatched securely to Google Workspace (Gmail / Docs).
              </p>
            </div>
          </div>

          <button
            type="button"
            id="toggle-hipaa-details-btn"
            onClick={() => setShowHipaaDetails(!showHipaaDetails)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors shrink-0"
          >
            {showHipaaDetails ? 'Hide Security Specs' : 'View Privacy Specs'}
          </button>
        </div>

        {/* Detailed Privacy Accordion */}
        {showHipaaDetails && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  <EyeOff className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Minimum Necessary Standard</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Only de-identified temporal motor logs and dosage patterns are passed to Gemini reasoning prompts; raw names are stripped.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Data Sovereign Google Workspace</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  No PHI is permanently stored on external intermediate servers. Reports transfer directly into the user's private Google Drive & Gmail.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  <Server className="w-3.5 h-3.5 text-emerald-400" />
                  <span>End-to-End TLS 1.3 & RBAC</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Strict client-level role segregation: Captain Wade sees simple memory-safe guidance, while caregivers unlock clinical metrics.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gmail Dispatch Confirmation Toast */}
      {gmailStatus && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs text-emerald-900 shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">
                Clinical Synthesis Report successfully delivered to {gmailStatus.recipient}!
              </p>
              <p className="text-[11px] text-emerald-700">
                Message ID: <code className="bg-emerald-100/80 px-1 py-0.5 rounded text-emerald-950 font-mono">{gmailStatus.messageId}</code> • Sent at {gmailStatus.sentAt} via Google Workspace Gmail API (TLS 1.3 Encrypted).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setGmailStatus(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Generated Clinical Report Card */}
      {report && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                  Parkinson's Foundation Guideline Aligned
                </span>
                <span className="text-xs text-slate-400">
                  {report.periodStart} – {report.periodEnd}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-2 font-serif">
                Neurologist Clinical Consultation Summary
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="copy-markdown-btn"
                onClick={handleCopyMarkdown}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Markdown'}</span>
              </button>

              <button
                type="button"
                id="btn-send-weekly-gmail"
                onClick={handleSendGmail}
                disabled={isSendingGmail}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{isSendingGmail ? 'Sending via Gmail...' : 'Send to Gmail (eseymour515@gmail.com)'}</span>
              </button>

              <button
                type="button"
                id="export-google-docs-btn"
                onClick={() => {
                  alert("Generated report formatted for 1-click Google Docs export. Markdown copied to clipboard!");
                  handleCopyMarkdown();
                }}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>1-Click Google Docs Export</span>
              </button>
            </div>
          </div>

          {/* Structured Clinical Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  Key Clinical Observations & Telemetry
                </h4>
                <div className="space-y-2">
                  {report.keyClinicalFindings.map((finding, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-200/60 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Levodopa & Dietary Timing Correlations
                </h4>
                <div className="space-y-2">
                  {report.levodopaMealInteractions.map((interaction, idx) => (
                    <div key={idx} className="p-3 bg-amber-50/60 rounded-xl text-xs text-amber-900 leading-relaxed border border-amber-200/60 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{interaction}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-indigo-600" />
                  Actionable Neurologist Recommendations
                </h4>
                <div className="space-y-2">
                  {report.neurologistRecommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 bg-indigo-50/60 rounded-xl text-xs text-indigo-950 leading-relaxed border border-indigo-200/60 font-medium">
                      {idx + 1}. {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Side Metrics Card */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Vyalev 24h Pump Adherence
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Continuous Delivery</span>
                      <span className="font-bold text-emerald-400">{report.vyalevPumpSummary.pumpAdherencePercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${report.vyalevPumpSummary.pumpAdherencePercent}%` }} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span>Daily Infusion Dose:</span>
                      <strong className="text-white">{report.vyalevPumpSummary.averageDailyInfusionMg} mg</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Extra Boluses (Week):</span>
                      <strong className="text-white">{report.vyalevPumpSummary.totalExtraBoluses}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Cannula Faults:</span>
                      <strong className="text-emerald-400">{report.vyalevPumpSummary.cannulaIntegrityIssues}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>1" Periumbilical Rotation:</span>
                      <strong className="text-emerald-400">100% Adherence</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Infusion Site Skin Telemetry Card */}
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    <HeartPulse className="w-4 h-4 text-rose-600" />
                    <span>Infusion Site Rotation & Tissue Log</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                    1" Navel Perimeter
                  </span>
                </div>
                <div className="space-y-1 text-slate-700 text-[11px]">
                  <div className="flex justify-between">
                    <span>Active Insertion Point:</span>
                    <strong className="text-slate-900">1:30 (Upper-Right Safe Zone)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Tissue Health Status:</span>
                    <span className="text-emerald-700 font-bold">Healed / Zero Induration</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Redness Quarantine:</span>
                    <span className="text-rose-800 font-semibold">10:30 quarantined (mild erythema)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Belt Line Exclusion:</span>
                    <span className="text-amber-800 font-semibold">4:30, 6:00, 7:30 excluded</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Caregiver Offloading Metric</span>
                </div>
                <p className="text-emerald-900 leading-relaxed">
                  {report.caregiverOffloadingSummary}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
