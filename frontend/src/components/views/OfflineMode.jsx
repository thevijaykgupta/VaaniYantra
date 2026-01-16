import { useState } from 'react';
import { useAppState } from '../../context/AppStateContext.jsx';
import './Views.css';

function OfflineMode() {
  const { offlineMode, setOfflineMode, addToast } = useAppState();
  const [simulateOffline, setSimulateOffline] = useState(offlineMode);

  return (
    <div className="offline-view">
      <div className="offline-header">
        <h2 className="offline-title">System Mode</h2>
        <p className="offline-subtitle">Current system capabilities and status</p>
      </div>

      <div className="mode-status-card">
        <div className="current-mode">
          <div className="mode-indicator">
            <span className={`mode-dot ${offlineMode ? 'offline' : 'online'}`}></span>
            <span className="mode-text">Current Mode: {offlineMode ? 'OFFLINE' : 'ONLINE'}</span>
          </div>
        </div>

        <div className="mode-description">
          <p>The system is currently operating in online mode with full cloud connectivity.</p>
        </div>
      </div>

      <div className="capabilities-grid">
        <div className="capability-card">
          <div className="capability-header">
            <span className="capability-icon">🎙️</span>
            <h3>Automatic Speech Recognition</h3>
          </div>
          <div className="capability-status">
            <span className="status online">Whisper AI</span>
            <span className="status-description">Primary ASR engine</span>
          </div>
        </div>

        <div className="capability-card">
          <span className="status offline">Vosk</span>
          <div className="capability-status">
            <span className="status-description">Backup offline ASR</span>
          </div>
        </div>

        <div className="capability-card">
          <div className="capability-header">
            <span className="capability-icon">🌍</span>
            <h3>Language Translation</h3>
          </div>
          <div className="capability-status">
            <span className="status online">MarianMT</span>
            <span className="status-description">Real-time translation</span>
          </div>
        </div>

        <div className="capability-card">
          <div className="capability-header">
            <span className="capability-icon">☁️</span>
            <h3>Cloud Services</h3>
          </div>
          <div className="capability-status">
            <span className="status online">Active</span>
            <span className="status-description">Full cloud connectivity</span>
          </div>
        </div>
      </div>

      <div className="offline-info">
        <h3>Offline Mode Capabilities</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>Available in Offline Mode</h4>
            <ul>
              <li>✓ Local speech recognition (Vosk)</li>
              <li>✓ Basic transcription</li>
              <li>✓ Speaker diarization</li>
              <li>✓ Local audio processing</li>
            </ul>
          </div>
          <div className="info-item">
            <h4>Limited in Offline Mode</h4>
            <ul>
              <li>✗ Real-time translation</li>
              <li>✗ Advanced AI features</li>
              <li>✗ Cloud backup</li>
              <li>✗ Multi-language support</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Demo toggle for presentation */}
      <div className="demo-section">
        <h3>Demo Controls</h3>
      <div className="demo-toggle">
        <label className="toggle-label">
            <input
              type="checkbox"
              checked={offlineMode}
              onChange={(e) => {
                setOfflineMode(e.target.checked);
                addToast(
                  e.target.checked ? 'Switched to offline mode (Vosk ASR)' : 'Switched to online mode',
                  e.target.checked ? 'warning' : 'success'
                );
              }}
              className="toggle-input"
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">
              {offlineMode ? 'Offline Mode Active' : 'Switch to Offline Mode'}
            </span>
          </label>
        </div>
        <p className="demo-note">
          This toggle is for demonstration purposes only. It doesn't affect actual system functionality.
        </p>
      </div>
    </div>
  );
}

export default OfflineMode;
