import React, { useState } from 'react';
import { PhoneSimulator } from './components/PhoneSimulator';
import { CodeExplorer } from './components/CodeExplorer';
import { OemGuideModal } from './components/OemGuideModal';
import {
  Smartphone,
  Code2,
  Columns,
  HelpCircle,
  Download,
  Sparkles,
  Github,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldAlert
} from 'lucide-react';

const KAJOL_AVATAR = '/assets/aistudio/4728e8639d9b2594a3d39a1558ef7de4b91eab8d53f5516930e55fc765c3bba5__1__72bcd1d0.png';

export default function App() {
  const [activeView, setActiveView] = useState<'both' | 'phone' | 'code'>('both');
  const [isOemModalOpen, setIsOemModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070B16] text-gray-100 font-['Hind_Siliguri',sans-serif] flex flex-col">
      {/* Top Application Header */}
      <header className="border-b border-[#1F293D] bg-[#0B1020]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Persona */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={KAJOL_AVATAR}
              alt="কাজল (Kajol)"
              className="w-10 h-10 rounded-full object-cover border-2 border-[#4FD1C5] shadow-lg shadow-[#4FD1C5]/20"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#0B1020] rounded-full" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              কাজল (Kajol)
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#4FD1C5]/20 text-[#4FD1C5] font-semibold">
                Android 15 • Bengali Voice AI
              </span>
            </h1>
            <p className="text-xs text-gray-400">
              Jetpack Compose • Always-Listening Foreground Service • Bengali TTS • Gemini Fallback
            </p>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-2 bg-[#141C33] p-1 rounded-xl border border-[#1F293D]">
          <button
            onClick={() => setActiveView('both')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeView === 'both'
                ? 'bg-[#4FD1C5] text-[#0B1020] shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">স্প্লিট ভিউ</span>
          </button>

          <button
            onClick={() => setActiveView('phone')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeView === 'phone'
                ? 'bg-[#4FD1C5] text-[#0B1020] shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>ফোন সিমুলেটর</span>
          </button>

          <button
            onClick={() => setActiveView('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeView === 'code'
                ? 'bg-[#4FD1C5] text-[#0B1020] shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>অ্যান্ড্রয়েড কোড হাব</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOemModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#141C33] hover:bg-[#1E293B] border border-[#1F293D] text-gray-200 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>OEM ব্যাটারি গাইড</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 p-3 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Quick Highlights Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#141C33] via-[#0E172A] to-[#141C33] border border-[#1F293D] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-gray-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#4FD1C5]" />
              <span>ওয়েক-ওয়ার্ড: <strong>"হ্যালো কাজল"</strong> (কাস্টমাইজেবল)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#4FD1C5]" />
              <span>লক-স্ক্রিন অ্যাক্টিভেশন: <strong>showWhenLocked</strong> &amp; <strong>turnScreenOn</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#4FD1C5]" />
              <span>মিষ্টি নারী কণ্ঠ: <strong>bn-BD TTS</strong> (Pitch: 1.1x, Speed: 0.92x)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#4FD1C5]" />
              <span>নিরাপত্তা: <strong>EncryptedSharedPreferences</strong> এ Gemini API Key</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#4FD1C5] font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>Hilt DI • Jetpack Compose • DataStore</span>
          </div>
        </div>

        {/* View Layouts */}
        {activeView === 'both' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 flex justify-center">
              <PhoneSimulator />
            </div>
            <div className="lg:col-span-7 h-[780px]">
              <CodeExplorer />
            </div>
          </div>
        )}

        {activeView === 'phone' && (
          <div className="flex justify-center py-4">
            <PhoneSimulator />
          </div>
        )}

        {activeView === 'code' && (
          <div className="h-[820px]">
            <CodeExplorer />
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="border-t border-[#1F293D] bg-[#0B1020] py-4 px-6 text-center text-xs text-gray-500">
        <p>
          কাজল (Kajol) — Production-grade Bengali-first Voice AI Assistant for Android • MinSDK 26, TargetSDK 35 • Built with Jetpack Compose &amp; Kotlin
        </p>
      </footer>

      {/* OEM Guide Modal */}
      <OemGuideModal isOpen={isOemModalOpen} onClose={() => setIsOemModalOpen(false)} />
    </div>
  );
}
