export class BengaliSpeechSynthesizer {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static voices: SpeechSynthesisVoice[] = [];

  static init() {
    if (!this.synth) return;
    this.updateVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.updateVoices();
    }
  }

  private static updateVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  static speak(
    text: string,
    pitch: number = 1.1,
    rate: number = 0.92,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (!this.synth) {
      onEnd?.();
      return;
    }

    this.synth.cancel();

    // Clean any markdown formatting
    const cleanText = text.replace(/[*_#`~]/g, '').trim();
    if (!cleanText) {
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.pitch = pitch;
    utterance.rate = rate;

    // Pick best Bengali female voice or fallback
    if (this.voices.length === 0) {
      this.updateVoices();
    }

    const bnVoice = this.voices.find(
      (v) =>
        (v.lang === 'bn-BD' || v.lang === 'bn_BD' || v.lang.startsWith('bn')) &&
        (v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('woman') ||
          v.name.toLowerCase().includes('natural') ||
          v.name.toLowerCase().includes('google'))
    ) || this.voices.find((v) => v.lang.startsWith('bn')) ||
    this.voices.find((v) => v.lang.startsWith('hi') && v.name.toLowerCase().includes('female')) ||
    this.voices.find((v) => v.name.toLowerCase().includes('female'));

    if (bnVoice) {
      utterance.voice = bnVoice;
      utterance.lang = bnVoice.lang;
    } else {
      utterance.lang = 'bn-BD';
    }

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('TTS error:', e);
      onEnd?.();
    };

    try {
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speak error:', e);
      onEnd?.();
    }
  }

  static stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}
