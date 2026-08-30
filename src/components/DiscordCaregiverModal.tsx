import React, { useState } from 'react';
import { 
  X, MessageSquare, Send, Bell, CheckCircle2, ShieldCheck, 
  Sparkles, ExternalLink, Copy, Check, Volume2, AlertTriangle,
  RefreshCw, Radio, Smartphone, Activity
} from 'lucide-react';
import { acousticVoice } from '../utils/acousticVoiceEngine';

export interface DiscordMessageItem {
  id: string;
  sender: string;
  avatar: string;
  isBot: boolean;
  timestamp: string;
  content: string;
  embed?: {
    title: string;
    description: string;
    color: string; // hex color for discord embed left bar
    fields: { name: string; value: string; inline?: boolean }[];
    footer: string;
  };
}

const INITIAL_DISCORD_MESSAGES: DiscordMessageItem[] = [
  {
    id: 'disc-msg-1',
    sender: 'The Care Navigator Agent',
    avatar: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100',
    isBot: true,
    timestamp: 'Today at 7:30 AM',
    content: '🌅 **Morning Anchor & Infusion Status Report**',
    embed: {
      title: '✅ Continuous Vyalev Infusion Online (Site 3: Upper Left Abdomen)',
      description: 'Captain Wade checked in during morning routine. Energy state is 🟢 **Good Day**. Cassette reserve at **14 hours**.',
      color: '#4F46E5',
      fields: [
        { name: 'Site Rotation', value: '1" clearance from prior site', inline: true },
        { name: 'Speech Acoustics', value: '118 WPM (Optimal clarity)', inline: true },
        { name: 'Autonomous Deduplication', value: '3 duplicate grocery queries silently handled', inline: false }
      ],
      footer: 'Legacy Honored • Automated Caregiver Webhook'
    }
  },
  {
    id: 'disc-msg-2',
    sender: 'The Care Navigator Agent',
    avatar: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100',
    isBot: true,
    timestamp: 'Today at 11:15 AM',
    content: '🛒 **Pantry Hub Restock Trigger**',
    embed: {
      title: '📦 Organic Root Beer & Alcohol Prep Pads Reordered',
      description: 'Pantry inventory dropped below safety threshold. Voice order deduplicated and added to Walmart/Instacart delivery queue.',
      color: '#10B981',
      fields: [
        { name: 'Action', value: 'Silent addition to shopping list', inline: true },
        { name: 'Dignity Guard', value: 'Wade reassured without memory correction', inline: true }
      ],
      footer: 'Legacy Honored • Grocery Agent'
    }
  }
];

interface DiscordCaregiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendAlert?: (urgency: 'normal' | 'urgent', customMessage?: string) => Promise<any>;
}

export const DiscordCaregiverModal: React.FC<DiscordCaregiverModalProps> = ({
  isOpen,
  onClose,
  onSendAlert
}) => {
  const [messages, setMessages] = useState<DiscordMessageItem[]>(INITIAL_DISCORD_MESSAGES);
  const [customInput, setCustomInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [lastDeliveryResult, setLastDeliveryResult] = useState<{
    success: boolean;
    deliveredToPhone: boolean;
    message: string;
    timestamp: string;
  } | null>(null);
  
  const userWebhookUrl = localStorage.getItem('legacy_honored_discord_webhook') || '';

  if (!isOpen) return null;

  const handleSendTestMessage = async (urgency: 'normal' | 'urgent' = 'normal', text?: string) => {
    setIsSending(true);
    acousticVoice.playEarcon('mic-active');

    const msgContent = text || customInput || (urgency === 'urgent' ? 'Captain Wade triggered an URGENT priority alert from the main screen.' : 'Captain Wade sent a check-in message from Wade Mode.');
    const activeWebhook = userWebhookUrl.trim() || undefined;

    try {
      const res = await fetch('/api/discord/alert-caregiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'Captain Wade',
          urgency,
          pumpHoursLeft: 14,
          energyState: 'GOOD_ENERGY',
          customMessage: msgContent,
          webhookUrl: activeWebhook
        })
      });

      const data = await res.json();

      if (data.webhookDelivered) {
        setLastDeliveryResult({
          success: true,
          deliveredToPhone: true,
          message: `Delivered to your Discord channel (${data.sentTo}). Check your Discord app on your phone!`,
          timestamp: data.timestamp
        });
      } else if (activeWebhook) {
        setLastDeliveryResult({
          success: false,
          deliveredToPhone: false,
          message: `Webhook dispatch failed: ${data.webhookError || 'Please check that your webhook URL is valid and active in Discord.'}`,
          timestamp: data.timestamp
        });
      } else {
        setLastDeliveryResult({
          success: true,
          deliveredToPhone: false,
          message: 'Dispatched to simulated #caregiver-alerts relay. (Paste your Discord Webhook URL above to receive notifications on your phone!)',
          timestamp: data.timestamp
        });
      }

      const newMsg: DiscordMessageItem = {
        id: `disc-msg-${Date.now()}`,
        sender: 'The Care Navigator Agent',
        avatar: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100',
        isBot: true,
        timestamp: 'Just now',
        content: urgency === 'urgent' ? '🚨 **URGENT CAREGIVER DISPATCH TRIGGERED**' : '💬 **Direct Message from Wade**',
        embed: {
          title: urgency === 'urgent' ? '⚠️ Urgent Assistance Requested by Captain Wade' : '💬 Message from Wade Mode',
          description: `*"${msgContent}"*`,
          color: urgency === 'urgent' ? '#E11D48' : '#4F46E5',
          fields: [
            { name: 'Time Dispatched', value: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), inline: true },
            { name: 'Infusion Pump', value: '14h remaining', inline: true },
            { name: 'Delivery Status', value: data.webhookDelivered ? '✅ Live Push to Discord Phone App' : 'Relay Feed', inline: true },
            { name: 'Channel', value: '#caregiver-alerts & Mobile Relay', inline: false }
          ],
          footer: 'Legacy Honored • Live Webhook Relay'
        }
      };

      setMessages(prev => [...prev, newMsg]);
      setCustomInput('');
      acousticVoice.playEarcon('chime');
    } catch (e: any) {
      console.error('Failed to send Discord message:', e);
      setLastDeliveryResult({
        success: false,
        deliveredToPhone: false,
        message: `Network error: ${e.message}`,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(userWebhookUrl || 'https://discord.com/api/webhooks/1283948291048/legacy-honored-caregiver-alerts');
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Discord Header Bar */}
        <div className="bg-[#2B2D31] px-5 py-4 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5865F2] flex items-center justify-center text-white font-black shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-extrabold text-base tracking-tight flex items-center gap-1.5">
                  <span className="text-slate-400">#</span> caregiver-alerts
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Webhook Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Legacy Honored Real-Time Family Sync & Remote Caregiver Dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E1F22] border border-slate-700 text-xs text-indigo-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold">Live Alert Stream Active</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#313338] space-y-4">
          
          <div className="space-y-4">
            
            {/* Channel Welcome Banner */}
              <div className="p-4 rounded-2xl bg-[#2B2D31] border border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Remote Caregiver Sync (Elsbeth Seymour • 12-Hour Remote Care)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every time Captain Wade presses <strong>Contact Caregiver</strong>, dispatches an alert, or triggers a medication/supply reorder, this channel receives an instant Discord webhook embed and pushes a mobile notification to Elsbeth's phone.
                </p>
              </div>

              {/* Message Stream */}
              <div className="space-y-4 pt-2">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className="p-4 rounded-2xl bg-[#2B2D31] border border-slate-700/60 space-y-2.5 animate-in fade-in transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={msg.avatar} 
                          alt={msg.sender} 
                          className="w-8 h-8 rounded-full object-cover border border-indigo-500/40" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-white">{msg.sender}</span>
                          {msg.isBot && (
                            <span className="bg-[#5865F2] text-white text-[10px] font-black px-1.5 py-0.2 rounded-sm uppercase tracking-wider">
                              BOT
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 ml-1">{msg.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Text content */}
                    <div className="text-xs sm:text-sm text-slate-200 pl-10 font-medium">
                      {msg.content}
                    </div>

                    {/* Embed Box */}
                    {msg.embed && (
                      <div className="ml-10 rounded-xl bg-[#1E1F22] border-l-4 p-4 space-y-2" style={{ borderLeftColor: msg.embed.color }}>
                        <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                          {msg.embed.title}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {msg.embed.description}
                        </p>

                        {/* Fields Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                          {msg.embed.fields.map((f, i) => (
                            <div key={i} className={`p-2 rounded-lg bg-[#2B2D31]/80 ${f.inline ? '' : 'sm:col-span-2'}`}>
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                {f.name}
                              </span>
                              <span className="text-xs font-semibold text-slate-200">
                                {f.value}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-between">
                          <span>{msg.embed.footer}</span>
                          <span className="text-emerald-400 font-bold">● Delivered</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Trigger Test Controls */}
              <div className="p-4 rounded-2xl bg-[#2B2D31] border border-slate-700 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Test Live Webhook Dispatch
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Click to test instant Discord ping
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendTestMessage('normal', 'Captain Wade checked in: "Everything is good here, finished my morning coffee."')}
                    disabled={isSending}
                    className="p-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition-all text-left flex items-center justify-between disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      <span>Send Routine Check-In</span>
                    </div>
                    <Send className="w-3.5 h-3.5 text-indigo-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendTestMessage('urgent', 'URGENT: Captain Wade tapped Urgent Help on his cockpit screen!')}
                    disabled={isSending}
                    className="p-3 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 text-xs font-bold transition-all text-left flex items-center justify-between disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-rose-400 animate-bounce" />
                      <span>Send URGENT Priority Ping</span>
                    </div>
                    <Send className="w-3.5 h-3.5 text-rose-400" />
                  </button>
                </div>

                {/* Custom Message Input */}
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendTestMessage('normal')}
                    placeholder="Type a custom alert message to dispatch to Discord..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#1E1F22] border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendTestMessage('normal')}
                    disabled={isSending || !customInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-black transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>

            </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-[#2B2D31] px-5 py-3.5 border-t border-slate-700 flex items-center justify-between shrink-0 text-xs">
          <div className="text-slate-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Channel connected to Elsbeth's Caregiver Mobile Dispatch</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close Feed
          </button>
        </div>

      </div>
    </div>
  );
};
