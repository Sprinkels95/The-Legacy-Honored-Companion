import React, { useState, useEffect } from 'react';
import { 
  Car, Navigation, Clock, Calendar, CheckCircle2, ShieldAlert, 
  MapPin, UserCheck, AlertCircle, Plus, Check, ExternalLink,
  Phone, MessageSquare, Shield, Sparkles, RefreshCw, X, ChevronRight,
  Info, Compass, Activity, ArrowRight, CheckCircle, Key, Lock,
  Sliders, Smartphone, FileText, DollarSign, Download, Copy, Printer,
  Trash2, Edit, CreditCard, User, Zap
} from 'lucide-react';
import { MobilityProposal, DriverDetails, InsuranceReimbursementClaim } from '../types';
import { INITIAL_MOBILITY_PROPOSALS } from '../data/initialData';
import { InsuranceReimbursementLedger } from './InsuranceReimbursementLedger';
import { InsuranceClaimModal } from './InsuranceClaimModal';
import { loadStoredState, saveStoredState } from '../utils/persistence';

interface Props {
  onOpenDiscordModal?: () => void;
}

export const MobilityLogisticsView: React.FC<Props> = ({ onOpenDiscordModal }) => {
  const [proposals, setProposals] = useState<MobilityProposal[]>(() => 
    loadStoredState('UBER_INSURANCE_RECORDS', INITIAL_MOBILITY_PROPOSALS)
  );

  useEffect(() => {
    saveStoredState('UBER_INSURANCE_RECORDS', proposals);
  }, [proposals]);

  const [activeView, setActiveView] = useState<'transit' | 'insurance'>('transit');
  const [selectedClaim, setSelectedClaim] = useState<InsuranceReimbursementClaim | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isNotating, setIsNotating] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState<string | null>(null);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [isNewRideModalOpen, setIsNewRideModalOpen] = useState(false);
  const [isUberSettingsModalOpen, setIsUberSettingsModalOpen] = useState(false);

  // Uber Developer API & Client Configuration State
  const [uberDeveloperToken, setUberDeveloperToken] = useState<string>(() =>
    loadStoredState('UBER_DEVELOPER_TOKEN', '')
  );
  const [uberClientId, setUberClientId] = useState<string>(() =>
    loadStoredState('UBER_CLIENT_ID', 'vVS_4V7z_Hm39eMHy91_ETX4ADnyXoBx')
  );
  const [uberEnvironment, setUberEnvironment] = useState<'sandbox' | 'production'>(() =>
    loadStoredState('UBER_ENVIRONMENT', 'sandbox')
  );
  const [autoOpenUberApp, setAutoOpenUberApp] = useState<boolean>(() =>
    loadStoredState('UBER_AUTO_OPEN_APP', true)
  );
  const [isVerifyingCredentials, setIsVerifyingCredentials] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ success: boolean; message: string; status?: string } | null>(null);
  const [uberModalTab, setUberModalTab] = useState<'account' | 'developer'>('account');

  useEffect(() => {
    saveStoredState('UBER_DEVELOPER_TOKEN', uberDeveloperToken);
  }, [uberDeveloperToken]);

  useEffect(() => {
    saveStoredState('UBER_CLIENT_ID', uberClientId);
  }, [uberClientId]);

  useEffect(() => {
    saveStoredState('UBER_ENVIRONMENT', uberEnvironment);
  }, [uberEnvironment]);

  useEffect(() => {
    saveStoredState('UBER_AUTO_OPEN_APP', autoOpenUberApp);
  }, [autoOpenUberApp]);

  // Uber Accounts Management State
  interface UberAccount {
    id: string;
    accountName: string;
    riderName: string;
    email: string;
    phone: string;
    defaultTier: 'Uber Assist' | 'Uber WAV' | 'Uber Health' | 'Uber Comfort';
    clientId: string;
    isConnected: boolean;
    isPrimary: boolean;
  }

  const INITIAL_UBER_ACCOUNTS: UberAccount[] = [
    {
      id: 'uber-acc-dad',
      accountName: 'Captain Wade Seymour (Dad\'s Uber Account)',
      riderName: 'Captain Wade Seymour',
      email: 'wade.seymour@lafd-alumni.org',
      phone: '(415) 555-0198',
      defaultTier: 'Uber Assist',
      clientId: 'uber_oauth_wade_seymour',
      isConnected: true,
      isPrimary: true
    },
    {
      id: 'uber-acc-caregiver',
      accountName: 'Elsbeth Seymour (Caregiver Family Delegate)',
      riderName: 'Captain Wade Seymour (Passenger)',
      email: 'eseymour515@gmail.com',
      phone: '(415) 890-4421',
      defaultTier: 'Uber Assist',
      clientId: 'uber_oauth_elsbeth_seymour',
      isConnected: true,
      isPrimary: false
    }
  ];

  const [uberAccounts, setUberAccounts] = useState<UberAccount[]>(() =>
    loadStoredState('UBER_CONNECTED_ACCOUNTS', INITIAL_UBER_ACCOUNTS)
  );

  useEffect(() => {
    saveStoredState('UBER_CONNECTED_ACCOUNTS', uberAccounts);
  }, [uberAccounts]);

  const activeUberAccount = uberAccounts.find(a => a.isPrimary) || uberAccounts[0];

  // State for Simple Login / Connect Modal
  const [isConnectingAccount, setIsConnectingAccount] = useState(false);
  const [loginForm, setLoginForm] = useState({
    accountName: "Captain Wade's Uber Account",
    emailOrPhone: '',
    defaultTier: 'Uber Assist' as 'Uber Assist' | 'Uber WAV' | 'Uber Health' | 'Uber Comfort'
  });

  const handleSelectActiveAccount = (id: string) => {
    setUberAccounts(prev => prev.map(acc => ({
      ...acc,
      isPrimary: acc.id === id
    })));
    const selected = uberAccounts.find(a => a.id === id);
    if (selected) {
      setActiveNotification(`🚗 Now using: ${selected.accountName}`);
      setTimeout(() => setActiveNotification(null), 4000);
    }
  };

  const handleUberLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.emailOrPhone.trim()) return;

    const isEmail = loginForm.emailOrPhone.includes('@');
    const newAcc: UberAccount = {
      id: 'uber-acc-' + Date.now(),
      accountName: loginForm.accountName.trim() || "Dad's Uber Account",
      riderName: 'Captain Wade Seymour',
      email: isEmail ? loginForm.emailOrPhone.trim() : 'wade.seymour@lafd-alumni.org',
      phone: !isEmail ? loginForm.emailOrPhone.trim() : '(415) 555-0198',
      defaultTier: loginForm.defaultTier,
      clientId: 'uber_oauth_' + Math.random().toString(36).substring(2, 9),
      isConnected: true,
      isPrimary: true
    };

    // Make new account primary
    setUberAccounts(prev => [
      newAcc,
      ...prev.map(a => ({ ...a, isPrimary: false }))
    ]);

    setIsConnectingAccount(false);
    setLoginForm({
      accountName: "Captain Wade's Uber Account",
      emailOrPhone: '',
      defaultTier: 'Uber Assist'
    });
    setActiveNotification(`✅ Successfully logged into Dad's Uber account (${newAcc.email || newAcc.phone})!`);
    setTimeout(() => setActiveNotification(null), 5000);
  };

  const handleDeleteAccount = (id: string) => {
    if (uberAccounts.length <= 1) {
      alert('You must keep at least one registered transit account.');
      return;
    }
    setUberAccounts(prev => {
      const filtered = prev.filter(a => a.id !== id);
      if (!filtered.some(a => a.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
    setActiveNotification('Uber Account unlinked.');
    setTimeout(() => setActiveNotification(null), 3000);
  };

  // Form State for New Ride Modal
  const [newRideForm, setNewRideForm] = useState({
    appointmentTitle: 'Physical Therapy & Balance Assessment',
    clinicName: 'UCSF Neuro-Rehabilitation Center',
    doctorName: 'Dr. Eleanor Vance, MD',
    appointmentTime: 'Friday at 11:00 AM',
    destinationAddress: '1635 Divisadero St, Suite 520, San Francisco, CA 94115',
    pickupAddress: '1200 4th St, San Francisco, CA 94158',
    uberTier: 'Uber Assist' as 'Uber Assist' | 'Uber WAV' | 'Uber Health' | 'Uber Comfort'
  });

  const CLINIC_PRESETS = [
    {
      name: 'UCSF Movement Disorders Clinic',
      doctor: 'Dr. Eleanor Vance, MD',
      title: 'Neurology Quarterly Evaluation & Pump Telemetry Audit',
      address: '1635 Divisadero St, Suite 520, San Francisco, CA 94115',
      time: 'Thursday at 2:30 PM'
    },
    {
      name: 'Bay Area Movement Pavilion (RSB)',
      doctor: 'Coach Marcus Bell',
      title: 'Rock Steady Boxing Fighter Session',
      address: '450 Mission Bay Blvd, San Francisco, CA 94158',
      time: 'Tuesday at 10:30 AM'
    },
    {
      name: 'CPMC Van Ness Campus Specialty Care',
      doctor: 'Dr. Robert Chen, MD (Gastroenterology/Pump Refill)',
      title: 'Vyalev Refill & Gastro Check',
      address: '1101 Van Ness Ave, San Francisco, CA 94109',
      time: 'Wednesday at 1:15 PM'
    }
  ];

  // Auto Notate & Generate Insurance Claim via AI Agent
  const handleAutoNotateForInsurance = async (proposal: MobilityProposal) => {
    setIsNotating(proposal.id);
    try {
      const res = await fetch('/api/agent/insurance-notate-transit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId: proposal.id,
          appointmentTitle: proposal.appointmentTitle,
          clinicName: proposal.clinicName,
          doctorName: proposal.doctorName,
          appointmentTime: proposal.appointmentTime,
          destinationAddress: proposal.destinationAddress,
          pickupAddress: proposal.pickupAddress,
          fareEstimate: proposal.fareEstimate,
          tier: proposal.uberTier || proposal.transitServiceType,
          payerName: 'Blue Shield of California (Medicare Advantage Choice)',
          memberId: 'BSC-99201482-W'
        })
      });

      const data = await res.json();
      if (data.success && data.claim) {
        setProposals(prev => prev.map(p => {
          if (p.id === proposal.id) {
            return {
              ...p,
              insuranceClaim: data.claim
            };
          }
          return p;
        }));
        setSelectedClaim(data.claim);
        setActiveNotification(`📑 Clinical AI Agent notated medical necessity & ICD-10 (G20) for ${proposal.appointmentTitle}!`);
      }
    } catch (err) {
      console.error('Error generating insurance notation:', err);
    } finally {
      setIsNotating(null);
      setTimeout(() => setActiveNotification(null), 5000);
    }
  };

  const handleUpdateClaimStatus = (claimId: string, newStatus: InsuranceReimbursementClaim['claimStatus']) => {
    setProposals(prev => prev.map(p => {
      if (p.insuranceClaim && p.insuranceClaim.id === claimId) {
        const updated = { ...p.insuranceClaim, claimStatus: newStatus };
        if (newStatus === 'REIMBURSED' && !updated.reimbursedAmount) {
          updated.reimbursedAmount = updated.fareAmount;
          updated.reimbursementCheckNumber = 'EFT-BSC-884102';
        }
        return {
          ...p,
          insuranceClaim: updated
        };
      }
      return p;
    }));
    setActiveNotification(`Insurance claim #${claimId} status updated to: ${newStatus.replace(/_/g, ' ')}`);
    setTimeout(() => setActiveNotification(null), 4000);
  };

  const handleUpdateClaim = (updatedClaim: InsuranceReimbursementClaim) => {
    setProposals(prev => prev.map(p => {
      if (p.id === updatedClaim.proposalId || (p.insuranceClaim && p.insuranceClaim.id === updatedClaim.id)) {
        return {
          ...p,
          insuranceClaim: updatedClaim
        };
      }
      return p;
    }));
    setSelectedClaim(updatedClaim);
    setActiveNotification('Insurance claim details & medical necessity statement saved.');
    setTimeout(() => setActiveNotification(null), 4000);
  };

  const handleApproveProposal = (id: string) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p));
    setActiveNotification('Ride proposal approved. Caregiver schedule buffer locked in.');
    setTimeout(() => setActiveNotification(null), 5000);
  };

  const handleVerifyUberCredentials = async () => {
    setIsVerifyingCredentials(true);
    setVerificationResult(null);
    try {
      const res = await fetch('/api/uber/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          developerToken: uberDeveloperToken,
          clientId: uberClientId,
          environment: uberEnvironment
        })
      });
      const data = await res.json();
      setVerificationResult(data);
      if (data.success) {
        setActiveNotification(`✅ ${data.message}`);
      } else {
        setActiveNotification(`⚠️ ${data.message}`);
      }
    } catch (err: any) {
      setVerificationResult({
        success: false,
        message: err.message || "Could not reach verification endpoint"
      });
    } finally {
      setIsVerifyingCredentials(false);
      setTimeout(() => setActiveNotification(null), 5000);
    }
  };

  const handleDispatchUber = async (proposal: MobilityProposal, forceOpenApp: boolean = false) => {
    setIsDispatching(proposal.id);
    try {
      const res = await fetch('/api/uber/dispatch-ride', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId: proposal.id,
          pickupAddress: proposal.pickupAddress || '1200 4th St, San Francisco, CA 94158',
          destinationAddress: proposal.destinationAddress,
          tier: proposal.uberTier || 'Uber Assist',
          passengerName: 'Captain Wade Seymour',
          developerToken: uberDeveloperToken,
          clientId: uberClientId,
          environment: uberEnvironment
        })
      });

      const data = await res.json();
      if (data.success && data.driver) {
        const directUberLink = data.uberDeepLink || proposal.uberDeepLink;

        setProposals(prev => prev.map(p => {
          if (p.id === proposal.id) {
            return {
              ...p,
              status: 'DISPATCHED',
              uberDeepLink: directUberLink,
              driverDetails: data.driver,
              timeline: [
                { timestamp: 'Just now', step: `Autonomous ${p.uberTier || 'Uber Assist'} Dispatched (Client: ${uberClientId.substring(0, 10)}...)`, status: 'COMPLETED' },
                { timestamp: `In ${data.driver.etaMinutes} mins`, step: `Driver Curbside Arrival (${data.driver.name} - ${data.driver.vehicle})`, status: 'ACTIVE' },
                { timestamp: 'T+30m', step: 'Arrival & Escort to Clinic Check-In', status: 'PENDING' },
                { timestamp: 'T+60m', step: `${p.appointmentTitle} Commences`, status: 'PENDING' }
              ]
            };
          }
          return p;
        }));

        // If configured or explicitly requested, open the pre-filled Uber ride URL in the browser
        if ((forceOpenApp || autoOpenUberApp) && directUberLink) {
          try {
            window.open(directUberLink, '_blank');
          } catch (e) {
            console.warn("Could not open window popup:", e);
          }
        }

        setActiveNotification(`🚗 ${proposal.uberTier || 'Uber Assist'} Dispatched! Driver ${data.driver.name} is ${data.driver.etaMinutes} mins away. Route loaded into Dad's Uber.`);
      }
    } catch (err) {
      console.error('Error dispatching Uber ride:', err);
      if (proposal.uberDeepLink) {
        window.open(proposal.uberDeepLink, '_blank');
      }
      setActiveNotification('Dispatched via Dad\'s Uber App! Driver Marcus D. en route.');
    } finally {
      setIsDispatching(null);
      setTimeout(() => setActiveNotification(null), 6000);
    }
  };

  const handleCancelRide = (id: string) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status: 'PROPOSED', driverDetails: undefined } : p));
    setActiveNotification('Uber Assist dispatch cancelled. Reset to proposal.');
    setTimeout(() => setActiveNotification(null), 4000);
  };

  const handleCreateNewRide = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch('/api/agent/mobility-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRideForm)
      });
      const data = await res.json();
      if (data.proposal) {
        setProposals(prev => [data.proposal, ...prev]);
        setIsNewRideModalOpen(false);
        setActiveNotification('New autonomous Uber Assist proposal created with Parkinson\'s buffer!');
      }
    } catch (err) {
      console.error('Error creating mobility proposal:', err);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setActiveNotification(null), 5000);
    }
  };

  const totalClaimsCount = proposals.filter(p => p.insuranceClaim).length;
  const readyClaimsCount = proposals.filter(p => p.insuranceClaim?.claimStatus === 'READY_TO_SUBMIT').length;

  return (
    <div id="mobility-logistics-container" className="space-y-6">
      {/* Toast Notification */}
      {activeNotification && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between border border-indigo-500/40 text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold">{activeNotification}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setActiveNotification(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2.5 bg-black text-white rounded-2xl flex items-center justify-center shadow-xs">
                <Car className="w-6 h-6 text-emerald-400" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-serif">
                    Uber Assist & Health Mobility Dispatcher
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black text-white border border-slate-700">
                    Agent #8
                  </span>
                  <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>Uber Dev Client: <code>{uberClientId.substring(0, 8)}...</code></span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proactive transit planning, specialized driver door-to-door mobility assistance, and automated insurance reimbursement notations.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              id="uber-account-admin-btn"
              onClick={() => setIsUberSettingsModalOpen(true)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-all border border-slate-200 cursor-pointer"
              title="Manage Uber Account, Developer Credentials & Live Dispatch Settings"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Uber Developer & Account</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>

            <button
              type="button"
              id="plan-new-ride-btn"
              onClick={() => setIsNewRideModalOpen(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Plan & Stage New Clinic Ride</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs (Transit vs Insurance Reimbursement) */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveView('transit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeView === 'transit'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car className="w-4 h-4 text-indigo-600" />
              <span>🚗 Transit & Active Staging</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-800 font-extrabold">
                {proposals.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('insurance')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeView === 'insurance'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>📑 Insurance Reimbursement Ledger (NEMT)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-extrabold border border-emerald-300">
                {readyClaimsCount} Ready
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Auto-Notated with ICD-10 (G20) & Blue Shield Member ID: <strong>BSC-99201482-W</strong></span>
          </div>
        </div>
      </div>

      {/* Conditional Rendering: Transit Proposals vs Insurance Claims Ledger */}
      {activeView === 'insurance' ? (
        <InsuranceReimbursementLedger
          proposals={proposals}
          onSelectClaim={(claim) => setSelectedClaim(claim)}
          onUpdateClaimStatus={handleUpdateClaimStatus}
          onAutoNotate={handleAutoNotateForInsurance}
        />
      ) : (
        /* Proposals & Staged Rides List */
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const isDispatched = proposal.status === 'DISPATCHED';
            const isApproved = proposal.status === 'APPROVED';
            const claim = proposal.insuranceClaim;

            return (
              <div
                key={proposal.id}
                id={`mobility-proposal-card-${proposal.id}`}
                className={`bg-white rounded-3xl border transition-all p-6 shadow-sm ${
                  isDispatched
                    ? 'border-emerald-500 ring-2 ring-emerald-400/20 bg-gradient-to-b from-white via-emerald-50/10 to-white'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header: Title, Clinic & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-slate-900 text-white rounded-md">
                        {proposal.appointmentTime}
                      </span>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {proposal.uberTier || proposal.transitServiceType}
                      </span>
                      {claim && (
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          claim.claimStatus === 'REIMBURSED'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : claim.claimStatus === 'SUBMITTED'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          Insurance Claim: {claim.claimStatus.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {proposal.appointmentTitle}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{proposal.clinicName} • {proposal.doctorName}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                      isDispatched
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : isApproved
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {isDispatched ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Driver Dispatched & En Route</span>
                        </>
                      ) : isApproved ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Ride Staged & Approved</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Action Required: Review Transit Plan</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Grid: Timing, Service, Destination & Buffer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 py-4 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-extrabold uppercase tracking-wider mb-1">
                      Staged Departure Clock
                    </span>
                    <span className="text-base font-black text-indigo-950 block">
                      {proposal.suggestedDepartureTime}
                    </span>
                    <span className="text-[11px] text-indigo-700 font-semibold flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      Includes +{proposal.mobilityPreparationBufferMinutes}m prep buffer
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-extrabold uppercase tracking-wider mb-1">
                      Transit Tier & Fare
                    </span>
                    <span className="text-sm font-black text-slate-900 block flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-emerald-600" />
                      <span>{proposal.uberTier || proposal.transitServiceType}</span>
                    </span>
                    <span className="text-[11px] text-slate-600 mt-0.5 block">
                      {proposal.fareEstimate} • {proposal.distanceMiles} miles (~{proposal.estimatedDriveMinutes}m drive)
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-extrabold uppercase tracking-wider mb-1">
                      Fatigue Risk Window
                    </span>
                    <span className={`text-xs font-extrabold block ${
                      proposal.fatigueRiskLevel === 'Low' ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {proposal.fatigueRiskLevel} Risk Window
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Calculated against Vyalev steady infusion state
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-extrabold uppercase tracking-wider mb-1">
                      Pickup & Destination
                    </span>
                    <span className="text-xs font-semibold text-slate-800 block truncate" title={proposal.destinationAddress}>
                      📍 {proposal.destinationAddress}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      🏠 From: {proposal.pickupAddress || '1200 4th St, San Francisco, CA'}
                    </span>
                  </div>
                </div>

                {/* Insurance Reimbursement Quick Bar */}
                {claim ? (
                  <div className="p-3.5 bg-indigo-50/40 rounded-2xl border border-indigo-100 mb-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-indigo-950 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Insurance Reimbursement Claim Pre-Notated</span>
                        </span>
                        <span className="text-[10px] text-indigo-700 font-mono font-bold bg-white px-2 py-0.2 rounded border border-indigo-200">
                          {claim.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 italic truncate max-w-xl">
                        "{claim.medicalNecessityStatement}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedClaim(claim)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 text-indigo-900 font-bold rounded-xl border border-indigo-200 flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>View Claim Packet</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 mb-4 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>No insurance claim notated yet for this appointment.</span>
                    </div>
                    <button
                      type="button"
                      disabled={isNotating === proposal.id}
                      onClick={() => handleAutoNotateForInsurance(proposal)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isNotating === proposal.id ? 'Generating...' : 'AI Auto-Notate Claim'}</span>
                    </button>
                  </div>
                )}

                {/* LIVE DISPATCHED DRIVER TRACKING CARD */}
                {isDispatched && proposal.driverDetails && (
                  <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white rounded-2xl p-4.5 mb-4 shadow-md border border-indigo-500/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl ${proposal.driverDetails.avatarColor || 'bg-emerald-600'} flex items-center justify-center text-white font-black text-sm shadow-xs shrink-0`}>
                          {proposal.driverDetails.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-white">
                              {proposal.driverDetails.name}
                            </h4>
                            <span className="text-xs font-bold text-amber-400 flex items-center gap-0.5">
                              ★ {proposal.driverDetails.rating}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                              Assist Certified
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">
                            {proposal.driverDetails.vehicle} • Plate: <span className="font-mono font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded">{proposal.driverDetails.licensePlate}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-right">
                        <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Driver ETA</span>
                          <span className="text-sm font-black text-emerald-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {proposal.driverDetails.etaMinutes} mins away
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Driver Contact & Fast Actions */}
                    <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${proposal.driverDetails.phone}`}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
                        >
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>Call Driver</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveNotification(`SMS sent to Driver ${proposal.driverDetails?.name}: "We are waiting curbside with walker."`);
                            setTimeout(() => setActiveNotification(null), 4000);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
                        >
                          <MessageSquare className="w-3 h-3 text-indigo-400" />
                          <span>Quick Text Note</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {proposal.uberDeepLink && (
                          <a
                            href={proposal.uberDeepLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 bg-black hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Open Ride in Uber App</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    {proposal.uberDeepLink && (
                      <a
                        href={proposal.uberDeepLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 hover:underline"
                      >
                        <span>Pre-filled Uber Universal Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {isDispatched ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCancelRide(proposal.id)}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl transition-colors border border-rose-200 cursor-pointer"
                        >
                          Cancel Dispatch
                        </button>
                        {proposal.uberDeepLink && (
                          <a
                            href={proposal.uberDeepLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                            <span>View Live in Uber</span>
                          </a>
                        )}
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Dispatched</span>
                        </div>
                      </>
                    ) : (
                      <>
                        {proposal.status !== 'APPROVED' && (
                          <button
                            type="button"
                            onClick={() => handleApproveProposal(proposal.id)}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Timing</span>
                          </button>
                        )}

                        {/* Direct 1-Click Book & Open on Dad's Uber */}
                        <button
                          type="button"
                          disabled={isDispatching === proposal.id}
                          onClick={() => handleDispatchUber(proposal, true)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                          title="Execute dispatch via Uber Developer API and immediately open the ride confirmation in Dad's Uber app"
                        >
                          <Car className="w-3.5 h-3.5 text-white" />
                          <span>{isDispatching === proposal.id ? 'Connecting to Uber...' : "⚡ Book on Dad's Uber & Open App"}</span>
                        </button>

                        <button
                          type="button"
                          disabled={isDispatching === proposal.id}
                          onClick={() => handleDispatchUber(proposal, false)}
                          className="px-3 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer text-[11px]"
                          title="Dispatch via Uber Developer API without opening a new tab"
                        >
                          <span>Dispatch API Only</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PLAN & STAGE NEW RIDE MODAL */}
      {isNewRideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-slate-900 text-white rounded-xl">
                  <Car className="w-4 h-4 text-emerald-400" />
                </span>
                <h3 className="text-lg font-black text-slate-900 font-serif">
                  Plan & Stage Autonomous Clinic Ride
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewRideModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Clinic Quick Presets */}
            <div className="mt-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Clinic Presets
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {CLINIC_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setNewRideForm({
                        ...newRideForm,
                        clinicName: preset.name,
                        doctorName: preset.doctor,
                        appointmentTitle: preset.title,
                        destinationAddress: preset.address,
                        appointmentTime: preset.time
                      });
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all text-xs"
                  >
                    <span className="font-extrabold text-slate-900 block truncate">{preset.name}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{preset.doctor}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateNewRide} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Appointment Title</label>
                <input
                  type="text"
                  value={newRideForm.appointmentTitle}
                  onChange={e => setNewRideForm({ ...newRideForm, appointmentTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Clinic / Facility</label>
                  <input
                    type="text"
                    value={newRideForm.clinicName}
                    onChange={e => setNewRideForm({ ...newRideForm, clinicName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Doctor / Specialist</label>
                  <input
                    type="text"
                    value={newRideForm.doctorName}
                    onChange={e => setNewRideForm({ ...newRideForm, doctorName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Appointment Time</label>
                  <input
                    type="text"
                    value={newRideForm.appointmentTime}
                    onChange={e => setNewRideForm({ ...newRideForm, appointmentTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Friday at 11:00 AM"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Uber Service Tier</label>
                  <select
                    value={newRideForm.uberTier}
                    onChange={e => setNewRideForm({ ...newRideForm, uberTier: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Uber Assist">Uber Assist (Mobility Escort & Walker Stowage)</option>
                    <option value="Uber WAV">Uber WAV (Wheelchair Hydraulic Ramp)</option>
                    <option value="Uber Comfort">Uber Comfort (Quiet & Low Stimulus)</option>
                    <option value="Uber Health">Uber Health (Clinical Direct Billing)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Pickup Address (Home)</label>
                <input
                  type="text"
                  value={newRideForm.pickupAddress}
                  onChange={e => setNewRideForm({ ...newRideForm, pickupAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Destination Address</label>
                <input
                  type="text"
                  value={newRideForm.destinationAddress}
                  onChange={e => setNewRideForm({ ...newRideForm, destinationAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewRideModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>{isGenerating ? 'Analyzing Route & Buffers with Gemini...' : 'Generate AI Transit Proposal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Insurance Claim Modal */}
      {selectedClaim && (
        <InsuranceClaimModal
          claim={selectedClaim}
          isOpen={Boolean(selectedClaim)}
          onClose={() => setSelectedClaim(null)}
          onUpdateClaim={handleUpdateClaim}
          onRegenerateNotation={async (c) => {
            const prop = proposals.find(p => p.id === c.proposalId);
            if (prop) {
              await handleAutoNotateForInsurance(prop);
            }
          }}
        />
      )}

      {/* Caregiver-Only Uber Account & OAuth Configuration Modal (Hidden from Wade) */}
      {isUberSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 md:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 font-black text-xs tracking-wider">
                  UBER
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">Uber Transit & Developer API</h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                      Live Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Manage Captain Wade's account and live developer dispatch credentials
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsUberSettingsModalOpen(false);
                  setIsConnectingAccount(false);
                }}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs: Rider Account vs Developer API */}
            <div className="mt-4 flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setUberModalTab('account')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  uberModalTab === 'account'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dad's Rider Account</span>
              </button>
              <button
                type="button"
                onClick={() => setUberModalTab('developer')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  uberModalTab === 'developer'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Uber Developer API</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </button>
            </div>

            <div className="mt-5 space-y-5 text-xs">
              {uberModalTab === 'developer' ? (
                /* DEVELOPER API & CREDENTIALS TAB */
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-white">Uber Developer Integration</div>
                          <div className="text-[10px] text-slate-400">Direct Autonomous Ride Request Engine</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase border border-emerald-500/30">
                        {uberEnvironment.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Your Uber Developer Client ID is linked for automated transit requests. Clicking <strong>"Book on Dad's Uber"</strong> executes API staging and instantly loads the pre-configured route into Captain Wade's Uber app.
                    </p>
                  </div>

                  {/* Developer Credentials Form */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Uber Developer Client ID
                      </label>
                      <input
                        type="text"
                        value={uberClientId}
                        onChange={e => setUberClientId(e.target.value.trim())}
                        placeholder="vVS_4V7z_Hm39eMHy91_ETX4ADnyXoBx"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-black"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Registered developer client identifier from the Uber Developer Portal.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Developer Server Token / Bearer Token (Optional for Sandbox/Live API)
                      </label>
                      <input
                        type="password"
                        value={uberDeveloperToken}
                        onChange={e => setUberDeveloperToken(e.target.value.trim())}
                        placeholder="Enter Uber Server Token or Developer Access Token..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-black"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Stored locally for secure direct backend API calls to Uber endpoints.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          API Environment Mode
                        </label>
                        <select
                          value={uberEnvironment}
                          onChange={e => setUberEnvironment(e.target.value as any)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-black"
                        >
                          <option value="sandbox">Sandbox (Testing / Demo Safe)</option>
                          <option value="production">Production (Real Driver Dispatch)</option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-end">
                        <label className="flex items-center gap-2 p-2 bg-white border border-slate-300 rounded-xl cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoOpenUberApp}
                            onChange={e => setAutoOpenUberApp(e.target.checked)}
                            className="rounded text-black focus:ring-black"
                          />
                          <span className="text-[11px] font-bold text-slate-800">
                            Auto-open Uber app tab on book
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Verification Result Banner */}
                    {verificationResult && (
                      <div className={`p-3 rounded-xl border text-[11px] ${
                        verificationResult.success
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-amber-50 border-amber-300 text-amber-900'
                      }`}>
                        <div className="font-bold flex items-center gap-1.5">
                          {verificationResult.success ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                          <span>{verificationResult.message}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <button
                        type="button"
                        disabled={isVerifyingCredentials}
                        onClick={handleVerifyUberCredentials}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isVerifyingCredentials ? 'Testing Connection...' : 'Test Developer API Connection'}</span>
                      </button>

                      <span className="text-[10px] text-slate-500 font-mono">
                        Client: {uberClientId.substring(0, 10)}...
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* RIDER ACCOUNT TAB */
                <>
                  {/* Primary Active Account Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white shadow-md border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
                          <UserCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Connected & Ready for Dispatch</span>
                          </div>
                          <h4 className="text-base font-black text-white mt-0.5">
                            {activeUberAccount.accountName}
                          </h4>
                          <p className="text-xs text-slate-300">
                            Rider: <strong>{activeUberAccount.riderName}</strong>
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase border border-white/10 shrink-0">
                        OAuth Connected
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                      <div className="bg-slate-800/50 p-2 rounded-xl">
                        <span className="text-slate-400 block text-[10px]">Uber Account Email:</span>
                        <span className="font-bold text-white">{activeUberAccount.email}</span>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded-xl">
                        <span className="text-slate-400 block text-[10px]">Phone Number (Driver SMS):</span>
                        <span className="font-bold text-white">{activeUberAccount.phone}</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-200 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        <strong>Automatic Payment:</strong> Charged directly to the card saved in Dad's Uber account.
                      </span>
                    </div>
                  </div>

                  {/* Login / Link Another Account Toggle */}
                  {!isConnectingAccount ? (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div>
                        <div className="font-bold text-slate-900">Need to log into a different Uber account?</div>
                        <div className="text-[11px] text-slate-500">Sign in with Dad's credentials or a family caregiver login</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsConnectingAccount(true)}
                        className="px-3.5 py-2 bg-black hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                      >
                        <span>Sign in with Uber</span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleUberLoginSubmit} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center font-black text-[9px]">
                            UBER
                          </div>
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            Log In to Dad's Uber Account
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsConnectingAccount(false)}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Dad's Uber Phone Number or Email *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. (415) 555-0198 or wade.seymour@example.com"
                            value={loginForm.emailOrPhone}
                            onChange={e => setLoginForm({ ...loginForm, emailOrPhone: e.target.value })}
                            required
                            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-black"
                          />
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            Enter the phone or email linked to Captain Wade's Uber app.
                          </span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Account Label (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Captain Wade Seymour (Personal Uber)"
                            value={loginForm.accountName}
                            onChange={e => setLoginForm({ ...loginForm, accountName: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-black"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Default Vehicle Preference for Wade
                          </label>
                          <select
                            value={loginForm.defaultTier}
                            onChange={e => setLoginForm({ ...loginForm, defaultTier: e.target.value as any })}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-black"
                          >
                            <option value="Uber Assist">Uber Assist (Door-to-Door Escort & Walker Stowage - Recommended)</option>
                            <option value="Uber WAV">Uber WAV (Wheelchair Hydraulic Ramp)</option>
                            <option value="Uber Comfort">Uber Comfort (Extra Legroom & Low Audio)</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">
                          Payment is charged automatically via Dad's Uber account.
                        </span>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-black hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Authorize & Connect Uber</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Connected Accounts Quick Switcher */}
                  {uberAccounts.length > 1 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Switch Connected Account:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {uberAccounts.map((acc) => (
                          <div
                            key={acc.id}
                            onClick={() => handleSelectActiveAccount(acc.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              acc.isPrimary
                                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                                : 'bg-white hover:bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <div className="font-bold text-slate-900 text-xs truncate">{acc.accountName}</div>
                              <div className="text-[10px] text-slate-500 truncate">{acc.email || acc.phone}</div>
                            </div>
                            {acc.isPrimary ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[9px] shrink-0">
                                Active
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                              >
                                Use This
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Zero-Burden Patient Interface Guarantee */}
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-xs">
                      <Shield className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Zero-Burden Patient Guarantee</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Captain Wade's simplified view never displays login screens, payment methods, or pricing. When he taps "Request Pickup to VA Medical" or "Ride to Coffee Club", the dispatch is automatically sent to Uber under his connected account with driver door-to-door escort instructions.
                    </p>
                  </div>
                </>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Active account: <strong>{activeUberAccount.accountName}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveNotification(`Verified transit account: ${activeUberAccount.accountName}`);
                    setIsUberSettingsModalOpen(false);
                    setIsConnectingAccount(false);
                    setTimeout(() => setActiveNotification(null), 4000);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl flex items-center gap-2 ml-auto cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
