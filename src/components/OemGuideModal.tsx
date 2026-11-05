import React from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, BatteryCharging, Zap } from 'lucide-react';

interface OemGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OemGuideModal: React.FC<OemGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0B1020] border border-[#1F293D] rounded-2xl shadow-2xl p-6 text-gray-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#141C33] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[#4FD1C5]/10 text-[#4FD1C5]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">মোবাইল OEM ব্যাকগ্রাউন্ড সেটিংস চেকলিস্ট</h2>
            <p className="text-xs text-gray-400">ফোন লক বা স্লিপ মোডে থাকলেও কাজলকে সচল রাখার প্রয়োজনীয় সেটিংস</p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          {/* Xiaomi */}
          <div className="p-4 rounded-xl bg-[#141C33] border border-[#1F293D]">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-500/20 text-orange-400">
                Xiaomi / Redmi / POCO (MIUI & HyperOS)
              </span>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4FD1C5] shrink-0 mt-0.5" />
                <span><strong>Auto-start (অটো-স্টার্ট):</strong> Settings &gt; Apps &gt; Permissions &gt; Autostart &gt; 'Kajol' চালু করুন।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4FD1C5] shrink-0 mt-0.5" />
                <span><strong>Battery Saver:</strong> Settings &gt; Apps &gt; Manage Apps &gt; Kajol &gt; Battery Saver &gt; <strong>'No restrictions'</strong> নির্বাচন করুন।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4FD1C5] shrink-0 mt-0.5" />
                <span><strong>Display Pop-up while running in background:</strong> অন্যান্য অনুমতি &gt; 'Display pop-up windows while running in background' অনুমতি দিন (লক-স্ক্রিন অ্যাক্টিভেশনের জন্য)।</span>
              </li>
            </ul>
          </div>

          {/* Samsung */}
          <div className="p-4 rounded-xl bg-[#141C33] border border-[#1F293D]">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-400">
                Samsung (One UI 5 / 6 / 7)
              </span>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4FD1C5] shrink-0 mt-0.5" />
                <span><strong>Unrestricted Battery:</strong> Settings &gt; Apps &gt; Kajol &gt; Battery &gt; <strong>'Unrestricted'</strong> নির্বাচন করুন।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4FD1C5] shrink-0 mt-0.5" />
                <span><strong>Never Sleeping Apps:</strong> Settings &gt; Device Care &gt; Battery &gt; Background usage limits &gt; 'Never auto sleeping apps' এ Kajol যোগ করুন।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4FD1C5] shrink-0 mt-0.5" />
                <span><strong>Appear on top:</strong> Settings &gt; Apps &gt; Kajol &gt; 'Appear on top' (ভাসমান অর্বের জন্য) অন করুন।</span>
              </li>
            </ul>
          </div>

          {/* Oppo / Realme */}
          <div className="p-4 rounded-xl bg-[#141C33] border border-[#1F293D]">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400">
                Oppo / Realme / OnePlus (ColorOS & OxygenOS)
              </span>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4FD1C5] shrink-0 mt-0.5" />
                <span><strong>Allow Background Activity:</strong> App Info &gt; Battery Usage &gt; 'Allow background activity' এবং 'Allow auto-launch' অন করুন।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4FD1C5] shrink-0 mt-0.5" />
                <span><strong>Recent Apps Lock:</strong> রিসেন্ট অ্যাপস স্ক্রিনে গিয়ে Kajol কার্ডে তিনটি ডট ট্যাপ করে <strong>'Lock'</strong> আইকন চাপুন।</span>
              </li>
            </ul>
          </div>

          {/* Vivo */}
          <div className="p-4 rounded-xl bg-[#141C33] border border-[#1F293D]">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/20 text-purple-400">
                Vivo & iQOO (Funtouch OS)
              </span>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4FD1C5] shrink-0 mt-0.5" />
                <span><strong>High Background Power Consumption:</strong> Settings &gt; Battery &gt; Background power consumption management &gt; Kajol &gt; 'Allow high background power consumption'।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4FD1C5] shrink-0 mt-0.5" />
                <span><strong>Autostart:</strong> Settings &gt; Applications &gt; Autostart &gt; Kajol অন করুন।</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold bg-[#4FD1C5] text-[#0B1020] hover:bg-[#38B2AC] transition"
          >
            বুঝেছি, ধন্যবাদ
          </button>
        </div>
      </div>
    </div>
  );
};
