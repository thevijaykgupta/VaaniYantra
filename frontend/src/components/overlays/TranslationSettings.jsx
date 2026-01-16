import { useState } from 'react';
import { useAppState } from '../../context/AppStateContext.jsx';
import './Overlays.css';

function TranslationSettings({ onClose }) {
  const { addToast } = useAppState();
  const [settings, setSettings] = useState({
    targetLanguage: 'hi',
    autoDetect: true,
    preserveSpeakerLabels: true,
    realTimeTranslation: true
  });

  const handleSave = () => {
    // Save settings logic here
    addToast('Translation settings saved!', 'success');
    onClose();
  };

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-panel translation-settings" onClick={e => e.stopPropagation()}>
        <div className="overlay-header">
          <h3>Translation Settings</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="overlay-content">
          <div className="setting-group">
            <label className="setting-label">Target Language</label>
            <select
              value={settings.targetLanguage}
              onChange={(e) => setSettings({...settings, targetLanguage: e.target.value})}
              className="setting-select"
            >
              <option value="hi">Hindi (हिंदी)</option>
              <option value="ta">Tamil (தமிழ்)</option>
              <option value="te">Telugu (తెలుగు)</option>
              <option value="kn">Kannada (ಕನ್ನಡ)</option>
              <option value="bn">Bengali (বাংলা)</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="setting-group">
            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={settings.autoDetect}
                onChange={(e) => setSettings({...settings, autoDetect: e.target.checked})}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">Auto-detect source language</span>
            </label>
          </div>

          <div className="setting-group">
            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={settings.preserveSpeakerLabels}
                onChange={(e) => setSettings({...settings, preserveSpeakerLabels: e.target.checked})}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">Preserve speaker labels in translation</span>
            </label>
          </div>

          <div className="setting-group">
            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={settings.realTimeTranslation}
                onChange={(e) => setSettings({...settings, realTimeTranslation: e.target.checked})}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">Real-time translation</span>
            </label>
          </div>
        </div>

        <div className="overlay-footer">
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={handleSave}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}

export default TranslationSettings;
