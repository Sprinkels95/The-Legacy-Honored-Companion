import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Bell, Smartphone, ShieldCheck, CheckCircle2, 
  Send, ExternalLink, RefreshCw, AlertTriangle, Activity, Zap, 
  Check, Copy, Terminal, PhoneCall, Radio, UserCheck, Clock
} from 'lucide-react';
import { acousticVoice } from '../utils/acousticVoiceEngine';

interface Props {
  onOpenDiscordModal?: () => void;
}

interface DiscordFeedItem {
  id: string;
  sender: string;
  timestamp: string;
  urgency: 'normal' | 'urgent';
  title: string;
  description: string;
  pumpHours: number;
  energyState: string;
  deliveredToPhone: boolean;
}

export const CaregiverAlertsOpsSection: React.FC<Props> = ({ onOpenDiscordModal }) => {
  const [webhookUrl, setWebhookUrl] = useState<string>(() => {
    return localStorage.getItem('legacy_honored_discord_webhook') || '';
  });
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [customText, setCustomText] = useState('');
  
  const [deliveryResult, setDeliveryResult] = useState<{
    success: boolean;
    deliveredToPhone: boolean;
    message: string;
    timestamp: string;
  } | null>(null);

  const [isCallingPhone, setIsCallingPhone] = useState(false);
  const [phoneCallResult, setPhoneCallResult] = useState<{
    success: boolean;
    message: string;
    callSid?: string;
  } | null>(null);

  const [feedItems, setFeedItems] = useState<DiscordFeedItem[]>([
    {
      id: 'feed-1',
      sender: 'Agent 4 (Deduplication Relay)',
      timestamp: 'Today, 8:05 AM',
      urgency: 'normal',
      title: 'Morning Schedule Briefing Confirmed',
      description: 'Captain Wade confirmed his morning care plan: "Morning Briefing Synced • Speech Therapy 10:00 AM • Low Protein Breakfast".',
      pumpHours: 14,
      energyState: 'GOOD_ENERGY',
      deliveredToPhone: true
    },
    {
      id: 'feed-2',
      sender: 'Captain Wade (Direct Touch)',
      timestamp: 'Today, 11:42 AM',
      urgency: 'normal',
      title: 'Caregiver Check-In',
      description: 'Captain Wade checked in via the "Contact Elsbeth" direct button on his home screen.',
      pumpHours: 11,
      energyState: 'GOOD_ENERGY',
      deliveredToPhone: true
    },
    {
      id: 'feed-3',
      sender: 'Gemini Acoustic Biomarker Engine',
      timestamp: 'Today, 3:15 PM',
      urgency: 'normal',
      title: '🎙️ Persistent Slurring / Low Vocal Cadence Detected',
      description: 'Acoustic voice analysis detected persistent low-energy / slurred speech pattern (42 WPM). Switched agent to 1-word brevity and notified caregiver to suggest check-in (hydration, continuous pump check, quiet rest).',
      pumpHours: 11,
      energyState: 'LOW_ENERGY_OFF_STATE',
      deliveredToPhone: true
    }
  ]);

  const handleSaveWebhook = (urlToSet?: string) => {
    const val = (urlToSet !== undefined ? urlToSet : webhookUrl).trim();
    if (!val) {
      localStorage.removeItem('legacy_honored_discord_webhook');
      setWebhookUrl('');
      setSaveStatus('Webhook cleared. Using default simulated relay.');
    } else {
      localStorage.setItem('legacy_honored_discord_webhook', val);
      setWebhookUrl(val);
      setSaveStatus('✅ Discord Webhook saved! All Wade Mode alerts will now ping your phone app directly.');
    }
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleSendAlert = async (urgency: 'normal' | 'urgent' = 'normal', text?: string) => {
    setIsSending(true);
    acousticVoice.playEarcon('mic-active');

    const msg = text || customText || (urgency === 'urgent' 
      ? 'Captain Wade triggered an URGENT priority alert from the Volcano Ops Console.' 
      : 'Routine check-in test dispatched from Volcano Ops Console.');

    const activeWebhook = webhookUrl.trim() || localStorage.getItem('legacy_honored_discord_webhook') || undefined;

    try {
      const res = await fetch('/api/discord/alert-caregiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'Ops Console (Caregiver Admin)',
          urgency,
          pumpHoursLeft: 14,
          energyState: 'GOOD_ENERGY',
          customMessage: msg,
          webhookUrl: activeWebhook
        })
      });

      const data = await res.json();
      const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

      if (data.webhookDelivered) {
        setDeliveryResult({
          success: true,
          deliveredToPhone: true,
          message: `Delivered directly to your Discord channel (${data.sentTo}). Notification sent to your phone!`,
          timestamp: timeStr
        });
      } else if (activeWebhook) {
        setDeliveryResult({
          success: false,
          deliveredToPhone: false,
          message: `Webhook dispatch failed: ${data.webhookError || 'Please check that your Discord Webhook URL is valid.'}`,
          timestamp: timeStr
        });
      } else {
        setDeliveryResult({
          success: true,
          deliveredToPhone: false,
          message: 'Dispatched to simulated #caregiver-alerts relay. Paste your Discord Webhook URL above to receive notifications on your phone!',
          timestamp: timeStr
        });
      }

      // Prepend to live local feed
      const newItem: DiscordFeedItem = {
        id: `feed-${Date.now()}`,
        sender: 'Ops Console',
        timestamp: `Today, ${timeStr}`,
        urgency,
        title: urgency === 'urgent' ? '⚠️ URGENT Priority Assistance Alert' : '💬 Caregiver Check-In',
        description: msg,
        pumpHours: 14,
        energyState: 'GOOD_ENERGY',
        deliveredToPhone: data.webhookDelivered || false
      };

      setFeedItems(prev => [newItem, ...prev]);
      setCustomText('');
      acousticVoice.playEarcon('chime');
    } catch (e: any) {
      console.error('Failed to dispatch alert:', e);
      setDeliveryResult({
        success: false,
        deliveredToPhone: false,
        message: `Network error: ${e.message}`,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDispatchTwilioCall = async (callType: 'caregiver-urgent' | 'pharmacy-refill' | 'routine-checkin') => {
    setIsCallingPhone(true);
    acousticVoice.playEarcon('mic-active');
    setPhoneCallResult(null);

    try {
      const res = await fetch('/api/telephony/dispatch-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callType,
          customMessage: customText.trim() || undefined,
          medicationName: 'Vyalev 24h Subcutaneous Infusion'
        })
      });

      const data = await res.json();
      acousticVoice.playEarcon('chime');
      setPhoneCallResult({
        success: data.success,
        message: data.message || 'Call dispatched!',
        callSid: data.callSid
      });
    } catch (err: any) {
      console.error('Error placing Twilio call:', err);
      setPhoneCallResult({
        success: false,
        message: err.message || 'Failed to place call.'
      });
    } finally {
      setIsCallingPhone(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Ops Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#5865F2] text-white flex items-center justify-center shadow-xs shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                Caregiver Alerts & Discord Phone Notification Hub
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                webhookUrl.startsWith('http')
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {webhookUrl.startsWith('http') ? '🟢 Live Webhook Connected' : '🟡 Simulated Relay'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct sub-second webhook integration sending Wade Mode alerts, urgent phone rings, and daily briefings straight to your phone.
            </p>
          </div>
        </div>

        {onOpenDiscordModal && (
          <button
            type="button"
            onClick={onOpenDiscordModal}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all flex items-center gap-2 shadow-xs shrink-0 cursor-pointer self-start md:self-auto"
          >
            <ExternalLink className="w-4 h-4 text-indigo-400" />
            <span>Open Fullscreen Discord Modal</span>
          </button>
        )}
      </div>

      {/* Primary Live Notification & Test Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#1E1F22] border border-indigo-500/30 text-white space-y-5 shadow-lg">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            <h4 className="font-extrabold text-sm text-white">
              Caregiver Mobile Push & Emergency Alerts
            </h4>
          </div>
          <span className="text-xs text-indigo-300 font-medium">
            Active Caregiver Link • Instant Mobile Dispatch
          </span>
        </div>

        {/* Quick Webhook Status & Update Endpoint */}
        <div className="p-3.5 rounded-2xl bg-[#2B2D31] border border-slate-700/80 space-y-2.5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-slate-200">Caregiver Alert Endpoint:</span>
              <span className="text-emerald-300 font-medium font-mono text-[11px]">
                {webhookUrl.startsWith('http') ? '🟢 Live Mobile Push Active' : '🟡 Simulated Relay Online'}
              </span>
            </div>
            {saveStatus && (
              <span className="text-[11px] text-emerald-300 font-bold animate-in fade-in">
                {saveStatus}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="Paste new Discord Webhook URL (https://discord.com/api/webhooks/...)"
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#1E1F22] border border-slate-700 text-xs text-indigo-200 font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => handleSaveWebhook()}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
            >
              Update URL
            </button>
            {webhookUrl && (
              <button
                type="button"
                onClick={() => handleSaveWebhook('')}
                className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 text-xs font-semibold transition-all shrink-0 cursor-pointer"
                title="Clear saved webhook"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Quick Test Trigger Buttons */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Test Instant Notification Dispatch:
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Direct HTTP Push
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSendAlert('normal', '🧪 Routine Check-in Test: "Hi Elsbeth, Captain Wade is doing well today!"')}
              disabled={isSending}
              className="p-3.5 rounded-2xl bg-[#2B2D31] hover:bg-[#35373C] border border-indigo-500/30 text-indigo-200 text-xs font-bold transition-all flex items-center justify-between disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-300">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block font-black text-white">Send Routine Test Ping</span>
                  <span className="text-[10px] text-slate-400">Standard notification to caregiver</span>
                </div>
              </div>
              <Send className="w-4 h-4 text-indigo-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleSendAlert('urgent', '🚨 URGENT TEST ALERT: Captain Wade triggered urgent assistance dispatch!')}
              disabled={isSending}
              className="p-3.5 rounded-2xl bg-rose-950/40 hover:bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs font-bold transition-all flex items-center justify-between disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-rose-600/30 text-rose-300">
                  <Bell className="w-4 h-4 animate-bounce" />
                </div>
                <div className="text-left">
                  <span className="block font-black text-rose-100">Send Urgent Phone Ping</span>
                  <span className="text-[10px] text-rose-300">High-priority sound alert for emergencies</span>
                </div>
              </div>
              <Send className="w-4 h-4 text-rose-400 shrink-0" />
            </button>
          </div>

          {/* Custom message dispatcher */}
          <div className="flex gap-2 pt-1">
            <input 
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Or type a custom caregiver dispatch note..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#2B2D31] border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customText.trim()) {
                  handleSendAlert('normal');
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleSendAlert('normal')}
              disabled={!customText.trim() || isSending}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>

        {/* Dispatch Feedback Banner */}
        {deliveryResult && (
          <div className={`p-3.5 rounded-2xl border text-xs font-semibold animate-in fade-in ${
            deliveryResult.deliveredToPhone
              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
              : deliveryResult.success 
                ? 'bg-indigo-950/70 border-indigo-500/40 text-indigo-200'
                : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
          }`}>
            <div className="flex items-center gap-2 font-bold mb-1">
              {deliveryResult.deliveredToPhone ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Delivered to Your Caregiver Phone / Discord!</span>
                </>
              ) : deliveryResult.success ? (
                <>
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>Simulated Relay Triggered</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Dispatch Alert</span>
                </>
              )}
              <span className="text-[10px] text-slate-400 font-normal ml-auto">
                {deliveryResult.timestamp}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-95">
              {deliveryResult.message}
            </p>
          </div>
        )}
      </div>

      {/* Real Outbound Telephony Calling (Twilio Carrier) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">
                Real Outbound Phone Calling (Twilio Telephony Carrier)
              </h4>
              <p className="text-xs text-slate-400">
                From: <span className="font-mono text-emerald-300 font-bold">(951) 338-8439</span> &rarr; Ringing: <span className="font-mono text-indigo-300 font-bold">(949) 441-0137</span>
              </p>
            </div>
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30 self-start sm:self-auto">
            Live PSTN Gateway Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleDispatchTwilioCall('caregiver-urgent')}
            disabled={isCallingPhone}
            className="p-4 rounded-2xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-left transition-all flex items-center justify-between disabled:opacity-50 cursor-pointer shadow-xs group"
          >
            <div className="space-y-1">
              <span className="block font-black text-xs text-rose-100 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-rose-400 animate-bounce" />
                Trigger Urgent Emergency Phone Call
              </span>
              <span className="text-[11px] text-rose-300 block">
                Actually dials (949) 441-0137 and speaks alert via Amazon Polly voice
              </span>
            </div>
            <PhoneCall className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleDispatchTwilioCall('pharmacy-refill')}
            disabled={isCallingPhone}
            className="p-4 rounded-2xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-left transition-all flex items-center justify-between disabled:opacity-50 cursor-pointer shadow-xs group"
          >
            <div className="space-y-1">
              <span className="block font-black text-xs text-emerald-100 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-400" />
                Trigger Specialty Pharmacy Voice Refill Call
              </span>
              <span className="text-[11px] text-emerald-300 block">
                Places outbound call & speaks Vyalev 24h pump refill authorization
              </span>
            </div>
            <PhoneCall className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
          </button>
        </div>

        {phoneCallResult && (
          <div className={`p-3.5 rounded-2xl border text-xs font-semibold animate-in fade-in ${
            phoneCallResult.rateLimited
              ? 'bg-amber-950/80 border-amber-500/60 text-amber-200'
              : phoneCallResult.success 
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200' 
                : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
          }`}>
            <div className="flex items-center gap-2 font-bold mb-0.5">
              {phoneCallResult.rateLimited ? (
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              ) : phoneCallResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              )}
              <span>
                {phoneCallResult.rateLimited 
                  ? 'Escalation Guardrail: 15-Minute Cooldown Active' 
                  : phoneCallResult.success 
                    ? 'Twilio Call Dispatched' 
                    : 'Telephony Dispatch Notice'}
              </span>
              {phoneCallResult.callSid && (
                <span className="text-[10px] font-mono text-slate-400 ml-auto">{phoneCallResult.callSid}</span>
              )}
            </div>
            <p className="text-[11px] opacity-95">{phoneCallResult.message}</p>
          </div>
        )}
      </div>

      {/* Live Message Feed & History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Live Caregiver Alert Stream (#caregiver-alerts)
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {feedItems.length} alerts logged in current session
          </span>
        </div>

        <div className="space-y-3">
          {feedItems.map((item) => (
            <div 
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                item.urgency === 'urgent'
                  ? 'bg-rose-50/60 border-rose-200 shadow-xs'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-xl text-white font-bold text-xs ${
                    item.urgency === 'urgent' ? 'bg-rose-600' : 'bg-[#5865F2]'
                  }`}>
                    {item.urgency === 'urgent' ? '🚨' : '💬'}
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">{item.title}</span>
                    <span className="text-[11px] text-slate-500">{item.sender}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.deliveredToPhone
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.deliveredToPhone ? '✅ Delivered to Phone' : 'Relay Feed'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{item.timestamp}</span>
                </div>
              </div>

              <div className="pt-3 space-y-2">
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {item.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Vyalev Pump: {item.pumpHours}h remaining</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Energy: {item.energyState === 'LOW_ENERGY_OFF_STATE' ? 'Hard Day / Low Energy' : 'Good Energy'}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
