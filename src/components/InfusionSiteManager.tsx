import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, RotateCw, Plus, 
  Sparkles, Calendar, Clock, Activity, FileText, Camera, 
  MapPin, Info, ArrowRight, HeartPulse, Ban, ShieldAlert,
  Flame, Lock
} from 'lucide-react';
import { InfusionSiteLog, ClockPosition } from '../types';

interface Props {
  sites: InfusionSiteLog[];
  onAddSiteLog: (newSite: InfusionSiteLog) => void;
  onUpdateSiteStatus: (id: string, status: InfusionSiteLog['status']) => void;
  onOpenQuickRefill?: () => void;
}

interface ClockSlotConfig {
  position: ClockPosition;
  label: string;
  quadrant: InfusionSiteLog['quadrant'];
  angleDegrees: number;
  cxPercent: number; // For SVG position in circular ring
  cyPercent: number;
  isUnderBelly: boolean; // True for lower slots near belt/waistband
  beltConflictReason?: string;
}

const CLOCK_SLOTS: ClockSlotConfig[] = [
  { 
    position: '12:00 (Top / Superior)', 
    label: '12:00', 
    quadrant: 'Top-Center', 
    angleDegrees: 0, 
    cxPercent: 50, 
    cyPercent: 18,
    isUnderBelly: false 
  },
  { 
    position: '1:30 (Upper-Right)', 
    label: '1:30', 
    quadrant: 'Upper-Right', 
    angleDegrees: 45, 
    cxPercent: 73, 
    cyPercent: 27,
    isUnderBelly: false 
  },
  { 
    position: '3:00 (Direct Right)', 
    label: '3:00', 
    quadrant: 'Upper-Right', 
    angleDegrees: 90, 
    cxPercent: 82, 
    cyPercent: 50,
    isUnderBelly: false 
  },
  { 
    position: '4:30 (Lower-Right)', 
    label: '4:30', 
    quadrant: 'Lower-Right', 
    angleDegrees: 135, 
    cxPercent: 73, 
    cyPercent: 73,
    isUnderBelly: true,
    beltConflictReason: 'Under-belly / Waistband friction zone'
  },
  { 
    position: '6:00 (Bottom / Inferior)', 
    label: '6:00', 
    quadrant: 'Bottom-Center', 
    angleDegrees: 180, 
    cxPercent: 50, 
    cyPercent: 82,
    isUnderBelly: true,
    beltConflictReason: 'Direct belt buckle & pant line compression'
  },
  { 
    position: '7:30 (Lower-Left)', 
    label: '7:30', 
    quadrant: 'Lower-Left', 
    angleDegrees: 225, 
    cxPercent: 27, 
    cyPercent: 73,
    isUnderBelly: true,
    beltConflictReason: 'Under-belly / Waistband friction zone'
  },
  { 
    position: '9:00 (Direct Left)', 
    label: '9:00', 
    quadrant: 'Lower-Left', 
    angleDegrees: 270, 
    cxPercent: 18, 
    cyPercent: 50,
    isUnderBelly: false 
  },
  { 
    position: '10:30 (Upper-Left)', 
    label: '10:30', 
    quadrant: 'Upper-Left', 
    angleDegrees: 315, 
    cxPercent: 27, 
    cyPercent: 27,
    isUnderBelly: false 
  },
];

export const InfusionSiteManager: React.FC<Props> = ({
  sites,
  onAddSiteLog,
  onUpdateSiteStatus,
  onOpenQuickRefill
}) => {
  const [selectedSlot, setSelectedSlot] = useState<ClockPosition>('1:30 (Upper-Right)');
  const [isLoggingNew, setIsLoggingNew] = useState(false);
  const [activeConstraintFilter, setActiveConstraintFilter] = useState<'all' | 'safe-only'>('all');

  // Form State
  const [erythema, setErythema] = useState(false);
  const [erythemaSeverity, setErythemaSeverity] = useState<'None' | 'Mild (Faint pink <1cm)' | 'Moderate (Redness 1-2cm)' | 'Significant (>2cm induration)'>('None');
  const [tenderness, setTenderness] = useState(false);
  const [tendernessSeverity, setTendernessSeverity] = useState<'None' | 'Mild' | 'Moderate' | 'Severe'>('None');
  const [edema, setEdema] = useState(false);
  const [nodule, setNodule] = useState(false);
  const [leakage, setLeakage] = useState(false);
  const [itchiness, setItchiness] = useState(false);
  const [caregiverNotes, setCaregiverNotes] = useState('');
  const [activeDays, setActiveDays] = useState(1);
  const [siteStatus, setSiteStatus] = useState<InfusionSiteLog['status']>('ACTIVE_INFUSING');

  // Currently active infusing site
  const currentActiveSite = sites.find(s => s.status === 'ACTIVE_INFUSING') || sites[0];

  // Helper to get site data for a specific clock position
  const getSiteAtPosition = (pos: ClockPosition) => {
    return sites.find(s => s.clockPosition === pos);
  };

  // Helper to check if a site has active erythema/redness
  const isSiteRedOrIrritated = (pos: ClockPosition): { isRed: boolean; reason?: string } => {
    const site = getSiteAtPosition(pos);
    if (!site) return { isRed: false };
    if (site.status === 'FLAGGED_IRRITATED') {
      return { isRed: true, reason: 'Flagged irritated / inflamed' };
    }
    if (site.reactions.erythemaRedness) {
      return { isRed: true, reason: `Active Erythema (${site.reactions.erythemaSeverity || 'Redness'})` };
    }
    return { isRed: false };
  };

  // Check if position is prohibited under-belly
  const isUnderBellySlot = (pos: ClockPosition): boolean => {
    const slot = CLOCK_SLOTS.find(s => s.position === pos);
    return !!slot?.isUnderBelly;
  };

  // Check if slot is totally eligible for placement
  const getSlotEligibility = (pos: ClockPosition): {
    eligible: boolean;
    badgeLabel: string;
    badgeColor: string;
    reason: string;
  } => {
    const site = getSiteAtPosition(pos);
    const redInfo = isSiteRedOrIrritated(pos);
    const isUnder = isUnderBellySlot(pos);

    if (site?.status === 'ACTIVE_INFUSING') {
      return {
        eligible: false,
        badgeLabel: 'Active Cannula',
        badgeColor: 'bg-rose-600 text-white',
        reason: 'Currently delivering continuous Vyalev infusion.'
      };
    }

    if (isUnder) {
      return {
        eligible: false,
        badgeLabel: 'Locked: Under-Belly / Belt',
        badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
        reason: 'Excluded per patient comfort rule: sits below belt line / waistband with high friction risk.'
      };
    }

    if (redInfo.isRed) {
      return {
        eligible: false,
        badgeLabel: 'Locked: Redness Quarantine',
        badgeColor: 'bg-rose-100 text-rose-900 border border-rose-300',
        reason: `Quarantined: ${redInfo.reason}. Dermal recovery protocol forbids reusing inflamed tissue.`
      };
    }

    if (site?.status === 'HEALING') {
      return {
        eligible: false,
        badgeLabel: 'Healing (In Rest)',
        badgeColor: 'bg-sky-100 text-sky-900 border border-sky-300',
        reason: 'Recently retired cannula site still completing standard rest cycle.'
      };
    }

    return {
      eligible: true,
      badgeLabel: 'Safe & Recommended',
      badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      reason: 'Upper quadrant safe zone: zero redness, clear of belt friction, tissue fully rested.'
    };
  };

  // Next suggested rotation slot that strictly respects constraints:
  // 1. NOT under-belly (no belt line)
  // 2. NOT red / erythema / irritated
  // 3. NOT currently active
  // 4. In upper quadrant safe clockwise sequence
  const getNextRecommendedSlot = (): ClockPosition => {
    // Upper safe sequence: 12:00 -> 1:30 -> 3:00 -> 9:00 -> 10:30
    const safeSlots = CLOCK_SLOTS.filter(s => {
      if (s.isUnderBelly) return false;
      const redCheck = isSiteRedOrIrritated(s.position);
      if (redCheck.isRed) return false;
      const site = getSiteAtPosition(s.position);
      if (site?.status === 'ACTIVE_INFUSING') return false;
      return true;
    });

    if (safeSlots.length === 0) {
      // Fallback to top-center if all have minor logs
      return '12:00 (Top / Superior)';
    }

    // Find next safe slot clockwise from current active
    if (currentActiveSite) {
      const allSlotsCount = CLOCK_SLOTS.length;
      const curIdx = CLOCK_SLOTS.findIndex(c => c.position === currentActiveSite.clockPosition);
      for (let step = 1; step < allSlotsCount; step++) {
        const nextCandidate = CLOCK_SLOTS[(curIdx + step) % allSlotsCount];
        if (safeSlots.some(s => s.position === nextCandidate.position)) {
          return nextCandidate.position;
        }
      }
    }

    return safeSlots[0].position;
  };

  const recommendedSlot = getNextRecommendedSlot();

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const slotInfo = CLOCK_SLOTS.find(s => s.position === selectedSlot) || CLOCK_SLOTS[0];
    
    // Determine status automatically if redness is logged
    let computedStatus = siteStatus;
    if (erythema || siteStatus === 'FLAGGED_IRRITATED') {
      computedStatus = siteStatus === 'ACTIVE_INFUSING' ? 'ACTIVE_INFUSING' : 'FLAGGED_IRRITATED';
    }

    const newLog: InfusionSiteLog = {
      id: `site-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      clockPosition: selectedSlot,
      quadrant: slotInfo.quadrant,
      angleDegrees: slotInfo.angleDegrees,
      distanceFromNavelInches: 1.0,
      activeDays,
      cannulaLotNumber: 'LOT-VY-' + Math.floor(10000 + Math.random() * 90000),
      reactions: {
        erythemaRedness: erythema,
        erythemaSeverity: erythema ? erythemaSeverity : 'None',
        tendernessPain: tenderness,
        tendernessSeverity: tenderness ? tendernessSeverity : 'None',
        edemaSwelling: edema,
        noduleFormation: nodule,
        leakageDischarge: leakage,
        itchinessPruritus: itchiness
      },
      caregiverNotes: caregiverNotes || 'Site evaluated and logged in 1-inch periumbilical rotation protocol with safety quarantine checks.',
      status: computedStatus,
      photoAttachmentSimulated: true
    };

    onAddSiteLog(newLog);
    setIsLoggingNew(false);
    
    // Reset form
    setErythema(false);
    setTenderness(false);
    setEdema(false);
    setNodule(false);
    setLeakage(false);
    setItchiness(false);
    setCaregiverNotes('');
  };

  return (
    <div id="infusion-site-manager" className="space-y-6">
      {/* Header & Clinical Context */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-rose-50 text-rose-700 rounded-xl">
                <HeartPulse className="w-5 h-5" />
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Vyalev Infusion Site Rotation & Reaction Tracker Agent
              </h2>
            </div>
            <p className="text-sm text-slate-500 max-w-3xl">
              Enforces a strict 1-inch circular perimeter around Captain Wade's belly button. Automatically excludes under-belly/belt positions and locks out irritated red sites until fully healed.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenQuickRefill && (
              <button
                type="button"
                id="quick-syringe-refill-btn"
                onClick={onOpenQuickRefill}
                className="px-4 py-2.5 bg-rose-900 hover:bg-rose-950 text-rose-100 border border-rose-700 text-xs font-black rounded-xl flex items-center gap-2 transition-all shadow-xs"
              >
                <span>🧪 Quick Syringe Refill (Daily)</span>
              </button>
            )}

            <button
              type="button"
              id="log-site-change-btn"
              onClick={() => {
                setSelectedSlot(recommendedSlot);
                setIsLoggingNew(true);
              }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Log Site Rotation / Reaction</span>
            </button>
          </div>
        </div>

        {/* Safety Rule Cards: Redness Quarantine & Belt Exclusions */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Rule 1: Redness Quarantine Lock */}
          <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs text-rose-950 flex items-start gap-3">
            <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg shrink-0 mt-0.5">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-rose-900">Zero Redness Re-Use Rule:</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-200 text-rose-900">
                  Enforced
                </span>
              </div>
              <p className="text-rose-800 text-[11px] leading-relaxed mt-0.5">
                Any 1-inch radial spot exhibiting erythema (redness) or tape sensitivity is automatically quarantined. The rotation engine bypasses it until tissue is 100% clear.
              </p>
            </div>
          </div>

          {/* Rule 2: Belt Line / Under-Belly Exclusion */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
              <Ban className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-amber-900">Under-Belly & Belt Exclusion:</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-200 text-amber-900">
                  Excluded
                </span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed mt-0.5">
                Captain Wade dislikes under-belly sites due to belt/waistband pressure. Lower clock slots (4:30, 6:00, 7:30) are locked out; rotation stays in upper safe arcs.
              </p>
            </div>
          </div>
        </div>

        {/* Recommended Next Alert Banner */}
        <div className="mt-3.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Autonomous Recommendation:</strong> Next rotation safely guided to <strong>{recommendedSlot}</strong> (Upper safe arc, 0% redness, zero belt friction).
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedSlot(recommendedSlot)}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shrink-0"
          >
            Select {recommendedSlot.split(' ')[0]}
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Belly Button Radial Map vs Reaction Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Interactive Circular Periumbilical Diagram (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                  Circular Navel Placement Map (1" Radius)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                Abdominal Clock
              </span>
            </div>

            {/* Interactive Anatomical SVG Radar Map */}
            <div className="relative w-full aspect-square max-w-[340px] mx-auto bg-gradient-to-b from-rose-50/40 via-slate-50 to-rose-50/20 rounded-3xl border border-rose-100 p-4 flex items-center justify-center shadow-inner">
              
              {/* Outer 1-inch Circle Ring Guide */}
              <div className="absolute inset-8 rounded-full border-2 border-dashed border-rose-300/60 pointer-events-none flex items-center justify-center">
                <div className="text-[8px] font-black uppercase tracking-widest text-rose-400 bg-white/90 px-2 py-0.5 rounded-full shadow-2xs">
                  1" Radius Circle Around Navel
                </div>
              </div>

              {/* Belt / Waistband Friction Line Barrier Indicator at the Bottom */}
              <div className="absolute bottom-3 left-4 right-4 h-14 rounded-2xl bg-amber-500/10 border-t-2 border-dashed border-amber-500/60 pointer-events-none flex items-end justify-center pb-1">
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-amber-700 bg-white/90 px-2 py-0.5 rounded-md border border-amber-200 shadow-2xs flex items-center gap-1">
                  <Ban className="w-2.5 h-2.5 text-amber-600" />
                  Waistband & Belt Line Exclusion Zone
                </span>
              </div>

              {/* Center Belly Button / Navel Anchor */}
              <div className="absolute z-10 w-14 h-14 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-slate-400 shadow-md flex flex-col items-center justify-center text-center p-1">
                <span className="text-[9px] font-black text-slate-700 uppercase leading-tight">Belly</span>
                <span className="text-[8px] font-bold text-slate-500 uppercase leading-tight">Button</span>
              </div>

              {/* 8 Radial Clock Position Interactive Nodes */}
              {CLOCK_SLOTS.map((slot) => {
                const siteData = getSiteAtPosition(slot.position);
                const isActive = siteData?.status === 'ACTIVE_INFUSING';
                const isSelected = selectedSlot === slot.position;
                const isUnder = slot.isUnderBelly;
                const redCheck = isSiteRedOrIrritated(slot.position);
                const eligibility = getSlotEligibility(slot.position);

                let bgClass = 'bg-white text-slate-700 border-slate-300 hover:border-rose-400';
                let iconBadge: React.ReactNode = null;

                if (isActive) {
                  bgClass = 'bg-rose-600 text-white border-rose-700 shadow-md ring-4 ring-rose-300 animate-pulse';
                } else if (isUnder) {
                  bgClass = 'bg-amber-100 text-amber-800 border-amber-300 opacity-70 hover:opacity-100';
                  iconBadge = <Ban className="w-2.5 h-2.5 text-amber-700" />;
                } else if (redCheck.isRed) {
                  bgClass = 'bg-rose-100 text-rose-900 border-rose-400 ring-2 ring-rose-200';
                  iconBadge = <Flame className="w-2.5 h-2.5 text-rose-600" />;
                } else if (siteData?.status === 'HEALING') {
                  bgClass = 'bg-sky-100 text-sky-800 border-sky-300';
                } else if (slot.position === recommendedSlot) {
                  bgClass = 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300 animate-bounce';
                  iconBadge = <Sparkles className="w-2.5 h-2.5 text-white" />;
                } else {
                  bgClass = 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100';
                }

                return (
                  <button
                    key={slot.position}
                    type="button"
                    onClick={() => setSelectedSlot(slot.position)}
                    style={{
                      position: 'absolute',
                      top: `${slot.cyPercent}%`,
                      left: `${slot.cxPercent}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`w-11 h-11 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${bgClass} ${
                      isSelected ? 'scale-115 ring-3 ring-slate-900 z-30 shadow-lg' : 'z-10'
                    }`}
                    title={`${slot.position} - ${eligibility.badgeLabel}`}
                  >
                    <div className="flex items-center gap-0.5">
                      <span className="text-[10px] font-black leading-none">{slot.label}</span>
                      {iconBadge}
                    </div>
                    <span className="text-[7.5px] opacity-90 leading-none mt-0.5 font-bold">
                      {isActive ? 'Active' : isUnder ? 'Belt' : redCheck.isRed ? 'Red' : 'Safe'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Legend with Rules */}
          <div className="grid grid-cols-2 gap-2 text-[10.5px] pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-rose-600 shrink-0"></span>
              <span className="font-semibold text-slate-700">Active Cannula (Day 1)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-emerald-500 text-white shrink-0"></span>
              <span className="font-semibold text-slate-700">Recommended Safe Arc</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-rose-100 border border-rose-400 text-rose-900 shrink-0 flex items-center justify-center text-[8px] font-black">!</span>
              <span className="font-semibold text-rose-800">Redness Quarantined</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300 text-amber-800 shrink-0 flex items-center justify-center text-[8px] font-black">✕</span>
              <span className="font-semibold text-amber-800">Under-Belly (Belt Line)</span>
            </div>
          </div>
        </div>

        {/* Right Col: Selected Site Inspection & Reaction Telemetry (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Inspection Slot</span>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>{selectedSlot}</span>
                  {getSiteAtPosition(selectedSlot)?.status === 'ACTIVE_INFUSING' && (
                    <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-xs rounded-full font-bold">
                      Current Active Infusion
                    </span>
                  )}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsLoggingNew(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Update / Log Reaction</span>
              </button>
            </div>

            {/* Site Eligibility Alert Box */}
            {(() => {
              const eligibility = getSlotEligibility(selectedSlot);
              const isUnder = isUnderBellySlot(selectedSlot);
              const redCheck = isSiteRedOrIrritated(selectedSlot);

              return (
                <div className={`my-4 p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                  isUnder
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : redCheck.isRed
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : eligibility.eligible
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black shrink-0 ${
                      isUnder ? 'bg-amber-200 text-amber-900' : redCheck.isRed ? 'bg-rose-200 text-rose-900' : 'bg-white text-emerald-700 shadow-2xs'
                    }`}>
                      {isUnder ? <Ban className="w-5 h-5" /> : redCheck.isRed ? <Flame className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider">
                          Placement Status: {eligibility.badgeLabel}
                        </span>
                      </div>
                      <p className="text-xs mt-1 leading-relaxed">
                        {eligibility.reason}
                      </p>
                    </div>
                  </div>

                  {eligibility.eligible && (
                    <button
                      type="button"
                      onClick={() => setIsLoggingNew(true)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shrink-0 shadow-xs"
                    >
                      Use This Spot
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Site Detail Card */}
            {(() => {
              const currentSite = getSiteAtPosition(selectedSlot);
              const isUnder = isUnderBellySlot(selectedSlot);

              if (!currentSite) {
                return (
                  <div className="my-4 p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800">
                      {isUnder ? 'Under-Belly Position (Excluded)' : 'Site Fully Rested & Available'}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {isUnder 
                        ? 'This location is situated below the navel in the waistband friction area. By rule, no cannula placements will be suggested here.' 
                        : 'No active cannula or lingering redness at this 1-inch periumbilical clock position. Ready for rotation.'}
                    </p>
                  </div>
                );
              }

              const hasReaction = currentSite.reactions.erythemaRedness || currentSite.reactions.tendernessPain || currentSite.reactions.edemaSwelling;

              return (
                <div className="my-4 space-y-4">
                  {/* Reaction Checklist Badges */}
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-slate-700 block">
                      Reaction Telemetry & Dermal Observations
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      <div className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                        currentSite.reactions.erythemaRedness ? 'bg-rose-100 border-rose-300 text-rose-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        <span className="font-bold flex items-center gap-1">
                          {currentSite.reactions.erythemaRedness && <Flame className="w-3 h-3 text-rose-600" />}
                          Erythema (Redness)
                        </span>
                        <span className="text-[11px] font-medium mt-1">
                          {currentSite.reactions.erythemaRedness ? currentSite.reactions.erythemaSeverity : 'None (Clear Skin)'}
                        </span>
                      </div>

                      <div className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                        currentSite.reactions.tendernessPain ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        <span className="font-bold">Tenderness / Pain</span>
                        <span className="text-[11px] font-medium mt-1">
                          {currentSite.reactions.tendernessPain ? currentSite.reactions.tendernessSeverity : 'None (Zero pain)'}
                        </span>
                      </div>

                      <div className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                        currentSite.reactions.edemaSwelling ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        <span className="font-bold">Edema / Swelling</span>
                        <span className="text-[11px] font-medium mt-1">
                          {currentSite.reactions.edemaSwelling ? 'Mild Induration' : 'None'}
                        </span>
                      </div>

                      <div className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                        currentSite.reactions.noduleFormation ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        <span className="font-bold">Nodules</span>
                        <span className="text-[11px] font-medium mt-1">
                          {currentSite.reactions.noduleFormation ? 'Subcutaneous Nodule' : 'None (Smooth)'}
                        </span>
                      </div>

                      <div className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                        currentSite.reactions.itchinessPruritus ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        <span className="font-bold">Itchiness / Pruritus</span>
                        <span className="text-[11px] font-medium mt-1">
                          {currentSite.reactions.itchinessPruritus ? 'Tape Sensitivity' : 'None'}
                        </span>
                      </div>

                      <div className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                        currentSite.reactions.leakageDischarge ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        <span className="font-bold">Cannula Seal</span>
                        <span className="text-[11px] font-medium mt-1">
                          {currentSite.reactions.leakageDischarge ? 'Leaking (Change Required)' : 'Tight Seal (100%)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Caregiver Log Notes */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Caregiver Clinical Notes ({currentSite.timestamp})
                    </span>
                    <p className="text-slate-600 leading-relaxed italic">
                      "{currentSite.caregiverNotes}"
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Auto-Sync with Neurologist Report Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong>Neurologist Sync:</strong> All logged erythema events and belt exclusion telemetry are automatically compiled for Dr. Henderson in the weekly MDS-UPDRS clinical report.
              </span>
            </div>
            <span className="px-2.5 py-1 bg-white text-indigo-800 rounded-lg font-bold border border-indigo-200 text-[11px] shrink-0">
              Auto-Synced
            </span>
          </div>
        </div>
      </div>

      {/* Log New Site Rotation Modal / Slide-Out */}
      {isLoggingNew && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-600" />
                <h3 className="text-lg font-black text-slate-900">
                  Log Site Placement & Reaction Check
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLoggingNew(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="space-y-4">
              {/* Placement Clock Position Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  1-Inch Periumbilical Placement Position
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value as ClockPosition)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800"
                >
                  {CLOCK_SLOTS.map(slot => {
                    const isUnder = slot.isUnderBelly;
                    const redCheck = isSiteRedOrIrritated(slot.position);
                    return (
                      <option key={slot.position} value={slot.position}>
                        {slot.position} — {slot.quadrant} {isUnder ? '⚠️ (Under-belly / Belt line)' : redCheck.isRed ? '⛔ (Redness Quarantined)' : '✅ (Safe zone)'}
                      </option>
                    );
                  })}
                </select>
                {isUnderBellySlot(selectedSlot) && (
                  <p className="mt-1.5 text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    Warning: This slot is located in the lower under-belly belt friction zone.
                  </p>
                )}
                {isSiteRedOrIrritated(selectedSlot).isRed && (
                  <p className="mt-1.5 text-[11px] text-rose-700 font-semibold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    Quarantine Warning: Redness was previously logged at this site. Recommended to rotate to a clear spot.
                  </p>
                )}
              </div>

              {/* Status & Active Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Site Status
                  </label>
                  <select
                    value={siteStatus}
                    onChange={(e) => setSiteStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    <option value="ACTIVE_INFUSING">Active Infusing (New Cannula)</option>
                    <option value="HEALING">Healing (Recently Retired)</option>
                    <option value="RESTED_READY">Rested & Ready (Healthy)</option>
                    <option value="FLAGGED_IRRITATED">Flagged (Irritated / Rest)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Cannula Dwell Time (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={activeDays}
                    onChange={(e) => setActiveDays(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              {/* Reaction Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                  <span>Reaction Assessment Checklist</span>
                  <span className="text-[10px] text-rose-600 font-bold">Checking 'Redness' auto-locks spot</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-rose-50/50">
                    <input
                      type="checkbox"
                      checked={erythema}
                      onChange={(e) => setErythema(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800">Erythema (Redness)</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-rose-50/50">
                    <input
                      type="checkbox"
                      checked={tenderness}
                      onChange={(e) => setTenderness(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800">Tenderness / Pain</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-rose-50/50">
                    <input
                      type="checkbox"
                      checked={edema}
                      onChange={(e) => setEdema(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800">Edema / Swelling</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-rose-50/50">
                    <input
                      type="checkbox"
                      checked={itchiness}
                      onChange={(e) => setItchiness(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800">Itchiness / Pruritus</span>
                  </label>
                </div>
              </div>

              {/* Erythema Severity Detail if Checked */}
              {erythema && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-1">
                  <label className="block text-[11px] font-bold text-rose-900 uppercase">
                    Erythema Severity (Spot will be quarantined)
                  </label>
                  <select
                    value={erythemaSeverity}
                    onChange={(e) => setErythemaSeverity(e.target.value as any)}
                    className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs font-bold text-rose-950"
                  >
                    <option value="Mild (Faint pink <1cm)">Mild (Faint pink &lt;1cm)</option>
                    <option value="Moderate (Redness 1-2cm)">Moderate (Redness 1-2cm)</option>
                    <option value="Significant (>2cm induration)">Significant (&gt;2cm induration)</option>
                  </select>
                </div>
              )}

              {/* Tenderness Severity if Checked */}
              {tenderness && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-1">
                  <label className="block text-[11px] font-bold text-rose-900 uppercase">
                    Tenderness Severity
                  </label>
                  <select
                    value={tendernessSeverity}
                    onChange={(e) => setTendernessSeverity(e.target.value as any)}
                    className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs font-bold text-rose-950"
                  >
                    <option value="Mild">Mild (Only upon deep palpation)</option>
                    <option value="Moderate">Moderate (Discomfort with clothing/belt)</option>
                    <option value="Severe">Severe (Persistent ache)</option>
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Caregiver Clinical Observations
                </label>
                <textarea
                  rows={2}
                  value={caregiverNotes}
                  onChange={(e) => setCaregiverNotes(e.target.value)}
                  placeholder="e.g. Placed in upper right quadrant away from belt line. Skin clear with zero redness. 70% IPA prep used."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLoggingNew(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Save Site Telemetry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
