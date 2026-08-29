import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Send, Sparkles, AlertCircle, CheckCircle2, ShieldCheck, 
  Volume2, VolumeX, RefreshCw, ShoppingCart, Package, Coffee, Droplets, 
  HeartPulse, Battery, Apple, Sun, Moon, Clock, ArrowRight
} from 'lucide-react';
import { AgentPersonaId, PantryItem, ShoppingItem, NeedsAuditLog, QuickTapSuggestion } from '../types';
import { acousticVoice } from '../utils/acousticVoiceEngine';

interface Props {
  selectedPersona: AgentPersonaId;
  pantryItems: PantryItem[];
  shoppingItems: ShoppingItem[];
  auditLogs: NeedsAuditLog[];
  onAddAuditLog: (log: NeedsAuditLog) => void;
  onAddShoppingItem: (item: ShoppingItem) => void;
}

export const WadeNeedsIntake: React.FC<Props> = ({
  selectedPersona,
  pantryItems,
  shoppingItems,
  auditLogs,
  onAddAuditLog,
  onAddShoppingItem
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [autoSpeakReassurance, setAutoSpeakReassurance] = useState(true);
  const [lastResponse, setLastResponse] = useState<{
    reassuranceText: string;
    extractedItems: any[];
    status: string;
  } | null>(null);

  const [timeContext, setTimeContext] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');
  const [quickTapSuggestions, setQuickTapSuggestions] = useState<QuickTapSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition & Time Context
  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      setTimeContext('Morning');
    } else if (currentHour >= 12 && currentHour < 17) {
      setTimeContext('Afternoon');
    } else {
      setTimeContext('Evening');
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      setVoiceSupported(true);
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // Automatically submit spoken requests for effortless accessibility
        handleProcessIntake(transcript, 'voice');
      };

      rec.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    fetchQuickTapSuggestions();
  }, [selectedPersona]);

  const fetchQuickTapSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await fetch('/api/agent/needs-tailored-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeContext,
          auditLogs,
          pantryItems
        })
      });
      const data = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setQuickTapSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error('Failed to fetch tailored suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const toggleListening = () => {
    if (!voiceSupported) {
      alert("Microphone recognition is not supported in this browser. Please type your request below.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInputText('');
      acousticVoice.playEarcon('mic-active');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Could not start recognition:', err);
      }
    }
  };

  const speakReassurance = (text: string) => {
    if (!autoSpeakReassurance) return;
    acousticVoice.speak(text, selectedPersona);
  };

  const handleProcessIntake = async (textToProcess?: string, source: 'voice' | 'quick-tap' | 'text-input' = 'text-input') => {
    const query = textToProcess || inputText;
    if (!query.trim()) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/agent/needs-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: query,
          personaId: selectedPersona,
          currentPantry: pantryItems,
          currentShoppingList: shoppingItems,
          source
        })
      });

      const data = await res.json();
      if (data.success) {
        setLastResponse({
          reassuranceText: data.reassuranceText,
          extractedItems: data.extractedItems || [],
          status: data.auditEntry?.status || 'PROCESSED'
        });

        // Add to audit log
        if (data.auditEntry) {
          onAddAuditLog(data.auditEntry);
        }

        // Add any non-duplicate items to the master shopping list
        if (data.extractedItems) {
          data.extractedItems.forEach((item: any) => {
            if (!item.isDuplicate && item.actionTaken === 'ADDED_TO_SHOPPING_QUEUE') {
              onAddShoppingItem({
                id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                name: item.name,
                category: item.category || 'Groceries',
                quantity: item.quantity || 1,
                unit: item.unit || 'units',
                urgency: item.category === 'Medical/Pump Supplies' ? 'High' : 'Medium',
                addedBy: 'Care Navigator Agent',
                dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                purchased: false,
                originPrompt: `Wade verbal request: "${query}"`
              });
            }
          });
        }

        speakReassurance(data.reassuranceText);
        setInputText('');
      }
    } catch (err) {
      console.error('Error processing needs intake:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Droplets': return <Droplets className="w-4 h-4 text-sky-500" />;
      case 'HeartPulse': return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case 'Battery': return <Battery className="w-4 h-4 text-amber-500" />;
      case 'Apple': return <Apple className="w-4 h-4 text-emerald-500" />;
      case 'Coffee': return <Coffee className="w-4 h-4 text-amber-700" />;
      default: return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div id="wade-needs-intake-module" className="space-y-6">
      {/* Primary Voice & Conversational Input Stage */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-serif">
                Captain Wade's Voice & Needs Intake
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Say what you need in your own words. The agent checks household inventory, halts duplicate buys, and reassures immediately.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoSpeakReassurance(!autoSpeakReassurance)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                autoSpeakReassurance
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
            >
              {autoSpeakReassurance ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{autoSpeakReassurance ? 'Vocal Reassurance ON' : 'Audio Muted'}</span>
            </button>
          </div>
        </div>

        {/* Big Accessible Microphone Stage */}
        <div className="py-6 flex flex-col items-center justify-center text-center">
          <div className="relative mb-5">
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-indigo-400/25 animate-ping" />
            )}
            <button
              type="button"
              id="wade-mic-trigger-btn"
              onClick={toggleListening}
              disabled={isProcessing}
              className={`relative z-10 w-24 h-24 md:w-28 md:h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-lg ${
                isListening
                  ? 'bg-rose-500 text-white scale-105 shadow-rose-500/30'
                  : isProcessing
                  ? 'bg-indigo-400 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-102 shadow-indigo-500/25'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-10 h-10 mb-1 animate-bounce" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Listening</span>
                </>
              ) : isProcessing ? (
                <>
                  <RefreshCw className="w-9 h-9 mb-1 animate-spin" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Checking...</span>
                </>
              ) : (
                <>
                  <Mic className="w-10 h-10 mb-1" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Tap to Speak</span>
                </>
              )}
            </button>
          </div>

          <p className="text-sm font-medium text-slate-600 max-w-md">
            {isListening
              ? "Speaking now... Try: \"We need low-acid orange juice and infusion pads\""
              : isProcessing
              ? "Agent cross-referencing pantry inventory and generating reassurance..."
              : "Tap the mic and say what's on your mind. No need to look up pantry stock."}
          </p>

          {/* Fallback Text Input Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleProcessIntake(inputText, 'text-input'); }}
            className="w-full max-w-2xl mt-5 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                id="wade-needs-text-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Or type here (e.g. 'Can we get more low-acid orange juice and batteries?')"
                disabled={isProcessing}
                className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              id="wade-submit-needs-btn"
              disabled={isProcessing || !inputText.trim()}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-colors shrink-0"
            >
              <span>Verify & Add</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Live Reassurance & Dignity Confirmation Banner */}
        {lastResponse && (
          <div 
            id="agent-reassurance-feedback-banner"
            className="mt-4 rounded-2xl p-5 border transition-all bg-emerald-50/90 border-emerald-200 text-emerald-950 shadow-xs"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl shrink-0 bg-emerald-600 text-white shadow-2xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Agent Vocal Reassurance ({selectedPersona === 'ward-cleaver' ? 'Ward Cleaver' : selectedPersona === 'first-mate' ? "Captain's First Mate" : selectedPersona === 'dr-evil' ? 'Dr. Evil' : 'Clinical Co-Pilot'})
                  </span>

                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 border border-emerald-300">
                    Handled & Offloaded to Care Agent
                  </span>
                </div>

                <p className="text-base font-semibold text-slate-900 leading-relaxed font-serif italic mb-3">
                  "{lastResponse.reassuranceText}"
                </p>

                {/* Items analysis breakdown */}
                {lastResponse.extractedItems && lastResponse.extractedItems.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-emerald-200/60">
                    {lastResponse.extractedItems.map((item: any, idx: number) => (
                      <div key={idx} className="bg-white/90 rounded-lg p-2.5 text-xs flex items-center justify-between border border-emerald-100 shadow-2xs">
                        <div>
                          <span className="font-bold text-slate-900">{item.name}</span>
                          <span className="text-slate-500 block text-[11px]">
                            {item.isDuplicate ? `Managed by Grocery Agent (Stock verified)` : `Category: ${item.category}`}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {item.actionTaken === 'SUPPRESSED' ? 'Handled (In Stock)' : 'Queued for Caregiver'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subsystem B: Dynamic Predictive Quick-Tap Generator */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Dynamic Predictive Quick-Taps
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 flex items-center gap-1">
                {timeContext === 'Morning' && <Sun className="w-3 h-3 text-amber-500" />}
                {timeContext === 'Evening' && <Moon className="w-3 h-3 text-indigo-500" />}
                <span>{timeContext} Routine Context</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked suggestions based on temporal time-of-day, past request frequency, and infusion prep schedules.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchQuickTapSuggestions}
            disabled={loadingSuggestions}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 p-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSuggestions ? 'animate-spin' : ''}`} />
            <span>Refresh Predictions</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickTapSuggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              id={`quick-tap-btn-${suggestion.id}`}
              onClick={() => handleProcessIntake(`We need some ${suggestion.item}`, 'quick-tap')}
              disabled={isProcessing}
              className="text-left p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 transition-all group flex items-start justify-between gap-2"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white border border-slate-200 group-hover:border-indigo-200 shadow-2xs">
                  {renderIcon(suggestion.iconName)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                    {suggestion.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    {suggestion.reasoning}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
