import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, Syringe, Clock, Sparkles, AlertTriangle, 
  CheckCircle2, Plus, Calendar, ShieldCheck, ArrowRight,
  RefreshCw, Check, Droplets, Flame, Ban, Info, X
} from 'lucide-react';
import { SyringeRefillLog, InfusionSiteLog, ClockPosition, VyalevPumpCycle } from '../types';

interface QuickSyringeRefillModalProps {
  isOpen: boolean;
  onClose: () => void;
  infusionSites: InfusionSiteLog[];
  onSaveRefill: (refillData: {
    refillLog: SyringeRefillLog;
    updatedPumpCycle: VyalevPumpCycle;
    updatedSiteLog?: InfusionSiteLog;
    pumpHoursCalculated: number;
  }) => void;
  lastRefill?: SyringeRefillLog;
  currentActiveSite?: InfusionSiteLog;
  currentPumpCycle?: VyalevPumpCycle;
}

const CLOCK_SLOT_OPTIONS: { position: ClockPosition; label: string; quadrant: string; isUnderBelly: boolean }[] = [
  { position: '12:00 (Top / Superior)', label: '12:00 Top', quadrant: 'Top-Center', isUnderBelly: false },
  { position: '1:30 (Upper-Right)', label: '1:30 Upper-Right', quadrant: 'Upper-Right', isUnderBelly: false },
  { position: '3:00 (Direct Right)', label: '3:00 Right', quadrant: 'Upper-Right', isUnderBelly: false },
  { position: '4:30 (Lower-Right)', label: '4:30 Lower-Right', quadrant: 'Lower-Right', isUnderBelly: true },
  { position: '6:00 (Bottom / Inferior)', label: '6:00 Bottom', quadrant: 'Bottom-Center', isUnderBelly: true },
  { position: '7:30 (Lower-Left)', label: '7:30 Lower-Left', quadrant: 'Lower-Left', isUnderBelly: true },
  { position: '9:00 (Direct Left)', label: '9:00 Left', quadrant: 'Lower-Left', isUnderBelly: false },
  { position: '10:30 (Upper-Left)', label: '10:30 Upper-Left', quadrant: 'Upper-Left', isUnderBelly: false }
];

export const QuickSyringeRefillModal: React.FC<QuickSyringeRefillModalProps> = ({
  isOpen,
  onClose,
  infusionSites,
  onSaveRefill,
  lastRefill,
  currentActiveSite,
  currentPumpCycle
}) => {
  // Form State
  const [syringeVolumeMl, setSyringeVolumeMl] = useState<number>(10);
  const [concentrationMgMl, setConcentrationMgMl] = useState<number>(240); // 240 mg/mL Vyalev
  const [basalHourlyRateMl, setBasalHourlyRateMl] = useState<number>(0.56);
  const [bolusVolumeMl, setBolusVolumeMl] = useState<number>(0.15);
  const [bolusesAllowedPerHour, setBolusesAllowedPerHour] = useState<number>(1);
  const [syringeLotNumber, setSyringeLotNumber] = useState<string>('SYR-VY-' + Math.floor(10000 + Math.random() * 90000));
  
  // Cannula Rotation State (Every-other-day logic)
  const [cannulaSiteChanged, setCannulaSiteChanged] = useState<boolean>(true);
  const [selectedSlot, setSelectedSlot] = useState<ClockPosition>(
    currentActiveSite?.clockPosition || '1:30 (Upper-Right)'
  );
  const [skinCondition, setSkinCondition] = useState<SyringeRefillLog['skinCondition']>('Clear & Healthy');
  const [erythemaLogged, setErythemaLogged] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [caregiverName, setCaregiverName] = useState<string>('Elsbeth Seymour');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Suggested safe slot calculation (respecting upper arc + zero redness)
  const safeAvailableSlots = CLOCK_SLOT_OPTIONS.filter(s => {
    if (s.isUnderBelly) return false;
    const existingSite = infusionSites.find(site => site.clockPosition === s.position);
    if (existingSite?.reactions.erythemaRedness || existingSite?.status === 'FLAGGED_IRRITATED') return false;
    return true;
  });

  const nextRecommended = safeAvailableSlots[0]?.position || '1:30 (Upper-Right)';

  // Automatic Mathematical Calculations that Feed the Pump Numbers
  const totalLoadedMg = Math.round(syringeVolumeMl * concentrationMgMl);
  const calculatedHoursSupply = basalHourlyRateMl > 0 
    ? Math.round((syringeVolumeMl / basalHourlyRateMl) * 10) / 10 
    : 18;
  const calculatedDailyDoseMg = Math.round(basalHourlyRateMl * 24 * concentrationMgMl);

  // Set default recommendation when modal opens
  useEffect(() => {
    if (isOpen) {
      if (cannulaSiteChanged && nextRecommended) {
        setSelectedSlot(nextRecommended);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newRefillLog: SyringeRefillLog = {
      id: `syr-${Date.now()}`,
      timestamp: `Today at ${timeFormatted}`,
      date: dateFormatted,
      syringeVolumeMl,
      concentrationMgMl,
      totalLoadedMg,
      basalHourlyRateMl,
      bolusesAllowedPerHour,
      bolusVolumeMl,
      hoursOfSupply: calculatedHoursSupply,
      syringeLotNumber: syringeLotNumber.trim() || `SYR-VY-${Math.floor(10000 + Math.random() * 90000)}`,
      vialsDrawnCount: syringeVolumeMl > 10 ? 2 : 1,
      siteRotatedToday: cannulaSiteChanged,
      cannulaSiteChanged,
      cannulaClockPosition: cannulaSiteChanged ? selectedSlot : (currentActiveSite?.clockPosition || selectedSlot),
      skinCondition: erythemaLogged ? 'Quarantined' : skinCondition,
      caregiverName: caregiverName.trim() || 'Caregiver',
      notes: notes.trim() || (cannulaSiteChanged ? 'Daily syringe refill loaded and cannula site rotated.' : 'Daily syringe refill loaded. Cannula maintained (Day 1 of 2).')
    };

    // Construct updated pump cycle telemetry
    const updatedPumpCycle: VyalevPumpCycle = {
      id: `pc-${Date.now()}`,
      date: dateFormatted,
      pumpStartTime: `${timeFormatted} (Continuous 24h)`,
      dailyDoseMg: calculatedDailyDoseMg,
      extraDoseBolusCount: 0,
      siteLocation: cannulaSiteChanged ? `Abdomen ${selectedSlot.split(' ')[1]?.replace(/[()]/g, '') || selectedSlot}` : (currentPumpCycle?.siteLocation || 'Abdomen Upper-Right'),
      cannulaChangeDate: cannulaSiteChanged ? dateFormatted : (currentPumpCycle?.cannulaChangeDate || dateFormatted),
      flowRateMlHr: basalHourlyRateMl,
      alarms: []
    };

    // Construct updated InfusionSiteLog if cannula rotated
    let updatedSiteLog: InfusionSiteLog | undefined = undefined;
    if (cannulaSiteChanged) {
      const slotObj = CLOCK_SLOT_OPTIONS.find(s => s.position === selectedSlot);
      updatedSiteLog = {
        id: `site-${Date.now()}`,
        timestamp: `Today at ${timeFormatted}`,
        date: dateFormatted,
        clockPosition: selectedSlot,
        quadrant: (slotObj?.quadrant as any) || 'Upper-Right',
        angleDegrees: selectedSlot.includes('12:00') ? 0 : selectedSlot.includes('1:30') ? 45 : selectedSlot.includes('3:00') ? 90 : selectedSlot.includes('10:30') ? 315 : 45,
        distanceFromNavelInches: 1.0,
        activeDays: 1,
        cannulaLotNumber: 'LOT-CAN-' + Math.floor(10000 + Math.random() * 90000),
        reactions: {
          erythemaRedness: erythemaLogged,
          erythemaSeverity: erythemaLogged ? 'Mild (Faint pink <1cm)' : 'None',
          tendernessPain: false,
          tendernessSeverity: 'None',
          edemaSwelling: false,
          noduleFormation: false,
          leakageDischarge: false,
          itchinessPruritus: false
        },
        caregiverNotes: `Cannula insertion logged during daily syringe refill. ${notes}`,
        status: erythemaLogged ? 'FLAGGED_IRRITATED' : 'ACTIVE_INFUSING',
        photoAttachmentSimulated: true
      };
    }

    onSaveRefill({
      refillLog: newRefillLog,
      updatedPumpCycle,
      updatedSiteLog,
      pumpHoursCalculated: Math.min(24, Math.round(calculatedHoursSupply))
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-slate-950 text-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/30 border border-rose-400/40 flex items-center justify-center text-rose-200 shadow-xs">
                <Syringe className="w-5 h-5 text-rose-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/40 text-rose-100 border border-rose-400/30">
                    Daily Caregiver Log
                  </span>
                  <span className="text-xs text-rose-200 font-medium">
                    Feeds Patient & Neurologist Dashboard
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                  Quick Syringe Refill & Site Logger
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-sm font-bold"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Automatic Feed Summary Bar */}
        <div className="bg-rose-50 border-b border-rose-100 px-5 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-950">
            <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Auto-calculated Output:</strong> Refill delivers <strong>{totalLoadedMg} mg</strong> ({calculatedHoursSupply} hrs reserve @ {basalHourlyRateMl} mL/hr).
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 font-extrabold text-rose-800 text-[11px] shadow-2xs">
            Wade Mode: {Math.min(24, Math.round(calculatedHoursSupply))}h Display
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Syringe & Dose Mechanics (Everyday Refill) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                1. Daily Syringe & Volume Loaded
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Performed Every Day</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Syringe Volume */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Syringe Volume (mL)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSyringeVolumeMl(10)}
                    className={`py-2 text-xs font-black rounded-xl border transition-all ${
                      syringeVolumeMl === 10
                        ? 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    10 mL (Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSyringeVolumeMl(20)}
                    className={`py-2 text-xs font-black rounded-xl border transition-all ${
                      syringeVolumeMl === 20
                        ? 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    20 mL (Double)
                  </button>
                </div>
              </div>

              {/* Basal Flow Rate */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Basal Rate (mL/hr)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="2.0"
                  value={basalHourlyRateMl}
                  onChange={(e) => setBasalHourlyRateMl(parseFloat(e.target.value) || 0.56)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900"
                />
                <span className="text-[10px] text-slate-500">Normal range: 0.50 - 0.65 mL/hr</span>
              </div>

              {/* Drug Concentration */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Concentration (mg/mL)
                </label>
                <input
                  type="number"
                  value={concentrationMgMl}
                  disabled
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500"
                />
                <span className="text-[10px] text-slate-500">Vyalev fixed: 240 mg/mL</span>
              </div>
            </div>
          </div>

          {/* Section 2: Cannula Site Replacement (Every-Other-Day Logging) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                2. Subcutaneous Cannula Site (Every Other Day)
              </span>
              <span className="text-[11px] font-bold text-indigo-700">1" Periumbilical Rotation</span>
            </div>

            {/* Cannula change toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <div className="font-extrabold text-xs text-slate-900">
                  Did you insert a NEW cannula site today?
                </div>
                <div className="text-[11px] text-slate-500">
                  Standard protocol is changing the 6mm cannula every 2 to 3 days.
                </div>
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCannulaSiteChanged(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    cannulaSiteChanged
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Yes, New Site
                </button>
                <button
                  type="button"
                  onClick={() => setCannulaSiteChanged(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    !cannulaSiteChanged
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  No, Reusing Current
                </button>
              </div>
            </div>

            {/* Cannula Position Selector & Rules (Shown if changed or to inspect) */}
            {cannulaSiteChanged && (
              <div className="space-y-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                    <span>Select Clock Position (1" Circle Around Navel)</span>
                    <span className="text-[10px] text-emerald-700 font-extrabold">
                      ⭐ Recommended: {nextRecommended}
                    </span>
                  </label>
                  
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value as ClockPosition)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-2xs"
                  >
                    {CLOCK_SLOT_OPTIONS.map(slot => {
                      const isUnder = slot.isUnderBelly;
                      const existingSite = infusionSites.find(s => s.clockPosition === slot.position);
                      const hasRedness = existingSite?.reactions.erythemaRedness || existingSite?.status === 'FLAGGED_IRRITATED';
                      return (
                        <option key={slot.position} value={slot.position} disabled={isUnder || hasRedness}>
                          {slot.position} — {slot.quadrant} {isUnder ? '⚠️ (Under-belly / Belt line - Excluded)' : hasRedness ? '⛔ (Redness Quarantined)' : '✅ (Safe Zone)'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Skin check on rotation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Skin Condition at New Site
                    </label>
                    <select
                      value={skinCondition}
                      onChange={(e) => setSkinCondition(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      <option value="Clear & Healthy">Clear & Healthy (Ideal)</option>
                      <option value="Faint Pink">Faint Pink (Mild)</option>
                      <option value="Irritated / Swollen">Irritated / Swollen</option>
                      <option value="Quarantined">Quarantined (Skip Slot)</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-rose-50/50 w-full mt-5 sm:mt-0">
                      <input
                        type="checkbox"
                        checked={erythemaLogged}
                        onChange={(e) => setErythemaLogged(e.target.checked)}
                        className="w-4 h-4 text-rose-600 rounded"
                      />
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-rose-600" />
                        Log Erythema (Auto-locks slot)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Administrative Notes & Verification */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Syringe / Medication Lot #
                </label>
                <input
                  type="text"
                  value={syringeLotNumber}
                  onChange={(e) => setSyringeLotNumber(e.target.value)}
                  placeholder="e.g. SYR-VY-99412"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Logged By (Caregiver)
                </label>
                <input
                  type="text"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Caregiver Clinical Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Fresh syringe primed with 0.1 mL flush. No air bubbles, patient comfortable."
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Record Refill & Feed Pump Data</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
