import React, { useState } from 'react';
import { 
  ShieldCheck, EyeOff, KeyRound, Server, Lock, 
  FileCheck2, UserCheck, ShieldAlert, Cpu, Sparkles, 
  CheckCircle2, Copy, Check, Terminal, ExternalLink,
  Zap, Database, Volume2
} from 'lucide-react';

export const SecurityArchitectureSection: React.FC = () => {
  const [showDetailedSpecs, setShowDetailedSpecs] = useState(true);
  const [copiedAudit, setCopiedAudit] = useState(false);
  const [activeSecurityPillar, setActiveSecurityPillar] = useState<string>('all');

  const securityPillars = [
    {
      id: 'minimum-necessary',
      title: 'Minimum Necessary Standard',
      icon: EyeOff,
      color: 'indigo',
      badge: 'PHI Stripping',
      summary: 'Only de-identified temporal motor logs and dosage patterns are passed to Gemini reasoning prompts; raw names, MRNs, and familial identifiers are stripped prior to model ingestion.',
      specs: [
        'Deterministic regex and entity scrubber sanitizes prompts on the server proxy before calling @google/genai.',
        'Motor diaries are tokenized as relative hour offsets (e.g., T+02:00 ON/OFF) without calendar metadata.',
        'Clinical prompts receive anonymized patient archetypes (e.g., "76yo male with 24h Vyalev infusion").'
      ]
    },
    {
      id: 'data-sovereign',
      title: 'Data Sovereign Google Workspace',
      icon: KeyRound,
      color: 'amber',
      badge: 'Zero 3rd-Party Storage',
      summary: 'No PHI is permanently stored on external intermediate servers. Reports, spreadsheets, and calendar entries transfer directly into the user\'s private Google Drive, Gmail & Calendar.',
      specs: [
        'Google OAuth 2.0 user tokens authorize direct writes to user-owned Google Drive folders and Gmail drafts.',
        'Ephemeral memory buffers are cleared immediately after PDF/Docs dispatch.',
        'Zero database persistence of raw medical records or voice audio on application hosting servers.'
      ]
    },
    {
      id: 'tls-rbac',
      title: 'End-to-End TLS 1.3 & RBAC',
      icon: Server,
      color: 'emerald',
      badge: 'Role Segregation',
      summary: 'Strict client-level role segregation: Captain Wade sees simple memory-safe guidance, while caregivers unlock clinical metrics and audit logs. All traffic is enforced via TLS 1.3.',
      specs: [
        'Patient Viewport: Dignity-first interface, large touch targets, zero complex medical charts or anxiety triggers.',
        'Caregiver Admin: Protected UPDRS Part III/IV motor logs, syringe cycle analytics, and telemetry alarms.',
        'Transport Security: Strict HTTPS / TLS 1.3 encryption with HTTP Strict Transport Security (HSTS).'
      ]
    },
    {
      id: 'server-keys',
      title: 'Air-Gapped Server-Side API Secrets',
      icon: Lock,
      color: 'sky',
      badge: 'Zero Client Leakage',
      summary: 'Gemini 3.7 Flash API keys and Google Workspace service credentials remain strictly server-side on Cloud Run Express containers, isolated from client browser bundles.',
      specs: [
        'Client components proxy all AI requests through /api/gemini/* and /api/agent/* routes.',
        'No VITE_ prefix used for backend API keys; environment variables are inaccessible via browser DevTools.',
        'Strict CORS and request origin validation enforced on all Express endpoints.'
      ]
    },
    {
      id: 'ephemeral-compute',
      title: 'Ephemeral Zero-Retention Processing',
      icon: Zap,
      color: 'purple',
      badge: 'RAM-Only Context',
      summary: 'Voice transcriptions, IVR simulations, and clinical synthesis pipelines execute in transient container memory with immediate garbage collection upon completion.',
      specs: [
        'Audio streams are converted to acoustic biomarker metrics in real-time without writing to disk.',
        'Pharmacy telephone scripts discard DTMF tones and Rx numbers immediately after confirmation.',
        'Zero persistent session logging of transcribed conversation histories.'
      ]
    },
    {
      id: 'acoustic-safety',
      title: 'Acoustic & Behavioral Dignity Guardrails',
      icon: Volume2,
      color: 'rose',
      badge: 'Sensory Safety',
      summary: 'Acoustic safety engineering prevents sensory startle in dyskinesia states, paired with psychological guardrails that strictly prohibit correcting memory lapses.',
      specs: [
        'Web Audio DSP chain: +3.8dB @ 220Hz warmth, +2.0dB @ 1.8kHz clarity, 8kHz low-pass filter, 4:1 compression.',
        'Harmonic Earcon Chimes: 528 Hz pure-tone triads eliminating abrupt attack transients.',
        'Dignity Rule: The AI persona validates feelings and gently redirects without disputing historical inaccuracies.'
      ]
    }
  ];

  const handleCopyAuditManifest = () => {
    const manifest = {
      architecture: 'The Legacy Honored Companion - Security & Privacy Framework',
      complianceVersion: '2026.4-HIPAA-PrivacyByDesign',
      timestamp: new Date().toISOString(),
      standards: {
        hipaaCompliance: 'Minimum Necessary Standard & PHI Stripping Active',
        dataRetention: 'Zero Data Retention (Ephemeral RAM Only)',
        storageSovereignty: 'Google Workspace Sovereign (Drive, Docs, Gmail, Calendar)',
        transportSecurity: 'TLS 1.3 / HSTS',
        rbac: 'Dual Viewport Isolation (Patient vs Caregiver Admin)',
        apiSecurity: 'Air-Gapped Server-Side Proxy Isolation',
        acousticSafety: 'Web Audio DSP 8kHz Low-Pass & 528Hz Anti-Startle Chimes'
      },
      authorizedScopes: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/drive.file'
      ]
    };

    navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
    setCopiedAudit(true);
    setTimeout(() => setCopiedAudit(false), 2500);
  };

  const filteredPillars = activeSecurityPillar === 'all' 
    ? securityPillars 
    : securityPillars.filter(p => p.id === activeSecurityPillar);

  return (
    <div className="space-y-6">
      
      {/* Primary HIPAA & Privacy-by-Design Compliance Ribbon */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-black text-emerald-400 uppercase tracking-wider">
                  HIPAA & Privacy-by-Design Architecture
                </span>
                <span className="text-[10px] font-bold bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full text-slate-300">
                  Zero Data Retention • Minimum Necessary Standard
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Reports are generated on-demand via ephemeral API calls and dispatched securely to Google Workspace (Gmail / Docs / Drive).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyAuditManifest}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy Privacy & Security Audit Manifest"
            >
              {copiedAudit ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Audit Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Audit JSON</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="toggle-security-specs-btn"
              onClick={() => setShowDetailedSpecs(!showDetailedSpecs)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              {showDetailedSpecs ? 'Hide Security Specs' : 'View Security Specs'}
            </button>
          </div>
        </div>

        {/* Status Indicators Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/80">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="block text-[10px] text-slate-400 font-medium">De-identification</span>
              <span className="text-[11px] font-bold text-slate-200">PHI Stripped Prompts</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="block text-[10px] text-slate-400 font-medium">Data Sovereignty</span>
              <span className="text-[11px] font-bold text-slate-200">Google Workspace Direct</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <span className="block text-[10px] text-slate-400 font-medium">Encryption</span>
              <span className="text-[11px] font-bold text-slate-200">TLS 1.3 / HSTS</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="block text-[10px] text-slate-400 font-medium">Role Access</span>
              <span className="text-[11px] font-bold text-slate-200">Strict RBAC Segregation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Security & Privacy Architecture Pillars */}
      {showDetailedSpecs && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                6 Core Security, Privacy & Safety Engineering Pillars
              </h3>
            </div>
            
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveSecurityPillar('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  activeSecurityPillar === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All 6 Pillars
              </button>
              {securityPillars.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveSecurityPillar(p.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                    activeSecurityPillar === p.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.title.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={pillar.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-xl bg-slate-100 text-slate-800">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 text-xs">{pillar.title}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {pillar.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {pillar.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[10.5px] text-slate-500">
                    {pillar.specs.map((spec, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span className="leading-tight">{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* End-to-End Privacy Data Flow Diagram */}
          <div className="p-4 rounded-2xl bg-slate-950 text-slate-300 font-mono text-[11px] space-y-2.5 overflow-x-auto leading-relaxed border border-slate-800">
            <div className="flex items-center justify-between text-amber-400 font-bold">
              <span># End-to-End Privacy-Preserving Data Flow Audit Trail</span>
              <span className="text-[10px] text-slate-400 font-normal">Zero PHI Ingestion at Model Layer</span>
            </div>
            
            <p className="text-slate-400">1. [User Input / Voice Stream / Sensor Log] (Captain Wade or Caregiver Client)</p>
            <p className="text-indigo-400">   ↓ Client-side de-identification &amp; role validation (RBAC Layer)</p>
            <p className="text-slate-400">2. [Cloud Run Express Server Gateway] (TLS 1.3 Transport, server.ts)</p>
            <p className="text-indigo-400">   ↓ Scrubbed Payload: Temporal offsets + Dosage ratios (Names &amp; MRNs removed)</p>
            <p className="text-slate-400">3. [Gemini 3.7 Flash Reasoning Engine] (@google/genai server-side SDK)</p>
            <p className="text-emerald-400">   ↓ Ephemeral RAM synthesis: MDS-UPDRS translation, transit buffering, refill staging</p>
            <p className="text-slate-400">4. [Direct Google Workspace OAuth Egress] (User Sovereign Data Store)</p>
            <p className="text-emerald-400">   ├── Google Drive / Docs: Clinical Synthesis Report</p>
            <p className="text-emerald-400">   ├── Google Gmail API: Encrypted Neurologist Care Dispatch</p>
            <p className="text-emerald-400">   └── Google Calendar API: Parkinson's-buffered staging</p>
            <p className="text-indigo-400">   ↓ Post-dispatch memory purge (Garbage collection)</p>
            <p className="text-amber-300">5. [Zero Cold Storage Footprint on Application Infrastructure]</p>
          </div>
        </div>
      )}

    </div>
  );
};
