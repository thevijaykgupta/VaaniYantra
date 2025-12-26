import { useState } from 'react';
import { LANGUAGES } from '../../utils/constants';
import './Views.css';

function TranslationSettings() {
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguages, setTargetLanguages] = useState(['hi', 'ta']);
  const [translationMode, setTranslationMode] = useState('real-time');
  const [confidenceFilter, setConfidenceFilter] = useState(70);

  const handleTargetLanguageChange = (langCode) => {
    setTargetLanguages(prev =>
      prev.includes(langCode)
        ? prev.filter(l => l !== langCode)
        : [...prev, langCode]
    );
  };

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2 className="settings-title">Translation Settings</h2>
        <p className="settings-subtitle">Configure how translations are processed</p>
      </div>

      <div className="settings-content">
        {/* Source Language */}
        <div className="setting-group">
          <label className="setting-label">Source Language</label>
          <select
            className="setting-select"
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
          >
            <option value="auto">Auto Detect</option>
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>

        {/* Target Languages */}
        <div className="setting-group">
          <label className="setting-label">Target Language(s)</label>
          <div className="language-grid">
            {LANGUAGES.map(lang => (
              <label key={lang.code} className="language-option">
                <input
                  type="checkbox"
                  checked={targetLanguages.includes(lang.code)}
                  onChange={() => handleTargetLanguageChange(lang.code)}
                />
                <span className="language-name">{lang.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Translation Mode */}
        <div className="setting-group">
          <label className="setting-label">Translation Mode</label>
          <div className="mode-options">
            <label className="mode-option">
              <input
                type="radio"
                value="real-time"
                checked={translationMode === 'real-time'}
                onChange={(e) => setTranslationMode(e.target.value)}
              />
              <span>Real-time</span>
            </label>
            <label className="mode-option">
              <input
                type="radio"
                value="sentence"
                checked={translationMode === 'sentence'}
                onChange={(e) => setTranslationMode(e.target.value)}
              />
              <span>Sentence</span>
            </label>
          </div>
        </div>

        {/* Confidence Filter */}
        <div className="setting-group">
          <label className="setting-label">
            Confidence Filter: {confidenceFilter}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(e.target.value)}
            className="confidence-slider"
          />
          <div className="slider-labels">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TranslationSettings;
