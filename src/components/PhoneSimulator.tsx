import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Radio,
  Play,
  Settings as SettingsIcon,
  Home,
  MessageSquare,
  ShieldCheck,
  History,
  Flashlight,
  Wifi,
  PhoneCall,
  Clock,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  Bell,
  Sun,
  Send,
  ExternalLink
} from 'lucide-react';
import { AssistantState, ScreenTab, MessageItem, PermissionStatus, AppSettings } from '../types/assistant';
import { BengaliSpeechSynthesizer } from '../services/speechSynthesis';
import { processBengaliVoiceCommand, ParsedVoiceAction } from '../services/intentEngine';

const KAJOL_AVATAR = '/assets/aistudio/4728e8639d9b2594a3d39a1558ef7de4b91eab8d53f5516930e55fc765c3bba5__1__72bcd1d0.png';

export const PhoneSimulator: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ScreenTab>('HOME');
  const [assistantState, setAssistantState] = useState<AssistantState>('IDLE');
  const [isLocked, setIsLocked] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isWifiOn, setIsWifiOn] = useState(true);
  const [isFloatingOrbActive, setIsFloatingOrbActive] = useState(true);
  const [floatingOrbPos, setFloatingOrbPos] = useState({ x: 260, y: 180 });
  const [isDraggingOrb, setIsDraggingOrb] = useState(false);
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const [inputText, setInputText] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<AppSettings>({
    wakePhrase: 'হ্যালো কাজল',
    voicePitch: 1.1,
    voiceRate: 0.92,
    lockScreenEnabled: true,
    alwaysListening: true,
    floatingOrbEnabled: true,
    geminiApiKey: ''
  });

  // Permissions state
  const [permissions, setPermissions] = useState<PermissionStatus[]>([
    {
      id: 'RECORD_AUDIO',
      title: 'মাইক্রোফোন (Record Audio)',
      bengaliDescription: 'আপনার মিষ্টি কণ্ঠে বাংলা নির্দেশ শোনার জন্য প্রয়োজনীয়।',
      isGranted: true
    },
    {
      id: 'POST_NOTIFICATIONS',
      title: 'নোটিফিকেশন (Notifications)',
      bengaliDescription: 'কাজল ব্যাকগ্রাউন্ডে সক্রিয় থাকার স্ট্যাটাস দেখানোর জন্য।',
      isGranted: true
    },
    {
      id: 'SYSTEM_ALERT_WINDOW',
      title: 'ভাসমান অর্ব (Display Over Apps)',
      bengaliDescription: 'যেকোনো অ্যাপে কাজলের গোলক প্রদর্শন ও দ্রুত কথা বলার জন্য।',
      isGranted: true,
      isSpecialSetting: true
    },
    {
      id: 'IGNORE_BATTERY_OPTIMIZATIONS',
      title: 'ব্যাটারি অপ্টিমাইজেশন বাইপাস',
      bengaliDescription: 'ফোন লক বা স্লিপ মোডে থাকলেও সবসময় যেন ওয়েক-ওয়ার্ড শুনতে পায়।',
      isGranted: true,
      isSpecialSetting: true
    },
    {
      id: 'CALL_PHONE',
      title: 'ফোন কল (Call Phone)',
      bengaliDescription: 'কণ্ঠের নির্দেশে সরাসরি পরিচিতিকে ডায়াল করার অনুমতি।',
      isGranted: true
    },
    {
      id: 'READ_CONTACTS',
      title: 'পরিচিতি তালিকা (Read Contacts)',
      bengaliDescription: 'নাম ধরে কল বা মেসেজ করার জন্য ফোনবুক পড়ার অনুমতি।',
      isGranted: true
    },
    {
      id: 'SEND_SMS',
      title: 'এসএমএস পাঠানো (Send SMS)',
      bengaliDescription: 'ভয়েস কমান্ড দিয়ে মেসেজ পাঠানোর অনুমতি।',
      isGranted: true
    },
    {
      id: 'FOREGROUND_SERVICE_MICROPHONE',
      title: 'ফোরগ্রাউন্ড মাইক্রোফোন সার্ভিস',
      bengaliDescription: 'Android 14+ এ ব্যাকগ্রাউন্ডে নিরবচ্ছিন্ন কণ্ঠ শোনার অনুমতি।',
      isGranted: true
    }
  ]);

  // Messages log
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: '1',
      text: 'হ্যালো! আমি কাজল। আপনার মিষ্টি ও সাহায্যকারী বাংলা ভয়েস সহকারী। যেকোনো কিছু বলুন!',
      isFromUser: false,
      timestamp: Date.now() - 60000,
      intentName: 'Greeting'
    }
  ]);

  // Recognition reference
  const recognitionRef = useRef<any>(null);

  // Update clock
  useEffect(() => {
    BengaliSpeechSynthesizer.init();

    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(
        now.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Speech recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'bn-BD';

      recognition.onstart = () => {
        setIsListeningSpeech(true);
        setAssistantState('LISTENING');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleUserVoiceCommand(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListeningSpeech(false);
        setAssistantState('IDLE');
      };

      recognition.onend = () => {
        setIsListeningSpeech(false);
      };

      recognitionRef.current = recognition;
    }
  }, [settings]);

  const startVoiceInput = () => {
    if (isListeningSpeech) {
      recognitionRef.current?.stop();
      setIsListeningSpeech(false);
      setAssistantState('IDLE');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      } else {
        // Fallback prompt for browsers without Web Speech API
        const sampleQuery = prompt('আপনার বাংলা ভয়েস কমান্ডটি লিখুন (যেমন: হ্যালো কাজল গান চালাও / আবহাওয়া কেমন):', 'হ্যালো কাজল গান চালাও');
        if (sampleQuery) {
          handleUserVoiceCommand(sampleQuery);
        }
      }
    } catch (e) {
      console.warn('Speech start error:', e);
    }
  };

  const handleUserVoiceCommand = async (rawText: string) => {
    if (!rawText.trim()) return;

    // Add user message
    const userMsg: MessageItem = {
      id: Date.now().toString(),
      text: rawText,
      isFromUser: true,
      timestamp: Date.now()
    };
    setMessages((prev) => [...prev, userMsg]);

    setAssistantState('THINKING');

    // If screen is locked and lockScreenEnabled is true, wake the screen!
    if (isLocked && settings.lockScreenEnabled) {
      // Simulate showWhenLocked & turnScreenOn
    }

    // Process intent
    const result: ParsedVoiceAction = await processBengaliVoiceCommand(rawText, settings.geminiApiKey);

    // Execute simulated hardware actions
    if (result.actionDetails?.type === 'flashlight') {
      setIsTorchOn(result.actionDetails.data.enabled);
    } else if (result.actionDetails?.type === 'wifi') {
      setIsWifiOn(result.actionDetails.data.enabled);
    }

    // Add Kajol's response
    const kajolMsg: MessageItem = {
      id: (Date.now() + 1).toString(),
      text: result.spokenReply,
      isFromUser: false,
      timestamp: Date.now(),
      intentName: result.intentType,
      success: result.success
    };
    setMessages((prev) => [...prev, kajolMsg]);

    // Speak via sweet Bengali TTS
    setAssistantState('SPEAKING');
    BengaliSpeechSynthesizer.speak(
      result.spokenReply,
      settings.voicePitch,
      settings.voiceRate,
      () => setAssistantState('SPEAKING'),
      () => setAssistantState('IDLE')
    );
  };

  const testVoiceGreeting = () => {
    const text = 'হ্যালো! আমি কাজল। আপনার মিষ্টি ও আন্তরিক বাংলা ভয়েস অ্যাসিস্ট্যান্ট।';
    setAssistantState('SPEAKING');
    BengaliSpeechSynthesizer.speak(
      text,
      settings.voicePitch,
      settings.voiceRate,
      () => setAssistantState('SPEAKING'),
      () => setAssistantState('IDLE')
    );
  };

  const togglePermission = (id: string) => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isGranted: !p.isGranted } : p))
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-6 w-full">
      {/* Phone External Hardware Simulation Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-4 text-xs">
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
            isLocked
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-[#141C33] border-[#1F293D] text-gray-300 hover:text-white'
          }`}
        >
          {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
          <span>{isLocked ? 'লকড মোড (স্ক্রিন বন্ধ)' : 'ফোন আনলক করুন'}</span>
        </button>

        <button
          onClick={() => setIsFloatingOrbActive(!isFloatingOrbActive)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
            isFloatingOrbActive
              ? 'bg-[#4FD1C5]/20 border-[#4FD1C5]/40 text-[#4FD1C5]'
              : 'bg-[#141C33] border-[#1F293D] text-gray-300 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>ভাসমান অর্ব: {isFloatingOrbActive ? 'চালু' : 'বন্ধ'}</span>
        </button>

        <button
          onClick={() => setIsTorchOn(!isTorchOn)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
            isTorchOn
              ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
              : 'bg-[#141C33] border-[#1F293D] text-gray-300 hover:text-white'
          }`}
        >
          <Flashlight className="w-3.5 h-3.5" />
          <span>টর্চ / ফ্ল্যাশ: {isTorchOn ? 'জ্বলছে' : 'বন্ধ'}</span>
        </button>

        <button
          onClick={() => setIsWifiOn(!isWifiOn)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
            isWifiOn
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-[#141C33] border-[#1F293D] text-gray-300 hover:text-white'
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>ওয়াইফাই: {isWifiOn ? 'সংযুক্ত' : 'বন্ধ'}</span>
        </button>
      </div>

      {/* Modern Android Phone Bezel Frame */}
      <div className="relative w-[360px] sm:w-[390px] h-[780px] bg-[#05070D] rounded-[48px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(79,209,197,0.15)] border-4 border-[#1E293B] overflow-hidden select-none">
        {/* Flashlight Screen Glow Simulation */}
        {isTorchOn && (
          <div className="absolute inset-0 bg-yellow-100/30 z-40 pointer-events-none animate-pulse" />
        )}

        {/* Screen Bezel Notch / Punch-hole Camera */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-30 border border-gray-800" />

        {/* Inner AMOLED Display (Dark Navy #0B1020) */}
        <div className="relative w-full h-full bg-[#0B1020] rounded-[38px] overflow-hidden flex flex-col font-['Hind_Siliguri',sans-serif]">
          {/* Android Status Bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-1 text-xs text-gray-300 z-20">
            <span className="font-semibold">{currentTime || '09:41'}</span>

            {/* Active Mic Indicator Dot (Android 12+ Privacy Indicator) */}
            <div className="flex items-center gap-2">
              {assistantState === 'LISTENING' && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-400 text-[10px] animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Mic</span>
                </div>
              )}
              {isWifiOn && <Wifi className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-bold">5G</span>
              <div className="w-5 h-2.5 border border-gray-400 rounded-sm p-0.5 flex items-center">
                <div className="w-full h-full bg-emerald-400 rounded-xs" />
              </div>
            </div>
          </div>

          {/* Persistent Foreground Service Notification Pill */}
          {settings.alwaysListening && (
            <div className="mx-4 mt-1 px-3 py-1 rounded-xl bg-[#141C33]/90 border border-[#1F293D] flex items-center justify-between text-[11px] text-gray-300 shadow-sm z-20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#4FD1C5] animate-ping" />
                <span className="font-medium text-white">কাজল সক্রিয় রয়েছে</span>
              </div>
              <span className="text-[10px] text-[#4FD1C5]">"{settings.wakePhrase}"</span>
            </div>
          )}

          {/* Screen Content Container or Lock Screen Modal */}
          {isLocked ? (
            /* Locked State View */
            <div className="flex-1 flex flex-col items-center justify-between p-6 z-20 bg-gradient-to-b from-[#0B1020] to-[#060812]">
              <div className="text-center mt-12">
                <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <div className="text-4xl font-bold text-white tracking-tight">{currentTime}</div>
                <div className="text-xs text-gray-400 mt-1">{currentDate}</div>
              </div>

              {/* Lock screen voice wake prompt */}
              <div className="w-full p-5 rounded-2xl bg-[#141C33]/80 border border-[#1F293D] text-center backdrop-blur-md">
                <div className="w-16 h-16 rounded-full bg-[#4FD1C5]/10 border border-[#4FD1C5]/30 flex items-center justify-center mx-auto mb-3">
                  <Mic className="w-8 h-8 text-[#4FD1C5] animate-pulse" />
                </div>
                <div className="text-sm font-bold text-white">লক স্ক্রিনেও কাজল প্রস্তুত</div>
                <div className="text-xs text-[#4FD1C5] mt-1 font-semibold">"{settings.wakePhrase}" বলুন</div>
                <p className="text-[11px] text-gray-400 mt-2">
                  লক থাকা অবস্থায়ও স্ক্রিন অন করে সরাসরি কল, গান বা অ্যালার্ম বাজাবে
                </p>

                <button
                  onClick={startVoiceInput}
                  className="mt-3 w-full py-2 rounded-xl bg-[#4FD1C5] text-[#0B1020] font-bold text-xs hover:bg-[#38B2AC] transition"
                >
                  কথা বলুন (লক স্ক্রিন ট্রাই করুন)
                </button>
              </div>

              <div className="text-[11px] text-gray-500 mb-4">আনলক করতে উপরে সোয়াইপ করুন অথবা আনলক বাটন চাপুন</div>
            </div>
          ) : (
            /* Unlocked Active App Screens */
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
              {/* TAB 1: HOME */}
              {currentTab === 'HOME' && (
                <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center text-center">
                  {/* Status Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141C33] border border-[#1F293D] text-xs font-medium text-white mb-4">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        assistantState === 'LISTENING'
                          ? 'bg-emerald-400 animate-pulse'
                          : assistantState === 'THINKING'
                          ? 'bg-amber-400 animate-spin'
                          : assistantState === 'SPEAKING'
                          ? 'bg-[#4FD1C5] animate-pulse'
                          : 'bg-teal-400'
                      }`}
                    />
                    <span>
                      {assistantState === 'LISTENING'
                        ? 'শুনছি… বলুন'
                        : assistantState === 'THINKING'
                        ? 'ভাবছি…'
                        : assistantState === 'SPEAKING'
                        ? 'উত্তর দিচ্ছি…'
                        : 'কাজল সক্রিয় রয়েছে'}
                    </span>
                  </div>

                  {/* Animated Glowing Orb */}
                  <div
                    onClick={startVoiceInput}
                    className="relative w-44 h-44 flex items-center justify-center cursor-pointer my-2 group"
                  >
                    {/* Concentric audio ripple waves */}
                    <div
                      className={`absolute inset-0 rounded-full border border-[#4FD1C5]/30 ${
                        assistantState === 'LISTENING' || assistantState === 'SPEAKING'
                          ? 'animate-ping'
                          : 'animate-pulse'
                      }`}
                    />
                    <div className="absolute inset-2 rounded-full bg-[#4FD1C5]/10 blur-xl animate-pulse-glow" />

                    {/* Central Glowing Core */}
                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#4FD1C5] via-[#319795] to-[#0B1020] p-1 shadow-2xl flex items-center justify-center border-2 border-[#4FD1C5]/60 group-hover:scale-105 transition transform">
                      <Mic className="w-10 h-10 text-[#0B1020]" />
                    </div>
                  </div>

                  {/* Wake Word Hint */}
                  <div className="text-xl font-bold text-[#4FD1C5] mt-2">"{settings.wakePhrase}"</div>
                  <p className="text-xs text-gray-400 mt-1 max-w-[280px]">
                    বললেই আমি সাড়া দেব, স্ক্রিন লক থাকলেও পাশে আছি
                  </p>

                  {/* Manual Mic Trigger Button */}
                  <div className="my-4">
                    <button
                      onClick={startVoiceInput}
                      className={`p-4 rounded-full shadow-lg transition-transform transform active:scale-95 ${
                        isListeningSpeech
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-gradient-to-r from-[#4FD1C5] to-[#319795] text-[#0B1020] hover:brightness-110'
                      }`}
                    >
                      {isListeningSpeech ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {isListeningSpeech ? 'শোনা হচ্ছে...' : 'কথা বলতে চাপুন'}
                    </div>
                  </div>

                  {/* Persona Card */}
                  <div className="w-full p-3 rounded-2xl bg-[#141C33]/90 border border-[#1F293D] flex items-center gap-3 text-left mb-4 shadow-sm">
                    <img
                      src={KAJOL_AVATAR}
                      alt="কাজল (Kajol Avatar)"
                      className="w-12 h-12 rounded-xl object-cover border border-[#4FD1C5]/40 shrink-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        কাজল (Kajol)
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#4FD1C5]/20 text-[#4FD1C5]">
                          AI ভয়েস
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-tight mt-0.5">
                        মিষ্টি ও কোমল নারী কণ্ঠে বাংলা উত্তর এবং সম্পূর্ণ ডিভাইস নিয়ন্ত্রণ।
                      </p>
                    </div>
                  </div>

                  {/* Quick Command Cards */}
                  <div className="w-full text-left">
                    <div className="text-xs font-bold text-gray-300 mb-2">দ্রুত নির্দেশনাসমূহ</div>
                    <div className="grid grid-cols-2 gap-2 text-left">
                      {[
                        { title: 'গান বাজাও', cmd: 'ইউটিউবে গান চালাও', icon: Play, color: 'text-red-400' },
                        { title: 'কল করো', cmd: 'আম্মুকে কল দাও', icon: PhoneCall, color: 'text-emerald-400' },
                        { title: 'ফ্ল্যাশলাইট', cmd: 'ফ্ল্যাশলাইট জ্বালাও', icon: Flashlight, color: 'text-amber-400' },
                        { title: 'আবহাওয়া', cmd: 'আজকের আবহাওয়া কেমন', icon: Sun, color: 'text-teal-400' },
                        { title: 'অ্যালার্ম', cmd: 'সকাল ৭টায় অ্যালার্ম দাও', icon: Clock, color: 'text-orange-400' },
                        { title: 'অ্যাপ খোলো', cmd: 'ফেসবুক খোলো', icon: Sparkles, color: 'text-purple-400' }
                      ].map((item, i) => (
                        <div
                          key={i}
                          onClick={() => handleUserVoiceCommand(item.cmd)}
                          className="p-2.5 rounded-xl bg-[#141C33] border border-[#1F293D] hover:border-[#4FD1C5]/40 cursor-pointer transition flex items-center gap-2 group"
                        >
                          <div className={`p-1.5 rounded-lg bg-gray-800/80 ${item.color}`}>
                            <item.icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white group-hover:text-[#4FD1C5] transition truncate">
                              {item.title}
                            </div>
                            <div className="text-[10px] text-gray-400 truncate">{item.cmd}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COMMANDS */}
              {currentTab === 'COMMANDS' && (
                <div className="flex-1 overflow-y-auto p-4 text-left">
                  <h3 className="text-base font-bold text-white">ভয়েস কমান্ড তালিকা</h3>
                  <p className="text-xs text-gray-400 mb-3">যেকোনো একটি বাক্যে ক্লিক করে সরাসরি পরীক্ষা করুন</p>

                  <div className="space-y-3">
                    {[
                      {
                        cat: 'মাল্টিমিডিয়া ও বিনোদন',
                        items: [
                          'ইউটিউবে রবীন্দ্রসঙ্গীত বাজাও',
                          'ফেসবুক খোলো',
                          'ক্যামেরা ওপেন করো'
                        ]
                      },
                      {
                        cat: 'যোগাযোগ ও মেসেজিং',
                        items: [
                          'আম্মুকে কল দাও',
                          '০১৭১২৩৪৫৬৭৮ এ মেসেজ পাঠাও আমি আসছি'
                        ]
                      },
                      {
                        cat: 'ডিভাইস কন্ট্রোল',
                        items: [
                          'ফ্ল্যাশলাইট জ্বালাও',
                          'ওয়াইফাই চালু করো',
                          'ভলিউম বাড়িয়ে দাও',
                          'ডু নট ডিস্টার্ব অন করো'
                        ]
                      },
                      {
                        cat: 'সময়, টাইমার ও অ্যালার্ম',
                        items: [
                          'সকাল ৭টায় অ্যালার্ম দাও',
                          '১০ মিনিটের টাইমার সেট করো',
                          'কয়টা বাজে'
                        ]
                      },
                      {
                        cat: 'জ্ঞান ও বুদ্ধিমত্তা (Gemini AI)',
                        items: [
                          'বাংলাদেশের জাতীয় স্মৃতিসৌধ কোথায় অবস্থিত',
                          'আমাকে একটি সুন্দর বাংলা উপদেশ দাও'
                        ]
                      }
                    ].map((group, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="text-xs font-bold text-[#4FD1C5]">{group.cat}</div>
                        {group.items.map((cmd, cIdx) => (
                          <div
                            key={cIdx}
                            onClick={() => handleUserVoiceCommand(cmd)}
                            className="p-2.5 rounded-xl bg-[#141C33] border border-[#1F293D] flex items-center justify-between cursor-pointer hover:border-[#4FD1C5]/50 transition"
                          >
                            <span className="text-xs text-gray-200">"{cmd}"</span>
                            <Play className="w-3.5 h-3.5 text-[#4FD1C5] shrink-0" />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: PERMISSIONS */}
              {currentTab === 'PERMISSIONS' && (
                <div className="flex-1 overflow-y-auto p-4 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-base font-bold text-white">অনুমতি ও এক্সেস কন্ট্রোল</h3>
                      <p className="text-[11px] text-gray-400">লাইভ পারমিশন স্ট্যাটাস</p>
                    </div>
                  </div>

                  <div className="space-y-2 mt-2">
                    {permissions.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-[#141C33] border border-[#1F293D] flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{p.title}</span>
                          <button
                            onClick={() => togglePermission(p.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition ${
                              p.isGranted
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {p.isGranted ? 'অনুমোদিত' : 'অনুপস্থিত (অন করুন)'}
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-400">{p.bengaliDescription}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: SETTINGS */}
              {currentTab === 'SETTINGS' && (
                <div className="flex-1 overflow-y-auto p-4 text-left space-y-4">
                  <h3 className="text-base font-bold text-white">সেটিংস ও কন্ট্রোল</h3>

                  {/* Wake Phrase */}
                  <div className="p-3 rounded-xl bg-[#141C33] border border-[#1F293D] space-y-2">
                    <label className="text-xs font-bold text-[#4FD1C5] block">ওয়েক ফ্রেজ (Wake Word)</label>
                    <input
                      type="text"
                      value={settings.wakePhrase}
                      onChange={(e) => setSettings({ ...settings, wakePhrase: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#0B1020] border border-[#1F293D] rounded-lg text-xs text-white focus:outline-none focus:border-[#4FD1C5]"
                    />
                  </div>

                  {/* Voice Tuning */}
                  <div className="p-3 rounded-xl bg-[#141C33] border border-[#1F293D] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#4FD1C5]">মিষ্টি নারী কণ্ঠের সুর (Pitch)</label>
                      <span className="text-xs text-gray-300 font-mono">{settings.voicePitch.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="1.4"
                      step="0.05"
                      value={settings.voicePitch}
                      onChange={(e) => setSettings({ ...settings, voicePitch: parseFloat(e.target.value) })}
                      className="w-full accent-[#4FD1C5]"
                    />

                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#4FD1C5]">কথা বলার গতি (Speed)</label>
                      <span className="text-xs text-gray-300 font-mono">{settings.voiceRate.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.7"
                      max="1.3"
                      step="0.05"
                      value={settings.voiceRate}
                      onChange={(e) => setSettings({ ...settings, voiceRate: parseFloat(e.target.value) })}
                      className="w-full accent-[#4FD1C5]"
                    />

                    <button
                      onClick={testVoiceGreeting}
                      className="w-full py-2 rounded-lg bg-[#4FD1C5]/10 border border-[#4FD1C5]/30 text-xs font-bold text-[#4FD1C5] hover:bg-[#4FD1C5]/20 transition flex items-center justify-center gap-1.5"
                    >
                      <Volume2 className="w-4 h-4" />
                      কাজলের কণ্ঠ পরীক্ষা করুন
                    </button>
                  </div>

                  {/* Toggles */}
                  <div className="p-3 rounded-xl bg-[#141C33] border border-[#1F293D] space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">সবসময় শুনবে (Always Listening)</div>
                        <div className="text-[10px] text-gray-400">অ্যাপ বন্ধ থাকলেও ব্যাকগ্রাউন্ডে সক্রিয়</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.alwaysListening}
                        onChange={(e) => setSettings({ ...settings, alwaysListening: e.target.checked })}
                        className="accent-[#4FD1C5] w-4 h-4"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">লক স্ক্রিনে সাড়া দেবে</div>
                        <div className="text-[10px] text-gray-400">লক থাকা অবস্থায় স্ক্রিন অন করে কমান্ড এক্সিকিউট</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.lockScreenEnabled}
                        onChange={(e) => setSettings({ ...settings, lockScreenEnabled: e.target.checked })}
                        className="accent-[#4FD1C5] w-4 h-4"
                      />
                    </div>
                  </div>

                  {/* Gemini API Key */}
                  <div className="p-3 rounded-xl bg-[#141C33] border border-[#1F293D] space-y-2">
                    <label className="text-xs font-bold text-[#4FD1C5] block">
                      Gemini AI API Key (EncryptedSharedPreferences)
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={settings.geminiApiKey}
                        onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                        placeholder="কাস্টম কি দিলে অগ্রাধিকার পাবে"
                        className="w-full px-3 py-1.5 pr-8 bg-[#0B1020] border border-[#1F293D] rounded-lg text-xs text-white focus:outline-none focus:border-[#4FD1C5]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2 top-2 text-gray-400 hover:text-white"
                      >
                        {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      ডিভাইসে নিরাপদ Keystore এনক্রিপশনে রাখা হবে।
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: HISTORY */}
              {currentTab === 'HISTORY' && (
                <div className="flex-1 overflow-y-auto p-4 text-left flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <h3 className="text-base font-bold text-white mb-2">কথোপকথনের হিস্ট্রি</h3>
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${m.isFromUser ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                            m.isFromUser
                              ? 'bg-[#1E2B4B] text-white rounded-br-none border border-[#31436F]'
                              : 'bg-[#141C33] text-gray-200 rounded-bl-none border border-[#1F293D]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-[10px] text-[#4FD1C5]">
                              {m.isFromUser ? 'আপনি' : 'কাজল'}
                            </span>
                            {m.intentName && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-gray-800 text-gray-300">
                                {m.intentName}
                              </span>
                            )}
                          </div>
                          <p>{m.text}</p>
                          {!m.isFromUser && (
                            <button
                              onClick={() => {
                                setAssistantState('SPEAKING');
                                BengaliSpeechSynthesizer.speak(
                                  m.text,
                                  settings.voicePitch,
                                  settings.voiceRate,
                                  () => setAssistantState('SPEAKING'),
                                  () => setAssistantState('IDLE')
                                );
                              }}
                              className="mt-1.5 flex items-center gap-1 text-[10px] text-[#4FD1C5] hover:underline"
                            >
                              <Volume2 className="w-3 h-3" />
                              পুনরায় শুনুন
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick text input bar for testing without voice */}
                  <div className="mt-3 flex items-center gap-2 pt-2 border-t border-[#1F293D]">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && inputText.trim()) {
                          handleUserVoiceCommand(inputText);
                          setInputText('');
                        }
                      }}
                      placeholder="বাংলায় কমান্ড টাইপ করুন..."
                      className="flex-1 px-3 py-1.5 bg-[#141C33] border border-[#1F293D] rounded-xl text-xs text-white focus:outline-none focus:border-[#4FD1C5]"
                    />
                    <button
                      onClick={() => {
                        if (inputText.trim()) {
                          handleUserVoiceCommand(inputText);
                          setInputText('');
                        }
                      }}
                      className="p-2 rounded-xl bg-[#4FD1C5] text-[#0B1020] hover:bg-[#38B2AC] transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Floating Orb Overlay (SYSTEM_ALERT_WINDOW simulation) */}
              {isFloatingOrbActive && (
                <div
                  style={{ top: `${floatingOrbPos.y}px`, left: `${floatingOrbPos.x}px` }}
                  onClick={startVoiceInput}
                  title="কাজল ভাসমান গোলক (ট্যাপ করে কথা বলুন)"
                  className="absolute z-50 w-12 h-12 rounded-full bg-gradient-to-br from-[#4FD1C5] to-[#0B1020] border-2 border-[#4FD1C5] shadow-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 animate-pulse-glow"
                >
                  <Mic className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          )}

          {/* Android Bottom Navigation Bar */}
          <div className="h-14 bg-[#141C33] border-t border-[#1F293D] grid grid-cols-5 items-center px-1 z-30">
            {[
              { tab: 'HOME' as ScreenTab, label: 'হোম', icon: Home },
              { tab: 'COMMANDS' as ScreenTab, label: 'কমান্ড', icon: MessageSquare },
              { tab: 'PERMISSIONS' as ScreenTab, label: 'পারমিশন', icon: ShieldCheck },
              { tab: 'SETTINGS' as ScreenTab, label: 'সেটিংস', icon: SettingsIcon },
              { tab: 'HISTORY' as ScreenTab, label: 'হিস্ট্রি', icon: History }
            ].map((item) => {
              const isSelected = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => setCurrentTab(item.tab)}
                  className={`flex flex-col items-center justify-center py-1 transition ${
                    isSelected ? 'text-[#4FD1C5]' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isSelected ? 'scale-110' : ''}`} />
                  <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Android 3-Button / Gesture Bar */}
          <div className="h-4 bg-[#0B1020] flex items-center justify-center pb-1">
            <div className="w-24 h-1 bg-gray-500 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
