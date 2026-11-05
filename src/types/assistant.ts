export type AssistantState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ERROR';

export type ScreenTab = 'HOME' | 'COMMANDS' | 'PERMISSIONS' | 'SETTINGS' | 'HISTORY';

export interface MessageItem {
  id: string;
  text: string;
  isFromUser: boolean;
  timestamp: number;
  intentName?: string;
  success?: boolean;
}

export interface PermissionStatus {
  id: string;
  title: string;
  bengaliDescription: string;
  isGranted: boolean;
  isSpecialSetting?: boolean;
}

export interface AppSettings {
  wakePhrase: string;
  voicePitch: number;
  voiceRate: number;
  lockScreenEnabled: boolean;
  alwaysListening: boolean;
  floatingOrbEnabled: boolean;
  geminiApiKey: string;
}
