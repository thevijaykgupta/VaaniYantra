// WebSocket URL
export const WS_URL = 'ws://localhost:8000/ws/audio/classroom1';

// Language options
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'mr', name: 'मराठी' },
];

// Export formats
export const EXPORT_FORMATS = [
  { key: 'pdf', label: 'PDF' },
  { key: 'docx', label: 'DOCX' },
  { key: 'srt', label: 'SRT' },
  { key: 'json', label: 'JSON' },
];

// Connection status constants
export const CONNECTION_STATUS = {
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  RECONNECTING: 'RECONNECTING',
};

// Sidebar navigation items
export const SIDEBAR_ITEMS = [
  { id: 'live-transcription', label: 'Live Transcription', icon: 'side_mic.png' },
  { id: 'translation-settings', label: 'Translation Settings', icon: 'side_settings.png' },
  { id: 'speaker-diarization', label: 'Speaker Diarization', icon: 'side_diarization.png' },
  { id: 'offline-mode', label: 'Offline Mode', icon: 'side_cloud.png' },
  { id: 'transcript-history', label: 'Transcript History', icon: 'side_history.png' },
  { id: 'app-analytics', label: 'App Analytics', icon: 'side_sheet.png' },
];

// Noise level thresholds
export const NOISE_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 65,
  HIGH: 100,
};

// Speech detection threshold
export const SPEECH_THRESHOLD = 15;

