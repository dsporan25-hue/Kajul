import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES, AndroidFileRecord } from '../data/androidFilesData';
import { FileCode, Download, Copy, Check, Search, Folder, ChevronRight, Sparkles, Terminal } from 'lucide-react';
import JSZip from 'jszip';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidFileRecord>(ANDROID_PROJECT_FILES[5]); // AndroidManifest.xml by default
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const filteredFiles = ANDROID_PROJECT_FILES.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || file.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add all project files into the zip archive preserving directory structure
      ANDROID_PROJECT_FILES.forEach((file) => {
        if (file.path === 'gradlew') {
          zip.file(file.path, file.content, { unixPermissions: '755' });
        } else {
          zip.file(file.path, file.content);
        }
      });

      zip.file(
        'README.md',
        `# Kajol (কাজল) - Bengali Voice AI Assistant for Android
A complete Bengali-first voice assistant built with:
- Kotlin & Jetpack Compose (Material 3)
- minSdk 26, targetSdk 35 (Android 15)
- Hilt Dependency Injection, Coroutines/Flow, DataStore & EncryptedSharedPreferences
- Always-listening foreground service (type: microphone)
- Bengali TextToSpeech (bn-BD, female pitch: 1.1x, rate: 0.92x)
- Bengali SpeechRecognizer with continuous loop
- Lock-screen execution (setShowWhenLocked, turnScreenOn)
- Floating Orb Overlay (SYSTEM_ALERT_WINDOW)
- Gemini API fallback for smart conversation and answers

## Build & Run
1. Open this directory in **Android Studio Ladybug (2024.2+)** or newer.
2. Sync Project with Gradle Files.
3. Connect an Android device with Android 8.0+ (API 26+) or launch an emulator.
4. Run 'app' (Shift + F10).
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Kajol-Bengali-Voice-Assistant-Android.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B1020] text-gray-200 border border-[#1F293D] rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-[#141C33] border-b border-[#1F293D] gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#4FD1C5]/10 text-[#4FD1C5]">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Android Studio Code Inspector
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#4FD1C5]/20 text-[#4FD1C5] rounded-full">
                Ready to Compile
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              Kotlin, Jetpack Compose, Hilt, DataStore, Android 15 (targetSdk 35)
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#4FD1C5] to-[#319795] text-[#0B1020] hover:brightness-110 shadow-lg shadow-[#4FD1C5]/20 transition disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isZipping ? 'জিপ তৈরি হচ্ছে...' : 'Download Android Studio Project (.ZIP)'}
        </button>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden min-h-[500px]">
        {/* Left File Tree Sidebar */}
        <div className="md:col-span-4 border-r border-[#1F293D] bg-[#0E1528] flex flex-col overflow-hidden">
          {/* Search & Filter */}
          <div className="p-3 border-b border-[#1F293D] space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ফাইল খুঁজুন..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#141C33] border border-[#1F293D] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4FD1C5]"
              />
            </div>

            <div className="flex flex-wrap gap-1 text-[11px]">
              {['all', 'kotlin', 'manifest', 'gradle', 'res', 'workflow'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-0.5 rounded capitalize transition ${
                    categoryFilter === cat
                      ? 'bg-[#4FD1C5] text-[#0B1020] font-semibold'
                      : 'bg-[#141C33] text-gray-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2 rounded-lg flex items-start gap-2.5 transition text-xs ${
                    isSelected
                      ? 'bg-[#4FD1C5]/15 border border-[#4FD1C5]/30 text-white'
                      : 'hover:bg-[#141C33] text-gray-300'
                  }`}
                >
                  <FileCode
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isSelected ? 'text-[#4FD1C5]' : 'text-gray-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[12px] font-medium truncate">{file.name}</div>
                    <div className="text-[10px] text-gray-400 truncate">{file.path}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Code Viewer */}
        <div className="md:col-span-8 flex flex-col overflow-hidden bg-[#0B1020]">
          {/* File Header Details */}
          <div className="p-3 bg-[#141C33]/70 border-b border-[#1F293D] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#4FD1C5] font-semibold">
                  /{selectedFile.path}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-800 text-gray-300 uppercase">
                  {selectedFile.language}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">{selectedFile.description}</p>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#1F293D] hover:bg-[#2A374F] text-gray-200 transition shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">কপি সম্পন্ন!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>কপি করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Syntax Content */}
          <div className="flex-1 overflow-auto p-4 font-mono text-[12px] leading-relaxed bg-[#0B1020] text-gray-300">
            <pre className="whitespace-pre">
              {selectedFile.content.split('\n').map((line, idx) => (
                <div key={idx} className="flex hover:bg-[#141C33]/50">
                  <span className="w-10 select-none text-gray-600 text-right pr-4 shrink-0 font-normal">
                    {idx + 1}
                  </span>
                  <span className="flex-1">{line}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
