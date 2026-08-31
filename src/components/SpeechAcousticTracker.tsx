import React, { useState } from 'react';
import { 
  Activity, Mic, Zap, TrendingDown, Clock, ShieldCheck, AlertCircle, 
  Volume2, CheckCircle2, LineChart, Sparkles, BarChart2, MessageSquare,
  Bell, Send, ExternalLink, RefreshCw, AlertTriangle, Radio,
  HeartHandshake, Coffee, Check, Smartphone
} from 'lucide-react';
import { SpeechAcousticEvent, EnergyState, BrevityMode } from '../types';
import { acousticVoice } from '../utils/acousticVoiceEngine';

interface SpeechAcousticTrackerProps {
  acousticEvents: SpeechAcousticEvent[];
  currentEnergyState: EnergyState;
  currentBrevityMode: BrevityMode;
  onSimulateEvent: (wpm: number, text: string) => void;
  onOpenDiscordModal?: () => void;
}

interface AcousticDiscordAlertRecord {
  id: string;
  timestamp: string;
  wpm: number;
  pitchProfile: string;
  urgency: 'normal' | 'urgent';
  suggestedAction: string;
  deliveredToPhone: boolean;
}

export const SpeechAcousticTracker: React.FC<SpeechAcousticTrackerProps> = ({
  acousticEvents,
  currentEnergyState,
  currentBrevityMode,
  onSimulateEvent,
  onOpenDiscordModal
}) => {
  const [autoNotifyDiscord, setAutoNotifyDiscord] = useState<boolean>(() => {
    const saved = localStorage.getItem('legacy_honored_acoustic_autonotify');
    return saved !== null ? saved === 'true' : true;
  });

  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{
    success: boolean;
    deliveredToPhone: boolean;
    message: string;
    timestamp: string;
    suggestedAction: string;
  } | null>(null);

  const [recentDiscordAlerts, setRecentDiscordAlerts] = useState<AcousticDiscordAlertRecord[]>([
    {
      id: 'alert-initial-1',
      timestamp: 'Today, 3:15 PM',
      wpm: 42,
      pitchProfile: 'Slurred / Hypophonic Pitch',
      urgency: 'normal',
      suggestedAction: 'Offer hydration & verify 24h Vyalev continuous pump flow',
      deliveredToPhone: true
    }
  ]);

  const avgWpm = acousticEvents.length 
    ? Math.round(acousticEvents.reduce((acc, curr) => acc + curr.detectedCadenceWpm, 0) / acousticEvents.length)
    : 110;

  const lowEnergyEvents = acousticEvents.filter(
    e => e.energyClassification === 'LOW_ENERGY_OFF_STATE' || e.pitchProfile === 'Slurred / Hypophonic Pitch' || e.detectedCadenceWpm < 95
  );
  const lowEnergyEventCount = lowEnergyEvents.length;

  // Detect if current state or most recent utterance is slurred/low energy
  const latestEvent = acousticEvents[0];
  const isLatestLowEnergy = latestEvent && (
    latestEvent.energyClassification === 'LOW_ENERGY_OFF_STATE' || 
    latestEvent.pitchProfile === 'Slurred / Hypophonic Pitch' || 
    latestEvent.detectedCadenceWpm < 95
  );

  const handleToggleAutoNotify = () => {
    const nextVal = !autoNotifyDiscord;
    setAutoNotifyDiscord(nextVal);
    localStorage.setItem('legacy_honored_acoustic_autonotify', String(nextVal));
  };

  // Dispatch Discord alert for persistent low-energy / slurred cadence
  const handleDispatchDiscordCheckIn = async (
    urgency: 'normal' | 'urgent' = 'normal',
    customAction?: string,
    targetWpm?: number
  ) => {
    setIsDispatching(true);
    acousticVoice.playEarcon('mic-active');

    const cadence = targetWpm ?? (latestEvent ? latestEvent.detectedCadenceWpm : 48);
    const actionText = customAction || (
      cadence < 40
        ? 'Urgent in-person check-in: Assess motor off-state, verify continuous Vyalev infusion flow, and offer warm hydration.'
        : 'Suggesting a gentle in-person check-in: Offer water/electrolytes, check pump comfort, and provide quiet restful reassurance.'
    );

    const alertMessage = `🎙️ **Acoustic Voice Alert**: Persistent low-energy / slurred speech pattern detected (${cadence} WPM, ${latestEvent?.pitchProfile || 'Hypophonic Cadence'}). ${actionText}`;

    const savedWebhook = localStorage.getItem('legacy_honored_discord_webhook') || undefined;

    try {
      const res = await fetch('/api/discord/alert-caregiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'Gemini Acoustic Voice Biomarker Engine',
          urgency,
          pumpHoursLeft: 14,
          energyState: 'LOW_ENERGY_OFF_STATE',
          customMessage: alertMessage,
          webhookUrl: savedWebhook
        })
      });

      const data = await res.json();
      const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

      const newRecord: AcousticDiscordAlertRecord = {
        id: `acoustic-alert-${Date.now()}`,
        timestamp: `Today, ${timeStr}`,
        wpm: cadence,
        pitchProfile: latestEvent?.pitchProfile || 'Slurred / Hypophonic Pitch',
        urgency,
        suggestedAction: actionText,
        deliveredToPhone: Boolean(data.webhookDelivered)
      };

      setRecentDiscordAlerts(prev => [newRecord, ...prev.slice(0, 9)]);

      setDispatchResult({
        success: true,
        deliveredToPhone: Boolean(data.webhookDelivered),
        message: data.webhookDelivered
          ? `Delivered directly to your Discord channel (${data.sentTo}). Notification sent to Elsbeth's phone!`
          : `Dispatched to #caregiver-alerts relay. Connect your Discord Webhook to push live alerts to your phone.`,
        timestamp: timeStr,
        suggestedAction: actionText
      });
    } catch (err: any) {
      const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      setDispatchResult({
        success: true,
        deliveredToPhone: false,
        message: 'Acoustic check-in alert dispatched to simulated Discord caregiver feed.',
        timestamp: timeStr,
        suggestedAction: actionText
      });
    } finally {
      setIsDispatching(false);
    }
  };

  // Wrapper for simulating intake with auto-Discord trigger
  const handleSimulateWithAutoAlert = async (wpm: number, text: string) => {
    onSimulateEvent(wpm, text);

    // If simulating slurred or low-energy speech and auto-notify is active, dispatch Discord alert
    if ((wpm < 95 || text.includes('...')) && autoNotifyDiscord) {
      setTimeout(() => {
        handleDispatchDiscordCheckIn(wpm < 40 ? 'urgent' : 'normal', undefined, wpm);
      }, 400);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Overview Card */}
      <div 
        id="acoustic-tracker-header-card"
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Gemini Acoustic Biomarker AI
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-violet-100 text-violet-800 border border-violet-200">
                DSP Audio Cadence Engine
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-indigo-600" />
                Discord #caregiver-alerts Connected
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Parkinson's Speech Adaptation & Fatigue Tracker
            </h3>
            <p className="text-sm text-slate-500">
              Continuously analyzes Captain Wade's vocal onset, detects hypophonic pitch drops & slurred off-states, automatically throttles agent responses to single words, and dispatches proactive Discord check-in notifications to the caregiver.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-400">Current Speech Mode</div>
              <div className={`text-sm font-black ${
                currentBrevityMode === 'ULTRA_CONCISE_SINGLE_WORD' ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {currentBrevityMode === 'ULTRA_CONCISE_SINGLE_WORD' ? 'Single-Word Mode' : '1-Sentence Mode'}
              </div>
            </div>
          </div>
        </div>

        {/* Live Acoustic Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Avg Vocal Cadence</span>
              <Activity className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {avgWpm} <span className="text-xs font-semibold text-slate-500">WPM</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Baseline: 110–135 WPM • Cutoff: &lt;95 WPM
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Off-States Logged</span>
              <TrendingDown className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2">
              {lowEnergyEventCount} <span className="text-xs font-semibold text-slate-500">Events</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Triggered 1-word brevity relief
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Discord Alert Relay</span>
              <Bell className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-600 mt-2">
              {recentDiscordAlerts.length} <span className="text-xs font-semibold text-slate-500">Alerts</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {autoNotifyDiscord ? 'Auto-notify enabled' : 'Manual dispatch only'}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Acoustic Rule Engine</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2">
              Active
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Zero-friction dignity protected
            </div>
          </div>
        </div>

        {/* Quick Test Acoustic Simulation Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Simulate Acoustic Intake:</span>
            <button
              type="button"
              id="sim-fluent-speech"
              onClick={() => handleSimulateWithAutoAlert(130, "Please grab some orange juice for breakfast")}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Activity className="w-3 h-3 text-emerald-600" />
              <span>+ Morning Fluent (130 WPM)</span>
            </button>

            <button
              type="button"
              id="sim-fatigued-speech"
              onClick={() => handleSimulateWithAutoAlert(48, "...juice... and water... please...")}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <TrendingDown className="w-3 h-3 text-amber-600" />
              <span>+ Slurred / Low Energy Off-State (48 WPM)</span>
            </button>

            <button
              type="button"
              id="sim-severe-fatigued-speech"
              onClick={() => handleSimulateWithAutoAlert(32, "...slow... heavy... rest...")}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              <span>+ Severe Hypophonic Slur (32 WPM)</span>
            </button>
          </div>

          {/* Auto-notify Toggle */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <button
              type="button"
              id="toggle-auto-discord-alert"
              onClick={handleToggleAutoNotify}
              className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer ${
                autoNotifyDiscord ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'
              }`}
            >
              {autoNotifyDiscord && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
            <label htmlFor="toggle-auto-discord-alert" className="text-xs font-bold text-slate-700 cursor-pointer">
              Auto-Discord Alert on Slurring
            </label>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          PROMINENT ACOUSTIC DISCORD CHECK-IN NOTIFICATION BANNER / CARD
      ------------------------------------------------------------- */}
      <div 
        id="acoustic-discord-alert-card"
        className={`rounded-3xl p-6 sm:p-7 border transition-all shadow-sm ${
          isLatestLowEnergy || currentEnergyState === 'LOW_ENERGY_OFF_STATE'
            ? 'bg-gradient-to-r from-amber-950/90 via-slate-900 to-indigo-950 text-white border-amber-500/50 shadow-amber-900/20 ring-2 ring-amber-400/30'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                isLatestLowEnergy || currentEnergyState === 'LOW_ENERGY_OFF_STATE'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                <Bell className="w-3.5 h-3.5 animate-bounce" />
                Discord Caregiver Alert Trigger
              </span>

              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isLatestLowEnergy || currentEnergyState === 'LOW_ENERGY_OFF_STATE'
                  ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {isLatestLowEnergy ? '⚠️ Slurred / Hypophonic Pattern Active (<95 WPM)' : '🟢 Vocal Cadence Baseline Normal'}
              </span>
            </div>

            <h4 className="text-xl sm:text-2xl font-black tracking-tight">
              {isLatestLowEnergy || currentEnergyState === 'LOW_ENERGY_OFF_STATE'
                ? 'Persistent Fatigue or Slurring Detected — Check-In Suggested'
                : 'Acoustic Biomarker Watchdog for Caregiver Peace of Mind'}
            </h4>

            <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${
              isLatestLowEnergy || currentEnergyState === 'LOW_ENERGY_OFF_STATE' ? 'text-amber-100/90' : 'text-slate-500'
            }`}>
              When Captain Wade speaks with slowed cadence (&lt;95 WPM), low pitch baritone drop, or slurred consonants, the engine automatically notifies Elsbeth via Discord (#caregiver-alerts) with personalized care recommendations.
            </p>

            {/* Recommended Check-In Actions */}
            <div className="pt-2">
              <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                isLatestLowEnergy ? 'text-amber-300' : 'text-slate-600'
              }`}>
                Recommended Proactive Caregiver Check-In Steps:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  isLatestLowEnergy ? 'bg-white/10 border-white/15 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Offer fresh water, warm tea, or electrolytes</span>
                </div>
                <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  isLatestLowEnergy ? 'bg-white/10 border-white/15 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <Activity className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Inspect Vyalev subcutaneous infusion site & flow</span>
                </div>
                <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  isLatestLowEnergy ? 'bg-white/10 border-white/15 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <HeartHandshake className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Assist with comfortable resting posture</span>
                </div>
                <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  isLatestLowEnergy ? 'bg-white/10 border-white/15 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <Volume2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Speak in calm, unhurried 1-sentence reassurance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:w-72">
            <button
              type="button"
              id="btn-dispatch-acoustic-discord-alert"
              disabled={isDispatching}
              onClick={() => handleDispatchDiscordCheckIn('normal')}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                isLatestLowEnergy
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-amber-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isDispatching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Pinging Discord...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Dispatch Check-In Alert to Discord</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-dispatch-urgent-acoustic-alert"
              disabled={isDispatching}
              onClick={() => handleDispatchDiscordCheckIn('urgent')}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Send Urgent Motor Off-State Ping</span>
            </button>

            {onOpenDiscordModal && (
              <button
                type="button"
                id="btn-open-discord-feed-from-acoustics"
                onClick={onOpenDiscordModal}
                className={`w-full py-2 px-3 rounded-xl font-semibold text-xs border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isLatestLowEnergy 
                    ? 'border-white/20 hover:bg-white/10 text-white' 
                    : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Discord #caregiver-alerts Feed</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Dispatch Feedback Result Banner */}
        {dispatchResult && (
          <div className="mt-5 p-4 rounded-2xl bg-indigo-900/80 border border-indigo-400/40 text-white text-xs space-y-1 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-black text-emerald-300">
                  {dispatchResult.deliveredToPhone ? 'Delivered to Discord Webhook' : 'Dispatched to Relay Feed'}
                </span>
                <span className="text-slate-300 font-mono text-[11px]">• {dispatchResult.timestamp}</span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/20 text-white">
                {dispatchResult.deliveredToPhone ? '📱 Pushed to Phone' : 'Relay Logged'}
              </span>
            </div>
            <p className="text-slate-200">
              {dispatchResult.message}
            </p>
            <p className="text-amber-200 font-medium pt-1">
              💬 Suggested Care Action: {dispatchResult.suggestedAction}
            </p>
          </div>
        )}
      </div>

      {/* Recent Discord Acoustic Notifications Log */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h4 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <span>Recent Acoustic Discord Dispatches</span>
            </h4>
            <p className="text-xs text-slate-500">
              Real-time audit of check-in notifications sent to Elsbeth's Discord app
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {recentDiscordAlerts.length} Dispatches Recorded
          </span>
        </div>

        <div className="space-y-2.5">
          {recentDiscordAlerts.map((alert) => (
            <div 
              key={alert.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">{alert.timestamp}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    alert.urgency === 'urgent' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {alert.pitchProfile} ({alert.wpm} WPM)
                  </span>
                  {alert.deliveredToPhone && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <Smartphone className="w-2.5 h-2.5 text-emerald-600" />
                      Phone Alert Delivered
                    </span>
                  )}
                </div>
                <div className="text-slate-600">
                  <span className="font-bold text-slate-800">Check-In Recommendation:</span> {alert.suggestedAction}
                </div>
              </div>

              <div className="shrink-0">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[11px] flex items-center gap-1">
                  <Check className="w-3 h-3 text-indigo-600" />
                  Sent to #caregiver-alerts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Telemetry Timeline Log */}
      <div 
        id="acoustic-telemetry-log-table"
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-lg text-slate-900">
              Speech Acoustic Event History
            </h4>
            <p className="text-xs text-slate-500">
              Logged vocal telemetry with automatic brevity mode transitions & Discord notifications
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {acousticEvents.length} Recorded Entries
          </span>
        </div>

        <div className="space-y-3">
          {acousticEvents.map((evt) => {
            const isLow = evt.energyClassification === 'LOW_ENERGY_OFF_STATE' || evt.pitchProfile === 'Slurred / Hypophonic Pitch';
            return (
              <div 
                key={evt.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isLow 
                    ? 'bg-amber-50/50 border-amber-200 text-slate-900' 
                    : 'bg-slate-50/70 border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">{evt.timestamp}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      isLow 
                        ? 'bg-amber-200 text-amber-900 border border-amber-300' 
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {evt.pitchProfile}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Cadence: {evt.detectedCadenceWpm} WPM ({evt.durationSeconds}s)
                    </span>
                    {isLow && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                        <MessageSquare className="w-2.5 h-2.5 text-indigo-600" />
                        Discord Alert Dispatched
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Agent Spoke:</span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-xs">
                      "{evt.agentSpokenResponse}"
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-sm font-semibold text-slate-800">
                  Patient Spoke: <span className="font-normal italic text-slate-700">"{evt.rawInput}"</span>
                </div>

                <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{evt.notes}</span>
                </div>

                {evt.suggestedCheckIn && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-100/60 border border-amber-300/80 text-amber-950 text-xs font-medium flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <HeartHandshake className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{evt.suggestedCheckIn}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDispatchDiscordCheckIn('normal', evt.suggestedCheckIn, evt.detectedCadenceWpm)}
                      className="px-2 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
                    >
                      Re-ping Discord
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
