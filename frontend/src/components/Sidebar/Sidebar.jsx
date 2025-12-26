import { useState } from 'react';
import {
  Mic,
  Settings,
  Users,
  Cloud,
  FileText,
  BarChart,
} from "lucide-react";
import { useAppState } from '../../context/AppStateContext';
import TranslationSettings from '../overlays/TranslationSettings';
import SpeakerDiarization from '../overlays/SpeakerDiarization';
import SessionHistory from './SessionHistory';
import './SessionHistory.css';

function Sidebar({ sidebarOpen, activeView, onViewChange }) {
  const { addToast } = useAppState();
  const [showTranslationSettings, setShowTranslationSettings] = useState(false);
  const [showSpeakerDiarization, setShowSpeakerDiarization] = useState(false);

  const menu = [
    { id: 'live-transcription', label: "Live Transcription", icon: <Mic size={20} />, view: 'LIVE', action: () => onViewChange('LIVE') },
    { id: 'translation-settings', label: "Translation Settings", icon: <Settings size={20} />, view: 'SETTINGS', action: () => setShowTranslationSettings(true) },
    { id: 'speaker-diarization', label: "Speaker Diarization", icon: <Users size={20} />, view: 'DIARIZATION', action: () => setShowSpeakerDiarization(true) },
    { id: 'offline-mode', label: "Offline Mode", icon: <Cloud size={20} />, view: 'OFFLINE', action: () => {
      addToast('Offline mode coming soon!', 'info');
      onViewChange('OFFLINE');
    }},
    { id: 'transcript-history', label: "Transcript History", icon: <FileText size={20} />, view: 'HISTORY', action: () => onViewChange('HISTORY') },
    { id: 'app-analytics', label: "App Analytics", icon: <BarChart size={20} />, view: 'ANALYTICS', action: () => onViewChange('ANALYTICS') },
  ];

  const handleItemClick = (item) => {
    item.action();
  };

  const getActiveItemId = () => {
    const viewMap = {
      'LIVE': 'live-transcription',
      'SETTINGS': 'translation-settings',
      'DIARIZATION': 'speaker-diarization',
      'OFFLINE': 'offline-mode',
      'HISTORY': 'transcript-history',
      'ANALYTICS': 'app-analytics'
    };
    return viewMap[activeView] || 'live-transcription';
  };

  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-content">
          <div className="logo-container">
            <img src="/logo.png" alt="VAANIYANTRA" className="logo" />
          </div>

          <ul className="sidebar-list">
            {menu.map((item) => (
              <li
                key={item.id}
                className={`sidebar-item ${item.id === getActiveItemId() ? 'active' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </li>
            ))}
          </ul>

          {/* Overlays */}
          {showTranslationSettings && (
            <TranslationSettings onClose={() => setShowTranslationSettings(false)} />
          )}

          {showSpeakerDiarization && (
            <SpeakerDiarization onClose={() => setShowSpeakerDiarization(false)} />
          )}

          <SessionHistory />
        </div>
      </aside>

      {/* Mini logo when sidebar is closed */}
      {!sidebarOpen && (
        <img
          src="/logo.png"
          className="mini-logo"
          alt="VaaniYantra"
        />
      )}
    </>
  );
}

export default Sidebar;